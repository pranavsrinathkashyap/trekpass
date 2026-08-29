import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, Layers, Filter, Info, ChevronRight, X } from 'lucide-react';
import { fetchGraphData } from '../services/api';
import GraphCanvas from '../components/GraphCanvas';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterLabel, setFilterLabel] = useState('ALL');

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const res = await fetchGraphData();
      setGraphData(res.data || { nodes: [], links: [] });
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNodes = filterLabel === 'ALL'
    ? graphData.nodes
    : graphData.nodes.filter(n => n.label === filterLabel);

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = graphData.links.filter(
    l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
  );

  const displayData = {
    nodes: filteredNodes,
    links: filteredLinks,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Network className="h-6 w-6 text-teal-700" />
            Trail & Safety Topology Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual topological network of Trekkers, Permits, Trails, Checkpoints, and Ranger Stations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Node Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['ALL', 'Trekker', 'TrekPass', 'Trail', 'Checkpoint', 'RangerStation'].map((lbl) => (
              <button
                key={lbl}
                onClick={() => setFilterLabel(lbl)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  filterLabel === lbl
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <button
            onClick={loadGraph}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Canvas Component */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex h-[550px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            </div>
          ) : (
            <GraphCanvas
              data={displayData}
              onSelectNode={setSelectedNode}
              selectedNode={selectedNode}
            />
          )}
        </div>

        {/* Node Inspector Side Panel */}
        <div className="alpine-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-teal-700" />
                Entity Details Inspector
              </h3>
              {selectedNode && (
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4 animate-fade-in text-xs">
                <div>
                  <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedNode.label}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1.5">{selectedNode.name}</h4>
                  <p className="font-mono text-[11px] text-slate-400">ID: {selectedNode.id}</p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Entity Attributes</p>
                  <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3 font-mono text-[11px]">
                    {Object.entries(selectedNode.properties || {}).map(([k, v]) => {
                      if (k === 'id' || k === 'name' || typeof v === 'object') return null;
                      return (
                        <div key={k} className="flex justify-between py-0.5 border-b border-slate-100 last:border-0">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-slate-800 font-semibold truncate max-w-[140px]">{String(v)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connected Relationships */}
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Connected Network Links</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                    {graphData.links
                      .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                      .map((l, i) => (
                        <div key={i} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-700">
                          <span className="font-mono text-teal-700 font-semibold">{l.type}</span>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-500 truncate">
                            {l.source === selectedNode.id ? `To ${l.target}` : `From ${l.source}`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Network className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs">Click any element in the topology view to inspect attributes and connected links.</p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-[10px] text-slate-500 font-medium">
            <strong>Network Topology:</strong> {graphData.nodes.length} Elements • {graphData.links.length} Connected Links
          </div>
        </div>

      </div>

    </div>
  );
}
