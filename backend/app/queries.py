"""
Cypher Queries Repository for TrekPass.
All queries are strictly parameterized for performance and injection safety.
"""

# Schema Setup & Constraints
INIT_CONSTRAINTS = [
    "CREATE CONSTRAINT trekker_id_unique IF NOT EXISTS FOR (t:Trekker) REQUIRE t.id IS UNIQUE",
    "CREATE CONSTRAINT trekpass_id_unique IF NOT EXISTS FOR (p:TrekPass) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT pass_number_unique IF NOT EXISTS FOR (p:TrekPass) REQUIRE p.pass_number IS UNIQUE",
    "CREATE CONSTRAINT trail_id_unique IF NOT EXISTS FOR (tr:Trail) REQUIRE tr.id IS UNIQUE",
    "CREATE CONSTRAINT checkpoint_id_unique IF NOT EXISTS FOR (c:Checkpoint) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT ranger_id_unique IF NOT EXISTS FOR (r:RangerStation) REQUIRE r.id IS UNIQUE",
    "CREATE CONSTRAINT zone_id_unique IF NOT EXISTS FOR (z:Zone) REQUIRE z.id IS UNIQUE",
]

# Trekker Queries
QUERY_CREATE_TREKKER = """
CREATE (t:Trekker {
    id: $id,
    name: $name,
    email: $email,
    country: $country,
    experience_level: $experience_level,
    emergency_contact: $emergency_contact,
    created_at: $created_at
})
RETURN t.id AS id, t.name AS name, t.email AS email, t.country AS country, 
       t.experience_level AS experience_level, t.emergency_contact AS emergency_contact
"""

# Pass Overlap Check Query
QUERY_CHECK_PERMIT_OVERLAP = """
MATCH (t:Trekker {id: $trekker_id})-[:HOLDS_PASS]->(p:TrekPass {status: 'ACTIVE'})
WHERE p.valid_from <= $valid_to AND p.valid_to >= $valid_from
RETURN p.pass_number AS pass_number, p.valid_from AS valid_from, p.valid_to AS valid_to
LIMIT 1
"""

# Pass Queries
QUERY_GET_ALL_PASSES = """
MATCH (p:TrekPass)
OPTIONAL MATCH (t:Trekker)-[:HOLDS_PASS]->(p)
OPTIONAL MATCH (p)-[:PERMITS_TRAIL]->(tr:Trail)
OPTIONAL MATCH (p)-[:INCLUDES_ZONE]->(z:Zone)
OPTIONAL MATCH (r:RangerStation)-[:ISSUED]->(p)
RETURN p.id AS id,
       p.pass_number AS pass_number,
       p.pass_type AS pass_type,
       p.status AS status,
       p.valid_from AS valid_from,
       p.valid_to AS valid_to,
       p.emergency_insurance_id AS emergency_insurance_id,
       p.created_at AS created_at,
       {
           id: t.id,
           name: t.name,
           email: t.email,
           country: t.country,
           experience_level: t.experience_level,
           emergency_contact: t.emergency_contact
       } AS trekker,
       collect(DISTINCT {
           id: tr.id,
           name: tr.name,
           difficulty: tr.difficulty,
           status: tr.status
       }) AS permitted_trails,
       collect(DISTINCT z.name) AS zones,
       r.name AS issuing_station
ORDER BY p.created_at DESC
"""

QUERY_GET_PASS_BY_NUMBER = """
MATCH (p:TrekPass {pass_number: $pass_number})
OPTIONAL MATCH (t:Trekker)-[:HOLDS_PASS]->(p)
OPTIONAL MATCH (p)-[:PERMITS_TRAIL]->(tr:Trail)
OPTIONAL MATCH (p)-[:INCLUDES_ZONE]->(z:Zone)
OPTIONAL MATCH (r:RangerStation)-[:ISSUED]->(p)
RETURN p.id AS id,
       p.pass_number AS pass_number,
       p.pass_type AS pass_type,
       p.status AS status,
       p.valid_from AS valid_from,
       p.valid_to AS valid_to,
       p.emergency_insurance_id AS emergency_insurance_id,
       p.created_at AS created_at,
       {
           id: t.id,
           name: t.name,
           email: t.email,
           country: t.country,
           experience_level: t.experience_level,
           emergency_contact: t.emergency_contact
       } AS trekker,
       collect(DISTINCT {
           id: tr.id,
           name: tr.name,
           difficulty: tr.difficulty,
           distance_km: tr.distance_km,
           status: tr.status
       }) AS permitted_trails,
       collect(DISTINCT z.name) AS zones,
       r.name AS issuing_station
"""

