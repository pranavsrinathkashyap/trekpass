from fastapi import APIRouter
import logging
from app.db import db_manager
from app import queries
from app.mock_data import mock_store

logger = logging.getLogger("trekpass.graph")

router = APIRouter(prefix="/graph", tags=["Graph Visualization"])

@router.get("/visualize")
@router.get("/visualize/")
def get_graph_data():
    """
    Returns full node-link graph structure (Trekkers, Passes, Trails, Checkpoints, Rangers, Zones)
    for interactive visual rendering in the frontend.
    """
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(queries.QUERY_EXPORT_FULL_GRAPH)
            if results:
                raw_nodes = results[0].get("nodes", [])
                raw_links = results[0].get("links", [])
                unique_nodes = {n["id"]: n for n in raw_nodes if n.get("id")}
                if len(unique_nodes) > 0:
                    return {
                        "data": {
                            "nodes": list(unique_nodes.values()),
                            "links": raw_links
                        },
                        "source": "cloud"
                    }
    except Exception as e:
        logger.warning(f"Error exporting graph: {e}")
    return {"data": mock_store.get_full_graph(), "source": "fallback"}
