from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import logging

from app.db import db_manager
from app import queries
from app.mock_data import mock_store

logger = logging.getLogger("trekpass.trails")

router = APIRouter(prefix="/trails", tags=["Trails & Navigation"])

class PathFindRequest(BaseModel):
    start_checkpoint_id: str
    end_checkpoint_id: str

class EvacuationRequest(BaseModel):
    current_checkpoint_id: str

class ToggleHazardRequest(BaseModel):
    from_checkpoint_id: str
    to_checkpoint_id: str
    is_passable: bool

@router.get("")
@router.get("/")
def get_trails():
    """List all registered trails with checkpoint connections."""
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(queries.QUERY_GET_ALL_TRAILS)
            if results:
                return {"data": results, "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error fetching trails: {e}")
    return {"data": mock_store.trails, "source": "fallback"}

@router.get("/checkpoints")
@router.get("/checkpoints/")
def get_checkpoints():
    """List all checkpoints, medical stations, and elevations in the mountain network."""
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(queries.QUERY_GET_ALL_CHECKPOINTS)
            if results:
                return {"data": results, "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error fetching checkpoints: {e}")
    return {"data": mock_store.checkpoints, "source": "fallback"}

@router.post("/pathfind")
@router.post("/pathfind/")
def find_multi_hop_route(req: PathFindRequest):
    """
    MULTI-HOP GRAPH QUERY (2+ HOPS):
    Finds optimal checkpoint sequences from start to end, verifying passable conditions.
    """
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(
                queries.QUERY_FIND_MULTI_HOP_PATHS,
                {"start_id": req.start_checkpoint_id, "end_id": req.end_checkpoint_id}
            )
            if results:
                return {"paths": results, "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error in pathfind query: {e}")

    results = mock_store.find_multi_hop_paths(req.start_checkpoint_id, req.end_checkpoint_id)
    return {"paths": results, "source": "fallback"}

@router.post("/emergency-evacuation")
@router.post("/emergency-evacuation/")
def find_emergency_evacuation(req: EvacuationRequest):
    """
    EMERGENCY GRAPH EVACUATION QUERY:
    Computes shortest safe egress route to nearest high-altitude medical station.
    """
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(
                queries.QUERY_EMERGENCY_EVACUATION_ROUTE,
                {"current_checkpoint_id": req.current_checkpoint_id}
            )
            if results:
                return {"routes": results, "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error in emergency evac query: {e}")

    results = mock_store.emergency_evac_route(req.current_checkpoint_id)
    return {"routes": results, "source": "fallback"}

@router.post("/toggle-hazard")
@router.post("/toggle-hazard/")
def toggle_trail_hazard(req: ToggleHazardRequest):
    """Simulate mountain hazard by blocking/unblocking a trail edge."""
    try:
        if db_manager.get_driver():
            results = db_manager.execute_write(
                queries.QUERY_TOGGLE_SEGMENT_STATUS,
                {
                    "from_id": req.from_checkpoint_id,
                    "to_id": req.to_checkpoint_id,
                    "is_passable": req.is_passable
                }
            )
            return {"message": "Segment passability updated", "data": results, "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error toggling hazard: {e}")

    res = mock_store.toggle_segment(req.from_checkpoint_id, req.to_checkpoint_id, req.is_passable)
    if not res:
        raise HTTPException(status_code=404, detail="Segment not found")
    return {"message": "Segment passability updated", "data": res, "source": "fallback"}
