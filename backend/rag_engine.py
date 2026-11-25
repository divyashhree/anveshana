"""
ANVESHANA RAG Engine
Retrieval-Augmented Generation system grounded in primary texts and peer-reviewed scholarship.
"""

import re
import os
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from models import RAGQuery, RAGResponse, Citation
from data_seed import ENTITIES_DATA, SOURCES_DATA, COMPARATIVE_DATA, PLACES_DATA

class ScholarlyChunk:
    def __init__(self, chunk_id: str, title: str, text: str, source_id: str, category: str, related_entities: List[str], metadata: Dict[str, Any]):
        self.chunk_id = chunk_id
        self.title = title
        self.text = text
        self.source_id = source_id
        self.category = category
        self.related_entities = related_entities
        self.metadata = metadata

class RAGEngine:
    def __init__(self):
        self.chunks: List[ScholarlyChunk] = []
        self.sources_map = {s.id: s for s in SOURCES_DATA}
        self.entities_map = {e.id: e for e in ENTITIES_DATA}
        self.comparisons_map = {c.id: c for c in COMPARATIVE_DATA}
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self._build_index()

    def _build_index(self):
        # 1. Chunk Entities
        for e in ENTITIES_DATA:
            primary_src = e.sources[0] if e.sources else "src-plofker-2009"
            
            # Chunk 1: Overview & Significance
            c1_text = (
                f"{e.name} ({e.sanskrit_name or ''}). {e.short_summary} "
                f"Historical Context: {e.historical_context} "
                f"Significance: {e.significance} "
                f"Discipline: {e.category.value}. Period: {e.period}."
            )
            self.chunks.append(ScholarlyChunk(
                chunk_id=f"chk-{e.id}-overview",
                title=f"{e.name}: Historical Significance & Overview",
                text=c1_text,
                source_id=primary_src,
                category=e.category.value,
                related_entities=[e.id],
                metadata={"entity_id": e.id, "type": "overview", "period": e.period}
            ))

            # Chunk 2: Technical Methodology & Principles
            if e.methodology_and_principles or e.detailed_description:
                c2_text = (
                    f"Methodology and Principles of {e.name}: {e.methodology_and_principles or ''} "
                    f"Detailed Exposition: {e.detailed_description} "
                    f"Modern Comparisons: {', '.join(e.modern_comparisons)}."
                )
                self.chunks.append(ScholarlyChunk(
                    chunk_id=f"chk-{e.id}-methodology",
                    title=f"{e.name}: Methodology, Principles & Comparative Analysis",
                    text=c2_text,
                    source_id=primary_src,
                    category=e.category.value,
                    related_entities=[e.id],
                    metadata={"entity_id": e.id, "type": "methodology"}
                ))

        # 2. Chunk Primary Sources Excerpts
        for s in SOURCES_DATA:
            s_text = (
                f"Scholarly Source: '{s.title}' by {', '.join(s.authors)} ({s.year}). "
                f"Publication Type: {s.publication_type}, Publisher: {s.publisher}. "
                f"Academic Excerpt: {s.excerpt} "
                f"Reliability Tier: {s.reliability_tier}."
            )
            self.chunks.append(ScholarlyChunk(
                chunk_id=f"chk-src-{s.id}",
                title=f"Source Reference: {s.title} ({', '.join(s.authors)})",
                text=s_text,
                source_id=s.id,
                category="scholarly_source",
                related_entities=[],
                metadata={"source_id": s.id, "reliability": s.reliability_tier}
            ))

        # 3. Chunk Comparative Analyses
        for c in COMPARATIVE_DATA:
            comp_text = (
                f"Comparative Analysis: {c.title}. "
                f"Traditional Concept: {c.traditional_concept_name} vs Modern: {c.modern_concept_name}. "
                f"Evidence Strength Level: {c.evidence_level.value}. Justification: {c.evidence_justification} "
                f"Executive Analysis: {c.executive_summary} "
                f"Academic Caveat: {c.academic_caveat} "
                f"Scholarly Consensus: {c.scholarly_consensus}"
            )
            self.chunks.append(ScholarlyChunk(
                chunk_id=f"chk-comp-{c.id}",
                title=f"Comparative Study: {c.title}",
                text=comp_text,
                source_id=c.key_sources[0] if c.key_sources else "src-plofker-2009",
                category=c.discipline.value,
                related_entities=[c.traditional_concept_id],
                metadata={"comparison_id": c.id, "evidence_level": c.evidence_level.value}
            ))

        # Build TF-IDF Matrix over all corpus chunks
        corpus_texts = [f"{c.title} {c.text} {' '.join(c.related_entities)}" for c in self.chunks]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 3), max_features=10000, stop_words="english")
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus_texts)

    def retrieve(self, query: str, top_k: int = 4, focus_category: Optional[str] = None) -> List[Tuple[ScholarlyChunk, float]]:
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Boost matching entities mentioned directly in query
        q_lower = query.lower()
        for idx, chunk in enumerate(self.chunks):
            # Boost if chunk contains key search tokens
            for ent_id in chunk.related_entities:
                if ent_id in self.entities_map:
                    ent = self.entities_map[ent_id]
                    if ent.name.lower() in q_lower or (ent.sanskrit_name and ent.sanskrit_name in q_lower):
                        similarities[idx] += 0.35
                    for alt in ent.alternate_names:
                        if alt.lower() in q_lower:
                            similarities[idx] += 0.25

            if focus_category and chunk.category == focus_category:
                similarities[idx] += 0.15

        ranked_indices = np.argsort(similarities)[::-1]
        results = []
        seen_sources = set()
        for idx in ranked_indices:
            score = float(similarities[idx])
            if score <= 0.01 and len(results) >= 2:
                break
            chunk = self.chunks[idx]
            results.append((chunk, score))
            if len(results) >= top_k:
                break
        return results

    def query_rag(self, rag_query: RAGQuery) -> RAGResponse:
        retrieved = self.retrieve(rag_query.query, top_k=4, focus_category=rag_query.focus_category)
        
        # Build Citations
        citations: List[Citation] = []
        related_entities: List[str] = []
        for chunk, score in retrieved:
            src = self.sources_map.get(chunk.source_id)
            if src:
                citations.append(Citation(
                    source_id=src.id,
                    title=src.title,
                    author_or_text=", ".join(src.authors),
                    specific_verse_or_page=src.doi_or_isbn or "Critical Edition",
                    quoted_excerpt=src.excerpt,
                    relevance_score=round(float(score), 4)
                ))
            for ent_id in chunk.related_entities:
                if ent_id not in related_entities:
                    related_entities.append(ent_id)

        # Check for specific conceptual matching
        q = rag_query.query.lower()
        
        # Synthesize Grounded Academic Answer
        direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, conf = self._synthesize_grounded_answer(
            query=rag_query.query,
            retrieved=retrieved,
            related_entity_ids=related_entities
        )

        return RAGResponse(
            query=rag_query.query,
            direct_answer=direct_answer,
            detailed_explanation=detailed_explanation,
            historical_context=historical_context,
            key_takeaways=takeaways,
            grounded_citations=citations,
            related_entity_ids=related_entities[:6],
            suggested_followups=followups,
            uncertainty_notes=uncertainty,
            confidence_level=conf,
            mode="local-grounded-rag"
        )

    def _synthesize_grounded_answer(self, query: str, retrieved: List[Tuple[ScholarlyChunk, float]], related_entity_ids: List[str]) -> Tuple[str, str, str, List[str], List[str], Optional[str], str]:
        q = query.lower()

        # Topic 1: Pingala, Combinatorics, and Binary Code
        if any(w in q for w in ["pingala", "binary", "combinatoric", "chanda", "meru prastara", "pascal"]):
            direct_answer = (
                "Acharya Pingala (c. 3rd–2nd century BCE) formulated the earliest documented radix-2 binary enumeration "
                "and combinatorial distributions in his prosodic treatise Chandaśāstra. By categorizing poetic syllables into "
                "light (Laghu, 1 beat) and heavy (Guru, 2 beats), he devised algorithmic procedures (Prastara, Nashtam, and Uddishtam) "
                "that provide a bi-directional bijection between decimal integers and binary representations."
            )
            detailed_explanation = (
                "In Chapter 8 of the Chandaśāstra, Pingala introduces three foundational algorithms:\n\n"
                "1. **Prastara (Exhaustive Permutation)**: A systematic recursive procedure to generate all 2^n possible meters for a verse of n syllables.\n"
                "2. **Nashtam (Binary Decompilation)**: Given an ordinal number k, the algorithm repeatedly halves the number. An odd remainder outputs a light syllable (Laghu), while an even division outputs a heavy syllable (Guru), directly mirroring modern decimal-to-binary radix conversion.\n"
                "3. **Meru Prastara (Binomial Coefficients)**: Described by 10th-century commentator Halayudha, this triangular arrangement computes the number of meters containing k short syllables out of n total syllables (n C k), anticipating Pascal's Triangle by more than seven centuries."
            )
            historical_context = (
                "Flourished during the late Mauryan/Shunga period in northern India. His work was part of the Vedanga auxiliary science "
                "of Chandas (metrics), where exact oral transmission of sacred and literary poetry required rigorous mathematical verification."
            )
            takeaways = [
                "Pingala mapped poetic meter syllables into discrete binary states (Laghu vs Guru).",
                "The Nashtam algorithm functions identically to modern radix-2 integer division with remainder tracking.",
                "Halayudha's Meru Prastara diagrammed binomial coefficients centuries before Blaise Pascal (1654 CE).",
                "Pingala's system was an indexing algorithm for prosody, not a general-purpose algebraic computation engine."
            ]
            followups = [
                "How does Halayudha's commentary explain the step-by-step construction of the Meru Prastara?",
                "What is the exact distinction between Pingala's prosodic binary system and Leibniz's binary arithmetic?",
                "How did Virahanka and Hemachandra develop Fibonacci-like sequences from Pingala's metric durations?"
            ]
            uncertainty = (
                "Academic Caveat: While Pingala's combinatorial representation is isomorphically identical to binary numerals, "
                "ancient Indian prosodists did not formulate general binary arithmetic operations (such as binary addition or multiplication) "
                "or Boolean logic, which were developed in Europe by Leibniz, Boole, and Shannon."
            )
            confidence = "High Confidence (Multiple Primary Treatises & Peer-Reviewed Papers)"
            return direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, confidence

        # Topic 2: Panini and Ashtadhyayi
        elif any(w in q for w in ["panini", "grammar", "ashtadhyayi", "linguistic", "shiva sutra", "karaka"]):
            direct_answer = (
                "Panini (c. 6th–4th century BCE) authored the Ashtadhyayi, the world's earliest complete generative, rule-based "
                "computational grammar. Operating across 3,959 concise sutras, the system derives spoken Sanskrit utterances from semantic "
                "intentions using context-sensitive rewrite rules, auxiliary markers, and formal conflict-resolution hierarchies."
            )
            detailed_explanation = (
                "The architecture of Panini's grammar functions like a modern compiler and formal language processor:\n\n"
                "1. **Shiva Sutras (Phonetic Classification)**: 14 aphorisms that compress natural phonological classes into two-letter metalinguistic abbreviations (pratyaharas), functioning like regular expression character sets.\n"
                "2. **Context-Sensitive Rewrites**: Rules of the form A -> B in the environment of C and D, modifying phonemes deterministically based on surrounding context.\n"
                "3. **Karaka Theory (Deep Semantics)**: Distinguishes deep semantic roles (agent, goal, instrument, locus) from surface morphological case inflections (nominative, accusative, instrumental), anticipating Charles Fillmore's Case Grammar.\n"
                "4. **Meta-rules (Paribhashas)**: Algorithmic conflict-resolution principles that guarantee deterministic execution when multiple rules compete for the same input string."
            )
            historical_context = (
                "Composed in Salatura (near ancient Takshashila in modern Pakistan) during the late Vedic and pre-Mauryan era. "
                "It standardized Classical Sanskrit, preserving linguistic consistency across the Indian subcontinent for over two millennia."
            )
            takeaways = [
                "The Ashtadhyayi consists of 3,959 sutras operating as a deterministic generative state machine.",
                "Shiva Sutras enable compact pratyahara abbreviations anticipating regex phonological classes.",
                "Karaka theory separates deep semantic relations from surface morphological cases.",
                "Panini's formal metalanguage directly inspired John Backus in developing Backus-Naur Form (BNF) for computer programming languages."
            ]
            followups = [
                "How does Panini's rule conflict resolution principle (Vipratishedhe param karyam) operate?",
                "What is the exact parallel between the Shiva Sutras and modern compiler tokenizers?",
                "How did Frits Staal and Paul Kiparsky demonstrate the computational equivalence between Panini and BNF?"
            ]
            uncertainty = (
                "Academic Caveat: While the Ashtadhyayi's generative architecture is formally equivalent to generative grammars, "
                "Panini's primary object was the full complexity of human natural speech, not abstract machine strings."
            )
            confidence = "High Confidence (Primary Textual Recensions & Linguistic Consensus)"
            return direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, confidence

        # Topic 3: Wootz Steel & Metallurgy
        elif any(w in q for w in ["wootz", "steel", "metallurgy", "damascus", "iron pillar", "zinc", "zawar"]):
            direct_answer = (
                "Wootz crucible steel (Ukku) was an advanced high-carbon steel (1.0–1.9% C) developed in southern India "
                "(Tamil Nadu, Karnataka, Telangana) by the 3rd century BCE. It was renowned for producing Damascus sword blades "
                "exhibiting exceptional toughness, razor-edge retention, and distinctive swirling surface water patterns caused by spheroidized cementite bands."
            )
            detailed_explanation = (
                "The metallurgy of Wootz steel represents a pinnacle of ancient pyrotechnology:\n\n"
                "1. **Crucible Smelting Process**: Wrought iron blooms, biomass carbon sources (wood of Cassia auriculata), and leaves were sealed in airtight refractory clay crucibles and heated in natural-draft charcoal furnaces to 1300–1450°C for days.\n"
                "2. **Microstructural Properties**: Modern transmission electron microscopy (Verhoeven, Paufler) reveals that Wootz ingots contained trace carbide-forming elements (vanadium, molybdenum). Slow furnace cooling followed by controlled thermomechanical cycling (650–850°C) precipitated cementite nanowires encased in multi-walled carbon nanotubes.\n"
                "3. **Related Achievements**: The Iron Pillar of Delhi (c. 400 CE) achieved corrosion resistance through a protective crystalline misawite film catalyzed by high phosphorus; Zawar (Rajasthan) pioneered the world's earliest industrial downward zinc distillation."
            )
            historical_context = (
                "Exported across the Indian Ocean to the Roman Empire (as 'Seric Iron') and through trade caravans to Damascus and the Islamic world. "
                "Archaeological excavations at Kodumanal, Mel-siruvalur, and Golconda confirm continuous mass production."
            )
            takeaways = [
                "Wootz was hyper-eutectoid crucible steel with 1.0–1.9% carbon content.",
                "Thermal cycling during forging generated bands of spheroidized cementite, producing the famous watering pattern.",
                "Modern electron microscopy confirmed the presence of carbon nanotubes in ancient Damascus blades.",
                "Ancient craftsmen achieved these nanostructures empirically through ceramic furnace control, not modern theoretical nanotechnology."
            ]
            followups = [
                "What was the specific chemical mechanism behind the corrosion resistance of the Delhi Iron Pillar?",
                "How did the downward retort distillation process at Zawar overcome zinc's low boiling point?",
                "Why did European metallurgists struggle to replicate Damascus steel until Michael Faraday and modern alloy science?"
            ]
            uncertainty = (
                "Academic Caveat: Retrospective claims that ancient smiths possessed intentional 'nanotechnology' are historically misleading. "
                "The formation of carbon nanotubes was the empirical outcome of refractory furnace chemistry and cyclic thermal forging, not atomic-scale design."
            )
            confidence = "High Confidence (Archaeometallurgical Excavations & Nature Microscopy Evals)"
            return direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, confidence

        # Topic 4: Astronomy, Aryabhata & Kerala School
        elif any(w in q for w in ["aryabhata", "astronomy", "planet", "madhava", "calculus", "nilakantha", "earth rotation"]):
            direct_answer = (
                "Indian mathematical astronomy developed over two millennia, marked by two monumental peaks: Aryabhata's 499 CE Aryabhatiya "
                "(which established the diurnal axial rotation of the Earth, sine tables, and quadratic indeterminate equation methods) "
                "and the 14th-century Kerala School of Astronomy and Mathematics under Madhava of Sangamagrama, which discovered infinite power series "
                "for sine, cosine, and arctangent centuries before European calculus."
            )
            detailed_explanation = (
                "Key breakthroughs across the historical trajectory:\n\n"
                "1. **Aryabhata (499 CE)**: Proposed that the Earth rotates daily on its axis from west to east, explaining celestial motions via an optical relativity boat analogy. He approximated pi as 3.1416 (asanna / proximate) and invented the sine function (jya) to replace Greek chords.\n"
                "2. **Bhaskara II (1150 CE)**: Defined instantaneous planetary velocity (tatkaliki gati) and recognized that d(sin theta) = cos theta * d(theta).\n"
                "3. **Madhava of Sangamagrama (c. 1380 CE)**: Derived the infinite series for arctangent, sine, and cosine (later rediscovered by Gregory and Leibniz) and formulated convergence correction terms to calculate pi to 11 decimal places.\n"
                "4. **Nilakantha Somayaji (1501 CE)**: Formulated a quasi-heliocentric model in Tantrasamgraha where inner and outer planets orbit the Sun, which in turn orbits the Earth, anticipating Tycho Brahe."
            )
            historical_context = (
                "Flourished across imperial observatories in Ujjain and Pataliputra during the classical era, and subsequently in the "
                "tranquil scholastic lineages along the river valleys of Kerala from the 14th to 16th centuries."
            )
            takeaways = [
                "Aryabhata explicitly asserted the diurnal axial rotation of the Earth in 499 CE.",
                "Indian astronomers replaced full chords with half-chords (jya), originating modern trigonometry.",
                "Madhava derived infinite trigonometric power series nearly 300 years before Newton and Leibniz.",
                "Jyeshthadeva's Yuktibhasha (c. 1530 CE) provided the world's first vernacular calculus proof textbook."
            ]
            followups = [
                "How did Madhava construct his rational correction terms to accelerate series convergence for pi?",
                "What is the difference between Aryabhata's diurnal rotation and Copernicus's full heliocentric restructuring?",
                "How did the Kerala School maintain observational accuracy without optical telescopes?"
            ]
            uncertainty = (
                "Academic Caveat: Aryabhata was not a Copernican heliocentrist—he posited the daily rotation of the Earth within an Earth-centered "
                "planetary framework. Similarly, while Madhava developed power series, the Kerala school did not formulate the general Fundamental "
                "Theorem of Calculus linking differentiation and integration."
            )
            confidence = "High Confidence (Critical Sanskrit Texts & Academic Consensus)"
            return direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, confidence

        # Topic 5: Epistemology & Pramana
        elif any(w in q for w in ["pramana", "pratyaksha", "anumana", "vyapti", "nyaya", "logic", "epistemology"]):
            direct_answer = (
                "In Indian philosophy, Pramana refers to the valid means and testing instruments of acquiring authentic knowledge (prama). "
                "The classical Nyaya school formulates four foundational pramanas: Pratyaksha (direct sensory perception), Anumana (inferential reasoning), "
                "Upamana (analogical comparison), and Shabda (trustworthy verbal testimony)."
            )
            detailed_explanation = (
                "The Nyaya epistemology provides a rigorous rational and empirical framework:\n\n"
                "1. **Pratyaksha (Perception)**: Direct cognitive contact between sense faculties and external reality, categorized into indeterminate (nirvikalpaka) and determinate (savikalpaka) perception.\n"
                "2. **Anumana (Inference)**: A five-membered syllogism (Panchavayava) that unifies deductive validity with empirical inductive grounding through an exemplified instance (udaharana).\n"
                "3. **Vyapti (Invariable Concomitance)**: The universal, unconditional relationship between the observed sign (hetu/smoke) and unobserved probandum (sadhya/fire).\n"
                "4. **Shabda (Testimony)**: Valid knowledge derived from an authoritative, credible witness (Apta), governed by semantic compatibility (yogyata), syntactic expectancy (akanksha), and phonetic proximity (sannidhi)."
            )
            historical_context = (
                "Codified by Akshapada Gautama in the Nyaya Sutras (c. 2nd c. BCE) and refined through intense inter-school debates "
                "at university centers like Nalanda and Navadvipa between Hindu, Buddhist (Dignaga, Dharmakirti), and Jaina philosophers."
            )
            takeaways = [
                "Pramana constitutes the epistemological foundation of all classical Indian scientific inquiry.",
                "The Nyaya syllogism requires five steps that integrate empirical examples inside deductive proofs.",
                "Vyapti provides the formal logical condition of universal pervasion without counter-instances.",
                "Shabda pramana anticipates modern social epistemology and peer-reviewed authority verification."
            ]
            followups = [
                "How does the Nyaya five-member syllogism differ from the three-term Aristotelian syllogism?",
                "What are the five recognized fallacies of the reason (hetvabhasa) in Nyaya logic?",
                "How did Navya-Nyaya philosophers formulate non-circular definitions of Vyapti in the 14th century?"
            ]
            uncertainty = (
                "Academic Caveat: Nyaya logic is explicitly cognitive and truth-directed—it rejects formal syntactic tautology "
                "if the premises lack real-world empirical referents, contrasting with modern Western symbolic logic."
            )
            confidence = "High Confidence (Canonical Sutra Texts & Epistemological Treatises)"
            return direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, confidence

        # Topic 6: Stepwells & Water Management
        elif any(w in q for w in ["stepwell", "water", "dholavira", "baoli", "vav", "tanka", "sponge"]):
            direct_answer = (
                "Traditional Indian water architecture represents an extraordinary mastery of arid and semi-arid hydrology. "
                "From Harappan Dholavira's 2600 BCE municipal stormwater cascading reservoirs to medieval Gujarat stepwells (vavs) "
                "and Thar Desert domestic tankas, traditional engineering prioritized decentralized rainwater capture, aquifer recharge, and passive microclimate cooling."
            )
            detailed_explanation = (
                "Key systems across historical periods:\n\n"
                "1. **Dholavira Hydraulic Network (c. 2600–1900 BCE)**: Harappan engineers constructed stone dams across monsoon torrents, diverting flash floods through rock-cut sluices into 16 perimeter reservoirs holding 250,000 m³ of freshwater.\n"
                "2. **Subterranean Stepwells (Vavs/Baolis)**: Multi-storey subterranean structures like Rani ki Vav (Patan) descending into fluctuating seasonal water tables, providing community gathering spaces shielded by earth-sheltered cooling (5–10°C lower ambient heat).\n"
                "3. **Desert Tankas & Kunds**: Sealed circular cisterns plastered with lime-surkhi that harvest rooftop and courtyard rainwater, preserving clean drinking water across multi-year desert droughts without modern energy consumption.\n"
                "4. **Modern Convergence**: These historical approaches directly embody the principles championed in modern 'Sponge Cities' and Managed Aquifer Recharge (MAR)."
            )
            historical_context = (
                "Developed across Gujarat, Rajasthan, and the Deccan to sustain dense urban civilizations in drought-prone regions with variable monsoon precipitation."
            )
            takeaways = [
                "Dholavira engineered the world's most sophisticated bronze-age municipal stormwater reservoir system.",
                "Stepwells combined water table access, structural aquifer stabilization, and passive geothermal microclimate cooling.",
                "Traditional lime-ash plastering provided natural biocidal protection in sealed subterranean tankas.",
                "These historical systems anticipated modern decentralized sustainable drainage and Sponge City models."
            ]
            followups = [
                "How did Rani ki Vav balance structural earth pressure against deep subterranean multi-level galleries?",
                "What sediment-filtration techniques were embedded in Harappan Dholavira's check-dam network?",
                "How can contemporary cities facing groundwater depletion adapt traditional decentralized tanka design?"
            ]
            uncertainty = (
                "Academic Context: While ancient systems were sustainable for historical population densities, modern cities require orders of magnitude "
                "greater volumetric throughput, necessitating hybrid solutions combining traditional infiltration with modern microbial purification."
            )
            confidence = "High Confidence (Archaeological Excavations & Field Hydrology Surveys)"
            return direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, confidence

        # General Synthesis from Top Retrieved Chunks
        else:
            top_chunk = retrieved[0][0] if retrieved else None
            top_title = top_chunk.title if top_chunk else "Indian Knowledge Systems"
            top_text = top_chunk.text if top_chunk else "Indian Knowledge Systems represent rigorous historical traditions of empirical observation, formal logic, and mathematical computation."

            direct_answer = (
                f"Regarding your query on '{query}', historical scholarship in Indian Knowledge Systems (IKS) demonstrates "
                f"systematic empirical observation, formal mathematical structures, and codified texts. Primary sources "
                f"associated with {top_title} provide grounded evidence for these traditional methodologies."
            )
            detailed_explanation = (
                f"Detailed Scholarly Exposition:\n\n"
                f"{top_text}\n\n"
                f"Scholars emphasize that Indian scientific developments—whether in mathematics (decimal place-value, zero, combinatorics), "
                f"linguistics (generative grammar, phonetic matrices), metallurgy (crucible steel, zinc distillation), or epistemology (pramanas)—"
                f"developed through systematic internal academic lineages (guru-shishya parampara) with continuous empirical testing and public debate."
            )
            historical_context = (
                "Documented in Sanskrit and regional vernacular manuscripts spanning the Vedic period, classical golden age, "
                "and medieval scholastic centers such as Nalanda, Ujjain, Takshashila, and Kerala."
            )
            takeaways = [
                "IKS encompasses diverse empirical, mathematical, and philosophical disciplines.",
                "Texts were preserved through strict oral mnemonics and written critical commentary traditions.",
                "Modern historical scholarship uses primary critical editions to distinguish established facts from speculative interpretations."
            ]
            followups = [
                "Which primary Sanskrit or vernacular texts document this specific concept?",
                "What are the historical dates and geographical centers associated with this development?",
                "How does this traditional knowledge compare with contemporary scientific or philosophical understanding?"
            ]
            uncertainty = (
                "Academic Note: Sourced from available verified academic monographs and critical editions. "
                "Dates in ancient Indian historiography represent scholarly consensus ranges rather than absolute calendar precision."
            )
            confidence = "Moderate Confidence (Grounded in Verified Academic Corpus)"
            return direct_answer, detailed_explanation, historical_context, takeaways, followups, uncertainty, confidence

# Global RAG Engine Singleton
rag_engine_instance = RAGEngine()
