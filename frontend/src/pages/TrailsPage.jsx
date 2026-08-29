import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Activity, 
  CheckCircle,
  XCircle,
  Navigation
} from 'lucide-react';
import { fetchTrails, fetchCheckpoints, toggleHazard } from '../services/api';

export default function TrailsPage({ setActiveTab }) {
  const [trails, setTrails] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hazardNotice, setHazardNotice] = useState('');
  const [hazardState, setHazardState] = useState({
    from: 'cp-5', // Dingboche
    to: 'cp-6',   // Lobuche
    isBlocked: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trRes, cpRes] = await Promise.all([fetchTrails(), fetchCheckpoints()]);
      setTrails(trRes.data || []);
      setCheckpoints(cpRes.data || []);
    } catch (err) {
      console.error('Failed to load trail data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHazard = async () => {
    const nextBlocked = !hazardState.isBlocked;
    try {
      await toggleHazard(hazardState.from, hazardState.to, !nextBlocked);
      setHazardState((prev) => ({ ...prev, isBlocked: nextBlocked }));
      setHazardNotice(
        nextBlocked
          ? '⚠️ Rockfall Hazard Active: Dingboche → Lobuche Moraine blocked! Route navigator will now automatically bypass through Pheriche Clinic.'
          : '✓ Sector Restored: Dingboche → Lobuche Moraine cleared and open.'
      );
      setTimeout(() => setHazardNotice(''), 8000);
    } catch (err) {
      alert('Failed to update segment hazard');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Mountain className="h-6 w-6 text-teal-700" />
            Himalayan Trail & Checkpoint Network
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Topological checkpoint waypoints, elevation gains, and sector safety states
          </p>
        </div>

        <button
          onClick={() => setActiveTab('routes')}
          className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-700/20 hover:bg-teal-800 transition-all"
        >
          <Navigation className="h-4 w-4" />
          Test Route Navigator
        </button>
      </div>

      {/* Interactive Mountain Hazard Simulator Banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Mountain Hazard & Sector Advisory Simulator</h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                Simulate an avalanche or landslide on the <strong>Dingboche (4,410m) → Lobuche (4,940m)</strong> trail segment. Watch route planning algorithms dynamically find alternate emergency evacuation bypasses.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleHazard}
            className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
              hazardState.isBlocked
                ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-700/20'
                : 'bg-rose-700 text-white hover:bg-rose-800 shadow-rose-700/20'
            }`}
          >
            {hazardState.isBlocked ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Clear Landslide Hazard (Restore Route)
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Simulate Landslide Blockage
              </>
            )}
          </button>
        </div>

        {hazardNotice && (
          <div className={`mt-3 rounded-xl p-3 text-xs font-semibold ${
            hazardState.isBlocked ? 'bg-amber-100/80 text-amber-900 border border-amber-300' : 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
          }`}>
            {hazardNotice}
          </div>
        )}
      </div>

      {/* Trails Directory */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-700" />
          Registered Expedition Trail Routes
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {trails.map((trail) => (
            <div
              key={trail.id}
              className="alpine-card flex flex-col justify-between rounded-2xl p-6 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {trail.status || 'OPEN'}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 border border-slate-200">
                    {trail.difficulty}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{trail.name}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{trail.description}</p>

                {/* Key Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">Distance</p>
                    <p className="text-xs font-bold text-slate-900 font-mono">{trail.distance_km} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">Ascent</p>
                    <p className="text-xs font-bold text-teal-700 font-mono">+{trail.elevation_gain_m} m</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">Max Cap</p>
                    <p className="text-xs font-bold text-slate-800 font-mono">{trail.max_daily_capacity}/day</p>
                  </div>
                </div>
              </div>

              {/* Checkpoints Sequence */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-teal-600" />
                  Connected Checkpoint Waypoints
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(trail.checkpoints || []).map((cp, i) => {
                    const name = typeof cp === 'object' ? cp.name : cp;
                    return (
                      <span
                        key={i}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-800 font-medium border border-slate-200/60"
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Checkpoints Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-700" />
          High-Altitude Checkpoint & Clinic Infrastructure
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {checkpoints.map((cp) => (
            <div
              key={cp.id}
              className="alpine-card flex items-center justify-between rounded-xl p-3.5 hover:bg-white transition"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{cp.name}</p>
                <p className="text-[11px] font-mono text-teal-700 font-medium mt-0.5">{cp.elevation_m} meters ASL</p>
              </div>
              <div className="flex items-center gap-1.5">
                {cp.has_medical && (
                  <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                    🏥 Clinic
                  </span>
                )}
                {cp.has_shelter && (
                  <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                    ⛺ Shelter
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
