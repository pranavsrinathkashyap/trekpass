"""
Realistic In-Memory Seed & Fallback Graph Engine for TrekPass.
Used for immediate local testing and as a fallback when CognoDB connection is pending.
"""
from datetime import datetime, timedelta
import uuid

INITIAL_CHECKPOINTS = [
    {"id": "cp-1", "name": "Lukla Gateway (2,860m)", "elevation_m": 2860, "has_medical": True, "has_shelter": True, "max_capacity": 150, "lat": 27.6869, "lng": 86.7297},
    {"id": "cp-2", "name": "Phakding Riverside (2,610m)", "elevation_m": 2610, "has_medical": False, "has_shelter": True, "max_capacity": 100, "lat": 27.7408, "lng": 86.7130},
    {"id": "cp-3", "name": "Namche Bazaar Hub (3,440m)", "elevation_m": 3440, "has_medical": True, "has_shelter": True, "max_capacity": 250, "lat": 27.8069, "lng": 86.7140},
    {"id": "cp-4", "name": "Tengboche Monastery (3,867m)", "elevation_m": 3867, "has_medical": False, "has_shelter": True, "max_capacity": 80, "lat": 27.8360, "lng": 86.7640},
    {"id": "cp-5", "name": "Dingboche Alpine Camp (4,410m)", "elevation_m": 4410, "has_medical": True, "has_shelter": True, "max_capacity": 90, "lat": 27.8933, "lng": 86.8322},
    {"id": "cp-6", "name": "Lobuche Ridge (4,940m)", "elevation_m": 4940, "has_medical": False, "has_shelter": True, "max_capacity": 60, "lat": 27.9483, "lng": 86.8106},
    {"id": "cp-7", "name": "Gorakshep High Camp (5,164m)", "elevation_m": 5164, "has_medical": True, "has_shelter": True, "max_capacity": 50, "lat": 27.9810, "lng": 86.8290},
    {"id": "cp-8", "name": "Everest Base Camp (5,364m)", "elevation_m": 5364, "has_medical": True, "has_shelter": False, "max_capacity": 40, "lat": 28.0040, "lng": 86.8550},
    {"id": "cp-9", "name": "Pheriche Rescue Clinic (4,371m)", "elevation_m": 4371, "has_medical": True, "has_shelter": True, "max_capacity": 70, "lat": 27.8920, "lng": 86.8190}
]

INITIAL_SEGMENTS = [
    {"from": "cp-1", "to": "cp-2", "distance_km": 7.5, "difficulty": "MODERATE", "is_passable": True, "trail_name": "Lukla-Phakding Trail"},
    {"from": "cp-2", "to": "cp-3", "distance_km": 10.2, "difficulty": "HARD", "is_passable": True, "trail_name": "Namche Ascent Trail"},
    {"from": "cp-3", "to": "cp-4", "distance_km": 9.2, "difficulty": "MODERATE", "is_passable": True, "trail_name": "Tengboche Spiritual Way"},
    {"from": "cp-4", "to": "cp-5", "distance_km": 10.8, "difficulty": "HARD", "is_passable": True, "trail_name": "Dingboche Valley Trail"},
    {"from": "cp-5", "to": "cp-6", "distance_km": 7.9, "difficulty": "VERY_HARD", "is_passable": True, "trail_name": "Lobuche Moraine Pass"},
    {"from": "cp-6", "to": "cp-7", "distance_km": 4.5, "difficulty": "VERY_HARD", "is_passable": True, "trail_name": "Gorakshep Glacier Traverse"},
    {"from": "cp-7", "to": "cp-8", "distance_km": 3.5, "difficulty": "EXTREME", "is_passable": True, "trail_name": "Khumbu Icefall Approach"},
    # Alternate Emergency & Acclimatization Segments
    {"from": "cp-5", "to": "cp-9", "distance_km": 3.2, "difficulty": "MODERATE", "is_passable": True, "trail_name": "Pheriche Evacuation Link"},
    {"from": "cp-6", "to": "cp-9", "distance_km": 6.1, "difficulty": "HARD", "is_passable": True, "trail_name": "Lobuche Direct Rescue Bypass"},
    {"from": "cp-9", "to": "cp-3", "distance_km": 14.5, "difficulty": "MODERATE", "is_passable": True, "trail_name": "Pheriche-Namche Express Egress"}
]

