export type EntityCategory =
  | 'mathematics'
  | 'linguistics'
  | 'astronomy'
  | 'metallurgy'
  | 'architecture_water'
  | 'philosophy_epistemology';

export type EntityType =
  | 'scholar'
  | 'text'
  | 'concept'
  | 'principle'
  | 'technology'
  | 'historical_period'
  | 'place';

export type RelationType =
  | 'authored'
  | 'described_in'
  | 'influenced'
  | 'related_to'
  | 'applied_in'
  | 'developed_during'
  | 'derived_from'
  | 'compared_with'
  | 'belongs_to'
  | 'contributed_to';

export interface SourceItem {
  id: string;
  title: string;
  authors: string[];
  year?: string;
  publication_type: string;
  publisher?: string;
  doi_or_isbn?: string;
  excerpt: string;
  reliability_tier: string;
  verified: boolean;
}

export interface Entity {
  id: string;
  name: string;
  sanskrit_name?: string;
  alternate_names: string[];
  entity_type: EntityType;
  category: EntityCategory;
  period: string;
  period_start_year?: number;
  period_end_year?: number;
  place_associated?: string;
  short_summary: string;
  detailed_description: string;
  historical_context: string;
  methodology_and_principles?: string;
  significance: string;
  primary_texts: string[];
  associated_scholars: string[];
  modern_comparisons: string[];
  sources: string[];
  tags: string[];
  image_url?: string;
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: RelationType;
  description: string;
  evidence_basis: string;
  source_references: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  sanskrit_name?: string;
  entity_type: EntityType;
  category: EntityCategory;
  period: string;
  degree: number;
  short_summary: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relation_type: RelationType;
  description: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type EvidenceLevel =
  | 'Critical Distinction'
  | 'Direct Equivalence Rejected'
  | 'Structural Analogy'
  | 'Algorithmic Convergence'
  | 'Documented Historical Transmission'
  | 'Conceptual Precursor';

export interface ComparisonDimension {
  dimension_name: string;
  traditional_aspect: string;
  modern_aspect: string;
  comparative_analysis: string;
}

export interface ComparativeAnalysis {
  id: string;
  title: string;
  traditional_concept_id: string;
  traditional_concept_name: string;
  modern_concept_name: string;
  discipline: EntityCategory;
  evidence_level: EvidenceLevel;
  evidence_justification: string;
  executive_summary: string;
  dimensions: ComparisonDimension[];
  academic_caveat: string;
  scholarly_consensus: string;
  key_sources: string[];
}

export interface JourneyStep {
  step_number: number;
  title: string;
  entity_id: string;
  subtitle: string;
  narrative: string;
  key_insight: string;
  interactive_prompt: string;
  reflection_question: string;
  suggested_sources: string[];
}

export interface LearningJourney {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  discipline: EntityCategory;
  estimated_minutes: number;
  prerequisites: string[];
  overview: string;
  learning_outcomes: string[];
  steps: JourneyStep[];
}

export interface Place {
  id: string;
  name: string;
  modern_location: string;
  latitude: number;
  longitude: number;
  description: string;
  historical_significance: string;
  associated_entities: string[];
}

export interface Citation {
  source_id: string;
  title: string;
  author_or_text: string;
  specific_verse_or_page?: string;
  quoted_excerpt: string;
  relevance_score: number;
}

export interface RAGResponse {
  query: string;
  direct_answer: string;
  detailed_explanation: string;
  historical_context: string;
  key_takeaways: string[];
  grounded_citations: Citation[];
  related_entity_ids: string[];
  suggested_followups: string[];
  uncertainty_notes?: string;
  confidence_level: string;
  mode: string;
}

export interface Bookmark {
  entity_id: string;
  entity_name: string;
  category: string;
  notes?: string;
}
