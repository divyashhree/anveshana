import React, { useState, useEffect } from 'react';
import {
  Scale, ShieldAlert, Sparkles, BookOpen, Check, AlertCircle,
  HelpCircle, ArrowRight, ArrowLeftRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { fetchComparisons, fetchComparisonDetail } from '../api/client';
import { ComparativeAnalysis, EvidenceLevel } from '../types';

interface ComparativeLabPageProps {
  initialComparisonId?: string;
  onAskAi: (query: string) => void;
  onOpenSource: (sourceId: string) => void;
  onSelectEntity: (entityId: string) => void;
}

const EVIDENCE_LEVEL_DESCRIPTIONS: Record<EvidenceLevel, { label: string; desc: string; color: string }> = {
  'Critical Distinction': {
    label: 'Critical Distinction',
    desc: 'Direct equivalence is explicitly rejected based on textual and historical analysis; concepts operate within fundamentally distinct cosmological or mathematical paradigms.',
    color: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
  },
  'Direct Equivalence Rejected': {
    label: 'Direct Equivalence Rejected',
    desc: 'Direct equivalence is explicitly rejected based on textual and historical analysis; concepts operate within fundamentally distinct cosmological or mathematical paradigms.',
    color: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
  },
  'Algorithmic Convergence': {
    label: 'Algorithmic Convergence',
    desc: 'The mathematical or empirical operations are structurally identical in logic and outcomes, having been discovered independently in different civilizations.',
    color: 'bg-gold-500/10 text-gold-300 border-gold-500/30'
  },
  'Structural Analogy': {
    label: 'Structural Analogy',
    desc: 'The systems share functional organization, multi-tiered architectures, or systemic goals, without literal physical identity.',
    color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
  },
  'Conceptual Precursor': {
    label: 'Conceptual Precursor',
    desc: 'The traditional idea formulated foundational mathematical or natural axioms that anticipated later global developments.',
    color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  },
  'Documented Historical Transmission': {
    label: 'Documented Historical Transmission',
    desc: 'Unambiguous textual evidence (such as translations into Arabic and Latin) proves historical transmission and influence.',
    color: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
  }
};

export const ComparativeLabPage: React.FC<ComparativeLabPageProps> = ({
  initialComparisonId,
  onAskAi,
  onOpenSource,
  onSelectEntity
}) => {
  const [comparisons, setComparisons] = useState<ComparativeAnalysis[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [currentComparison, setCurrentComparison] = useState<ComparativeAnalysis | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComparisons().then((list) => {
      setComparisons(list);
      if (initialComparisonId) {
        setSelectedId(initialComparisonId);
      } else if (list.length > 0) {
        setSelectedId(list[0].id);
      }
    });
  }, [initialComparisonId]);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetchComparisonDetail(selectedId)
      .then(setCurrentComparison)
      .catch((err) => console.error('Failed to load comparison:', err))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const filteredList = comparisons.filter(
    (c) => filterDiscipline === 'all' || c.discipline === filterDiscipline
  );

  const evidenceInfo = currentComparison
    ? EVIDENCE_LEVEL_DESCRIPTIONS[currentComparison.evidence_level] || {
        label: currentComparison.evidence_level,
        desc: currentComparison.evidence_justification,
        color: 'bg-slate-800 text-slate-300 border-slate-700'
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Academic Integrity Declaration */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-copper-400">
          <Scale className="w-4 h-4" />
          <span>Epistemic Comparative Analysis Engine</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          Comparative Analysis Lab
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Explore rigorous academic side-by-side evaluations comparing traditional Indian Knowledge Systems with contemporary scientific, technological, and computational principles. Every study separates established algorithmic convergence from misleading false equivalence.
        </p>
      </div>

      {/* Prominent Academic Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/35 flex items-start space-x-3.5 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-amber-300 text-xs sm:text-sm">
            Academic Integrity Principle: Rejection of False Equivalence
          </h4>
          <p className="leading-relaxed">
            ANVESHANA strictly avoids claiming that ancient thinkers had modern electronic computers, quantum mechanics, or modern aircraft. Instead, we examine whether ancient thinkers discovered mathematically isomorphic algorithms (such as Pingala's binary conversion) or empirical physical methods (such as crucible Wootz steel) within their historical context.
          </p>
        </div>
      </div>

      {/* Selection & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-midnight-900 border border-slate-800">
        
        {/* Comparison Selector Dropdown */}
        <div className="flex-1">
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Select Comparative Study
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-gold-500/40 text-xs sm:text-sm text-slate-100 focus:outline-none"
          >
            {filteredList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Discipline Filter */}
        <div className="w-full sm:w-56">
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Filter by Discipline
          </label>
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-gold-500/40 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Disciplines ({comparisons.length})</option>
            <option value="mathematics">Mathematics</option>
            <option value="linguistics">Linguistics</option>
            <option value="astronomy">Astronomy</option>
            <option value="metallurgy">Metallurgy</option>
            <option value="architecture_water">Architecture & Water</option>
            <option value="philosophy_epistemology">Epistemology & Logic</option>
          </select>
        </div>

      </div>

      {/* COMPARATIVE STUDY MAIN VIEW */}
      {loading && (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Synthesizing comparative dimensions...</p>
        </div>
      )}

      {!loading && currentComparison && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Executive Header Card */}
          <div className="p-6 rounded-3xl bg-midnight-900 border border-gold-500/30 space-y-5 shadow-xl">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Discipline: {currentComparison.discipline}
              </span>

              {/* Evidence Level Indicator */}
              {evidenceInfo && (
                <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center space-x-1.5 ${evidenceInfo.color}`}>
                  <Scale className="w-3.5 h-3.5" />
                  <span>Evidence Level: {evidenceInfo.label}</span>
                </div>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              {currentComparison.title}
            </h2>

            {/* Concept Bridges Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div 
                onClick={() => onSelectEntity(currentComparison.traditional_concept_id)}
                className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 hover:border-gold-400 cursor-pointer transition-colors group"
              >
                <span className="text-[10px] font-mono uppercase text-gold-400 block mb-1">
                  Traditional IKS Concept (Click to inspect)
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-gold-300">
                  {currentComparison.traditional_concept_name}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-[10px] font-mono uppercase text-indigo-400 block mb-1">
                  Contemporary Concept / Application
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-100">
                  {currentComparison.modern_concept_name}
                </h3>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                Executive Synthesis
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif">
                {currentComparison.executive_summary}
              </p>
            </div>

            {/* Evidence Level Justification Box */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 space-y-1">
              <h5 className="font-semibold text-gold-400 text-xs">
                Criteria for Evidence Rating:
              </h5>
              <p className="leading-relaxed">
                {currentComparison.evidence_justification}
              </p>
            </div>

            {/* Academic Caveat Highlight */}
            <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>Essential Academic Caveat:</span>
              </div>
              <p className="leading-relaxed">
                {currentComparison.academic_caveat}
              </p>
            </div>

          </div>

          {/* SIDE-BY-SIDE DIMENSIONS BREAKDOWN */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-slate-100">
                Dimensional Analysis
              </h3>
              <span className="text-xs text-slate-400">
                {currentComparison.dimensions.length} Core Dimensions Evaluated
              </span>
            </div>

            <div className="space-y-4">
              {currentComparison.dimensions.map((dim, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-midnight-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-gold-500/15 border border-gold-500/40 text-gold-400 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-serif text-base font-bold text-slate-100">
                      {dim.dimension_name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Traditional Aspect */}
                    <div className="p-3.5 rounded-xl bg-gold-500/5 border border-gold-500/20 text-xs">
                      <span className="font-mono text-[10px] uppercase text-gold-400 block mb-1 font-semibold">
                        Traditional IKS Form
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {dim.traditional_aspect}
                      </p>
                    </div>

                    {/* Modern Aspect */}
                    <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs">
                      <span className="font-mono text-[10px] uppercase text-indigo-400 block mb-1 font-semibold">
                        Modern Scientific Form
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {dim.modern_aspect}
                      </p>
                    </div>
                  </div>

                  {/* Comparative Analysis Text */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                    <span className="font-mono text-[10px] uppercase text-copper-400 block mb-1 font-semibold">
                      Comparative Assessment
                    </span>
                    <p className="leading-relaxed">
                      {dim.comparative_analysis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SCHOLARLY CONSENSUS & SOURCES */}
          <div className="p-6 rounded-2xl bg-midnight-900 border border-slate-800 space-y-4">
            <h4 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Academic Consensus & Primary Citations</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentComparison.scholarly_consensus}
            </p>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono text-[11px]">Primary Texts:</span>
                {currentComparison.key_sources.map((sId) => (
                  <button
                    key={sId}
                    onClick={() => onOpenSource(sId)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-gold-500/20 text-gold-300 text-xs border border-slate-700 hover:border-gold-500/40 transition-colors"
                  >
                    {sId}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onAskAi(`Explain the comparative analysis between ${currentComparison.traditional_concept_name} and ${currentComparison.modern_concept_name}`)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 font-semibold transition-colors border border-gold-500/40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Guide About This Comparison</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
