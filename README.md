# 📋 Job Copier & CV Agent — v1.2.5

A Chrome/Brave extension combined with a local AI agent to copy job offers and automatically generate a tailored CV in HTML format.

---

## 🆕 Changelog

### v1.2.5
- Local AI agent (Ollama/Qwen) for automatic CV adaptation
- HTML CV generation per offer (`cv_{company}_{position}.html`)
- Matched skills highlighting in CV
- Hidden skills injection from pool
- Experience bullets rewriting based on offer keywords
- Automatic soft skills update based on offer
- Unmatched skills tracking for future pool enrichment
- PostgreSQL database for application tracking (status, response rate)
- ATS optimization — exact offer terms injected into CV
- Full Docker architecture (api, postgres, pgadmin)
- FastAPI webhook to receive offers from extension
- Structured JSON payload from extension (`company`, `position`, `job_offer`, `url`)

### v1.0.0
- Multi-site support (Indeed, LinkedIn, Welcome to the Jungle, HelloWork, Free-Work)
- Keyboard shortcut (`Ctrl+Shift+M` / `Cmd+Shift+M`)
- Floating visual button on job pages
- Copy confirmation notification
- Automatic site detection
- SPA support via MutationObserver

---

## 📋 Features

- ✅ **Multi-site support** (Indeed, LinkedIn, Welcome to the Jungle, HelloWork, Free-Work)
- ✅ **Keyboard shortcut** (`Ctrl+Shift+M` / `Cmd+Shift+M` on Mac)
- ✅ **Visual copy button** on supported pages
- ✅ **Structured JSON payload** sent to local webhook
- ✅ **AI agent** — adapts CV HTML to job offer via Ollama/Qwen
- ✅ **ATS optimization** — exact keywords from offer injected in CV
- ✅ **Skills highlighting** — matched skills visually highlighted
- ✅ **Hidden skills injection** — skills from pool injected if requested
- ✅ **Bullet rewriting** — experience bullets rewritten with offer terminology
- ✅ **Soft skills update** — up to 2 soft skills from offer added automatically
- ✅ **Unmatched skills tracking** — missing skills logged for pool enrichment
- ✅ **Application CRM** — PostgreSQL tracking (status, response rate)
- ✅ **PDF generation** — WeasyPrint (disabled, ready to enable)

---

## 🎯 Supported Job Boards

| Site | Status | Selector |
|------|--------|----------|
| Indeed | ✅ Configured | `.jobsearch-InfoHeaderContainer` + `.jobsearch-JobComponent-description` |
| LinkedIn | ⏳ To configure | _Empty_ |
| Welcome to the Jungle | ⏳ To configure | _Empty_ |
| HelloWork | ⏳ To configure | _Empty_ |
| Free-Work | ⏳ To configure | _Empty_ |

---

## 🏗️ Project Structure

```
.
├── docker-compose.yml
├── .env
├── README.md
│
├── extension/                        # Chrome/Brave extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── style.css
│   └── icons/
│   │   ├── icon128.png
│   │   ├── icon16.png
│   │   └── icon48.png
│
├── api/                              # FastAPI + AI agent
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                       # FastAPI routes + webhook
│   ├── agent.py                      # Ollama/Qwen API call
│   ├── html_patcher.py               # HTML patching via BeautifulSoup
│   ├── utils.py                      # Slugify + logger
│   ├── models.py                     # SQLAlchemy models
│   ├── database.py                   # Async DB connection
│   ├── alembic.ini                   # Alembic config
│   ├── init_db.sh                    # DB init script
│   ├── agent.md                      # AI agent system prompt
│   └── db/
│       └── migrations/               # Alembic migrations
│
├── template/                         # CV HTML templates
│   └── template_resume.html
│
├── output/                           # Generated HTML CVs
└── pdf/                              # Generated PDFs (when enabled)
```

---

## 🚀 Getting Started

### Prerequisites

- Docker + Docker Compose
- Ollama installed locally with Qwen model
- Chrome or Brave browser

### 1. Start Ollama

```bash
ollama pull qwen2.5:9b
ollama serve
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — no API key needed, Ollama runs locally
```

### 3. Start Docker services

```bash
docker compose up --build
```

Services available:
- API: `http://localhost:9000`
- pgAdmin: `http://localhost:5050`

### 4. Load the extension

1. Open `brave://extensions/` or `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## 🎮 Usage

1. Navigate to a job offer on a supported site
2. Click **"📋 Copier l'offre"** or press `Ctrl+Shift+M`
3. The offer is copied to clipboard and sent to the local webhook
4. The AI agent generates a tailored CV in `output/`
5. Track your application via the API at `http://localhost:9000/applications`

---

## 📊 CRM API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook` | Receive job offer, generate CV |
| GET | `/applications` | List all applications |
| GET | `/applications/{id}` | Application detail |
| PATCH | `/applications/{id}/status` | Update status |
| GET | `/stats` | Response rate & stats |

### Application statuses
`generated` → `sent` → `no_response` / `positive` / `negative` / `interview`

---

## 🔧 Enable PDF Generation

1. Uncomment Playwright lines in `api/Dockerfile`
2. Uncomment `playwright` in `api/requirements.txt`
3. Uncomment `generate_pdf()` function in `api/main.py`
4. Rebuild: `docker compose up --build`

---

## 🛠️ Technologies

**Extension:** JavaScript, Chrome Manifest V3, MutationObserver, Clipboard API

**Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic, BeautifulSoup4, httpx

**AI:** Ollama, Qwen 2.5

**PDF:** WeasyPrint

**Infrastructure:** Docker, Docker Compose, pgAdmin

---

## ⚠️ Disclaimer

This tool is designed for personal productivity. It does not collect any external data and runs entirely locally. Copying job descriptions should respect the terms of service of each job board.

---

**Built to maximize your ATS score and streamline your job application process** 🎯