QUERY_CREATE_PASS = """
MATCH (t:Trekker {id: $trekker_id})
MATCH (tr:Trail {id: $trail_id})
OPTIONAL MATCH (r:RangerStation {id: $station_id})
CREATE (p:TrekPass {
    id: $pass_id,
    pass_number: $pass_number,
    pass_type: $pass_type,
    status: 'ACTIVE',
    valid_from: $valid_from,
    valid_to: $valid_to,
    emergency_insurance_id: $emergency_insurance_id,
    created_at: $created_at
})
CREATE (t)-[:HOLDS_PASS]->(p)
CREATE (p)-[:PERMITS_TRAIL {permitted_date: $valid_from}]->(tr)
WITH p, t, tr, r
WHERE r IS NOT NULL
CREATE (r)-[:ISSUED]->(p)
RETURN p.id AS id, p.pass_number AS pass_number, p.status AS status
"""

QUERY_UPDATE_PASS_STATUS = """
MATCH (p:TrekPass {id: $pass_id})
SET p.status = $status
RETURN p.id AS id, p.pass_number AS pass_number, p.status AS status
"""

# Checkpoint & Trail Topology Queries
QUERY_GET_ALL_TRAILS = """
MATCH (tr:Trail)
OPTIONAL MATCH (tr)-[:CONNECTS_TO]->(c:Checkpoint)
RETURN tr.id AS id,
       tr.name AS name,
       tr.difficulty AS difficulty,
       tr.distance_km AS distance_km,
       tr.elevation_gain_m AS elevation_gain_m,
       tr.max_daily_capacity AS max_daily_capacity,
       tr.status AS status,
       tr.description AS description,
       collect(DISTINCT {
           id: c.id,
           name: c.name,
           elevation_m: c.elevation_m,
           has_medical: c.has_medical,
           has_shelter: c.has_shelter
       }) AS checkpoints
ORDER BY tr.name ASC
"""

QUERY_GET_ALL_CHECKPOINTS = """
MATCH (c:Checkpoint)
OPTIONAL MATCH (r:RangerStation)-[:MONITORS]->(c)
RETURN c.id AS id,
       c.name AS name,
       c.elevation_m AS elevation_m,
       c.has_medical AS has_medical,
       c.has_shelter AS has_shelter,
       c.max_capacity AS max_capacity,
       c.latitude AS latitude,
       c.longitude AS longitude,
       r.name AS monitored_by
ORDER BY c.elevation_m ASC
"""

# MULTI-HOP TRAVERSAL: Trail Route Discovery (2+ hops)
QUERY_FIND_MULTI_HOP_PATHS = """
MATCH p = (start:Checkpoint {id: $start_id})-[:LEADS_TO*1..10]->(end:Checkpoint {id: $end_id})
WHERE ALL(rel IN relationships(p) WHERE rel.is_passable = true)
RETURN [n IN nodes(p) | {
           id: n.id,
           name: n.name,
           elevation_m: n.elevation_m,
           has_medical: n.has_medical,
           has_shelter: n.has_shelter
       }] AS path_checkpoints,
       [r IN relationships(p) | {
           distance_km: r.distance_km,
           difficulty: r.difficulty,
           trail_name: r.trail_name
       }] AS segments,
       reduce(total_km = 0.0, r IN relationships(p) | total_km + r.distance_km) AS total_distance_km,
       length(p) AS hop_count
ORDER BY total_distance_km ASC
LIMIT 5
"""

# EMERGENCY EVACUATION ROUTE
QUERY_EMERGENCY_EVACUATION_ROUTE = """
MATCH p = (start:Checkpoint {id: $current_checkpoint_id})-[:LEADS_TO*1..10]->(safe:Checkpoint {has_medical: true})
WHERE ALL(rel IN relationships(p) WHERE rel.is_passable = true)
RETURN [n IN nodes(p) | {
           id: n.id,
           name: n.name,
           elevation_m: n.elevation_m,
           has_medical: n.has_medical,
           has_shelter: n.has_shelter
       }] AS evac_route,
       reduce(total_km = 0.0, r IN relationships(p) | total_km + r.distance_km) AS total_evac_distance_km,
       safe.name AS destination_hospital,
       length(p) AS hops_to_safety
ORDER BY total_evac_distance_km ASC
LIMIT 3
"""

# Check-in & Location Updates
QUERY_CHECKIN_TREKKER = """
MATCH (t:Trekker {id: $trekker_id})
MATCH (c:Checkpoint {id: $checkpoint_id})
OPTIONAL MATCH (t)-[old:LAST_SEEN_AT]->(:Checkpoint)
DELETE old
CREATE (t)-[:CHECKED_IN {timestamp: $timestamp, status: $status}]->(c)
CREATE (t)-[:LAST_SEEN_AT {timestamp: $timestamp}]->(c)
RETURN t.id AS trekker_id, t.name AS trekker_name, c.name AS checkpoint_name, $timestamp AS timestamp
"""

