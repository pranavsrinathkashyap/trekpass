from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
import uuid

from app.db import db_manager
from app import queries
from app.mock_data import mock_store

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
            return {"data": results, "source": "cloud"}
    except Exception:
        pass
    return {"data": mock_store.trekkers, "source": "standalone"}

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
        pass

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
    return {"message": "Trekker registered successfully", "data": new_t, "source": "standalone"}

@router.post("/checkin")
def checkin_at_checkpoint(req: CheckinRequest):
    """
    Record real-time trekker check-in at a mountain checkpoint.
    Updates the LAST_SEEN_AT relationship for search & rescue tracking.
    """
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
    except Exception:
        pass

    res = mock_store.checkin_trekker(req.trekker_id, req.checkpoint_id)
    return {"message": "Check-in recorded successfully", "data": res, "source": "standalone"}

@router.get("/{trekker_id}/safety-network")
def get_trekker_safety_network(trekker_id: str):
    """
    Traverses multi-degree companion network (:TREKKING_WITH*1..2)
    and discovers responsible Ranger Stations monitoring permitted checkpoints.
    """
    try:
        if db_manager.get_driver():
            results = db_manager.run_query(
                queries.QUERY_GET_TREKKER_NETWORK,
                {"trekker_id": trekker_id}
            )
            if results:
                return {"data": results[0], "source": "cloud"}
            raise HTTPException(status_code=404, detail="Trekker not found")
    except HTTPException:
        raise
    except Exception:
        pass

    res = mock_store.get_trekker_network(trekker_id)
    if not res:
        raise HTTPException(status_code=404, detail="Trekker not found")
    return {"data": res, "source": "standalone"}
