import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Mountain, 
  Users, 
  PlusCircle, 
  Navigation, 
  CheckCircle2, 
  ArrowRight, 
  HeartPulse, 
  Flame, 
  Sun,
  ShieldCheck,
  TrendingUp,
  Activity,
  MapPin
} from 'lucide-react';
import { fetchDashboardStats, fetchTrailCapacity, fetchAllPasses, fetchCheckpoints } from '../services/api';
import PassCardModal from '../components/PassCardModal';

export default function Dashboard({ setActiveTab, onOpenPassModal }) {
  const [stats, setStats] = useState(null);
  const [capacities, setCapacities] = useState([]);
  const [recentPasses, setRecentPasses] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [selectedElevationCheckpoint, setSelectedElevationCheckpoint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, capRes, passesRes, cpRes] = await Promise.all([
        fetchDashboardStats(),
        fetchTrailCapacity(),
        fetchAllPasses(),
        fetchCheckpoints()
      ]);
      setStats(statsRes.data || {});
      setCapacities(capRes.data || []);
      setRecentPasses((passesRes.data || []).slice(0, 4));
      const sortedCps = (cpRes.data || []).sort((a, b) => a.elevation_m - b.elevation_m);
      setCheckpoints(sortedCps);
      if (sortedCps.length > 0) {
        setSelectedElevationCheckpoint(sortedCps[sortedCps.length - 1]);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxElevation = 5500;
  const minElevation = 2500;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header Banner with High-Res Himalayan Mountaineering Backdrop */}
      <div className="relative overflow-hidden rounded-3xl min-h-[260px] sm:min-h-[290px] flex items-center shadow-lg border border-slate-200">
        
        {/* Background Photo & Dark Gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-teal-950/40" />
        </div>

        <div className="relative z-10 px-6 sm:px-10 py-8 max-w-2xl text-white space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/20">
            <Sun className="h-3.5 w-3.5" />
            <span>Khumbu Sector • Clear Skies (-4°C)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Expedition Operations & Trail Safety
          </h1>
          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal">
            Real-time permit monitoring, altitude acclimatization tracking, and emergency rescue readiness across 9 Himalayan waypoints.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onOpenPassModal}
              className="flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition-all transform active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Issue Trek Permit
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all"
            >
              <Navigation className="h-4 w-4 text-teal-300" />
              Route Navigator
            </button>
          </div>
        </div>

      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="alpine-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Permits</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.active_passes ?? '-'}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {stats?.total_passes ?? 0} total registered
          </p>
        </div>

        <div className="alpine-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hikers on Mountain</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.total_trekkers ?? '-'}</p>
          <p className="mt-1 text-xs text-slate-500">Across 9 monitored waypoints</p>
        </div>

        <div className="alpine-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Trails</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <Mountain className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.open_trails ?? '-'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {stats?.blocked_trails > 0 ? (
              <span className="text-rose-600 font-semibold">{stats.blocked_trails} Hazard Advisory</span>
            ) : (
              <span className="text-emerald-600 font-medium">All Routes Passable</span>
            )}
          </p>
        </div>

        <div className="alpine-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rescue Clinics</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <HeartPulse className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.medical_stations ?? '-'}</p>
          <p className="mt-1 text-xs text-rose-600 font-medium">Equipped Medical Shelters</p>
        </div>
      </div>

      {/* 3. Mountain Elevation Profile & Acclimatization Visualizer */}
      <div className="alpine-card rounded-3xl p-6 sm:p-7 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Himalayan Checkpoint Elevation & Acclimatization Profile
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Topological gradient from Lukla Gateway (2,860m) to Everest Base Camp (5,364m)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-teal-600" />
              <span className="font-semibold text-slate-600">Waypoint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-600">Medical Clinic</span>
            </div>
          </div>
        </div>

        {/* Visual Altitude Graph Bars */}
        <div className="relative pt-6 pb-2">
          <div className="grid grid-cols-4 sm:grid-cols-9 gap-2 sm:gap-3 items-end min-h-[180px]">
            {checkpoints.map((cp) => {
              const heightPct = Math.round(((cp.elevation_m - minElevation) / (maxElevation - minElevation)) * 100);
              const isSelected = selectedElevationCheckpoint?.id === cp.id;
              return (
                <div
                  key={cp.id}
                  onClick={() => setSelectedElevationCheckpoint(cp)}
                  className="group cursor-pointer flex flex-col items-center justify-end h-full transition"
                >
                  <span className={`text-[10px] font-mono font-bold mb-1 transition ${
                    isSelected ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-800'
                  }`}>
                    {cp.elevation_m}m
                  </span>
                  
                  {/* Vertical bar */}
                  <div className="w-full max-w-[42px] rounded-t-xl overflow-hidden bg-slate-100 h-32 flex items-end p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        cp.has_medical 
                          ? isSelected ? 'bg-rose-600 shadow-md' : 'bg-rose-400 group-hover:bg-rose-500'
                          : isSelected ? 'bg-teal-700 shadow-md' : 'bg-teal-500 group-hover:bg-teal-600'
                      }`}
                      style={{ height: `${Math.max(heightPct, 15)}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-semibold text-slate-700 text-center truncate max-w-[65px] mt-2">
                    {cp.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Elevation Details Drawer */}
        {selectedElevationCheckpoint && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-teal-700 font-bold">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{selectedElevationCheckpoint.name}</p>
                <p className="text-[11px] text-slate-500">
                  Elevation: <strong className="text-teal-800 font-mono">{selectedElevationCheckpoint.elevation_m} meters ASL</strong> • Daily Max Capacity: {selectedElevationCheckpoint.max_capacity} hikers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedElevationCheckpoint.has_medical && (
                <span className="rounded-lg bg-rose-50 px-2.5 py-1 font-bold text-rose-700 border border-rose-200">
                  🏥 Medical Clinic Active
                </span>
              )}
              {selectedElevationCheckpoint.has_shelter && (
                <span className="rounded-lg bg-teal-50 px-2.5 py-1 font-bold text-teal-800 border border-teal-200">
                  ⛺ High-Altitude Shelter
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Trail Capacities & Recent Permits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trail Capacities */}
        <div className="lg:col-span-2 alpine-card rounded-3xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                Live Trailhead Capacity & Occupancy
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Ecological hiker volume constraints along active routes</p>
            </div>
            <button
              onClick={() => setActiveTab('trails')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Explore Trails <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {capacities.map((c) => {
              const pct = c.capacity_utilization_pct || 0;
              const isHigh = pct >= 80;
              const isMed = pct >= 50;
              return (
                <div key={c.trail_id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{c.trail_name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-500">
                          {c.active_trekkers} / {c.max_daily_capacity} permits issued
                        </span>
                        <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {c.difficulty}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                      isHigh ? 'bg-rose-100 text-rose-800' :
                      isMed ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {pct}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Permits */}
        <div className="alpine-card rounded-3xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-teal-700" />
                Latest Permits
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Issued mountain passes</p>
            </div>
            <button
              onClick={() => setActiveTab('passes')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              All Passes <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentPasses.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPass(p)}
                className="group cursor-pointer rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 hover:border-teal-300 hover:bg-white hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {p.pass_number}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-800 font-semibold truncate">
                  {p.trekker?.name || 'Trekker'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {p.permitted_trails?.[0]?.name || 'Everest Base Camp'}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Digital Pass Modal */}
      {selectedPass && (
        <PassCardModal pass={selectedPass} onClose={() => setSelectedPass(null)} />
      )}
    </div>
  );
}
