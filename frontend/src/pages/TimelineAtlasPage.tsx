import React, { useState, useEffect } from 'react';
import {
  Clock, MapPin, Compass, Calendar, ArrowRight, Share2,
  BookOpen, Sparkles, Layers, Landmark
} from 'lucide-react';
import { fetchTimeline, fetchPlaces } from '../api/client';
import { Entity, Place } from '../types';

interface TimelineAtlasPageProps {
  onSelectEntity: (entityId: string) => void;
  onAskAi: (query: string) => void;
}

export const TimelineAtlasPage: React.FC<TimelineAtlasPageProps> = ({
  onSelectEntity,
  onAskAi
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'atlas'>('timeline');
  const [timelineData, setTimelineData] = useState<{ periods: Entity[]; chronological_milestones: Entity[] } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTimeline(), fetchPlaces()])
      .then(([tRes, pRes]) => {
        setTimelineData(tRes);
        setPlaces(pRes);
        if (pRes.length > 0) setSelectedPlace(pRes[0]);
      })
      .catch((err) => console.error('Failed to load timeline/atlas:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatYear = (year: number) => {
    if (year < 0) return `${Math.abs(year)} BCE`;
    return `${year} CE`;
  };

  const milestones = timelineData?.chronological_milestones || [];
  const filteredMilestones = milestones.filter((m) => {
    if (selectedPeriod === 'all') return true;
    if (selectedPeriod === 'vedic') return (m.period_start_year || 0) < -500;
    if (selectedPeriod === 'classical') return (m.period_start_year || 0) >= -500 && (m.period_start_year || 0) < 300;
    if (selectedPeriod === 'gupta') return (m.period_start_year || 0) >= 300 && (m.period_start_year || 0) < 650;
    if (selectedPeriod === 'medieval') return (m.period_start_year || 0) >= 650 && (m.period_start_year || 0) < 1350;
    if (selectedPeriod === 'kerala') return (m.period_start_year || 0) >= 1350;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-sky-400">
            <Clock className="w-4 h-4" />
            <span>Spatiotemporal Knowledge Coordinates</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mt-1">
            Timeline & Knowledge Atlas
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Explore the historical chronology and geographical epicenters of scientific discoveries, mathematical treatises, and architectural monuments across the Indian subcontinent.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-midnight-900 border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              activeTab === 'timeline'
                ? 'bg-gold-500 text-midnight-950 font-bold shadow-gold-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historical Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('atlas')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              activeTab === 'atlas'
                ? 'bg-gold-500 text-midnight-950 font-bold shadow-gold-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Geographical Atlas</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Mapping spatiotemporal coordinates...</p>
        </div>
      )}

      {/* VIEW 1: HISTORICAL CHRONOLOGICAL TIMELINE */}
      {!loading && activeTab === 'timeline' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Period Filter Buttons */}
          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-midnight-900 border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All Eras' },
              { id: 'vedic', label: 'Vedic & Vedanga (pre-500 BCE)' },
              { id: 'classical', label: 'Classical & Sutra (500 BCE – 300 CE)' },
              { id: 'gupta', label: 'Gupta Golden Age (300 – 650 CE)' },
              { id: 'medieval', label: 'Medieval Scholastic (650 – 1350 CE)' },
              { id: 'kerala', label: 'Kerala School (1350 – 1600 CE)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
                  selectedPeriod === p.id
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 shadow-gold-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Timeline Vertical Track */}
          <div className="relative border-l-2 border-gold-500/30 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 my-4">
            {filteredMilestones.map((m, idx) => {
              const yearStr = m.period_start_year !== undefined ? formatYear(m.period_start_year) : m.period;

              return (
                <div key={m.id} className="relative group">
                  {/* Timeline bullet node */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-midnight-950 border-2 border-gold-400 group-hover:bg-gold-400 group-hover:scale-125 transition-all shadow-gold-sm" />

                  {/* Milestone Card */}
                  <div className="p-5 rounded-2xl bg-midnight-900 border border-slate-800 hover:border-gold-500/40 transition-all hover:bg-slate-900/60 shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                        {yearStr}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {m.category.replace('_', ' ')} • {m.entity_type}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-2">
                      <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-gold-300 transition-colors">
                        {m.name}
                      </h3>
                      {m.sanskrit_name && (
                        <span className="font-serif text-sm text-gold-400/80">
                          ({m.sanskrit_name})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-serif">
                      {m.short_summary}
                    </p>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Historical Period: {m.period}
                      </span>
                      <button
                        onClick={() => onSelectEntity(m.id)}
                        className="inline-flex items-center space-x-1 text-gold-400 hover:text-gold-300 font-medium text-xs"
                      >
                        <span>View Entity Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: GEOGRAPHICAL KNOWLEDGE ATLAS */}
      {!loading && activeTab === 'atlas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          {/* Left Column: Interactive Map Canvas of Historical Centers */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-midnight-900 border border-gold-500/25 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-gold-400" />
                <span>Historical Centers of Science & Scholasticism</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {places.length} Mapped Centers
              </span>
            </div>

            {/* Stylized Historical Map Container */}
            <div className="relative w-full h-[450px] rounded-2xl bg-midnight-950 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
              
              {/* Subtle Map Grid lines */}
              <div className="absolute inset-0 bg-manuscript-pattern opacity-40 pointer-events-none" />

              {/* Subcontinental SVG outline graphic */}
              <svg viewBox="0 0 500 550" className="w-full h-full max-h-[420px] text-slate-800">
                {/* Simplified Coastline / River paths */}
                <path
                  d="M 120 80 Q 200 60 300 80 Q 380 120 400 200 Q 380 300 320 420 Q 250 500 220 520 Q 180 440 140 340 Q 100 260 120 180 Z"
                  fill="rgba(14, 20, 34, 0.6)"
                  stroke="rgba(212, 175, 55, 0.2)"
                  strokeWidth="1.5"
                />

                {/* Major Ancient Rivers (Indus, Ganga, Narmada, Godavari, Kaveri) */}
                <path d="M 140 100 Q 160 160 150 220" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" fill="none" />
                <path d="M 190 140 Q 260 150 380 180" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.2" fill="none" />
                <path d="M 180 250 Q 260 260 330 270" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" fill="none" />

                {/* Plot Centers */}
                {places.map((place) => {
                  // Map lat/long to SVG coords approx
                  // Longitude bounds: ~68 to ~88 -> x: 80 to 420
                  // Latitude bounds: ~35 to ~8 -> y: 60 to 490
                  const x = ((place.longitude - 68) / (88 - 68)) * 340 + 80;
                  const y = ((35 - place.latitude) / (35 - 8)) * 430 + 50;
                  const isSelected = selectedPlace?.id === place.id;

                  return (
                    <g
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse circle for selected */}
                      {isSelected && (
                        <circle cx={x} cy={y} r="14" fill="rgba(212, 175, 55, 0.2)" className="animate-ping" />
                      )}

                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '6' : '4.5'}
                        fill={isSelected ? '#D4AF37' : '#94A3B8'}
                        stroke="#0B0F19"
                        strokeWidth="1.5"
                        className="group-hover:fill-gold-400 transition-colors"
                      />

                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        fill={isSelected ? '#F8FAFC' : '#CBD5E1'}
                        fontSize="9"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        fontFamily="Plus Jakarta Sans, sans-serif"
                        className="pointer-events-none select-none"
                      >
                        {place.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Coordinates Overlay Note */}
              <div className="absolute bottom-3 left-3 text-[10px] text-slate-500 font-mono">
                Click pins to inspect historical center
              </div>
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {places.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlace(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    selectedPlace?.id === p.id
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Place Detail Dossier */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-midnight-900 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
            {selectedPlace ? (
              <div className="space-y-4">
                
                <div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-gold-400 uppercase">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Historical Learning Center</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-slate-100 mt-1">
                    {selectedPlace.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modern Location: <strong className="text-slate-200">{selectedPlace.modern_location}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Coordinates: {selectedPlace.latitude.toFixed(4)}° N, {selectedPlace.longitude.toFixed(4)}° E
                  </p>
                </div>

                {/* Description */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1 font-semibold">
                    Historical Overview
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedPlace.description}
                  </p>
                </div>

                {/* Historical Significance */}
                <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/25">
                  <h4 className="text-[11px] font-mono uppercase text-gold-400 mb-1 font-semibold">
                    Significance in Indian Science & Thought
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-serif">
                    {selectedPlace.historical_significance}
                  </p>
                </div>

                {/* Associated Scholars / Texts */}
                {selectedPlace.associated_entities.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-2 font-semibold">
                      Associated Scholars & Treatises
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlace.associated_entities.map((eid) => (
                        <button
                          key={eid}
                          onClick={() => onSelectEntity(eid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-gold-500/20 text-gold-300 border border-slate-700 text-xs font-medium transition-colors"
                        >
                          {eid.replace('ent-', '').replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                Select a learning center pin on the map.
              </div>
            )}

            {selectedPlace && (
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => onAskAi(`Explain the scientific and scholastic significance of ${selectedPlace.name}`)}
                  className="w-full py-2.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Ask AI Guide About {selectedPlace.name.split(' ')[0]}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