INITIAL_TRAILS = [
    {
        "id": "trail-ebc-main",
        "name": "Classic Everest Base Camp Expedition",
        "difficulty": "VERY_HARD",
        "distance_km": 65.0,
        "elevation_gain_m": 2800,
        "max_daily_capacity": 60,
        "status": "OPEN",
        "description": "The quintessential high-altitude Himalayan trail from Lukla to EBC.",
        "checkpoints": ["cp-1", "cp-2", "cp-3", "cp-4", "cp-5", "cp-6", "cp-7", "cp-8"]
    },
    {
        "id": "trail-gokyo-link",
        "name": "Gokyo Lakes & Cho La Pass Circuit",
        "difficulty": "EXTREME",
        "distance_km": 48.0,
        "elevation_gain_m": 2400,
        "max_daily_capacity": 30,
        "status": "OPEN",
        "description": "High alpine glacial lakes with dramatic technical pass crossings.",
        "checkpoints": ["cp-3", "cp-4", "cp-9", "cp-5"]
    },
    {
        "id": "trail-namche-panorama",
        "name": "Namche Acclimatization & Cultural Trail",
        "difficulty": "MODERATE",
        "distance_km": 18.0,
        "elevation_gain_m": 600,
        "max_daily_capacity": 120,
        "status": "OPEN",
        "description": "Scenic low-altitude trail suitable for acclimatization and cultural discovery.",
        "checkpoints": ["cp-1", "cp-2", "cp-3"]
    }
]

INITIAL_RANGERS = [
    {"id": "ranger-1", "name": "Namche Central Sector Post", "jurisdiction": "Sagarmatha National Park Zone 1", "radio_channel": "VHF 144.800 MHz"},
    {"id": "ranger-2", "name": "Lobuche High Altitude Rescue Command", "jurisdiction": "Khumbu Glacial Zone", "radio_channel": "VHF 146.520 MHz"}
]

INITIAL_ZONES = [
    {"id": "zone-1", "name": "Sagarmatha Alpine Core Sanctuary", "protection_level": "ECO_SENSITIVE"},
    {"id": "zone-2", "name": "Khumbu High Altitude Glacial Zone", "protection_level": "RESTRICTED"}
]

INITIAL_TREKKERS = [
    {
        "id": "trekker-1",
        "name": "Alex Mercer",
        "email": "alex.mercer@expedition.org",
        "country": "Switzerland",
        "experience_level": "EXPERT",
        "emergency_contact": "+41 79 123 4567 (Alpine Rescue Swiss)",
        "companion_ids": ["trekker-2"]
    },
    {
        "id": "trekker-2",
        "name": "Elena Rostova",
        "email": "elena.rostova@trekguide.com",
        "country": "Austria",
        "experience_level": "LEAD_GUIDE",
        "emergency_contact": "+43 664 987 6543 (ÖBRD Innsbruck)",
        "companion_ids": ["trekker-1", "trekker-3"]
    },
    {
        "id": "trekker-3",
        "name": "David Chen",
        "email": "david.chen@adventure.io",
        "country": "Canada",
        "experience_level": "INTERMEDIATE",
        "emergency_contact": "+1 604 555 0199 (Vancouver Mountain Club)",
        "companion_ids": ["trekker-2"]
    },
    {
        "id": "trekker-4",
        "name": "Priya Sharma",
        "email": "priya.sharma@himalayanoutdoors.in",
        "country": "India",
        "experience_level": "ADVANCED",
        "emergency_contact": "+91 98200 11223 (Himalayan Club Mumbai)",
        "companion_ids": []
    }
]

