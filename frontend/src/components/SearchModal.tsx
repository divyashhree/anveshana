import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Scale, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { universalSearch } from '../api/client';
import { Entity, SourceItem, ComparativeAnalysis, LearningJourney } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntity: (entityId: string) => void;
  onSelectComparison: (comparisonId: string) => void;
  onSelectJourney: (journeyId: string) => void;
  onSelectSource: (sourceId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectEntity,
  onSelectComparison,
  onSelectJourney,
  onSelectSource
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    entities: Entity[];
    sources: SourceItem[];
    comparisons: ComparativeAnalysis[];
    journeys: LearningJourney[];
  }>({ entities: [], sources: [], comparisons: [], journeys: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ entities: [], sources: [], comparisons: [], journeys: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ entities: [], sources: [], comparisons: [], journeys: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await universalSearch(query);
        setResults({
          entities: res.entities || [],
          sources: res.sources || [],
          comparisons: res.comparisons || [],
          journeys: res.journeys || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults = results.entities.length + results.comparisons.length + results.journeys.length + results.sources.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-midnight-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-midnight-900 border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-midnight-950/60">
          <Search className="w-5 h-5 text-gold-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scholars, texts, binary code, metallurgy, epistemology..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/80 border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-5 text-xs">
          {loading && (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching historical corpora...</span>
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-slate-500 space-y-3">
              <p>Type keywords to search across primary Sanskrit texts, concepts, and peer-reviewed sources.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Pingala', 'Panini', 'Wootz Steel', 'Aryabhata', 'Meru Prastara', 'Pramana', 'Stepwells'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setQuery(hint)}
                    className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 hover:border-gold-500/40 text-slate-300 hover:text-gold-300 text-[11px]"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-400">
              <p>No results found for "<span className="text-gold-300">{query}</span>".</p>
              <p className="text-slate-500 text-[11px] mt-1">Try broader terms like "mathematics", "linguistics", or a scholar name.</p>
            </div>
          )}

          {/* Entities Section */}
          {results.entities.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Knowledge Entities ({results.entities.length})</span>
                <span className="text-slate-500 text-[10px]">Click to view details</span>
              </h4>
              <div className="space-y-1.5">
                {results.entities.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onSelectEntity(e.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-gold-500/10 border border-slate-800 hover:border-gold-500/30 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-200 group-hover:text-gold-300 text-xs">
                          {e.name}
                        </span>
                        {e.sanskrit_name && (
                          <span className="text-[11px] text-gold-400/80 font-serif">
                            ({e.sanskrit_name})
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {e.category}
                        </span>
                      </div>
                      <p className="text-slate-400 line-clamp-1 mt-0.5 text-[11px]">
                        {e.short_summary}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-gold-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparisons Section */}
          {results.comparisons.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-copper-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Comparative Analyses ({results.comparisons.length})</span>
              </h4>
              <div className="space-y-1.5">
                {results.comparisons.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectComparison(c.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-copper-500/10 border border-slate-800 hover:border-copper-500/30 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium text-slate-200 group-hover:text-copper-300 text-xs">
                        {c.title}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                        Evidence Level: <strong className="text-gold-400">{c.evidence_level}</strong>
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-copper-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journeys Section */}
          {results.journeys.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learning Journeys ({results.journeys.length})</span>
              </h4>
              <div className="space-y-1.5">
                {results.journeys.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => {
                      onSelectJourney(j.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium text-slate-200 group-hover:text-indigo-300 text-xs">
                        {j.title}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        {j.subtitle} • {j.estimated_minutes} mins
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources Section */}
          {results.sources.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Primary & Peer-Reviewed Sources ({results.sources.length})</span>
              </h4>
              <div className="space-y-1.5">
                {results.sources.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectSource(s.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium text-slate-200 group-hover:text-emerald-300 text-xs">
                        {s.title}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        {s.authors.join(', ')} ({s.year}) • {s.reliability_tier}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-midnight-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or arrow keys</span>
          <span className="flex items-center space-x-1">
            <span>Press</span>
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
