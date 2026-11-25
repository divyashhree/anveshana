"""
ANVESHANA FastAPI Backend
Interactive Exploration and Comparative Analysis of Indian Knowledge Systems
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import networkx as nx

from .models import (
    Entity, Relationship, GraphData, GraphNode, GraphEdge,
    SourceItem, ComparativeAnalysis, LearningJourney, Place,
    RAGQuery, RAGResponse, BookmarkCreate, EntityCategory, EntityType
)
from .data_seed import (
    ENTITIES_DATA, RELATIONSHIPS_DATA, SOURCES_DATA,
    COMPARATIVE_DATA, JOURNEYS_DATA, PLACES_DATA
)
from .rag_engine import rag_engine_instance

app = FastAPI(
    title="ANVESHANA API",
    description="Backend API for AI-Powered Interactive Exploration and Comparative Analysis of Indian Knowledge Systems",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory indices & graphs
ENTITIES_BY_ID: Dict[str, Entity] = {e.id: e for e in ENTITIES_DATA}
SOURCES_BY_ID: Dict[str, SourceItem] = {s.id: s for s in SOURCES_DATA}
COMPARISONS_BY_ID: Dict[str, ComparativeAnalysis] = {c.id: c for c in COMPARATIVE_DATA}
JOURNEYS_BY_ID: Dict[str, LearningJourney] = {j.id: j for j in JOURNEYS_DATA}
PLACES_BY_ID: Dict[str, Place] = {p.id: p for p in PLACES_DATA}

# Build NetworkX graph for path finding and centrality
G = nx.DiGraph()
for e in ENTITIES_DATA:
    G.add_node(e.id, label=e.name, category=e.category.value, type=e.entity_type.value)
for r in RELATIONSHIPS_DATA:
    if r.source_id in ENTITIES_BY_ID and r.target_id in ENTITIES_BY_ID:
        G.add_edge(r.source_id, r.target_id, id=r.id, relation=r.relation_type.value, description=r.description)

# In-memory user bookmarks & saved explorations
SAVED_BOOKMARKS: List[Dict[str, Any]] = [
    {"entity_id": "ent-pingala", "entity_name": "Pingala", "category": "mathematics", "notes": "Fascinating binary prosody origins"},
    {"entity_id": "ent-ashtadhyayi", "entity_name": "Ashtadhyayi", "category": "linguistics", "notes": "Generative grammar precursor to BNF"}
]

@app.get("/api/info")
def platform_info():
    return {
        "platform": "ANVESHANA",
        "subtitle": "Discover the connections within India's knowledge traditions.",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "entity_count": len(ENTITIES_DATA),
        "relationship_count": len(RELATIONSHIPS_DATA),
        "source_count": len(SOURCES_DATA),
        "comparisons_count": len(COMPARATIVE_DATA),
        "journeys_count": len(JOURNEYS_DATA)
    }

@app.get("/api/stats")
def get_stats():
    disciplines = {}
    for e in ENTITIES_DATA:
        c = e.category.value
        disciplines[c] = disciplines.get(c, 0) + 1

    return {
        "total_entities": len(ENTITIES_DATA),
        "total_relationships": len(RELATIONSHIPS_DATA),
        "total_sources": len(SOURCES_DATA),
        "total_comparisons": len(COMPARATIVE_DATA),
        "total_journeys": len(JOURNEYS_DATA),
        "total_places": len(PLACES_DATA),
        "disciplines_breakdown": disciplines
    }

@app.get("/api/entities", response_model=List[Entity])
def list_entities(
    category: Optional[str] = Query(None, description="Filter by discipline category"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (scholar, text, concept, etc.)"),
    period: Optional[str] = Query(None, description="Filter by historical period"),
    search: Optional[str] = Query(None, description="Search query string")
):
    results = ENTITIES_DATA
    if category:
        results = [e for e in results if e.category.value == category]
    if entity_type:
        results = [e for e in results if e.entity_type.value == entity_type]
    if period:
        results = [e for e in results if period.lower() in e.period.lower()]
    if search:
        q = search.lower()
        results = [
            e for e in results
            if q in e.name.lower()
            or (e.sanskrit_name and q in e.sanskrit_name)
            or any(q in alt.lower() for alt in e.alternate_names)
            or q in e.short_summary.lower()
            or any(q in tag.lower() for tag in e.tags)
        ]
    return results

@app.get("/api/entities/{entity_id}")
def get_entity_detail(entity_id: str):
    if entity_id not in ENTITIES_BY_ID:
        raise HTTPException(status_code=404, detail="Entity not found")
    entity = ENTITIES_BY_ID[entity_id]

    # Find incoming and outgoing relationships
    outgoing = [r for r in RELATIONSHIPS_DATA if r.source_id == entity_id]
    incoming = [r for r in RELATIONSHIPS_DATA if r.target_id == entity_id]

    # Connect related entities
    related_nodes = []
    for r in outgoing:
        if r.target_id in ENTITIES_BY_ID:
            tgt = ENTITIES_BY_ID[r.target_id]
            related_nodes.append({
                "id": tgt.id,
                "name": tgt.name,
                "type": tgt.entity_type.value,
                "category": tgt.category.value,
                "relation_direction": "outgoing",
                "relation_type": r.relation_type.value,
                "relation_desc": r.description
            })
    for r in incoming:
        if r.source_id in ENTITIES_BY_ID:
            src = ENTITIES_BY_ID[r.source_id]
            related_nodes.append({
                "id": src.id,
                "name": src.name,
                "type": src.entity_type.value,
                "category": src.category.value,
                "relation_direction": "incoming",
                "relation_type": r.relation_type.value,
                "relation_desc": r.description
            })

    # Resolve sources
    resolved_sources = [SOURCES_BY_ID[s_id] for s_id in entity.sources if s_id in SOURCES_BY_ID]

    # Find associated comparisons
    associated_comparisons = [
        c for c in COMPARATIVE_DATA
        if c.traditional_concept_id == entity_id
    ]

    return {
        "entity": entity,
        "related_nodes": related_nodes,
        "sources": resolved_sources,
        "comparisons": associated_comparisons
    }

@app.get("/api/graph", response_model=GraphData)
def get_graph_data(
    category: Optional[str] = Query(None, description="Filter nodes by category"),
    entity_type: Optional[str] = Query(None, description="Filter nodes by entity type")
):
    nodes_filtered = ENTITIES_DATA
    if category:
        nodes_filtered = [e for e in nodes_filtered if e.category.value == category]
    if entity_type:
        nodes_filtered = [e for e in nodes_filtered if e.entity_type.value == entity_type]

    active_ids = {e.id for e in nodes_filtered}

    graph_nodes: List[GraphNode] = []
    for e in nodes_filtered:
        # Calculate degree from whole network
        deg = G.degree(e.id) if e.id in G else 0
        graph_nodes.append(GraphNode(
            id=e.id,
            label=e.name,
            sanskrit_name=e.sanskrit_name,
            entity_type=e.entity_type,
            category=e.category,
            period=e.period,
            degree=deg,
            short_summary=e.short_summary
        ))

    graph_edges: List[GraphEdge] = []
    for r in RELATIONSHIPS_DATA:
        if r.source_id in active_ids and r.target_id in active_ids:
            graph_edges.append(GraphEdge(
                id=r.id,
                source=r.source_id,
                target=r.target_id,
                label=r.relation_type.value.replace("_", " ").title(),
                relation_type=r.relation_type,
                description=r.description
            ))

    return GraphData(nodes=graph_nodes, edges=graph_edges)

@app.get("/api/graph/path")
def find_graph_path(
    source_id: str = Query(..., description="Start node ID"),
    target_id: str = Query(..., description="End node ID")
):
    if source_id not in G or target_id not in G:
        raise HTTPException(status_code=404, detail="One or both nodes not found in graph")
    
    # Check shortest path in undirected version for connectivity
    G_undirected = G.to_undirected()
    try:
        path = nx.shortest_path(G_undirected, source=source_id, target=target_id)
        path_nodes = [ENTITIES_BY_ID[node_id] for node_id in path if node_id in ENTITIES_BY_ID]
        
        path_edges = []
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            matching_rel = [
                r for r in RELATIONSHIPS_DATA
                if (r.source_id == u and r.target_id == v) or (r.source_id == v and r.target_id == u)
            ]
            if matching_rel:
                path_edges.append(matching_rel[0])

        return {
            "found": True,
            "path_length": len(path) - 1,
            "node_ids": path,
            "nodes": path_nodes,
            "edges": path_edges
        }
    except nx.NetworkXNoPath:
        return {
            "found": False,
            "message": f"No connected path found between '{source_id}' and '{target_id}'"
        }

@app.get("/api/graph/neighbors/{entity_id}")
def get_node_neighbors(entity_id: str):
    if entity_id not in ENTITIES_BY_ID:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    outgoing_ids = [r.target_id for r in RELATIONSHIPS_DATA if r.source_id == entity_id]
    incoming_ids = [r.source_id for r in RELATIONSHIPS_DATA if r.target_id == entity_id]
    all_neighbor_ids = list(set(outgoing_ids + incoming_ids))

    neighbor_nodes = [ENTITIES_BY_ID[nid] for nid in all_neighbor_ids if nid in ENTITIES_BY_ID]
    neighbor_edges = [
        r for r in RELATIONSHIPS_DATA
        if r.source_id == entity_id or r.target_id == entity_id
    ]

    return {
        "central_entity": ENTITIES_BY_ID[entity_id],
        "neighbor_count": len(neighbor_nodes),
        "neighbors": neighbor_nodes,
        "edges": neighbor_edges
    }

@app.get("/api/search")
def universal_search(q: str = Query(..., min_length=1, description="Search term")):
    term = q.lower().strip()
    
    # 1. Matching Entities
    matched_entities = []
    for e in ENTITIES_DATA:
        score = 0
        if term == e.name.lower() or (e.sanskrit_name and term == e.sanskrit_name.lower()):
            score += 100
        elif term in e.name.lower() or (e.sanskrit_name and term in e.sanskrit_name.lower()):
            score += 50
        elif any(term in alt.lower() for alt in e.alternate_names):
            score += 40
        elif any(term in tag.lower() for tag in e.tags):
            score += 30
        elif term in e.short_summary.lower():
            score += 20
        elif term in e.historical_context.lower() or term in e.detailed_description.lower():
            score += 10

        if score > 0:
            matched_entities.append((score, e))

    matched_entities.sort(key=lambda x: x[0], reverse=True)

    # 2. Matching Sources
    matched_sources = []
    for s in SOURCES_DATA:
        if term in s.title.lower() or any(term in a.lower() for a in s.authors) or term in s.excerpt.lower():
            matched_sources.append(s)

    # 3. Matching Comparisons
    matched_comparisons = []
    for c in COMPARATIVE_DATA:
        if term in c.title.lower() or term in c.traditional_concept_name.lower() or term in c.modern_concept_name.lower() or term in c.executive_summary.lower():
            matched_comparisons.append(c)

    # 4. Matching Journeys
    matched_journeys = []
    for j in JOURNEYS_DATA:
        if term in j.title.lower() or term in j.subtitle.lower() or term in j.overview.lower():
            matched_journeys.append(j)

    return {
        "query": q,
        "total_results": len(matched_entities) + len(matched_sources) + len(matched_comparisons) + len(matched_journeys),
        "entities": [e for _, e in matched_entities[:10]],
        "sources": matched_sources[:5],
        "comparisons": matched_comparisons[:5],
        "journeys": matched_journeys[:3]
    }

@app.get("/api/comparisons", response_model=List[ComparativeAnalysis])
def list_comparisons(
    discipline: Optional[str] = Query(None, description="Filter by discipline"),
    evidence_level: Optional[str] = Query(None, description="Filter by evidence strength level")
):
    results = COMPARATIVE_DATA
    if discipline:
        results = [c for c in results if c.discipline.value == discipline]
    if evidence_level:
        results = [c for c in results if c.evidence_level.value == evidence_level]
    return results

@app.get("/api/comparisons/{comparison_id}", response_model=ComparativeAnalysis)
def get_comparison(comparison_id: str):
    if comparison_id not in COMPARISONS_BY_ID:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return COMPARISONS_BY_ID[comparison_id]

@app.get("/api/journeys", response_model=List[LearningJourney])
def list_journeys(discipline: Optional[str] = Query(None, description="Filter by discipline")):
    results = JOURNEYS_DATA
    if discipline:
        results = [j for j in results if j.discipline.value == discipline]
    return results

@app.get("/api/journeys/{journey_id}", response_model=LearningJourney)
def get_journey(journey_id: str):
    if journey_id not in JOURNEYS_BY_ID:
        raise HTTPException(status_code=404, detail="Learning journey not found")
    return JOURNEYS_BY_ID[journey_id]

@app.get("/api/timeline")
def get_timeline():
    # Return entities sorted chronologically by start year
    dated_entities = [e for e in ENTITIES_DATA if e.period_start_year is not None]
    dated_entities.sort(key=lambda x: x.period_start_year)

    periods = [e for e in ENTITIES_DATA if e.entity_type == EntityType.HISTORICAL_PERIOD]
    periods.sort(key=lambda x: x.period_start_year or 0)

    return {
        "periods": periods,
        "chronological_milestones": dated_entities
    }

@app.get("/api/places", response_model=List[Place])
def list_places():
    return PLACES_DATA

@app.get("/api/places/{place_id}")
def get_place_detail(place_id: str):
    if place_id not in PLACES_BY_ID:
        raise HTTPException(status_code=404, detail="Place not found")
    place = PLACES_BY_ID[place_id]
    associated_entities = [ENTITIES_BY_ID[eid] for eid in place.associated_entities if eid in ENTITIES_BY_ID]
    return {
        "place": place,
        "entities": associated_entities
    }

@app.get("/api/sources", response_model=List[SourceItem])
def list_sources(
    publication_type: Optional[str] = Query(None, description="Filter by publication type"),
    verified_only: bool = Query(True, description="Only show verified sources")
):
    results = SOURCES_DATA
    if verified_only:
        results = [s for s in results if s.verified]
    if publication_type:
        results = [s for s in results if publication_type.lower() in s.publication_type.lower()]
    return results

@app.get("/api/sources/{source_id}", response_model=SourceItem)
def get_source(source_id: str):
    if source_id not in SOURCES_BY_ID:
        raise HTTPException(status_code=404, detail="Source not found")
    return SOURCES_BY_ID[source_id]

@app.post("/api/rag/query", response_model=RAGResponse)
def query_rag_assistant(query_data: RAGQuery):
    if not query_data.query or not query_data.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return rag_engine_instance.query_rag(query_data)

@app.get("/api/bookmarks")
def get_bookmarks():
    return {
        "count": len(SAVED_BOOKMARKS),
        "bookmarks": SAVED_BOOKMARKS
    }

@app.post("/api/bookmarks")
def add_bookmark(bm: BookmarkCreate):
    existing = [b for b in SAVED_BOOKMARKS if b["entity_id"] == bm.entity_id]
    if existing:
        return {"status": "already_bookmarked", "bookmark": existing[0]}
    
    new_bm = {
        "entity_id": bm.entity_id,
        "entity_name": bm.entity_name,
        "category": bm.category,
        "notes": bm.notes or "Saved exploration item"
    }
    SAVED_BOOKMARKS.append(new_bm)
    return {"status": "saved", "bookmark": new_bm}

@app.delete("/api/bookmarks/{entity_id}")
def remove_bookmark(entity_id: str):
    global SAVED_BOOKMARKS
    SAVED_BOOKMARKS = [b for b in SAVED_BOOKMARKS if b["entity_id"] != entity_id]
    return {"status": "deleted", "entity_id": entity_id}

# Mount static frontend build if present
import os
from fastapi.staticfiles import StaticFiles
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

