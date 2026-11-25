from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class EntityCategory(str, Enum):
    MATHEMATICS = "mathematics"
    LINGUISTICS = "linguistics"
    ASTRONOMY = "astronomy"
    METALLURGY = "metallurgy"
    ARCHITECTURE_WATER = "architecture_water"
    PHILOSOPHY_EPISTEMOLOGY = "philosophy_epistemology"

class EntityType(str, Enum):
    SCHOLAR = "scholar"
    TEXT = "text"
    CONCEPT = "concept"
    PRINCIPLE = "principle"
    TECHNOLOGY = "technology"
    HISTORICAL_PERIOD = "historical_period"
    PLACE = "place"

class RelationType(str, Enum):
    AUTHORED = "authored"
    DESCRIBED_IN = "described_in"
    INFLUENCED = "influenced"
    RELATED_TO = "related_to"
    APPLIED_IN = "applied_in"
    DEVELOPED_DURING = "developed_during"
    DERIVED_FROM = "derived_from"
    COMPARED_WITH = "compared_with"
    BELONGS_TO = "belongs_to"
    CONTRIBUTED_TO = "contributed_to"

class SourceItem(BaseModel):
    id: str
    title: str
    authors: List[str]
    year: Optional[str] = None
    publication_type: str  # "Primary Text", "Peer-Reviewed Journal", "Critical Translation", "University Press Book", "Archaeological Report"
    publisher: Optional[str] = None
    doi_or_isbn: Optional[str] = None
    excerpt: str
    reliability_tier: str  # "Tier 1: Peer-Reviewed / Critical Edition", "Tier 2: Academic Monograph", "Tier 3: Standard Reference"
    verified: bool = True

class Entity(BaseModel):
    id: str
    name: str
    sanskrit_name: Optional[str] = None
    alternate_names: List[str] = []
    entity_type: EntityType
    category: EntityCategory
    period: str
    period_start_year: Optional[int] = None
    period_end_year: Optional[int] = None
    place_associated: Optional[str] = None
    short_summary: str
    detailed_description: str
    historical_context: str
    methodology_and_principles: Optional[str] = None
    significance: str
    primary_texts: List[str] = []
    associated_scholars: List[str] = []
    modern_comparisons: List[str] = []
    sources: List[str] = []  # list of source IDs
    tags: List[str] = []
    image_url: Optional[str] = None

class Relationship(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: RelationType
    description: str
    evidence_basis: str  # textual, epigraphical, mathematical, archaeological
    source_references: List[str] = []

class GraphNode(BaseModel):
    id: str
    label: str
    sanskrit_name: Optional[str] = None
    entity_type: EntityType
    category: EntityCategory
    period: str
    degree: int = 0
    short_summary: str

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relation_type: RelationType
    description: str

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ComparisonDimension(BaseModel):
    dimension_name: str  # e.g. "Historical Context", "Core Principles", "Methodology", "Purpose", "Similarities", "Differences", "Limitations"
    traditional_aspect: str
    modern_aspect: str
    comparative_analysis: str

class EvidenceLevel(str, Enum):
    CRITICAL_DISTINCTION = "Critical Distinction"
    DIRECT_EQUIVALENCE_REJECTED = "Direct Equivalence Rejected"
    STRUCTURAL_ANALOGY = "Structural Analogy"
    ALGORITHMIC_CONVERGENCE = "Algorithmic Convergence"
    DIRECT_HISTORICAL_INFLUENCE = "Documented Historical Transmission"
    FOUNDATIONAL_PRECURSOR = "Conceptual Precursor"

class ComparativeAnalysis(BaseModel):
    id: str
    title: str
    traditional_concept_id: str
    traditional_concept_name: str
    modern_concept_name: str
    discipline: EntityCategory
    evidence_level: EvidenceLevel
    evidence_justification: str
    executive_summary: str
    dimensions: List[ComparisonDimension]
    academic_caveat: str  # Warning against false equivalence
    scholarly_consensus: str
    key_sources: List[str]  # source IDs

class JourneyStep(BaseModel):
    step_number: int
    title: str
    entity_id: str
    subtitle: str
    narrative: str
    key_insight: str
    interactive_prompt: str
    reflection_question: str
    suggested_sources: List[str]

class LearningJourney(BaseModel):
    id: str
    title: str
    slug: str
    subtitle: str
    discipline: EntityCategory
    estimated_minutes: int
    prerequisites: List[str]
    overview: str
    learning_outcomes: List[str]
    steps: List[JourneyStep]

class Place(BaseModel):
    id: str
    name: str
    modern_location: str
    latitude: float
    longitude: float
    description: str
    historical_significance: str
    associated_entities: List[str]

class RAGQuery(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    focus_category: Optional[str] = None
    model_provider: Optional[str] = "local-grounded"  # "local-grounded", "gemini", "openai"
    stream: Optional[bool] = False

class Citation(BaseModel):
    source_id: str
    title: str
    author_or_text: str
    specific_verse_or_page: Optional[str] = None
    quoted_excerpt: str
    relevance_score: float

class RAGResponse(BaseModel):
    query: str
    direct_answer: str
    detailed_explanation: str
    historical_context: str
    key_takeaways: List[str]
    grounded_citations: List[Citation]
    related_entity_ids: List[str]
    suggested_followups: List[str]
    uncertainty_notes: Optional[str] = None
    confidence_level: str  # "High Confidence (Multiple Primary & Critical Sources)", "Moderate (Scholarly Interpretation)", "Speculative"
    mode: str  # "local-grounded-rag" or "api-llm"

class BookmarkCreate(BaseModel):
    entity_id: str
    entity_name: str
    category: str
    notes: Optional[str] = None
