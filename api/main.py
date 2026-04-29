import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import init_db, get_db
from models import Application, ApplicationEvent
from agent import run_agent
from html_patcher import load_template, extract_cv_context, apply_patch, write_output
from utils import build_output_filename, logger

# ── Config ────────────────────────────────────────────────────────────────────

TEMPLATE_PATH = os.getenv("TEMPLATE_PATH", "./template/template_cv_2.html")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./output")
PDF_DIR = os.getenv("PDF_DIR", "./pdf")


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("DB initialisée")
    yield

app = FastAPI(title="CV Agent API", lifespan=lifespan)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "chrome-extension://",
        "chrome-extension://ebnkclahmmgkdiebmhfnmmponnjmldpf",
        # "brave-browsers://ebnkclahmmgkdiebmhfnmmponnjmldpf",
        # os.getenv("NGROK_URL", ""),
    ],
    # allow_origins=["*"],
    # allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────────────────────

class WebhookPayload(BaseModel):
    job_offer: str
    company: str
    position: str
    url: str | None = None


class StatusUpdate(BaseModel):
    status: str
    note: str | None = None


# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/webhook")
async def handle_webhook(payload: WebhookPayload, db: AsyncSession = Depends(get_db)):
    """
    Point d'entrée principal.
    Reçoit l'offre depuis l'extension Chrome, lance l'agent et génère le CV HTML.
    """
    logger.info(f"Webhook reçu — {payload.company} / {payload.position}")

    # 1. Charge le template et extrait le contexte
    soup = load_template(TEMPLATE_PATH)
    cv_context = extract_cv_context(soup)

    # 2. Lance l'agent Claude
    try:
        patch = run_agent(payload.model_dump(), cv_context)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Applique le patch sur le HTML
    patched_soup = apply_patch(soup, patch, cv_context)

    # 4. Écrit le fichier output
    filename = build_output_filename(payload.company, payload.position)
    output_path = os.path.join(OUTPUT_DIR, filename)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    write_output(patched_soup, output_path)

    # 5. Sauvegarde en DB
    application = Application(
        company=payload.company,
        position=payload.position,
        url=payload.url,
        job_offer=payload.job_offer,
        cv_html_path=output_path,
        highlight_skills=patch.get("highlight_skills", []),
        inject_skills=patch.get("inject_skills", {}),
        unmatched_skills=patch.get("unmatched_skills", []),
        status="generated"
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    pdf_path = await generate_pdf(output_path, PDF_DIR, filename)
    application.pdf_path = pdf_path
    await db.commit()

    logger.info(f"Application #{application.id} créée — {filename}")

    return {
        "status": "ok",
        "application_id": application.id,
        "cv_file": filename,
        "highlight_skills": patch.get("highlight_skills", []),
        "inject_skills": patch.get("inject_skills", {}),
        "unmatched_skills": patch.get("unmatched_skills", []),
    }


@app.get("/applications")
async def list_applications(db: AsyncSession = Depends(get_db)):
    """Liste toutes les candidatures."""
    result = await db.execute(select(Application).order_by(Application.created_at.desc()))
    applications = result.scalars().all()
    return applications


@app.get("/applications/{application_id}")
async def get_application(application_id: int, db: AsyncSession = Depends(get_db)):
    """Détail d'une candidature."""
    result = await db.execute(select(Application).where(Application.id == application_id))
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    return application


@app.patch("/applications/{application_id}/status")
async def update_status(
    application_id: int,
    body: StatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Met à jour le statut d'une candidature et log l'event."""
    result = await db.execute(select(Application).where(Application.id == application_id))
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    application.status = body.status
    event = ApplicationEvent(
        application_id=application.id,
        status=body.status,
        note=body.note
    )
    db.add(event)
    await db.commit()

    logger.info(f"Application #{application_id} → statut : {body.status}")
    return {"status": "ok", "new_status": body.status}


@app.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Stats globales des candidatures."""
    from sqlalchemy import func
    result = await db.execute(
        select(Application.status, func.count(Application.id))
        .group_by(Application.status)
    )
    rows = result.all()
    stats = {row[0]: row[1] for row in rows}
    total = sum(stats.values())
    return {
        "total": total,
        "by_status": stats,
        "response_rate": round(
            (stats.get("positive", 0) + stats.get("negative", 0) + stats.get("interview", 0))
            / total * 100, 1
        ) if total > 0 else 0
    }


# ── PDF generation —  ─────────────────────────────────────────────────────────

async def generate_pdf(html_path: str, pdf_dir: str, filename: str) -> str:
    from weasyprint import HTML
    import os

    os.makedirs(pdf_dir, exist_ok=True)
    pdf_filename = filename.replace(".html", ".pdf")
    pdf_path = os.path.join(pdf_dir, pdf_filename)

    HTML(filename=html_path).write_pdf(pdf_path)
    logger.info(f"PDF généré : {pdf_path}")
    return pdf_path

