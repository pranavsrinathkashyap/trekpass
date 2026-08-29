from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
import uuid
import logging

from app.db import db_manager
from app import queries
from app.mock_data import mock_store

logger = logging.getLogger("trekpass.trekkers")

router = APIRouter(prefix="/trekkers", tags=["Trekkers & Safety Registry"])

class CreateTrekkerRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Full name of the trekker")
    email: str = Field(..., description="Contact email address")
    country: str = Field(default="International", description="Nationality / Home country")
    experience_level: str = Field(default="INTERMEDIATE", description="BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, LEAD_GUIDE")
    emergency_contact: str = Field(..., description="Emergency contact phone number or rescue agency")

class CheckinRequest(BaseModel):
    trekker_id: str
    checkpoint_id: str
    status: str = Field(default="CHECKED_IN", description="CHECKED_IN, RESTING, or MEDICAL_ATTENTION")

@router.get("")
@router.get("/")
def get_all_trekkers():
    """Retrieve all registered trekkers in the system."""
    try:
        if db_manager.get_driver():
            cypher = """
            MATCH (t:Trekker)
            OPTIONAL MATCH (t)-[:LAST_SEEN_AT]->(c:Checkpoint)
            RETURN t.id AS id,
                   t.name AS name,
                   t.email AS email,
                   t.country AS country,
                   t.experience_level AS experience_level,
                   t.emergency_contact AS emergency_contact,
                   c.name AS last_known_location
            ORDER BY t.name ASC
            """
            results = db_manager.run_query(cypher)
            if results:
                return {"data": results, "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error fetching trekkers from database: {e}")
    return {"data": mock_store.trekkers, "source": "fallback"}

@router.post("")
@router.post("/")
def register_trekker(req: CreateTrekkerRequest):
    """Register a new trekker with alpine emergency credentials."""
    trekker_id = f"trekker-{uuid.uuid4().hex[:6]}"
    created_at = datetime.utcnow().isoformat()
    
    try:
        if db_manager.get_driver():
            params = {
                "id": trekker_id,
                "name": req.name.strip(),
                "email": req.email.strip(),
                "country": req.country.strip(),
                "experience_level": req.experience_level,
                "emergency_contact": req.emergency_contact.strip(),
                "created_at": created_at
            }
            results = db_manager.execute_write(queries.QUERY_CREATE_TREKKER, params)
            return {
                "message": "Trekker registered successfully",
                "data": results[0] if results else params,
                "source": "cloud"
            }
    except Exception as e:
        logger.error(f"Error creating trekker in DB: {e}")

    # Fallback in-memory
    new_t = {
        "id": trekker_id,
        "name": req.name.strip(),
        "email": req.email.strip(),
        "country": req.country.strip(),
        "experience_level": req.experience_level,
        "emergency_contact": req.emergency_contact.strip(),
        "last_known_location": "Lukla Gateway (2,860m)"
    }
    mock_store.trekkers.insert(0, new_t)
    return {"message": "Trekker registered successfully", "data": new_t, "source": "fallback"}

@router.delete("/{trekker_id}")
@router.delete("/{trekker_id}/")
def delete_trekker(trekker_id: str):
    """Safely delete a trekker and detach related passes from graph."""
    try:
        if db_manager.get_driver():
            cypher = """
            MATCH (t:Trekker {id: $trekker_id})
            OPTIONAL MATCH (t)-[:HOLDS_PASS]->(p:TrekPass)
            DETACH DELETE p, t
            """
            db_manager.execute_write(cypher, {"trekker_id": trekker_id})
            return {"message": f"Trekker {trekker_id} and associated permits deleted", "source": "cloud"}
    except Exception as e:
        logger.error(f"Error deleting trekker: {e}")

    mock_store.trekkers = [t for t in mock_store.trekkers if t["id"] != trekker_id]
    mock_store.passes = [p for p in mock_store.passes if p.get("trekker_id") != trekker_id]
    return {"message": f"Trekker {trekker_id} deleted", "source": "fallback"}

@router.post("/checkin")
@router.post("/checkin/")
def checkin_at_checkpoint(req: CheckinRequest):
    """Record real-time trekker check-in at a mountain checkpoint."""
    timestamp = datetime.utcnow().isoformat()
    try:
        if db_manager.get_driver():
            results = db_manager.execute_write(
                queries.QUERY_CHECKIN_TREKKER,
                {
                    "trekker_id": req.trekker_id,
                    "checkpoint_id": req.checkpoint_id,
                    "timestamp": timestamp,
                    "status": req.status
                }
            )
            return {"message": "Check-in recorded successfully", "data": results[0] if results else {}, "source": "cloud"}
    except Exception as e:
        logger.error(f"Error checking in: {e}")

    res = mock_store.checkin_trekker(req.trekker_id, req.checkpoint_id)
    return {"message": "Check-in recorded successfully", "data": res, "source": "fallback"}

@router.get("/{trekker_id}/safety-network")
@router.get("/{trekker_id}/safety-network/")
def get_trekker_safety_network(trekker_id: str):
    """Traverse companion network & alert ranger stations."""
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(
                queries.QUERY_GET_TREKKER_NETWORK,
                {"trekker_id": trekker_id}
            )
            if results and results[0].get("id"):
                return {"data": results[0], "source": "cloud"}
    except Exception as e:
        logger.warning(f"Error fetching network: {e}")

    res = mock_store.get_trekker_network(trekker_id)
    if not res:
        raise HTTPException(status_code=404, detail="Trekker not found")
    return {"data": res, "source": "fallback"}
