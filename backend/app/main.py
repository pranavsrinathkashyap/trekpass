from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path
import time
import os
import logging

from app.config import settings
from app.db import db_manager
from app.routes import passes, trails, trekkers, stats, graph

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("trekpass")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing TrekPass Backend...")
    health = db_manager.check_health()
    logger.info(f"Database status: {health['status']} (URI: {health.get('uri')})")
    yield
    logger.info("Shutting down TrekPass Backend...")
    db_manager.close()

app = FastAPI(
    title="TrekPass Mountain Safety API",
    description="Trekking Permit & Trail Safety System backed by Cloud Graph Database.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Sub-routers
app.include_router(passes.router, prefix="/api")
app.include_router(trails.router, prefix="/api")
app.include_router(trekkers.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(graph.router, prefix="/api")

@app.get("/api/health")
def get_health():
    """System and database connectivity diagnostics."""
    start_time = time.time()
    db_health = db_manager.check_health()
    latency_ms = round((time.time() - start_time) * 1000, 2)
    
    return {
        "api_status": "online",
        "timestamp": time.time(),
        "database": db_health,
        "latency_ms": latency_ms,
        "features": {
            "multi_hop_pathfinding": True,
            "emergency_evacuation_routing": True,
            "companion_network_tracing": True,
            "realtime_capacity_analytics": True
        }
    }

@app.post("/api/seed")
def trigger_seed():
    """Trigger seeding of graph database with Himalayan trail dataset."""
    from seed import run_seed
    success, message = run_seed()
    return {"success": success, "message": message}

# Serve Built React Frontend (Unified Single Deployment Support)
dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=dist_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = dist_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(dist_dir / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "service": "TrekPass API",
            "version": "1.0.0",
            "docs_url": "/docs",
            "health_url": "/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