INITIAL_PASSES = [
    {
        "id": "pass-001",
        "pass_number": "TP-2026-8891",
        "pass_type": "EXPEDITION",
        "status": "ACTIVE",
        "valid_from": (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d"),
        "valid_to": (datetime.utcnow() + timedelta(days=12)).strftime("%Y-%m-%d"),
        "emergency_insurance_id": "GLOBAL-RESCUE-8921",
        "trekker_id": "trekker-1",
        "trail_id": "trail-ebc-main",
        "issuing_station_id": "ranger-1",
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
    },
    {
        "id": "pass-002",
        "pass_number": "TP-2026-8892",
        "pass_type": "LOCAL_GUIDED",
        "status": "ACTIVE",
        "valid_from": (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d"),
        "valid_to": (datetime.utcnow() + timedelta(days=12)).strftime("%Y-%m-%d"),
        "emergency_insurance_id": "ALLIANZ-ALPINE-4410",
        "trekker_id": "trekker-2",
        "trail_id": "trail-ebc-main",
        "issuing_station_id": "ranger-1",
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
    },
    {
        "id": "pass-003",
        "pass_number": "TP-2026-8893",
        "pass_type": "SOLO",
        "status": "ACTIVE",
        "valid_from": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
        "valid_to": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "emergency_insurance_id": "NOMAD-MED-7711",
        "trekker_id": "trekker-4",
        "trail_id": "trail-namche-panorama",
        "issuing_station_id": "ranger-1",
        "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat()
    }
]

class MockGraphStore:
    def __init__(self):
        self.checkpoints = list(INITIAL_CHECKPOINTS)
        self.segments = list(INITIAL_SEGMENTS)
        self.trails = list(INITIAL_TRAILS)
        self.rangers = list(INITIAL_RANGERS)
        self.zones = list(INITIAL_ZONES)
        self.trekkers = list(INITIAL_TREKKERS)
        self.passes = list(INITIAL_PASSES)
        self.checkins = [
            {"trekker_id": "trekker-1", "checkpoint_id": "cp-5", "timestamp": datetime.utcnow().isoformat(), "status": "CHECKED_IN"},
            {"trekker_id": "trekker-2", "checkpoint_id": "cp-5", "timestamp": datetime.utcnow().isoformat(), "status": "CHECKED_IN"},
            {"trekker_id": "trekker-4", "checkpoint_id": "cp-3", "timestamp": datetime.utcnow().isoformat(), "status": "CHECKED_IN"}
        ]

    def get_all_passes(self):
        result = []
        for p in self.passes:
            trekker = next((t for t in self.trekkers if t["id"] == p["trekker_id"]), None)
            trail = next((tr for tr in self.trails if tr["id"] == p["trail_id"]), None)
            ranger = next((r for r in self.rangers if r["id"] == p.get("issuing_station_id")), None)
            
            result.append({
                "id": p["id"],
                "pass_number": p["pass_number"],
                "pass_type": p["pass_type"],
                "status": p["status"],
                "valid_from": p["valid_from"],
                "valid_to": p["valid_to"],
                "emergency_insurance_id": p.get("emergency_insurance_id", ""),
                "created_at": p["created_at"],
                "trekker": trekker,
                "permitted_trails": [trail] if trail else [],
                "zones": [z["name"] for z in self.zones],
                "issuing_station": ranger["name"] if ranger else "Main Gate"
            })
        return sorted(result, key=lambda x: x["created_at"], reverse=True)

    def create_pass(self, trekker_id, trail_id, pass_type, valid_from, valid_to, insurance_id, station_id=None):
        pass_id = f"pass-{uuid.uuid4().hex[:6]}"
        pass_num = f"TP-2026-{uuid.uuid4().hex[:4].upper()}"
        new_pass = {
            "id": pass_id,
            "pass_number": pass_num,
            "pass_type": pass_type,
            "status": "ACTIVE",
            "valid_from": valid_from,
            "valid_to": valid_to,
            "emergency_insurance_id": insurance_id,
            "trekker_id": trekker_id,
            "trail_id": trail_id,
            "issuing_station_id": station_id or "ranger-1",
            "created_at": datetime.utcnow().isoformat()
        }
        self.passes.insert(0, new_pass)
        return new_pass

    def update_pass_status(self, pass_id, new_status):
        for p in self.passes:
            if p["id"] == pass_id:
                p["status"] = new_status
                return p
        return None

    def find_multi_hop_paths(self, start_id, end_id):
        # Graph BFS / DFS multi-hop traversal
        graph = {}
        for s in self.segments:
            if s.get("is_passable", True):
                graph.setdefault(s["from"], []).append(s)
        
        all_paths = []
        queue = [([start_id], 0.0, [])]
        
        while queue and len(all_paths) < 5:
            current_path, current_dist, segs = queue.pop(0)
            node = current_path[-1]
            
            if node == end_id:
                node_objs = [next((c for c in self.checkpoints if c["id"] == cid), None) for cid in current_path]
                all_paths.append({
                    "path_checkpoints": [n for n in node_objs if n],
                    "segments": segs,
                    "total_distance_km": round(current_dist, 2),
                    "hop_count": len(current_path) - 1
                })
                continue
            
            if len(current_path) > 7:
                continue
            
            for edge in graph.get(node, []):
                next_node = edge["to"]
                if next_node not in current_path:
                    queue.append((
                        current_path + [next_node],
                        current_dist + edge["distance_km"],
                        segs + [edge]
                    ))
                    
        return sorted(all_paths, key=lambda x: x["total_distance_km"])

    def emergency_evac_route(self, current_checkpoint_id):
        med_checkpoints = [c["id"] for c in self.checkpoints if c.get("has_medical") and c["id"] != current_checkpoint_id]
        routes = []
        for med_id in med_checkpoints:
            paths = self.find_multi_hop_paths(current_checkpoint_id, med_id)
            if paths:
                shortest = paths[0]
                med_node = next(c for c in self.checkpoints if c["id"] == med_id)
                routes.append({
                    "evac_route": shortest["path_checkpoints"],
                    "total_evac_distance_km": shortest["total_distance_km"],
                    "destination_hospital": med_node["name"],
                    "hops_to_safety": shortest["hop_count"]
                })
        return sorted(routes, key=lambda x: x["total_evac_distance_km"])[:3]

    def toggle_segment(self, from_id, to_id, is_passable):
        for s in self.segments:
            if s["from"] == from_id and s["to"] == to_id:
                s["is_passable"] = is_passable
                return s
        return None

    def checkin_trekker(self, trekker_id, checkpoint_id):
        now = datetime.utcnow().isoformat()
        # update checkin
        self.checkins = [c for c in self.checkins if c["trekker_id"] != trekker_id]
        record = {"trekker_id": trekker_id, "checkpoint_id": checkpoint_id, "timestamp": now, "status": "CHECKED_IN"}
        self.checkins.append(record)
        t = next((t for t in self.trekkers if t["id"] == trekker_id), None)
        c = next((c for c in self.checkpoints if c["id"] == checkpoint_id), None)
        return {
            "trekker_id": trekker_id,
            "trekker_name": t["name"] if t else "Unknown",
            "checkpoint_name": c["name"] if c else "Unknown",
            "timestamp": now
        }

    def get_trekker_network(self, trekker_id):
        t = next((t for t in self.trekkers if t["id"] == trekker_id), None)
        if not t:
            return None
        last_checkin = next((c for c in self.checkins if c["trekker_id"] == trekker_id), None)
        last_cp = next((c["name"] for c in self.checkpoints if c["id"] == last_checkin["checkpoint_id"]), "Not checked in yet") if last_checkin else "Not checked in yet"
        
        # 1-2 hop companions
        comp_ids = set(t.get("companion_ids", []))
        for cid in list(comp_ids):
            c_obj = next((x for x in self.trekkers if x["id"] == cid), None)
            if c_obj:
                for second_hop in c_obj.get("companion_ids", []):
                    if second_hop != trekker_id:
                        comp_ids.add(second_hop)
                        
        companions = [x for x in self.trekkers if x["id"] in comp_ids]
        
        return {
            "id": t["id"],
            "name": t["name"],
            "email": t["email"],
            "emergency_contact": t["emergency_contact"],
            "experience_level": t["experience_level"],
            "last_known_location": last_cp,
            "expedition_companions": companions,
            "alert_ranger_stations": self.rangers
        }

    def get_stats(self):
        active_passes = len([p for p in self.passes if p["status"] == "ACTIVE"])
        expired_passes = len([p for p in self.passes if p["status"] == "EXPIRED"])
        revoked_passes = len([p for p in self.passes if p["status"] == "REVOKED"])
        blocked_segs = len([s for s in self.segments if not s.get("is_passable", True)])
        
        return {
            "total_passes": len(self.passes),
            "active_passes": active_passes,
            "expired_passes": expired_passes,
            "revoked_passes": revoked_passes,
            "total_trekkers": len(self.trekkers),
            "total_trails": len(self.trails),
            "open_trails": len(self.trails) - (1 if blocked_segs > 0 else 0),
            "blocked_trails": 1 if blocked_segs > 0 else 0,
            "total_checkpoints": len(self.checkpoints),
            "medical_stations": len([c for c in self.checkpoints if c.get("has_medical")])
        }

    def get_full_graph(self):
        nodes = []
        for t in self.trekkers:
            nodes.append({"id": t["id"], "label": "Trekker", "name": t["name"], "properties": t})
        for p in self.passes:
            nodes.append({"id": p["id"], "label": "TrekPass", "name": p["pass_number"], "properties": p})
        for tr in self.trails:
            nodes.append({"id": tr["id"], "label": "Trail", "name": tr["name"], "properties": tr})
        for c in self.checkpoints:
            nodes.append({"id": c["id"], "label": "Checkpoint", "name": c["name"], "properties": c})
        for r in self.rangers:
            nodes.append({"id": r["id"], "label": "RangerStation", "name": r["name"], "properties": r})

        links = []
        for p in self.passes:
            links.append({"source": p["trekker_id"], "target": p["id"], "type": "HOLDS_PASS"})
            links.append({"source": p["id"], "target": p["trail_id"], "type": "PERMITS_TRAIL"})
            if p.get("issuing_station_id"):
                links.append({"source": p["issuing_station_id"], "target": p["id"], "type": "ISSUED"})

        for t in self.trekkers:
            for cid in t.get("companion_ids", []):
                links.append({"source": t["id"], "target": cid, "type": "TREKKING_WITH"})

        for s in self.segments:
            links.append({
                "source": s["from"],
                "target": s["to"],
                "type": "LEADS_TO",
                "properties": {"distance_km": s["distance_km"], "is_passable": s.get("is_passable", True)}
            })

        for chk in self.checkins:
            links.append({"source": chk["trekker_id"], "target": chk["checkpoint_id"], "type": "LAST_SEEN_AT"})

        return {"nodes": nodes, "links": links}

mock_store = MockGraphStore()
