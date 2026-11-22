import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.session import engine, SessionLocal
from backend.app.db.seed import seed_database
from backend.app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema exists
    Base.metadata.create_all(bind=engine)
    # Seed realistic demo data if enabled
    if settings.AUTO_SEED:
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="CampusLoop — Campus-restricted peer-to-peer resource and services exchange API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
allow_all = "*" in origins or origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}


# API routes
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/v1")


# Static files / SPA serving when built frontend exists
FRONTEND_DIST = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)

if os.path.isdir(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa_or_static(full_path: str):
        # Do not catch API or docs routes
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
        candidate_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(candidate_file):
            return FileResponse(candidate_file)
            
        index_html = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_html):
            return FileResponse(index_html)
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
else:
    @app.get("/")
    def root():
        return {
            "name": settings.PROJECT_NAME,
            "tagline": "Your campus. Your people. Your resources.",
            "version": "1.0.0",
            "docs_url": "/docs",
            "api_v1": settings.API_V1_STR,
        }
