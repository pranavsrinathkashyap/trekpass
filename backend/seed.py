"""
Realistic Himalayan Trail & Trekking Pass Seeder for CognoDB / Neo4j.
Loads labeled nodes, typed relationships, and realistic properties using
parameterized Cypher queries via the official Neo4j Bolt driver.
"""
import logging
from datetime import datetime, timedelta
from app.config import settings
from app.db import db_manager
from app import queries
from app.mock_data import (
    INITIAL_CHECKPOINTS,
    INITIAL_SEGMENTS,
    INITIAL_TRAILS,
    INITIAL_RANGERS,
    INITIAL_ZONES,
    INITIAL_TREKKERS,
    INITIAL_PASSES
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed")

def run_seed():
    """Seeds CognoDB database. Returns (success: bool, message: str)."""
    driver = db_manager.get_driver()
    if not driver:
        err = f"Cannot connect to CognoDB at {settings.COGNODB_URI}. Check .env credentials."
        logger.warning(err)
        return False, err

    try:
        with driver.session() as session:
            logger.info("1. Creating schema constraints and indexes...")
            for constraint in queries.INIT_CONSTRAINTS:
                try:
                    session.run(constraint)
                except Exception as e:
                    logger.debug(f"Constraint creation notice: {e}")

            logger.info("2. Clearing old graph nodes & relationships...")
            session.run("MATCH (n) DETACH DELETE n")

            logger.info("3. Seeding Checkpoint nodes...")
            for cp in INITIAL_CHECKPOINTS:
                session.run("""
                    CREATE (c:Checkpoint {
                        id: $id,
                        name: $name,
                        elevation_m: $elevation_m,
                        has_medical: $has_medical,
                        has_shelter: $has_shelter,
                        max_capacity: $max_capacity,
                        latitude: $lat,
                        longitude: $lng
                    })
                """, cp)

            logger.info("4. Seeding Checkpoint LEADS_TO topology segments...")
            for seg in INITIAL_SEGMENTS:
                session.run("""
                    MATCH (c1:Checkpoint {id: $from_id})
                    MATCH (c2:Checkpoint {id: $to_id})
                    CREATE (c1)-[:LEADS_TO {
                        distance_km: $distance_km,
                        difficulty: $difficulty,
                        is_passable: $is_passable,
                        trail_name: $trail_name
                    }]->(c2)
                """, {
                    "from_id": seg["from"],
                    "to_id": seg["to"],
                    "distance_km": seg["distance_km"],
                    "difficulty": seg["difficulty"],
                    "is_passable": seg["is_passable"],
                    "trail_name": seg["trail_name"]
                })

            logger.info("5. Seeding Ranger Stations & Zones...")
            for r in INITIAL_RANGERS:
                session.run("""
                    CREATE (rs:RangerStation {
                        id: $id,
                        name: $name,
                        jurisdiction: $jurisdiction,
                        radio_channel: $radio_channel
                    })
                """, r)

            for z in INITIAL_ZONES:
                session.run("""
                    CREATE (zn:Zone {
                        id: $id,
                        name: $name,
                        protection_level: $protection_level
                    })
                """, z)

            # Link Ranger to Checkpoints
            session.run("""
                MATCH (r:RangerStation {id: 'ranger-1'}), (c:Checkpoint)
                WHERE c.id IN ['cp-1', 'cp-2', 'cp-3', 'cp-4']
                CREATE (r)-[:MONITORS]->(c)
            """)
            session.run("""
                MATCH (r:RangerStation {id: 'ranger-2'}), (c:Checkpoint)
                WHERE c.id IN ['cp-5', 'cp-6', 'cp-7', 'cp-8', 'cp-9']
                CREATE (r)-[:MONITORS]->(c)
            """)

            logger.info("6. Seeding Trails and Checkpoint mappings...")
            for tr in INITIAL_TRAILS:
                session.run("""
                    CREATE (t:Trail {
                        id: $id,
                        name: $name,
                        difficulty: $difficulty,
                        distance_km: $distance_km,
                        elevation_gain_m: $elevation_gain_m,
                        max_daily_capacity: $max_daily_capacity,
                        status: $status,
                        description: $description
                    })
                """, tr)
                for cid in tr["checkpoints"]:
                    session.run("""
                        MATCH (t:Trail {id: $trail_id})
                        MATCH (c:Checkpoint {id: $cp_id})
                        CREATE (t)-[:CONNECTS_TO]->(c)
                    """, {"trail_id": tr["id"], "cp_id": cid})

            logger.info("7. Seeding Trekkers and Expedition Companion networks...")
            for trekker in INITIAL_TREKKERS:
                session.run("""
                    CREATE (t:Trekker {
                        id: $id,
                        name: $name,
                        email: $email,
                        country: $country,
                        experience_level: $experience_level,
                        emergency_contact: $emergency_contact
                    })
                """, trekker)

            # Trekker companion relations
            for trekker in INITIAL_TREKKERS:
                for comp_id in trekker.get("companion_ids", []):
                    session.run("""
                        MATCH (t1:Trekker {id: $t1_id})
                        MATCH (t2:Trekker {id: $t2_id})
                        MERGE (t1)-[:TREKKING_WITH]->(t2)
                    """, {"t1_id": trekker["id"], "t2_id": comp_id})

            now_str = datetime.utcnow().isoformat()
            # Check-ins
            session.run("""
                MATCH (t1:Trekker {id: 'trekker-1'}), (cp5:Checkpoint {id: 'cp-5'})
                CREATE (t1)-[:LAST_SEEN_AT {timestamp: $ts}]->(cp5)
            """, {"ts": now_str})
            session.run("""
                MATCH (t2:Trekker {id: 'trekker-2'}), (cp5:Checkpoint {id: 'cp-5'})
                CREATE (t2)-[:LAST_SEEN_AT {timestamp: $ts}]->(cp5)
            """, {"ts": now_str})
            session.run("""
                MATCH (t4:Trekker {id: 'trekker-4'}), (cp3:Checkpoint {id: 'cp-3'})
                CREATE (t4)-[:LAST_SEEN_AT {timestamp: $ts}]->(cp3)
            """, {"ts": now_str})

            logger.info("8. Seeding Passes and Graph Relationships...")
            for p in INITIAL_PASSES:
                session.run("""
                    MATCH (t:Trekker {id: $trekker_id})
                    MATCH (tr:Trail {id: $trail_id})
                    MATCH (r:RangerStation {id: $issuing_station_id})
                    MATCH (z:Zone {id: 'zone-1'})
                    CREATE (pass:TrekPass {
                        id: $id,
                        pass_number: $pass_number,
                        pass_type: $pass_type,
                        status: $status,
                        valid_from: $valid_from,
                        valid_to: $valid_to,
                        emergency_insurance_id: $emergency_insurance_id,
                        created_at: $created_at
                    })
                    CREATE (t)-[:HOLDS_PASS]->(pass)
                    CREATE (pass)-[:PERMITS_TRAIL {permitted_date: $valid_from}]->(tr)
                    CREATE (pass)-[:INCLUDES_ZONE]->(z)
                    CREATE (r)-[:ISSUED]->(pass)
                """, p)

        msg = f"Successfully seeded TrekPass graph dataset into CognoDB instance at {settings.COGNODB_URI}"
        logger.info(msg)
        return True, msg
    except Exception as e:
        err = f"Error during CognoDB seeding: {e}"
        logger.error(err)
        return False, err

if __name__ == "__main__":
    success, message = run_seed()
    print(message)
