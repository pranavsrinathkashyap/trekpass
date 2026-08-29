from fastapi import APIRouter
from app.db import db_manager
from app import queries
from app.mock_data import mock_store

router = APIRouter(prefix="/stats", tags=["Analytics & Capacity"])

@router.get("/dashboard")
def get_dashboard_stats():
    """Retrieve high-level system metrics, active pass counts, and trail safety statuses."""
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(queries.QUERY_DASHBOARD_STATS)
            if results and "stats" in results[0]:
                return {"data": results[0]["stats"], "source": "cognoDB"}
    except Exception:
        pass
    return {"data": mock_store.get_stats(), "source": "standalone_engine"}

@router.get("/trail-capacity")
def get_trail_capacity_metrics():
    """
    TRAIL CAPACITY & OCCUPANCY GRAPH QUERY:
    Calculates active pass density against environmental capacity constraints.
    """
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(queries.QUERY_TRAIL_CAPACITY_METRICS)
            return {"data": results, "source": "cognoDB"}
    except Exception:
        pass
    
    # Mock capacity calculation
    trails = mock_store.trails
    passes = mock_store.passes
    out = []
    for tr in trails:
        active_t = len([p for p in passes if p["trail_id"] == tr["id"] and p["status"] == "ACTIVE"])
        cap = tr["max_daily_capacity"]
        pct = round((active_t / cap) * 100, 1) if cap > 0 else 0.0
        out.append({
            "trail_id": tr["id"],
            "trail_name": tr["name"],
            "difficulty": tr["difficulty"],
            "status": tr["status"],
            "max_daily_capacity": cap,
            "active_trekkers": active_t,
            "capacity_utilization_pct": pct
        })
    return {"data": out, "source": "standalone_engine"}
