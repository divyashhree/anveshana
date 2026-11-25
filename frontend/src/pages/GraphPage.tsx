import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import {
  Search, Filter, Sparkles, Scale, Maximize2, RotateCcw,
  Route, Eye, Info, Check, ArrowRight, Layers, SlidersHorizontal
} from 'lucide-react';
import { fetchGraphData, fetchGraphPath } from '../api/client';
import { GraphData, GraphNode, GraphEdge } from '../types';

interface GraphPageProps {
  onSelectEntity: (entityId: string) => void;
  onAskAi: (entityName: string) => void;
  onOpenComparison: (conceptName: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  mathematics: '#D4AF37', // Antique gold
  linguistics: '#818CF8', // Indigo
  astronomy: '#38BDF8', // Sky
  metallurgy: '#FB923C', // Copper/Orange
  architecture_water: '#34D399', // Emerald
  philosophy_epistemology: '#F472B6', // Rose
};

export const GraphPage: React.FC<GraphPageProps> = ({
  onSelectEntity,
  onAskAi,
  onOpenComparison
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Path Finding Mode
  const [pathMode, setPathMode] = useState(false);
  const [pathSource, setPathSource] = useState<string>('');
  const [pathTarget, setPathTarget] = useState<string>('');
  const [pathResult, setPathResult] = useState<any>(null);

  // Load Graph Data
  useEffect(() => {
    setLoading(true);
    fetchGraphData(
      selectedCategory === 'all' ? undefined : selectedCategory,
      selectedType === 'all' ? undefined : selectedType
    )
      .then((data) => {
        setGraphData(data);
      })
      .catch((err) => console.error('Failed to load graph data:', err))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedType]);

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Build Cytoscape elements
    const elements: any[] = [];
    graphData.nodes.forEach((n) => {
      elements.push({
        group: 'nodes',
        data: {
          id: n.id,
          label: n.label,
          sanskrit: n.sanskrit_name || '',
          category: n.category,
          type: n.entity_type,
          period: n.period,
          degree: n.degree,
          summary: n.short_summary,
          color: CATEGORY_COLORS[n.category] || '#94A3B8'
        }
      });
    });

    graphData.edges.forEach((e) => {
      elements.push({
        group: 'edges',
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          relation: e.relation_type,
          description: e.description
        }
      });
    });

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#F1F5F9',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-size': 10,
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'background-color': 'data(color)',
            'border-width': 2,
            'border-color': '#0B0F19',
            'width': 'mapData(degree, 1, 15, 24, 48)',
            'height': 'mapData(degree, 1, 15, 24, 48)'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#FFFFFF'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': 'rgba(148, 163, 184, 0.25)',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'rgba(148, 163, 184, 0.4)',
            'arrow-scale': 0.8
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 3,
            'line-color': '#D4AF37',
            'target-arrow-color': '#D4AF37',
            'z-index': 999
          }
        },
        {
          selector: '.highlighted',
          style: {
            'border-width': 4,
            'border-color': '#D4AF37',
            'z-index': 9999
          }
        },
        {
          selector: '.highlighted-edge',
          style: {
            'width': 3.5,
            'line-color': '#D4AF37',
            'target-arrow-color': '#D4AF37',
            'z-index': 9998
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.15
          }
        }
      ] as any,
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 40,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      }
    });

    cyRef.current = cy;

    // Node Click Listener
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = node.data();
      const fullNode = graphData.nodes.find((n) => n.id === nodeData.id);
      if (fullNode) {
        setSelectedNode(fullNode);

        // Highlight neighborhood
        cy.elements().removeClass('highlighted highlighted-edge dimmed');
        const neighborhood = node.neighborhood().add(node);
        cy.elements().not(neighborhood).addClass('dimmed');
        neighborhood.nodes().addClass('highlighted');
        neighborhood.edges().addClass('highlighted-edge');
      }
    });

    // Background Tap Listener (Reset highlight)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted highlighted-edge dimmed');
        setSelectedNode(null);
      }
    });

    return () => {
      cy.destroy();
    };
  }, [graphData]);

  // Center & Fit
  const handleResetZoom = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('highlighted highlighted-edge dimmed');
      cyRef.current.fit(undefined, 40);
      setSelectedNode(null);
    }
  };

  // Node Search in graph
  const handleSearchNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cyRef.current || !searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    const match = cyRef.current.nodes().filter((n) => {
      const label = n.data('label').toLowerCase();
      const sanskrit = (n.data('sanskrit') || '').toLowerCase();
      return label.includes(query) || sanskrit.includes(query);
    });

    if (match.length > 0) {
      const targetNode = match[0];
      cyRef.current.elements().removeClass('highlighted highlighted-edge dimmed');
      const neighborhood = targetNode.neighborhood().add(targetNode);
      cyRef.current.elements().not(neighborhood).addClass('dimmed');
      targetNode.addClass('highlighted');
      neighborhood.edges().addClass('highlighted-edge');

      cyRef.current.animate({
        center: { eles: targetNode },
        zoom: 1.8,
        duration: 500
      });

      const fullNode = graphData?.nodes.find((n) => n.id === targetNode.id());
      if (fullNode) setSelectedNode(fullNode);
    }
  };

  // Compute Path between two nodes
  const handleFindPath = async () => {
    if (!pathSource || !pathTarget || pathSource === pathTarget) return;

    try {
      const res = await fetchGraphPath(pathSource, pathTarget);
      setPathResult(res);

      if (res.found && cyRef.current) {
        cyRef.current.elements().removeClass('highlighted highlighted-edge dimmed');
        cyRef.current.elements().addClass('dimmed');

        res.node_ids.forEach((id: string) => {
          cyRef.current?.$(`#${id}`).removeClass('dimmed').addClass('highlighted');
        });

        res.edges.forEach((edge: any) => {
          cyRef.current?.$(`edge[source = "${edge.source_id}"][target = "${edge.target_id}"]`)
            .removeClass('dimmed')
            .addClass('highlighted-edge');
          cyRef.current?.$(`edge[source = "${edge.target_id}"][target = "${edge.source_id}"]`)
            .removeClass('dimmed')
            .addClass('highlighted-edge');
        });

        cyRef.current.fit(cyRef.current.$('.highlighted'), 50);
      }
    } catch (err) {
      console.error('Path error:', err);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden bg-midnight-950">
      
      {/* GRAPH CANVAS CONTAINER */}
      <div className="flex-1 relative h-full">
        <div ref={containerRef} className="w-full h-full bg-midnight-950" />

        {/* TOP CONTROLS OVERLAY BAR */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Search Input */}
            <form onSubmit={handleSearchNode} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find node (e.g. Pingala, Wootz)..."
                className="w-48 sm:w-64 px-3.5 py-2 pl-9 rounded-xl bg-midnight-900/90 border border-slate-700/80 hover:border-gold-500/40 focus:border-gold-400 text-xs text-slate-100 placeholder-slate-400 backdrop-blur-md focus:outline-none shadow-lg"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-midnight-900/90 border border-slate-700/80 hover:border-gold-500/40 text-xs text-slate-200 backdrop-blur-md focus:outline-none shadow-lg"
            >
              <option value="all">All Disciplines</option>
              <option value="mathematics">Mathematics</option>
              <option value="linguistics">Linguistics</option>
              <option value="astronomy">Astronomy</option>
              <option value="metallurgy">Metallurgy</option>
              <option value="architecture_water">Architecture & Water</option>
              <option value="philosophy_epistemology">Epistemology & Logic</option>
            </select>

            {/* Entity Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-midnight-900/90 border border-slate-700/80 hover:border-gold-500/40 text-xs text-slate-200 backdrop-blur-md focus:outline-none shadow-lg hidden sm:block"
            >
              <option value="all">All Entity Types</option>
              <option value="scholar">Scholars</option>
              <option value="text">Primary Texts</option>
              <option value="principle">Principles & Algorithms</option>
              <option value="technology">Technologies</option>
              <option value="historical_period">Historical Periods</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            {/* Path Finder Toggle */}
            <button
              onClick={() => setPathMode(!pathMode)}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 backdrop-blur-md transition-colors shadow-lg ${
                pathMode
                  ? 'bg-gold-500 text-midnight-950 font-bold'
                  : 'bg-midnight-900/90 text-slate-300 border border-slate-700 hover:border-gold-500/40'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>Trace Path</span>
            </button>

            {/* Reset / Fit View */}
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-xl bg-midnight-900/90 border border-slate-700 hover:border-gold-500/40 text-slate-300 hover:text-gold-300 backdrop-blur-md shadow-lg transition-colors"
              title="Reset Zoom and Centering"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* PATH FINDER PANEL (Collapsible) */}
        {pathMode && (
          <div className="absolute top-16 left-4 z-20 w-80 p-4 rounded-2xl bg-midnight-900/95 border border-gold-500/35 shadow-2xl backdrop-blur-md space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-serif font-bold text-slate-100 flex items-center space-x-1.5">
                <Route className="w-4 h-4 text-gold-400" />
                <span>Relationship Path Finder</span>
              </span>
              <button onClick={() => setPathMode(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Origin Node</label>
              <select
                value={pathSource}
                onChange={(e) => setPathSource(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              >
                <option value="">Select starting entity...</option>
                {graphData?.nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.label} ({n.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Target Node</label>
              <select
                value={pathTarget}
                onChange={(e) => setPathTarget(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              >
                <option value="">Select target entity...</option>
                {graphData?.nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.label} ({n.category})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleFindPath}
              disabled={!pathSource || !pathTarget}
              className="w-full py-2 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 font-semibold transition-colors disabled:opacity-40"
            >
              Calculate Connection Path
            </button>

            {pathResult && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1 text-slate-300">
                {pathResult.found ? (
                  <>
                    <p className="text-emerald-400 font-semibold">
                      Path found across {pathResult.path_length} hops:
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">
                      {pathResult.nodes.map((n: any) => n.name).join(' → ')}
                    </p>
                  </>
                ) : (
                  <p className="text-rose-400">No connected path found between these nodes.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM LEGEND */}
        <div className="absolute bottom-4 left-4 z-10 hidden md:flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-midnight-900/90 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="font-mono text-slate-500">Legend:</span>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{cat.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

      </div>

      {/* CONTEXTUAL NODE DRAWER (Right Sidebar) */}
      {selectedNode && (
        <div className="w-80 sm:w-96 h-full bg-midnight-900 border-l border-gold-500/25 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl z-20 animate-slideLeft">
          <div className="space-y-4">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[selectedNode.category]}20`,
                    color: CATEGORY_COLORS[selectedNode.category],
                    border: `1px solid ${CATEGORY_COLORS[selectedNode.category]}40`
                  }}
                >
                  {selectedNode.category.replace('_', ' ')}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>

              <h3 className="font-serif text-xl font-bold text-slate-100">
                {selectedNode.label}
              </h3>
              {selectedNode.sanskrit_name && (
                <p className="font-serif text-gold-400 text-sm mt-0.5">
                  {selectedNode.sanskrit_name}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                Period: {selectedNode.period} • Degree: {selectedNode.degree} connections
              </p>
            </div>

            {/* Summary */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <h5 className="text-[10px] font-mono uppercase text-slate-400 mb-1">Summary</h5>
              <p className="text-xs text-slate-300 leading-relaxed font-serif">
                {selectedNode.short_summary}
              </p>
            </div>

            {/* Actions for this node */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onSelectEntity(selectedNode.id)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-gold-500/15 border border-slate-700 hover:border-gold-500/40 text-xs font-medium text-slate-200 hover:text-gold-300 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-gold-400" />
                  <span>Open Complete Entity Dossier</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onAskAi(`Explain ${selectedNode.label} and its significance in IKS`)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-500/15 border border-slate-700 hover:border-indigo-500/40 text-xs font-medium text-slate-200 hover:text-indigo-300 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Ask AI Guide About This</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenComparison(selectedNode.label)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-copper-500/15 border border-slate-700 hover:border-copper-500/40 text-xs font-medium text-slate-200 hover:text-copper-300 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-copper-400" />
                  <span>Compare with Modern Concepts</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Double click node to center • Drag to rearrange
          </div>
        </div>
      )}

    </div>
  );
};
