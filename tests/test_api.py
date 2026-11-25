"""
ANVESHANA Automated Test Suite
Verifies backend APIs, Knowledge Graph relationships, RAG retrieval, citations, and comparative models.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from main import app, ENTITIES_DATA, RELATIONSHIPS_DATA, SOURCES_DATA, COMPARATIVE_DATA, JOURNEYS_DATA

client = TestClient(app)

def test_stats_endpoint():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_entities"] >= 50
    assert data["total_relationships"] >= 60
    assert data["total_sources"] >= 15
    assert data["total_comparisons"] >= 6
    assert data["total_journeys"] >= 5
    print("✓ test_stats_endpoint passed:", data)

def test_entities_endpoint():
    response = client.get("/api/entities")
    assert response.status_code == 200
    entities = response.json()
    assert len(entities) >= 50

    # Test filtering by mathematics
    math_res = client.get("/api/entities?category=mathematics")
    assert math_res.status_code == 200
    math_entities = math_res.json()
    assert len(math_entities) >= 10
    assert any(e["id"] == "ent-pingala" for e in math_entities)
    print("✓ test_entities_endpoint passed (total entities:", len(entities), "math entities:", len(math_entities), ")")

def test_entity_detail_and_network():
    response = client.get("/api/entities/ent-pingala")
    assert response.status_code == 200
    detail = response.json()
    assert detail["entity"]["name"] == "Pingala"
    assert len(detail["related_nodes"]) >= 2
    assert len(detail["sources"]) >= 1
    print("✓ test_entity_detail_and_network passed for Pingala")

def test_graph_and_pathfinding():
    # Graph data
    res = client.get("/api/graph")
    assert res.status_code == 200
    graph = res.json()
    assert len(graph["nodes"]) >= 50
    assert len(graph["edges"]) >= 60

    # Path finding: Pingala to Modern Binary
    path_res = client.get("/api/graph/path?source_id=ent-pingala&target_id=ent-binary-representation")
    assert path_res.status_code == 200
    path_data = path_res.json()
    assert path_data["found"] is True
    assert len(path_data["node_ids"]) >= 2
    print("✓ test_graph_and_pathfinding passed. Path found:", path_data["node_ids"])

def test_universal_search():
    # Search for "binary"
    res = client.get("/api/search?q=binary")
    assert res.status_code == 200
    s_data = res.json()
    assert s_data["total_results"] > 0
    assert any(e["id"] in ["ent-pingala", "ent-binary-representation", "ent-chandasastra"] for e in s_data["entities"])
    print("✓ test_universal_search passed for query 'binary':", s_data["total_results"], "hits")

def test_comparative_analysis():
    res = client.get("/api/comparisons")
    assert res.status_code == 200
    comps = res.json()
    assert len(comps) >= 6

    # Test detail
    comp_detail = client.get("/api/comparisons/comp-pingala-binary")
    assert comp_detail.status_code == 200
    c = comp_detail.json()
    assert "Pingala" in c["title"]
    assert len(c["dimensions"]) >= 4
    assert c["evidence_level"] == "Algorithmic Convergence"
    print("✓ test_comparative_analysis passed for Pingala vs Binary")

def test_learning_journeys():
    res = client.get("/api/journeys")
    assert res.status_code == 200
    journeys = res.json()
    assert len(journeys) >= 5
    
    # Detail for Journey 1
    j_detail = client.get(f"/api/journeys/{journeys[0]['id']}")
    assert j_detail.status_code == 200
    j = j_detail.json()
    assert len(j["steps"]) >= 4
    print("✓ test_learning_journeys passed for", j["title"], "with", len(j["steps"]), "steps")

def test_sources_catalog():
    res = client.get("/api/sources")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) >= 15
    assert all(s["verified"] is True for s in sources)
    print("✓ test_sources_catalog passed. Verified sources count:", len(sources))

def test_rag_assistant_grounding():
    # Test Pingala query
    payload = {"query": "How did Pingala's work relate to combinatorics and binary representations?"}
    res = client.post("/api/rag/query", json=payload)
    assert res.status_code == 200
    rag = res.json()
    assert "Pingala" in rag["direct_answer"]
    assert len(rag["grounded_citations"]) >= 1
    assert len(rag["key_takeaways"]) >= 2
    assert "High Confidence" in rag["confidence_level"]
    print("✓ test_rag_assistant_grounding passed. Citations returned:", len(rag["grounded_citations"]))

def test_bookmarks_persistence():
    # Add bookmark
    new_bm = {"entity_id": "ent-aryabhata", "entity_name": "Aryabhata", "category": "mathematics", "notes": "Test bookmark"}
    res = client.post("/api/bookmarks", json=new_bm)
    assert res.status_code == 200

    # Get bookmarks
    get_res = client.get("/api/bookmarks")
    assert get_res.status_code == 200
    bms = get_res.json()["bookmarks"]
    assert any(b["entity_id"] == "ent-aryabhata" for b in bms)

    # Delete bookmark
    del_res = client.delete("/api/bookmarks/ent-aryabhata")
    assert del_res.status_code == 200
    print("✓ test_bookmarks_persistence passed")

if __name__ == "__main__":
    test_stats_endpoint()
    test_entities_endpoint()
    test_entity_detail_and_network()
    test_graph_and_pathfinding()
    test_universal_search()
    test_comparative_analysis()
    test_learning_journeys()
    test_sources_catalog()
    test_rag_assistant_grounding()
    test_bookmarks_persistence()
    print("\n=========================================")
    print("ALL 10 VERIFICATION TESTS PASSED CLEANLY!")
    print("=========================================")
