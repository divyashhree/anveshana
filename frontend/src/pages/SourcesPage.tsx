import React, { useState, useEffect } from 'react';
import {
  FileText, ShieldCheck, BookOpen, ExternalLink, Search,
  CheckCircle2, Copy, Check
} from 'lucide-react';
import { fetchSources } from '../api/client';
import { SourceItem } from '../types';

interface SourcesPageProps {
  onOpenSource: (sourceId: string) => void;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({ onOpenSource }) => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchSources()
      .then(setSources)
      .catch((err) => console.error('Failed to load sources:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredSources = sources.filter((s) => {
    const matchesType = filterType === 'all' || s.publication_type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      s.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const copyCitation = (s: SourceItem) => {
    const text = `${s.authors.join(', ')} (${s.year || 'n.d.'}). ${s.title}. ${s.publisher || ''}. ${s.doi_or_isbn ? 'DOI/ISBN: ' + s.doi_or_isbn : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Methodology Statement */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Academic Integrity & Bibliographic Verification</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          Source Quality & Critical Editions
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          ANVESHANA treats source quality as a core architectural feature. Every knowledge entry, algorithm, and historical claim is verified against primary Sanskrit manuscripts, critical editions published by research bodies (e.g., INSA), or peer-reviewed academic literature.
        </p>
      </div>

      {/* Verification Methodology Card */}
      <div className="p-6 rounded-2xl bg-midnight-900 border border-emerald-500/25 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
        <div className="space-y-1.5">
          <h4 className="font-serif font-bold text-slate-100 flex items-center space-x-1.5 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tier 1: Critical Editions</span>
          </h4>
          <p className="leading-relaxed text-slate-400">
            Critical Sanskrit recensions and authoritative translations published by the Indian National Science Academy (INSA), Harvard Oriental Series, and Motilal Banarsidass.
          </p>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-serif font-bold text-slate-100 flex items-center space-x-1.5 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Peer-Reviewed Science</span>
          </h4>
          <p className="leading-relaxed text-slate-400">
            Rigorous articles published in peer-reviewed scientific journals (Nature, Current Science, Princeton University Press) verifying material compositions and algorithms.
          </p>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-serif font-bold text-slate-100 flex items-center space-x-1.5 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Archaeological Reports</span>
          </h4>
          <p className="leading-relaxed text-slate-400">
            Excavation reports from the Archaeological Survey of India (ASI) documenting stratigraphy, carbon dating, and material remains at Dholavira, Kodumanal, and Zawar.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-midnight-900 border border-slate-800">
        
        {/* Search */}
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, or excerpt..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-gold-500/40 text-xs text-slate-100 focus:outline-none"
          />
        </div>

        {/* Filter Type */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'Critical', label: 'Critical Editions' },
            { id: 'Journal', label: 'Journals (Nature/Current Science)' },
            { id: 'University', label: 'University Press Books' },
            { id: 'Archaeological', label: 'Archaeological Reports' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                filterType === btn.id
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

      </div>

      {/* SOURCES CARDS GRID */}
      {loading && (
        <div className="py-20 text-center text-slate-400">Loading verified source catalog...</div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="p-5 rounded-2xl bg-midnight-900 border border-slate-800 hover:border-gold-500/35 transition-all space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    {source.reliability_tier}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Year: {source.year}
                  </span>
                </div>

                <h3 
                  onClick={() => onOpenSource(source.id)}
                  className="font-serif text-lg font-bold text-slate-100 hover:text-gold-300 cursor-pointer transition-colors"
                >
                  {source.title}
                </h3>

                <p className="text-xs text-slate-300 font-medium">
                  Authors: <span className="text-gold-300">{source.authors.join(', ')}</span>
                </p>

                <p className="text-[11px] text-slate-400">
                  Publication: {source.publication_type} • Publisher: {source.publisher}
                  {source.doi_or_isbn && ` • ${source.doi_or_isbn}`}
                </p>

                {/* Excerpt */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs italic text-slate-200 leading-relaxed border-l-2 border-gold-400">
                  "{source.excerpt}"
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => copyCitation(source)}
                  className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedId === source.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenSource(source.id)}
                  className="text-gold-400 hover:text-gold-300 font-semibold"
                >
                  Inspect Full Record
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