# Companion Network Traversal
QUERY_GET_TREKKER_NETWORK = """
MATCH (t:Trekker {id: $trekker_id})
OPTIONAL MATCH (t)-[:TREKKING_WITH*1..2]-(companion:Trekker)
OPTIONAL MATCH (t)-[:LAST_SEEN_AT]->(last_loc:Checkpoint)
OPTIONAL MATCH (t)-[:HOLDS_PASS]->(p:TrekPass)-[:PERMITS_TRAIL]->(tr:Trail)-[:CONNECTS_TO]->(cp:Checkpoint)<-[:MONITORS]-(r:RangerStation)
RETURN t.id AS id,
       t.name AS name,
       t.email AS email,
       t.emergency_contact AS emergency_contact,
       t.experience_level AS experience_level,
       last_loc.name AS last_known_location,
       collect(DISTINCT {
           id: companion.id,
           name: companion.name,
           email: companion.email,
           emergency_contact: companion.emergency_contact
       }) AS expedition_companions,
       collect(DISTINCT {
           id: r.id,
           name: r.name,
           radio_channel: r.radio_channel,
           jurisdiction: r.jurisdiction
       }) AS alert_ranger_stations
"""

# Trail Status & Capacity Analytics
QUERY_TRAIL_CAPACITY_METRICS = """
MATCH (tr:Trail)
OPTIONAL MATCH (p:TrekPass {status: 'ACTIVE'})-[:PERMITS_TRAIL]->(tr)
OPTIONAL MATCH (t:Trekker)-[:HOLDS_PASS]->(p)
RETURN tr.id AS trail_id,
       tr.name AS trail_name,
       tr.difficulty AS difficulty,
       tr.status AS status,
       tr.max_daily_capacity AS max_daily_capacity,
       count(DISTINCT p) AS active_passes,
       count(DISTINCT t) AS active_trekkers,
       CASE WHEN tr.max_daily_capacity > 0 
            THEN round((toFloat(count(DISTINCT t)) / tr.max_daily_capacity) * 100, 1)
            ELSE 0.0 END AS capacity_utilization_pct
ORDER BY capacity_utilization_pct DESC
"""

# Overall System Statistics
QUERY_DASHBOARD_STATS = """
MATCH (p:TrekPass)
WITH count(p) AS total_passes,
     count(CASE WHEN p.status = 'ACTIVE' THEN 1 END) AS active_passes,
     count(CASE WHEN p.status = 'EXPIRED' THEN 1 END) AS expired_passes,
     count(CASE WHEN p.status = 'REVOKED' THEN 1 END) AS revoked_passes
MATCH (t:Trekker)
WITH total_passes, active_passes, expired_passes, revoked_passes, count(t) AS total_trekkers
MATCH (tr:Trail)
WITH total_passes, active_passes, expired_passes, revoked_passes, total_trekkers, 
     count(tr) AS total_trails,
     count(CASE WHEN tr.status = 'OPEN' THEN 1 END) AS open_trails,
     count(CASE WHEN tr.status = 'BLOCKED' THEN 1 END) AS blocked_trails
MATCH (c:Checkpoint)
WITH total_passes, active_passes, expired_passes, revoked_passes, total_trekkers,
     total_trails, open_trails, blocked_trails,
     count(c) AS total_checkpoints,
     count(CASE WHEN c.has_medical = true THEN 1 END) AS medical_stations
RETURN {
    total_passes: total_passes,
    active_passes: active_passes,
    expired_passes: expired_passes,
    revoked_passes: revoked_passes,
    total_trekkers: total_trekkers,
    total_trails: total_trails,
    open_trails: open_trails,
    blocked_trails: blocked_trails,
    total_checkpoints: total_checkpoints,
    medical_stations: medical_stations
} AS stats
"""

# Full Graph Export for Interactive Visualizer
QUERY_EXPORT_FULL_GRAPH = """
MATCH (n)
WHERE n:Trekker OR n:TrekPass OR n:Trail OR n:Checkpoint OR n:RangerStation OR n:Zone
WITH collect(DISTINCT {
    id: coalesce(n.id, id(n)),
    label: labels(n)[0],
    name: coalesce(n.name, n.pass_number, 'Unknown'),
    properties: properties(n)
}) AS nodes
MATCH (source)-[r]->(target)
WHERE (source:Trekker OR source:TrekPass OR source:Trail OR source:Checkpoint OR source:RangerStation OR source:Zone)
  AND (target:Trekker OR target:TrekPass OR target:Trail OR target:Checkpoint OR target:RangerStation OR target:Zone)
RETURN nodes,
       collect(DISTINCT {
           source: coalesce(source.id, id(source)),
           target: coalesce(target.id, id(target)),
           type: type(r),
           properties: properties(r)
       }) AS links
"""

# Toggle Segment Passability (simulate landslide/avalanche)
QUERY_TOGGLE_SEGMENT_STATUS = """
MATCH (c1:Checkpoint {id: $from_id})-[r:LEADS_TO]->(c2:Checkpoint {id: $to_id})
SET r.is_passable = $is_passable
RETURN c1.name AS from_checkpoint, c2.name AS to_checkpoint, r.is_passable AS is_passable
"""
