import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router


app = FastAPI(title="Interview Simulator")

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Add middleware BEFORE including routers
ALLOWED_ORIGINS = [
    "http://localhost:3000",           # local React dev server
    "http://127.0.0.1:3000",
]

# Pull any extra origins from environment variable (set in Railway/Render)
# e.g. ALLOWED_ORIGINS=https://your-app.vercel.app,https://custom-domain.com
extra = os.getenv("ALLOWED_ORIGINS", "")
if extra:
    ALLOWED_ORIGINS += [o.strip() for o in extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(router, prefix="/api")

# ─── Static frontend (optional, for self-hosted deploys) ──────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_BUILD = BASE_DIR / "frontend" / "build"
FRONTEND_INDEX = FRONTEND_BUILD / "index.html"

if FRONTEND_BUILD.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_BUILD / "static"), name="frontend-static")


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ─── Root ─────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    if FRONTEND_BUILD.exists():
        return HTMLResponse(FRONTEND_INDEX.read_text(encoding="utf-8"))
    return JSONResponse(
        {
            "message": "API is running. Frontend is deployed separately on Vercel.",
            "api_prefix": "/api",
            "health": "/health",
        }
    )