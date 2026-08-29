from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
import logging

from app.db import db_manager
from app import queries
from app.mock_data import mock_store

logger = logging.getLogger("trekpass.passes")

router = APIRouter(prefix="/passes", tags=["Passes"])

class CreatePassRequest(BaseModel):
    trekker_id: str
    trail_id: str
    pass_type: str = Field(default="SOLO", description="SOLO, EXPEDITION, or LOCAL_GUIDED")
    valid_from: str
    valid_to: str
    emergency_insurance_id: Optional[str] = ""
    station_id: Optional[str] = "ranger-1"

class UpdateStatusRequest(BaseModel):
    status: str = Field(..., description="ACTIVE, EXPIRED, REVOKED, or COMPLETED")

@router.get("")
@router.get("/")
def get_all_passes():
    """Retrieve all trekking passes with linked trekker, trail, and ranger station."""
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(queries.QUERY_GET_ALL_PASSES)
            if results is not None and len(results) > 0:
                return {"data": results, "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error fetching passes from DB: {e}")
    return {"data": mock_store.get_all_passes(), "source": "fallback"}

@router.get("/{pass_number}")
@router.get("/{pass_number}/")
def get_pass_by_number(pass_number: str):
    """Retrieve digital verification details for a single pass number."""
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(queries.QUERY_GET_PASS_BY_NUMBER, {"pass_number": pass_number})
            if results:
                return {"data": results[0], "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error fetching pass by number: {e}")
        
    all_passes = mock_store.get_all_passes()
    matched = next((p for p in all_passes if p["pass_number"] == pass_number), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Pass not found")
    return {"data": matched, "source": "fallback"}

@router.post("")
@router.post("/")
def create_pass(req: CreatePassRequest):
    """
    Issue a new official trekking pass connecting Trekker, Trail, and Ranger Station in graph.
    Enforces overlap check: a trekker cannot hold multiple active permits for overlapping dates.
    """
    # 1. Duplicate & Overlap Date Validation
    try:
        if db_manager.get_driver():
            overlap_check = db_manager.run_query(
                queries.QUERY_CHECK_PERMIT_OVERLAP,
                {
                    "trekker_id": req.trekker_id,
                    "valid_from": req.valid_from,
                    "valid_to": req.valid_to
                }
            )
            if overlap_check and len(overlap_check) > 0:
                conflict = overlap_check[0]
                raise HTTPException(
                    status_code=400,
                    detail=f"Duplicate Booking Conflict: Trekker already holds active permit ({conflict['pass_number']}) valid from {conflict['valid_from']} to {conflict['valid_to']}. Multiple permits cannot be booked for overlapping dates."
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Overlap check notice: {e}")

    # Fallback store overlap validation
    existing = [p for p in mock_store.passes if p["trekker_id"] == req.trekker_id and p["status"] == "ACTIVE"]
    for p in existing:
        if p["valid_from"] <= req.valid_to and p["valid_to"] >= req.valid_from:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate Booking Conflict: Trekker already holds active permit ({p['pass_number']}) valid from {p['valid_from']} to {p['valid_to']}. Multiple permits cannot be booked for overlapping dates."
            )

    pass_id = f"pass-{uuid.uuid4().hex[:8]}"
    pass_number = f"TP-2026-{uuid.uuid4().hex[:4].upper()}"
    created_at = datetime.utcnow().isoformat()
    
    try:
        if db_manager.get_driver():
            params = {
                "trekker_id": req.trekker_id,
                "trail_id": req.trail_id,
                "pass_id": pass_id,
                "pass_number": pass_number,
                "pass_type": req.pass_type,
                "valid_from": req.valid_from,
                "valid_to": req.valid_to,
                "emergency_insurance_id": req.emergency_insurance_id or "",
                "station_id": req.station_id or "ranger-1",
                "created_at": created_at
            }
            db_manager.execute_write(queries.QUERY_CREATE_PASS, params)
            # Query full created pass with trekker & trail info for immediate confirmation view
            full_pass_res = db_manager.run_query(queries.QUERY_GET_PASS_BY_NUMBER, {"pass_number": pass_number})
            if full_pass_res:
                return {
                    "message": "Permit authorized successfully",
                    "data": full_pass_res[0],
                    "source": "cloud"
                }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating pass in DB: {e}")

    # Fallback store
    created = mock_store.create_pass(
        trekker_id=req.trekker_id,
        trail_id=req.trail_id,
        pass_type=req.pass_type,
        valid_from=req.valid_from,
        valid_to=req.valid_to,
        insurance_id=req.emergency_insurance_id or "",
        station_id=req.station_id
    )
    full_fallback = next((p for p in mock_store.get_all_passes() if p["id"] == created["id"]), created)
    return {"message": "Permit authorized successfully", "data": full_fallback, "source": "fallback"}

@router.patch("/{pass_id}/status")
@router.patch("/{pass_id}/status/")
def update_pass_status(pass_id: str, req: UpdateStatusRequest):
    """Update pass lifecycle status (ACTIVE, EXPIRED, REVOKED)."""
    try:
        if db_manager.get_driver():
            res = db_manager.execute_write(
                queries.QUERY_UPDATE_PASS_STATUS,
                {"pass_id": pass_id, "status": req.status}
            )
            if res:
                return {"message": f"Pass status updated to {req.status}", "data": res[0], "source": "cloud"}
    except Exception as e:
        logger.error(f"Error updating pass status: {e}")

    updated = mock_store.update_pass_status(pass_id, req.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Pass not found")
    return {"message": f"Pass status updated to {req.status}", "data": updated, "source": "fallback"}
