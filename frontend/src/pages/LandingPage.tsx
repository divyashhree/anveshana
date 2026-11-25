import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Share2, Scale, BookOpen, ArrowRight, ShieldCheck,
  Compass, Award, Cpu, Code, Orbit, Flame, Droplets, Brain
} from 'lucide-react';
import { fetchStats, fetchComparisons, fetchJourneys } from '../api/client';
import { ComparativeAnalysis, LearningJourney } from '../types';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onSelectEntity: (entityId: string) => void;
  onSelectComparison: (comparisonId: string) => void;
  onSelectJourney: (journeyId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectEntity,
  onSelectComparison,
  onSelectJourney
}) => {
  const [stats, setStats] = useState<any>(null);
  const [comparisons, setComparisons] = useState<ComparativeAnalysis[]>([]);
  const [journeys, setJourneys] = useState<LearningJourney[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {});
    fetchComparisons().then((res) => setComparisons(res.slice(0, 3))).catch(() => {});
    fetchJourneys().then((res) => setJourneys(res.slice(0, 3))).catch(() => {});
  }, []);

  // Interactive Particle/Node Universe Canvas in Hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    // Node particles
    const nodes = [
      { name: 'Pingala', category: 'math', x: width * 0.2, y: height * 0.3, vx: 0.3, vy: -0.2, r: 8, color: '#D4AF37' },
      { name: 'Binary Code', category: 'math', x: width * 0.35, y: height * 0.25, vx: -0.2, vy: 0.3, r: 6, color: '#E6CA65' },
      { name: 'Panini', category: 'ling', x: width * 0.75, y: height * 0.3, vx: -0.25, vy: 0.25, r: 9, color: '#818CF8' },
      { name: 'Ashtadhyayi', category: 'ling', x: width * 0.85, y: height * 0.45, vx: 0.2, vy: -0.2, r: 7, color: '#A5B4FC' },
      { name: 'Aryabhata', category: 'astro', x: width * 0.3, y: height * 0.75, vx: 0.2, vy: -0.15, r: 8, color: '#38BDF8' },
      { name: 'Wootz Steel', category: 'metal', x: width * 0.7, y: height * 0.7, vx: -0.3, vy: -0.2, r: 8, color: '#FB923C' },
      { name: 'Stepwells', category: 'water', x: width * 0.5, y: height * 0.85, vx: 0.15, vy: 0.2, r: 7, color: '#34D399' },
      { name: 'Pramana', category: 'logic', x: width * 0.5, y: height * 0.2, vx: -0.15, vy: -0.2, r: 8, color: '#F472B6' },
      { name: 'Madhava', category: 'math', x: width * 0.15, y: height * 0.6, vx: 0.25, vy: 0.2, r: 7, color: '#D4AF37' },
      { name: 'Calculus', category: 'math', x: width * 0.25, y: height * 0.5, vx: -0.2, vy: -0.25, r: 6, color: '#E6CA65' },
    ];

    // Mouse interaction
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint background grid
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 30 || node.x > width - 30) node.vx *= -1;
        if (node.y < 30 || node.y > height - 30) node.vy *= -1;

        // Mouse avoidance/gravitation
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          node.x -= (dx / dist) * 1.5;
          node.y -= (dy / dist) * 1.5;
        }
      });

      // Draw edges between close nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const alpha = (1 - dist / 220) * 0.35;
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes and labels
      nodes.forEach((node) => {
        // Outer halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}22`;
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Node label
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.r + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const disciplines = [
    {
      id: 'mathematics',
      title: 'Mathematics & Combinatorics',
      sanskrit: 'गणितम्',
      icon: Cpu,
      color: 'border-gold-500/30 hover:border-gold-400 text-gold-300',
      bgGlow: 'from-gold-500/10',
      desc: 'Binary sequences, Meru Prastara binomial coefficients, decimal place-value, Kuttaka indeterminate equations, and infinite power series.',
      scholars: ['Pingala', 'Aryabhata', 'Brahmagupta', 'Madhava']
    },
    {
      id: 'linguistics',
      title: 'Linguistics & Generative Grammar',
      sanskrit: 'व्याकरणम्',
      icon: Code,
      color: 'border-indigo-500/30 hover:border-indigo-400 text-indigo-300',
      bgGlow: 'from-indigo-500/10',
      desc: "Panini's 3,959-rule generative grammar engine, Shiva Sutra phonological regular expressions, Karaka deep case theory, and Patanjali's Mahabhashya.",
      scholars: ['Panini', 'Patanjali', 'Katyayana']
    },
    {
      id: 'astronomy',
      title: 'Astronomy & Celestial Mechanics',
      sanskrit: 'ज्योतिषम्',
      icon: Orbit,
      color: 'border-sky-500/30 hover:border-sky-400 text-sky-300',
      bgGlow: 'from-sky-500/10',
      desc: 'Diurnal axial rotation of Earth, sine & cosine trigonometric tables, eclipse computation, and Nilakantha Somayaji’s geo-heliocentric planetary model.',
      scholars: ['Aryabhata', 'Varahamihira', 'Nilakantha']
    },
    {
      id: 'metallurgy',
      title: 'Metallurgy & Materials Science',
      sanskrit: 'धातुकर्म',
      icon: Flame,
      color: 'border-orange-500/30 hover:border-orange-400 text-orange-300',
      bgGlow: 'from-orange-500/10',
      desc: 'Wootz high-carbon crucible steel with carbon nanotube microstructures, the rustless Delhi Iron Pillar, and industrial downward zinc distillation at Zawar.',
      scholars: ['Crucible Smiths', 'Zawar Distillers', 'Chola Casters']
    },
    {
      id: 'architecture_water',
      title: 'Hydraulic Architecture & Water Systems',
      sanskrit: 'वास्तु एवं जलतन्त्र',
      icon: Droplets,
      color: 'border-emerald-500/30 hover:border-emerald-400 text-emerald-300',
      bgGlow: 'from-emerald-500/10',
      desc: 'Dholavira Bronze Age stormwater reservoir networks, subterranean stepwells (vavs/baolis) with geothermal cooling, and desert rainwater tankas.',
      scholars: ['Harappan Civil Engineers', 'Solanki Builders', 'Vastu Geometers']
    },
    {
      id: 'philosophy_epistemology',
      title: 'Epistemology & Formal Logic',
      sanskrit: 'प्रमाणशास्त्रम्',
      icon: Brain,
      color: 'border-pink-500/30 hover:border-pink-400 text-pink-300',
      bgGlow: 'from-pink-500/10',
      desc: 'Pramana epistemology, five-member Nyaya syllogisms uniting induction and deduction, Vyapti invariable concomitance, and Kanada’s atomic physics.',
      scholars: ['Akshapada Gautama', 'Kanada', 'Gangesha Upadhyaya']
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-gold-500/15 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950">
        
        {/* Subtle decorative radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold-500/5 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brand & Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Academic Research Platform & Digital Museum</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-[1.15]">
                Thousands of years of knowledge. <br />
                <span className="gold-gradient-text">One interconnected universe.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-xl mx-auto lg:mx-0">
                Explore the foundational concepts, mathematical treatises, linguistic automata, and metallurgical breakthroughs of Indian Knowledge Systems (IKS)—grounded in primary Sanskrit manuscripts and peer-reviewed historical scholarship.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('graph')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-midnight-950 font-bold text-sm shadow-gold-md hover:shadow-gold-lg hover:brightness-110 transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 text-midnight-950" />
                  <span>Explore the Knowledge Universe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('ai-guide')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-midnight-900 border border-gold-500/35 hover:border-gold-400 text-gold-300 font-medium text-sm hover:bg-gold-500/10 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Ask the IKS AI Guide</span>
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-center lg:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-serif text-slate-100">
                    {stats?.total_entities || '50+'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Curated Entities</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-serif text-gold-400">
                    {stats?.total_relationships || '100+'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Verified Connections</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-serif text-emerald-400">
                    100%
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Sourced & Grounded</div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Canvas Visualizer */}
            <div className="lg:col-span-6 relative">
              <div className="w-full h-[400px] sm:h-[450px] rounded-2xl border border-gold-500/25 bg-midnight-950/70 shadow-2xl relative overflow-hidden backdrop-blur-sm group">
                <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
                
                {/* Canvas Overlay Badge */}
                <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-2 px-3 py-1 rounded-lg bg-midnight-950/80 border border-gold-500/20 text-[11px] text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-mono">Live Interconnected Knowledge Mesh</span>
                </div>

                <div className="absolute bottom-4 right-4 pointer-events-none px-3 py-1 rounded-lg bg-midnight-950/80 border border-slate-800 text-[11px] text-slate-400">
                  Hover to interact with nodes
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DISCIPLINE EXPLORATION MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-3xl font-bold text-slate-100">
            Explore by Discipline
          </h2>
          <p className="text-sm text-slate-400">
            Six comprehensive domains of traditional Indian science, technology, architecture, and philosophy with structured nodes and explicit relationship networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disciplines.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                onClick={() => onNavigate('graph')}
                className={`p-6 rounded-2xl bg-midnight-900/80 border ${d.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 group-hover:border-gold-500/40 transition-colors">
                      <Icon className="w-5 h-5 text-gold-400" />
                    </div>
                    <span className="text-sm font-serif text-slate-400 group-hover:text-gold-300">
                      {d.sanskrit}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-gold-300 transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {d.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
                  <span>Pioneers: {d.scholars.join(', ')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-gold-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* THREE CORE PILLARS VISUAL ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-8 rounded-3xl bg-midnight-900 border border-gold-500/25 relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
            <span className="text-xs uppercase font-mono tracking-wider px-2.5 py-0.5 rounded bg-gold-500/10 border border-gold-500/30 text-gold-300">
              System Architecture
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              How ANVESHANA Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Three tightly integrated modules sharing a unified dataset to deliver verifiable, hallucination-resistant discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div 
              onClick={() => onNavigate('graph')}
              className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-gold-500/40 cursor-pointer transition-all hover:bg-slate-900/60"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-100">
                1. Interactive Knowledge Graph
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Explore real entities (scholars, texts, principles, places) interconnected by explicit relationships: <em>authored, influenced, described_in, applied_in</em>. Zoom, search, filter, and trace paths between concepts.
              </p>
            </div>

            {/* Pillar 2 */}
            <div 
              onClick={() => onNavigate('ai-guide')}
              className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-gold-500/40 cursor-pointer transition-all hover:bg-slate-900/60"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-100">
                2. Sourced RAG Assistant
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ask deep technical questions grounded in primary texts. Every answer provides direct citations, verifiable excerpts, key takeaways, and explicit uncertainty notes instead of ungrounded hallucinations.
              </p>
            </div>

            {/* Pillar 3 */}
            <div 
              onClick={() => onNavigate('comparisons')}
              className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-copper-500/40 cursor-pointer transition-all hover:bg-slate-900/60"
            >
              <div className="w-10 h-10 rounded-xl bg-copper-500/15 border border-copper-500/30 flex items-center justify-center text-copper-400 mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-100">
                3. Comparative Analysis Lab
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Responsible side-by-side comparative matrices between traditional and modern concepts. Transparent evidence-strength ratings safeguard against anachronistic claims of false equivalence.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED COMPARISONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              Featured Comparative Studies
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rigorous side-by-side analyses distinguishing genuine algorithmic convergence from false equivalence.
            </p>
          </div>
          <button
            onClick={() => onNavigate('comparisons')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300"
          >
            <span>View All Analyses ({stats?.total_comparisons || 8})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comparisons.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectComparison(c.id)}
              className="p-5 rounded-2xl bg-midnight-900 border border-slate-800 hover:border-copper-500/40 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {c.discipline}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-300 font-semibold">
                    {c.evidence_level}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-slate-100 group-hover:text-copper-300 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {c.executive_summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-copper-400 font-medium">
                <span>Inspect Dimensions</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LEARNING JOURNEYS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              Interactive Learning Journeys
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Curated pedagogical arcs taking you step-by-step through major conceptual breakthroughs.
            </p>
          </div>
          <button
            onClick={() => onNavigate('journeys')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300"
          >
            <span>View All Journeys ({stats?.total_journeys || 5})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {journeys.map((j) => (
            <div
              key={j.id}
              onClick={() => onSelectJourney(j.id)}
              className="p-5 rounded-2xl bg-midnight-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {j.discipline}
                  </span>
                  <span>{j.estimated_minutes} min journey</span>
                </div>

                <h3 className="font-serif text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {j.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {j.subtitle}
                </p>

                <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                  <span>{j.steps.length} interactive checkpoints</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                <span>Start Journey</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACADEMIC INTEGRITY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-midnight-900/90 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-slate-100">
                Scholarly Rigor & Citation Transparency
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                All claims distinguish primary textual evidence from later commentaries and modern interpretations. No unverified internet claims.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('sources')}
            className="shrink-0 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            Review Source Methodology
          </button>
        </div>
      </section>

    </div>
  );
};
