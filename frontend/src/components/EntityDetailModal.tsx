import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Scale, Share2, BookOpen, Clock, MapPin,
  Bookmark, Check, ArrowRight, ShieldCheck, ExternalLink
} from 'lucide-react';
import { fetchEntityDetail, saveBookmark, removeBookmark, fetchBookmarks } from '../api/client';
import { Entity, SourceItem, ComparativeAnalysis } from '../types';

interface EntityDetailModalProps {
  entityId: string | null;
  onClose: () => void;
  onAskAi: (entityName: string) => void;
  onOpenComparison: (comparisonId: string) => void;
  onSelectEntity: (entityId: string) => void;
  onOpenSource: (sourceId: string) => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entityId,
  onClose,
  onAskAi,
  onOpenComparison,
  onSelectEntity,
  onOpenSource
}) => {
  const [data, setData] = useState<{
    entity: Entity;
    related_nodes: any[];
    sources: SourceItem[];
    comparisons: ComparativeAnalysis[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'context' | 'network' | 'sources' | 'comparisons'>('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!entityId) {
      setData(null);
      return;
    }

    setLoading(true);
    fetchEntityDetail(entityId)
      .then((res) => {
        setData(res);
        // check bookmark status
        fetchBookmarks().then((bms) => {
          setIsBookmarked(bms.bookmarks.some((b) => b.entity_id === entityId));
        });
      })
      .catch((err) => console.error('Failed to load entity detail:', err))
      .finally(() => setLoading(false));
  }, [entityId]);

  if (!entityId) return null;

  const toggleBookmark = async () => {
    if (!data?.entity) return;
    if (isBookmarked) {
      await removeBookmark(data.entity.id);
      setIsBookmarked(false);
    } else {
      await saveBookmark({
        entity_id: data.entity.id,
        entity_name: data.entity.name,
        category: data.entity.category,
        notes: data.entity.short_summary
      });
      setIsBookmarked(true);
    }
  };

  const entity = data?.entity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-midnight-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-midnight-900 border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-midnight-950 via-slate-900 to-midnight-950 border-b border-gold-500/20 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5 flex-wrap gap-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-300 font-semibold">
                {entity?.category.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {entity?.entity_type}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-slate-500" />
                {entity?.period}
              </span>
            </div>

            <div className="flex items-baseline space-x-3">
              <h2 className="font-serif text-2xl font-bold text-slate-100">
                {entity?.name}
              </h2>
              {entity?.sanskrit_name && (
                <span className="font-serif text-lg text-gold-400/90 font-medium">
                  {entity.sanskrit_name}
                </span>
              )}
            </div>

            {entity?.alternate_names && entity.alternate_names.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                Also known as: <span className="text-slate-300">{entity.alternate_names.join(', ')}</span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-gold-500/20 border-gold-400 text-gold-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isBookmarked ? "Remove from bookmarks" : "Bookmark this entity"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-gold-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-midnight-950/60 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview & Significance' },
            { id: 'context', label: 'Methodology & Context' },
            { id: 'network', label: `Connected Network (${data?.related_nodes.length || 0})` },
            { id: 'comparisons', label: `Modern Comparisons (${data?.comparisons.length || 0})` },
            { id: 'sources', label: `Primary Sources (${data?.sources.length || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-300 flex-1">
          {loading && (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Retrieving primary scholastic records...</p>
            </div>
          )}

          {!loading && entity && activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Short Summary Card */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-gold-500/20">
                <h4 className="text-xs uppercase font-mono tracking-wider text-gold-400 mb-1.5 font-semibold">
                  Executive Summary
                </h4>
                <p className="text-sm leading-relaxed text-slate-200 font-serif">
                  {entity.short_summary}
                </p>
              </div>

              {/* Detailed Description */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2 font-semibold">
                  Scholarly Analysis
                </h4>
                <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                  {entity.detailed_description}
                </p>
              </div>

              {/* Historical Significance */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs uppercase font-mono tracking-wider text-gold-400/90 mb-1.5 font-semibold">
                  Long-Term Impact & Epistemic Significance
                </h4>
                <p className="text-sm leading-relaxed text-slate-300">
                  {entity.significance}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {entity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!loading && entity && activeTab === 'context' && (
            <div className="space-y-5">
              {/* Historical Context */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="text-xs uppercase font-mono tracking-wider text-gold-400 mb-2 font-semibold flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Historical & Intellectual Setting
                </h4>
                <p className="text-sm leading-relaxed text-slate-300">
                  {entity.historical_context}
                </p>
              </div>

              {/* Methodology & Principles */}
              {entity.methodology_and_principles && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-copper-400 mb-2 font-semibold">
                    Core Methodology & Operating Principles
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {entity.methodology_and_principles}
                  </p>
                </div>
              )}

              {/* Associated Texts / Scholars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entity.primary_texts.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h5 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Associated Treatises</h5>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {entity.primary_texts.map((tId) => (
                        <button
                          key={tId}
                          onClick={() => onSelectEntity(tId)}
                          className="text-xs px-2 py-0.5 rounded bg-slate-800 text-gold-300 hover:bg-gold-500/20 transition-colors"
                        >
                          {tId.replace('ent-', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {entity.associated_scholars.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h5 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Associated Scholars</h5>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {entity.associated_scholars.map((sId) => (
                        <button
                          key={sId}
                          onClick={() => onSelectEntity(sId)}
                          className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                        >
                          {sId.replace('ent-', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && activeTab === 'network' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-3">
                Explicit relationships documented in academic literature connecting <strong className="text-slate-200">{entity?.name}</strong> to other nodes in the knowledge graph.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data?.related_nodes.map((rn, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectEntity(rn.id)}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-gold-500/10 border border-slate-800 hover:border-gold-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-gold-400">
                        {rn.relation_type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {rn.relation_direction}
                      </span>
                    </div>
                    <h5 className="text-sm font-medium text-slate-200 group-hover:text-gold-300 mt-2">
                      {rn.name}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {rn.relation_desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'comparisons' && (
            <div className="space-y-4">
              {data?.comparisons && data.comparisons.length > 0 ? (
                data.comparisons.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onOpenComparison(c.id);
                      onClose();
                    }}
                    className="p-4 rounded-xl bg-slate-900/60 hover:bg-copper-500/10 border border-slate-800 hover:border-copper-500/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-200 hover:text-copper-300">
                        {c.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-300">
                        {c.evidence_level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {c.executive_summary}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-copper-400 font-medium">
                      <span>Open detailed side-by-side comparative analysis</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <p>No dedicated side-by-side comparison article created for this node yet.</p>
                  <button
                    onClick={() => {
                      onAskAi(`Compare ${entity?.name} with modern principles`);
                      onClose();
                    }}
                    className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-gold-300 border border-slate-700 hover:border-gold-500/40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Guide to Compare</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'sources' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Primary Sanskrit editions, translations, and peer-reviewed academic monographs documenting this entity.
              </p>
              {data?.sources && data.sources.length > 0 ? (
                data.sources.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onOpenSource(s.id)}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-semibold text-slate-200">
                        {s.title}
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {s.reliability_tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {s.authors.join(', ')} ({s.year}) • {s.publisher}
                    </p>
                    <blockquote className="mt-2 text-xs italic text-slate-300 border-l-2 border-gold-500/40 pl-2.5 py-0.5 bg-slate-950/40 rounded-r">
                      "{s.excerpt}"
                    </blockquote>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-8 text-center">No primary sources linked directly.</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-midnight-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Academic Integrity Verified • Sourced from Critical Editions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (entity) onAskAi(`Explain ${entity.name} and its historical context`);
                onClose();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-300 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Guide</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
