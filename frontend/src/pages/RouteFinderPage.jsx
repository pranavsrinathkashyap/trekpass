import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  HeartPulse, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { fetchCheckpoints, findMultiHopPath, findEmergencyEvacuation } from '../services/api';

export default function RouteFinderPage() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Standard multi-hop state
  const [startId, setStartId] = useState('cp-1'); // Lukla
  const [endId, setEndId] = useState('cp-8');   // Everest Base Camp
  const [paths, setPaths] = useState([]);
  const [findingPath, setFindingPath] = useState(false);

  // Evacuation state
  const [evacStartId, setEvacStartId] = useState('cp-6'); // Lobuche
  const [evacRoutes, setEvacRoutes] = useState([]);
  const [findingEvac, setFindingEvac] = useState(false);

  useEffect(() => {
    loadCheckpoints();
  }, []);

  const loadCheckpoints = async () => {
    setLoading(true);
    try {
      const res = await fetchCheckpoints();
      const list = res.data || [];
      setCheckpoints(list);
      if (list.length > 0) {
        setStartId(list[0].id);
        setEndId(list[list.length - 2]?.id || list[list.length - 1]?.id);
        setEvacStartId(list[5]?.id || list[0].id);
      }
    } catch (err) {
      console.error('Failed to load checkpoints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = async () => {
    if (!startId || !endId) return;
    setFindingPath(true);
    try {
      const res = await findMultiHopPath(startId, endId);
      setPaths(res.paths || []);
    } catch (err) {
      alert('Route calculation failed');
    } finally {
      setFindingPath(false);
    }
  };

  const handleCalculateEvac = async () => {
    if (!evacStartId) return;
    setFindingEvac(true);
    try {
      const res = await findEmergencyEvacuation(evacStartId);
      setEvacRoutes(res.routes || []);
    } catch (err) {
      alert('Evacuation calculation failed');
    } finally {
      setFindingEvac(false);
    }
  };

  useEffect(() => {
    if (checkpoints.length > 0) {
      handleCalculateRoute();
      handleCalculateEvac();
    }
  }, [checkpoints]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Navigation className="h-6 w-6 text-teal-700" />
          Expedition Route & Evacuation Pathfinder
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Topological navigation engine calculating multi-stage acclimatization waypoints and high-altitude emergency medical egress
        </p>
      </div>

      {/* Section 1: Multi-Hop Route Finder */}
      <div className="alpine-card rounded-3xl p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Multi-Stage Expedition Trail Navigation</h2>
            <p className="text-xs text-slate-500">Calculates checkpoint sequence, elevation progression, and cumulative distance</p>
          </div>
        </div>

        {/* Form Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Origin Checkpoint</label>
            <select
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
            >
              {checkpoints.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.elevation_m}m)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Destination</label>
            <select
              value={endId}
              onChange={(e) => setEndId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
            >
              {checkpoints.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.elevation_m}m)</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCalculateRoute}
              disabled={findingPath}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50 shadow-md shadow-teal-700/20 transition-all"
            >
              <Navigation className="h-4 w-4" />
              {findingPath ? 'Calculating Route...' : 'Compute Expedition Path'}
            </button>
          </div>
        </div>

        {/* Calculated Routes */}
        {paths.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500 border border-slate-200">
            No passable route found between the selected checkpoints. (Check if intermediate segments are blocked by hazards).
          </div>
        ) : (
          <div className="space-y-4">
            {paths.map((p, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 border border-teal-200 font-mono">
                      Route Option #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {p.hop_count} Intermediate Stages
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-teal-800 font-bold">{p.total_distance_km} km Total</span>
                  </div>
                </div>

                {/* Itinerary Timeline */}
                <div className="flex flex-wrap items-center gap-2">
                  {p.path_checkpoints?.map((cp, cIdx) => (
                    <React.Fragment key={cIdx}>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <MapPin className="h-3.5 w-3.5 text-teal-700" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{cp.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{cp.elevation_m}m {cp.has_medical ? '• 🏥 Medical Unit' : ''}</p>
                        </div>
                      </div>
                      {cIdx < p.path_checkpoints.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-teal-600 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Emergency Medical Evacuation Router */}
      <div className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-rose-50/40 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Emergency Rescue & Evacuation Navigator</h2>
            <p className="text-xs text-slate-600">
              Automatically discovers shortest safe egress to the nearest High-Altitude Medical Shelter, bypassing hazardous terrain.
            </p>
          </div>
        </div>

        {/* Evac Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Distressed Trekker Position
            </label>
            <select
              value={evacStartId}
              onChange={(e) => setEvacStartId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-rose-600 focus:outline-none transition"
            >
              {checkpoints.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.elevation_m}m) {c.has_medical ? '— [Medical Unit Available]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCalculateEvac}
              disabled={findingEvac}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-800 disabled:opacity-50 shadow-md shadow-rose-700/20 transition-all"
            >
              <HeartPulse className="h-4 w-4" />
              {findingEvac ? 'Navigating...' : 'Find Fastest Medical Egress'}
            </button>
          </div>
        </div>

        {/* Evacuation Routes */}
        <div className="space-y-3">
          {evacRoutes.map((route, idx) => (
            <div key={idx} className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                    🏥 Target: {route.destination_hospital}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {route.hops_to_safety} Stages to Clinic
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {route.total_evac_distance_km} km Egress
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {route.evac_route?.map((cp, cIdx) => (
                  <React.Fragment key={cIdx}>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs">
                      <MapPin className="h-3 w-3 text-rose-600" />
                      <span className="font-semibold text-slate-800">{cp.name}</span>
                    </div>
                    {cIdx < route.evac_route.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
