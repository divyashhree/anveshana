import React from 'react';
import {
  Compass, Share2, Sparkles, Scale, BookOpen, Clock,
  FileText, Search, Bookmark as BookmarkIcon, Moon, Sun
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSearch: () => void;
  openBookmarks: () => void;
  bookmarkCount: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSearch,
  openBookmarks,
  bookmarkCount,
  darkMode,
  setDarkMode
}) => {
  const navItems = [
    { id: 'home', label: 'Overview', icon: Compass },
    { id: 'graph', label: 'Knowledge Graph', icon: Share2 },
    { id: 'ai-guide', label: 'AI Guide', icon: Sparkles },
    { id: 'comparisons', label: 'Comparative Lab', icon: Scale },
    { id: 'journeys', label: 'Journeys', icon: BookOpen },
    { id: 'timeline-atlas', label: 'Timeline & Atlas', icon: Clock },
    { id: 'sources', label: 'Sources', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-midnight-950/85 border-b border-gold-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-full border border-gold-500/40 flex items-center justify-center bg-midnight-900 group-hover:border-gold-400 group-hover:shadow-gold-sm transition-all duration-300">
            {/* Astrolabe / Chakra Motif */}
            <div className="w-6 h-6 rounded-full border border-dashed border-gold-400/60 flex items-center justify-center animate-[spin_20s_linear_infinite]">
              <div className="w-2 h-2 rounded-full bg-gold-400"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black tracking-widest text-lg text-slate-100 group-hover:text-gold-300 transition-colors">
                ANVESHANA
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-gold-500/30 text-gold-400 bg-gold-500/10">
                IKS 2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide hidden sm:block">
              Discover the connections within India's knowledge traditions
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-gold-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions: Search, Bookmarks, Theme */}
        <div className="flex items-center space-x-2">
          {/* Universal Search trigger */}
          <button
            onClick={openSearch}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-midnight-900 border border-slate-700/60 hover:border-gold-500/40 text-slate-300 hover:text-gold-200 transition-all text-xs"
            title="Search entities, sources, comparisons (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline text-slate-400">Search...</span>
            <kbd className="hidden lg:inline-block text-[10px] font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Bookmarks Counter */}
          <button
            onClick={openBookmarks}
            className="relative p-2 rounded-lg bg-midnight-900 border border-slate-700/60 hover:border-gold-500/40 text-slate-300 hover:text-gold-300 transition-colors"
            title="Saved Explorations"
          >
            <BookmarkIcon className="w-4 h-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-midnight-950 rounded-full text-[10px] font-bold flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-midnight-900 border border-slate-700/60 hover:border-gold-500/40 text-slate-300 hover:text-gold-300 transition-colors"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 bg-midnight-950/90 text-xs overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center px-2 py-1 rounded ${
                isActive ? 'text-gold-300 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
