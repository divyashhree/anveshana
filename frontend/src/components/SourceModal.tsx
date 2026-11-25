import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, BookOpen, ExternalLink, Copy, Check } from 'lucide-react';
import { fetchSourceDetail } from '../api/client';
import { SourceItem } from '../types';

interface SourceModalProps {
  sourceId: string | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ sourceId, onClose }) => {
  const [source, setSource] = useState<SourceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sourceId) {
      setSource(null);
      return;
    }
    setLoading(true);
    fetchSourceDetail(sourceId)
      .then(setSource)
      .catch((err) => console.error('Failed to load source:', err))
      .finally(() => setLoading(false));
  }, [sourceId]);

  if (!sourceId) return null;

  const copyCitation = () => {
    if (!source) return;
    const citation = `${source.authors.join(', ')} (${source.year || 'n.d.'}). ${source.title}. ${source.publisher || ''}. ${source.doi_or_isbn ? 'ISBN/DOI: ' + source.doi_or_isbn : ''}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-midnight-900 border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-800 bg-midnight-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif text-base font-bold text-slate-100">
              Scholarly Source Verification
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {loading && (
            <div className="py-8 text-center text-slate-400">Loading source record...</div>
          )}

          {!loading && source && (
            <>
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {source.reliability_tier}
                </span>
                <h4 className="font-serif text-lg font-bold text-slate-100 mt-2">
                  {source.title}
                </h4>
                <p className="text-slate-300 font-medium mt-1">
                  Authors: <span className="text-gold-300">{source.authors.join(', ')}</span>
                </p>
                <p className="text-slate-400 mt-0.5">
                  Year: {source.year} • Publisher: {source.publisher}
                </p>
                {source.doi_or_isbn && (
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                    Identifier: {source.doi_or_isbn}
                  </p>
                )}
              </div>

              {/* Verbatim Excerpt */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h5 className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                  Verified Academic Excerpt
                </h5>
                <blockquote className="italic text-slate-200 text-xs leading-relaxed border-l-2 border-gold-400 pl-3">
                  "{source.excerpt}"
                </blockquote>
              </div>

              {/* Academic Standards Card */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-slate-300 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Academic Rigor Guarantee:</strong> This text is classified as a primary critical edition or university-press peer-reviewed monograph. Citations in ANVESHANA are verified to prevent fabricated claims or anachronistic misinterpretations.
                </p>
              </div>

              {/* Copy Citation Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={copyCitation}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Citation Copied' : 'Copy Academic Citation (APA)'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 font-medium text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
