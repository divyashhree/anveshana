import React, { useState, useEffect } from 'react';
import {
  BookOpen, Clock, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Share2, HelpCircle, Lightbulb, Compass, Award
} from 'lucide-react';
import { fetchJourneys, fetchJourneyDetail } from '../api/client';
import { LearningJourney, JourneyStep } from '../types';

interface JourneysPageProps {
  initialJourneyId?: string;
  onSelectEntity: (entityId: string) => void;
  onAskAi: (query: string) => void;
  onOpenSource: (sourceId: string) => void;
}

export const JourneysPage: React.FC<JourneysPageProps> = ({
  initialJourneyId,
  onSelectEntity,
  onAskAi,
  onOpenSource
}) => {
  const [journeys, setJourneys] = useState<LearningJourney[]>([]);
  const [activeJourney, setActiveJourney] = useState<LearningJourney | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});

  useEffect(() => {
    fetchJourneys().then((list) => {
      setJourneys(list);
      const targetId = initialJourneyId || (list.length > 0 ? list[0].id : null);
      if (targetId) {
        loadJourney(targetId);
      }
    });

    const saved = localStorage.getItem('anveshana_journey_progress');
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {}
    }
  }, [initialJourneyId]);

  const loadJourney = (id: string) => {
    setLoading(true);
    fetchJourneyDetail(id)
      .then((j) => {
        setActiveJourney(j);
        setCurrentStepIndex(0);
      })
      .catch((err) => console.error('Failed to load journey:', err))
      .finally(() => setLoading(false));
  };

  const markStepComplete = (jId: string, stepIdx: number) => {
    const prev = completedSteps[jId] || [];
    if (!prev.includes(stepIdx)) {
      const updated = { ...completedSteps, [jId]: [...prev, stepIdx] };
      setCompletedSteps(updated);
      localStorage.setItem('anveshana_journey_progress', JSON.stringify(updated));
    }
  };

  const currentStep: JourneyStep | null = activeJourney ? activeJourney.steps[currentStepIndex] : null;
  const isLastStep = activeJourney ? currentStepIndex === activeJourney.steps.length - 1 : false;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Overview */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
          <BookOpen className="w-4 h-4" />
          <span>Curated Pedagogical Explorations</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          Interactive Knowledge Journeys
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Embark on guided, step-by-step historical investigations. Each journey connects ancient texts, mathematical principles, and technological breakthroughs with interactive prompts, reflection questions, and source citations.
        </p>
      </div>

      {/* Journeys Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {journeys.map((j) => {
          const isActive = activeJourney?.id === j.id;
          const completedCount = (completedSteps[j.id] || []).length;
          const isFinished = completedCount === j.steps.length;

          return (
            <button
              key={j.id}
              onClick={() => loadJourney(j.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-midnight-900 border-gold-500 shadow-gold-sm text-slate-100'
                  : 'bg-midnight-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                  <span className="uppercase text-gold-400">{j.discipline}</span>
                  {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <h3 className="font-serif font-bold text-xs line-clamp-2 leading-snug">
                  {j.title}
                </h3>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{j.estimated_minutes} min</span>
                <span>{j.steps.length} checkpoints</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE JOURNEY EXPERIENCE */}
      {loading && (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Preparing interactive journey checkpoints...</p>
        </div>
      )}

      {!loading && activeJourney && currentStep && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Journey Header Banner */}
          <div className="p-6 rounded-3xl bg-midnight-900 border border-gold-500/25 space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono text-gold-400 uppercase tracking-wider">
                {activeJourney.discipline} • Checkpoint {currentStepIndex + 1} of {activeJourney.steps.length}
              </span>
              <span className="text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated duration: {activeJourney.estimated_minutes} mins</span>
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              {activeJourney.title}
            </h2>
            <p className="text-sm text-slate-300 font-serif leading-relaxed">
              {activeJourney.subtitle}
            </p>

            {/* Stepper Progress Bar */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
                <span>Step {currentStepIndex + 1}: {currentStep.title}</span>
                <span>{Math.round(((currentStepIndex + 1) / activeJourney.steps.length) * 100)}% Completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / activeJourney.steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* STEP MAIN CONTENT CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-midnight-900 border border-slate-800 space-y-6 shadow-xl">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/30">
                  Checkpoint {currentStep.step_number}
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-100 mt-2">
                  {currentStep.title}
                </h3>
                <h4 className="text-sm text-gold-400/90 font-serif mt-0.5">
                  {currentStep.subtitle}
                </h4>
              </div>

              {/* Connected Entity Link */}
              <button
                onClick={() => onSelectEntity(currentStep.entity_id)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-gold-500/20 text-gold-300 border border-slate-700 hover:border-gold-500/40 text-xs font-medium flex items-center space-x-1.5 transition-colors shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Inspect in Graph</span>
              </button>
            </div>

            {/* Historical Narrative */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <p className="text-sm leading-relaxed text-slate-200 font-serif whitespace-pre-line">
                {currentStep.narrative}
              </p>
            </div>

            {/* Key Insight Callout */}
            <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-start space-x-3 text-xs sm:text-sm text-slate-200">
              <Lightbulb className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gold-300 block mb-0.5">Fundamental Epistemic Insight:</span>
                <p className="leading-relaxed">{currentStep.key_insight}</p>
              </div>
            </div>

            {/* Interactive Prompt & Challenge */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-start space-x-3 text-xs sm:text-sm text-slate-200">
              <Compass className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-300 block mb-0.5">Interactive Challenge / Thought Experiment:</span>
                <p className="leading-relaxed">{currentStep.interactive_prompt}</p>
              </div>
            </div>

            {/* Reflection Question */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
              <HelpCircle className="w-5 h-5 text-copper-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-copper-300 block mb-0.5">Scholarly Reflection:</span>
                <p className="italic leading-relaxed">"{currentStep.reflection_question}"</p>
              </div>
            </div>

            {/* Source Citations */}
            {currentStep.suggested_sources.length > 0 && (
              <div className="flex items-center space-x-2 pt-2 text-xs">
                <span className="text-slate-500 font-mono">Suggested Source:</span>
                {currentStep.suggested_sources.map((sId) => (
                  <button
                    key={sId}
                    onClick={() => onOpenSource(sId)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-gold-500/20 text-gold-300 border border-slate-700 transition-colors"
                  >
                    {sId}
                  </button>
                ))}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={isFirstStep}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 disabled:opacity-40 transition-colors flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <button
                onClick={() => {
                  onAskAi(`Explain "${currentStep.title}" from the journey "${activeJourney.title}"`);
                }}
                className="px-3 py-2 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/35 text-gold-300 text-xs font-medium flex items-center space-x-1.5 transition-colors hidden sm:flex"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Guide About This Step</span>
              </button>

              <button
                onClick={() => {
                  markStepComplete(activeJourney.id, currentStepIndex);
                  if (!isLastStep) {
                    setCurrentStepIndex((prev) => prev + 1);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-midnight-950 text-xs font-bold shadow-gold-sm hover:brightness-110 transition-all flex items-center space-x-1.5"
              >
                <span>{isLastStep ? 'Complete Journey' : 'Next Checkpoint'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
