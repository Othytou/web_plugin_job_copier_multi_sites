import json
import os
import httpx
from utils import logger

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3.5:9b")


def load_agent_instructions() -> str:
    instructions_path = os.path.join(os.path.dirname(__file__), "agent.md")
    with open(instructions_path, "r", encoding="utf-8") as f:
        return f.read()


def build_user_prompt(payload: dict, cv_context: dict) -> str:
    skills_pool = cv_context.get("skills_pool", {})
    bullets_map = cv_context.get("bullets_map", {})

    return f"""
## Offre
Entreprise : {payload.get('company', 'Non précisé')}
Poste : {payload.get('position', 'Non précisé')}
URL : {payload.get('url', '')}

{payload['job_offer']}

## Contexte CV
Compétences displayed : {json.dumps(skills_pool.get('displayed', []), ensure_ascii=False)}
Compétences hidden : {json.dumps(skills_pool.get('hidden', []), ensure_ascii=False)}
Bullets : {json.dumps(bullets_map, ensure_ascii=False)}

Note : compare les compétences de l'offre en ignorant la casse et les variantes 
(ex: PostgreSQL = postgresql, Node.js = nodejs, CI/CD = cicd).
"""


def run_agent(payload: dict, cv_context: dict) -> dict:
    logger.info(f"Agent démarré — {payload.get('company')} / {payload.get('position')}")

    system_prompt = load_agent_instructions()
    user_prompt = build_user_prompt(payload, cv_context)

    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "stream": False,
                "think": False,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "format": "json"
            }
        )
        response.raise_for_status()

    raw = response.json()["message"]["content"].strip()

    try:
        patch = json.loads(raw)
        logger.info(f"Patch reçu — skills matchés : {patch.get('highlight_skills', [])}")
        return patch
    except json.JSONDecodeError as e:
        logger.error(f"Erreur parsing JSON agent : {e}")
        logger.error(f"Réponse brute : {raw}")
        raise ValueError(f"L'agent n'a pas retourné un JSON valide : {e}")