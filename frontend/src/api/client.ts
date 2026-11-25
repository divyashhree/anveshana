import {
  Entity, GraphData, ComparativeAnalysis, LearningJourney,
  Place, SourceItem, RAGResponse, Bookmark
} from '../types';

const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchEntities(params?: { category?: string; entity_type?: string; search?: string }): Promise<Entity[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.entity_type) query.set('entity_type', params.entity_type);
  if (params?.search) query.set('search', params.search);
  
  const res = await fetch(`${API_BASE}/entities?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch entities');
  return res.json();
}

export async function fetchEntityDetail(entityId: string) {
  const res = await fetch(`${API_BASE}/entities/${entityId}`);
  if (!res.ok) throw new Error('Failed to fetch entity details');
  return res.json();
}

export async function fetchGraphData(category?: string, entity_type?: string): Promise<GraphData> {
  const query = new URLSearchParams();
  if (category) query.set('category', category);
  if (entity_type) query.set('entity_type', entity_type);
  
  const res = await fetch(`${API_BASE}/graph?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch graph data');
  return res.json();
}

export async function fetchGraphPath(sourceId: string, targetId: string) {
  const res = await fetch(`${API_BASE}/graph/path?source_id=${sourceId}&target_id=${targetId}`);
  if (!res.ok) throw new Error('Failed to compute graph path');
  return res.json();
}

export async function fetchNodeNeighbors(entityId: string) {
  const res = await fetch(`${API_BASE}/graph/neighbors/${entityId}`);
  if (!res.ok) throw new Error('Failed to fetch node neighborhood');
  return res.json();
}

export async function universalSearch(q: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function fetchComparisons(discipline?: string, evidence_level?: string): Promise<ComparativeAnalysis[]> {
  const query = new URLSearchParams();
  if (discipline) query.set('discipline', discipline);
  if (evidence_level) query.set('evidence_level', evidence_level);
  
  const res = await fetch(`${API_BASE}/comparisons?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch comparisons');
  return res.json();
}

export async function fetchComparisonDetail(comparisonId: string): Promise<ComparativeAnalysis> {
  const res = await fetch(`${API_BASE}/comparisons/${comparisonId}`);
  if (!res.ok) throw new Error('Failed to fetch comparison');
  return res.json();
}

export async function fetchJourneys(): Promise<LearningJourney[]> {
  const res = await fetch(`${API_BASE}/journeys`);
  if (!res.ok) throw new Error('Failed to fetch learning journeys');
  return res.json();
}

export async function fetchJourneyDetail(journeyId: string): Promise<LearningJourney> {
  const res = await fetch(`${API_BASE}/journeys/${journeyId}`);
  if (!res.ok) throw new Error('Failed to fetch journey');
  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${API_BASE}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch(`${API_BASE}/places`);
  if (!res.ok) throw new Error('Failed to fetch places');
  return res.json();
}

export async function fetchSources(publication_type?: string): Promise<SourceItem[]> {
  const query = new URLSearchParams();
  if (publication_type) query.set('publication_type', publication_type);
  const res = await fetch(`${API_BASE}/sources?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

export async function fetchSourceDetail(sourceId: string): Promise<SourceItem> {
  const res = await fetch(`${API_BASE}/sources/${sourceId}`);
  if (!res.ok) throw new Error('Failed to fetch source');
  return res.json();
}

export async function queryRAG(query: string, focus_category?: string): Promise<RAGResponse> {
  const res = await fetch(`${API_BASE}/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, focus_category })
  });
  if (!res.ok) throw new Error('RAG query failed');
  return res.json();
}

export async function fetchBookmarks(): Promise<{ count: number; bookmarks: Bookmark[] }> {
  try {
    const res = await fetch(`${API_BASE}/bookmarks`);
    if (res.ok) return res.json();
  } catch (e) {
    // fallback to localStorage
  }
  const local = localStorage.getItem('anveshana_bookmarks');
  const bms: Bookmark[] = local ? JSON.parse(local) : [];
  return { count: bms.length, bookmarks: bms };
}

export async function saveBookmark(bm: Bookmark) {
  try {
    const res = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bm)
    });
    if (res.ok) return res.json();
  } catch (e) {
    // fallback
  }
  const local = localStorage.getItem('anveshana_bookmarks');
  const bms: Bookmark[] = local ? JSON.parse(local) : [];
  if (!bms.some(b => b.entity_id === bm.entity_id)) {
    bms.push(bm);
    localStorage.setItem('anveshana_bookmarks', JSON.stringify(bms));
  }
  return { status: 'saved', bookmark: bm };
}

export async function removeBookmark(entityId: string) {
  try {
    await fetch(`${API_BASE}/bookmarks/${entityId}`, { method: 'DELETE' });
  } catch (e) {}
  const local = localStorage.getItem('anveshana_bookmarks');
  if (local) {
    const bms: Bookmark[] = JSON.parse(local);
    const filtered = bms.filter(b => b.entity_id !== entityId);
    localStorage.setItem('anveshana_bookmarks', JSON.stringify(filtered));
  }
}
