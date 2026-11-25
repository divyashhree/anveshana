import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, ShieldCheck, BookOpen, Share2, HelpCircle,
  AlertTriangle, ArrowRight, CornerDownLeft, RefreshCw, CheckCircle2
} from 'lucide-react';
import { queryRAG } from '../api/client';
import { RAGResponse, Citation } from '../types';

interface AiGuidePageProps {
  initialQuery?: string;
  onSelectEntity: (entityId: string) => void;
  onOpenSource: (sourceId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  response?: RAGResponse;
  timestamp: string;
}

export const AiGuidePage: React.FC<AiGuidePageProps> = ({
  initialQuery,
  onSelectEntity,
  onOpenSource
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "How did Pingala's work relate to combinatorics and binary code?",
    "Explain Panini's grammatical generative engine and Ashtadhyayi.",
    "What is the historical metallurgy behind Wootz steel and Damascus blades?",
    "How were traditional Indian astronomical calculations performed by Aryabhata?",
    "What are the four Pramanas in Nyaya epistemology?",
    "How did traditional stepwells achieve subterranean microclimate cooling?"
  ];

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    } else if (messages.length === 0) {
      // Welcome assistant message
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: "Namaste. I am the ANVESHANA IKS Research Guide. I synthesize answers grounded strictly in primary Sanskrit treatises, critical archaeological excavations, and peer-reviewed academic literature. Ask about mathematics, linguistics, metallurgy, astronomy, water architecture, or epistemology.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ragRes = await queryRAG(q);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        response: ragRes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('RAG Error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an error retrieving primary grounded sources. Please ensure the backend service is reachable.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-4.5rem)] flex flex-col">
      
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-midnight-900 border border-gold-500/25 flex flex-wrap items-center justify-between gap-3 shrink-0 mb-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>ANVESHANA IKS Guide</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Grounded RAG
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Retrieval-Augmented Generation with primary textual citations • Zero fabrication guarantee
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([])}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1.5 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            {msg.sender === 'user' ? (
              <div className="max-w-xl p-4 rounded-2xl bg-gold-600/20 border border-gold-500/40 text-slate-100 text-xs sm:text-sm">
                <p className="font-medium">{msg.text}</p>
                <span className="text-[10px] text-gold-400/70 block text-right mt-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ) : (
              <div className="max-w-3xl w-full p-5 rounded-2xl bg-midnight-900 border border-slate-800 text-slate-200 text-xs sm:text-sm shadow-xl space-y-4">
                
                {/* Assistant greeting or plain text */}
                {msg.text && (
                  <p className="leading-relaxed text-slate-300">
                    {msg.text}
                  </p>
                )}

                {/* Structured RAG Response */}
                {msg.response && (
                  <div className="space-y-4">
                    
                    {/* Confidence & Mode Badge */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                      <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{msg.response.confidence_level}</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        Mode: {msg.response.mode}
                      </span>
                    </div>

                    {/* Direct Answer Highlight Box */}
                    <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/25">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-gold-400 mb-1.5 font-bold">
                        Grounded Synthesis
                      </h4>
                      <p className="text-sm font-serif leading-relaxed text-slate-100">
                        {msg.response.direct_answer}
                      </p>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="space-y-2 text-slate-300 leading-relaxed text-xs sm:text-sm">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
                        Comprehensive Scholarly Analysis
                      </h4>
                      <div className="whitespace-pre-line text-slate-300">
                        {msg.response.detailed_explanation}
                      </div>
                    </div>

                    {/* Historical Context */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                      <h5 className="font-mono text-[10px] uppercase text-gold-400/90 mb-1 font-semibold">
                        Historical & Intellectual Context
                      </h5>
                      <p>{msg.response.historical_context}</p>
                    </div>

                    {/* Key Takeaways */}
                    {msg.response.key_takeaways.length > 0 && (
                      <div className="space-y-1.5">
                        <h5 className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                          Key Takeaways
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.response.key_takeaways.map((point, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start space-x-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grounded Citations (Critical Feature) */}
                    {msg.response.grounded_citations.length > 0 && (
                      <div className="pt-2">
                        <h5 className="text-[11px] font-mono uppercase text-emerald-400 font-semibold mb-2 flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Grounded Primary Sources ({msg.response.grounded_citations.length})</span>
                        </h5>
                        <div className="space-y-2">
                          {msg.response.grounded_citations.map((cite, idx) => (
                            <div
                              key={idx}
                              onClick={() => onOpenSource(cite.source_id)}
                              className="p-3 rounded-lg bg-slate-950/80 hover:bg-emerald-950/20 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-slate-200">
                                  {cite.title}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Score: {Math.round(cite.relevance_score * 100)}%
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                By {cite.author_or_text} • Ref: {cite.specific_verse_or_page}
                              </p>
                              <blockquote className="text-[11px] italic text-slate-300 border-l border-gold-400/50 pl-2 mt-1.5">
                                "{cite.quoted_excerpt}"
                              </blockquote>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connected Knowledge Graph Nodes */}
                    {msg.response.related_entity_ids.length > 0 && (
                      <div className="pt-2">
                        <h5 className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1.5 flex items-center space-x-1.5">
                          <Share2 className="w-3.5 h-3.5 text-gold-400" />
                          <span>Connected Knowledge Graph Nodes</span>
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.response.related_entity_ids.map((eid) => (
                            <button
                              key={eid}
                              onClick={() => onSelectEntity(eid)}
                              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-gold-500/20 border border-slate-700 hover:border-gold-500/40 text-xs text-gold-300 transition-colors"
                            >
                              {eid.replace('ent-', '').replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Academic Uncertainty Note */}
                    {msg.response.uncertainty_notes && (
                      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-slate-300 flex items-start space-x-2 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-300">Scholarly Caveat: </span>
                          <span>{msg.response.uncertainty_notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Suggested Follow-up Questions */}
                    {msg.response.suggested_followups.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                          Suggested Inquiries
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.response.suggested_followups.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(q)}
                              className="text-left text-xs px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 hover:text-gold-300 text-slate-300 border border-slate-700 transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                <div className="text-[10px] text-slate-500 font-mono text-right">
                  {msg.timestamp}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="p-4 rounded-2xl bg-midnight-900 border border-slate-800 flex items-center space-x-3 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching vector embeddings and retrieving primary manuscript evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Sample Chips */}
      {messages.length <= 2 && (
        <div className="mb-3">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">
            Suggested Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs px-3 py-1.5 rounded-lg bg-midnight-900 border border-slate-800 hover:border-gold-500/40 text-slate-300 hover:text-gold-300 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a technical, historical, or comparative question regarding Indian Knowledge Systems..."
          className="w-full py-3.5 pl-4 pr-14 rounded-2xl bg-midnight-900 border border-slate-700/80 hover:border-gold-500/40 focus:border-gold-400 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none shadow-xl"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 p-2 rounded-xl bg-gold-500 text-midnight-950 hover:bg-gold-400 transition-colors disabled:opacity-40"
          title="Send query (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
