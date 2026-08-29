"""
Verification script for TrekPass FastAPI backend endpoints.
"""
import sys
import io

# Set UTF-8 encoding for Windows terminals
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["api_status"] == "online"
    print("[PASS] /api/health passed:", data["database"]["status"])

def test_get_passes():
    response = client.get("/api/passes/")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) > 0
    print(f"[PASS] /api/passes passed: {len(data['data'])} passes retrieved")

def test_multi_hop_pathfinding():
    response = client.post("/api/trails/pathfind", json={
        "start_checkpoint_id": "cp-1",
        "end_checkpoint_id": "cp-8"
    })
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data
    assert len(data["paths"]) > 0
    first_path = data["paths"][0]
    print(f"[PASS] /api/trails/pathfind (Multi-Hop 2+ Hops) passed: {first_path['hop_count']} hops, {first_path['total_distance_km']} km")

def test_emergency_evacuation():
    response = client.post("/api/trails/emergency-evacuation", json={
        "current_checkpoint_id": "cp-6"
    })
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert len(data["routes"]) > 0
    print(f"[PASS] /api/trails/emergency-evacuation (Evac to Medical) passed: {data['routes'][0]['destination_hospital']}")

def test_dashboard_stats():
    response = client.get("/api/stats/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "active_passes" in data["data"]
    print(f"[PASS] /api/stats/dashboard passed: {data['data']['active_passes']} active passes, {data['data']['total_trekkers']} trekkers")

def test_graph_visualization():
    response = client.get("/api/graph/visualize")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "nodes" in data["data"]
    assert "links" in data["data"]
    print(f"[PASS] /api/graph/visualize passed: {len(data['data']['nodes'])} nodes, {len(data['data']['links'])} edges")

if __name__ == "__main__":
    print("Running TrekPass API verification suite...")
    test_health()
    test_get_passes()
    test_multi_hop_pathfinding()
    test_emergency_evacuation()
    test_dashboard_stats()
    test_graph_visualization()
    print("\nALL BACKEND GRAPH TESTS PASSED SUCCESSFULLY!")
