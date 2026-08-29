from fastapi import APIRouter
from app.db import db_manager
from app import queries
from app.mock_data import mock_store

router = APIRouter(prefix="/graph", tags=["Graph Visualization"])

@router.get("/visualize")
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
                # deduplicate
                unique_nodes = {n["id"]: n for n in raw_nodes if n.get("id")}
                return {
                    "data": {
                        "nodes": list(unique_nodes.values()),
                        "links": raw_links
                    },
                    "source": "cognoDB"
                }
    except Exception:
        pass
    return {"data": mock_store.get_full_graph(), "source": "standalone_engine"}
