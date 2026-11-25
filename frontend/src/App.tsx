import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchModal } from './components/SearchModal';
import { EntityDetailModal } from './components/EntityDetailModal';
import { SourceModal } from './components/SourceModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';

import { LandingPage } from './pages/LandingPage';
import { GraphPage } from './pages/GraphPage';
import { AiGuidePage } from './pages/AiGuidePage';
import { ComparativeLabPage } from './pages/ComparativeLabPage';
import { JourneysPage } from './pages/JourneysPage';
import { TimelineAtlasPage } from './pages/TimelineAtlasPage';
import { SourcesPage } from './pages/SourcesPage';

import { fetchBookmarks, removeBookmark } from './api/client';
import { Bookmark } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals & Drawers state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Cross-page navigation state
  const [aiInitialQuery, setAiInitialQuery] = useState<string>('');
  const [activeComparisonId, setActiveComparisonId] = useState<string | undefined>(undefined);
  const [activeJourneyId, setActiveJourneyId] = useState<string | undefined>(undefined);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    fetchBookmarks().then((res) => setBookmarks(res.bookmarks)).catch(() => {});
  }, []);

  // Sync dark mode class on HTML root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAskAi = (query: string) => {
    setAiInitialQuery(query);
    setActiveTab('ai-guide');
  };

  const handleOpenComparison = (comparisonIdOrName: string) => {
    setActiveComparisonId(comparisonIdOrName);
    setActiveTab('comparisons');
  };

  const handleOpenJourney = (journeyId: string) => {
    setActiveJourneyId(journeyId);
    setActiveTab('journeys');
  };

  const handleRemoveBookmark = async (entityId: string) => {
    await removeBookmark(entityId);
    setBookmarks((prev) => prev.filter((b) => b.entity_id !== entityId));
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col font-sans selection:bg-gold-500/30 selection:text-gold-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSearch={() => setIsSearchOpen(true)}
        openBookmarks={() => setIsBookmarksOpen(true)}
        bookmarkCount={bookmarks.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            onNavigate={setActiveTab}
            onSelectEntity={(id) => setSelectedEntityId(id)}
            onSelectComparison={handleOpenComparison}
            onSelectJourney={handleOpenJourney}
          />
        )}

        {activeTab === 'graph' && (
          <GraphPage
            onSelectEntity={(id) => setSelectedEntityId(id)}
            onAskAi={handleAskAi}
            onOpenComparison={handleOpenComparison}
          />
        )}

        {activeTab === 'ai-guide' && (
          <AiGuidePage
            initialQuery={aiInitialQuery}
            onSelectEntity={(id) => setSelectedEntityId(id)}
            onOpenSource={(id) => setSelectedSourceId(id)}
          />
        )}

        {activeTab === 'comparisons' && (
          <ComparativeLabPage
            initialComparisonId={activeComparisonId}
            onAskAi={handleAskAi}
            onOpenSource={(id) => setSelectedSourceId(id)}
            onSelectEntity={(id) => setSelectedEntityId(id)}
          />
        )}

        {activeTab === 'journeys' && (
          <JourneysPage
            initialJourneyId={activeJourneyId}
            onSelectEntity={(id) => setSelectedEntityId(id)}
            onAskAi={handleAskAi}
            onOpenSource={(id) => setSelectedSourceId(id)}
          />
        )}

        {activeTab === 'timeline-atlas' && (
          <TimelineAtlasPage
            onSelectEntity={(id) => setSelectedEntityId(id)}
            onAskAi={handleAskAi}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesPage
            onOpenSource={(id) => setSelectedSourceId(id)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-midnight-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="font-serif font-black tracking-widest text-slate-200">ANVESHANA</span>
              <span className="text-[10px] text-gold-400 font-mono px-1.5 py-0.2 rounded border border-gold-500/30">IKS 2.0</span>
            </div>
            <p className="text-slate-500">
              AI-Powered Interactive Exploration & Comparative Analysis of Indian Knowledge Systems
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('graph')} className="hover:text-gold-300 transition-colors">Knowledge Graph</button>
            <button onClick={() => setActiveTab('ai-guide')} className="hover:text-gold-300 transition-colors">RAG Guide</button>
            <button onClick={() => setActiveTab('comparisons')} className="hover:text-gold-300 transition-colors">Comparative Lab</button>
            <button onClick={() => setActiveTab('journeys')} className="hover:text-gold-300 transition-colors">Journeys</button>
            <button onClick={() => setActiveTab('sources')} className="hover:text-gold-300 transition-colors">Sources</button>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectEntity={(id) => setSelectedEntityId(id)}
        onSelectComparison={handleOpenComparison}
        onSelectJourney={handleOpenJourney}
        onSelectSource={(id) => setSelectedSourceId(id)}
      />

      <EntityDetailModal
        entityId={selectedEntityId}
        onClose={() => setSelectedEntityId(null)}
        onAskAi={handleAskAi}
        onOpenComparison={handleOpenComparison}
        onSelectEntity={(id) => setSelectedEntityId(id)}
        onOpenSource={(id) => setSelectedSourceId(id)}
      />

      <SourceModal
        sourceId={selectedSourceId}
        onClose={() => setSelectedSourceId(null)}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onSelectEntity={(id) => setSelectedEntityId(id)}
      />

    </div>
  );
}

export default App;
