import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Network, 
  CheckCircle, 
  UserPlus, 
  Sparkles,
  Award,
  Trash2
} from 'lucide-react';
import { fetchTrekkers, fetchTrekkerSafetyNetwork, deleteTrekker } from '../services/api';
import AddTrekkerModal from '../components/AddTrekkerModal';
import CheckinModal from '../components/CheckinModal';

export default function TrekkersPage() {
  const [trekkers, setTrekkers] = useState([]);
  const [filteredTrekkers, setFilteredTrekkers] = useState([]);
  const [selectedTrekkerNetwork, setSelectedTrekkerNetwork] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [checkinTrekker, setCheckinTrekker] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState('');

  const loadTrekkers = async () => {
    setLoading(true);
    try {
      const res = await fetchTrekkers();
      const list = res.data || [];
      setTrekkers(list);
      setFilteredTrekkers(list);
    } catch (err) {
      console.error('Error loading trekkers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrekkers();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      setFilteredTrekkers(
        trekkers.filter(
          (t) =>
            t.name?.toLowerCase().includes(q) ||
            t.country?.toLowerCase().includes(q) ||
            t.experience_level?.toLowerCase().includes(q) ||
            t.last_known_location?.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredTrekkers(trekkers);
    }
  }, [search, trekkers]);

  const handleInspectNetwork = async (trekkerId) => {
    setNetworkLoading(true);
    try {
      const res = await fetchTrekkerSafetyNetwork(trekkerId);
      setSelectedTrekkerNetwork(res.data);
    } catch (err) {
      console.error('Network load error:', err);
    } finally {
      setNetworkLoading(false);
    }
  };

  const handleDeleteTrekker = async (trekkerId, trekkerName) => {
    if (!window.confirm(`Are you sure you want to delete trekker ${trekkerName}? All associated permits will also be removed.`)) {
      return;
    }
    setDeletingId(trekkerId);
    try {
      await deleteTrekker(trekkerId);
      setNotice(`Trekker ${trekkerName} deleted successfully.`);
      setTimeout(() => setNotice(''), 4000);
      loadTrekkers();
      if (selectedTrekkerNetwork?.id === trekkerId) {
        setSelectedTrekkerNetwork(null);
      }
    } catch (err) {
      console.error('Delete trekker failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-700" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Trekker Registry & Mountain Tracking
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered high-altitude trekkers, live checkpoint waypoints, and expedition group networks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 transition transform active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Register New Trekker
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-fade-in">
          ✓ {notice}
        </div>
      )}

      {/* Search Bar */}
      <div className="alpine-card rounded-2xl p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by trekker name, country, experience, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none transition"
          />
        </div>
      </div>

      {/* Main Grid: Trekkers & Companion Network Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trekkers List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 font-medium">
              Loading registered trekkers...
            </div>
          ) : filteredTrekkers.length === 0 ? (
            <div className="alpine-card rounded-3xl py-16 text-center text-slate-500">
              <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">No Trekkers Found</p>
              <p className="text-xs text-slate-400 mt-1">Register a new trekker to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTrekkers.map((t) => (
                <div
                  key={t.id}
                  className="alpine-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-teal-200 transition group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800 font-extrabold text-sm border border-teal-100">
                          {t.name ? t.name[0] : 'T'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                            {t.name}
                          </h3>
                          <p className="text-[11px] text-slate-500">{t.country || 'International'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTrekker(t.id, t.name)}
                        disabled={deletingId === t.id}
                        title="Delete trekker"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100">
                        <span className="text-slate-500">Experience Tier:</span>
                        <span className="font-semibold text-slate-800">{t.experience_level}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-teal-600" />
                          Last Checked In:
                        </span>
                        <span className="font-semibold text-teal-800 truncate max-w-[140px]">
                          {t.last_known_location || 'Lukla Gateway'}
                        </span>
                      </div>

                      {t.emergency_contact && (
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100 text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-rose-500" />
                            Rescue Contact:
                          </span>
                          <span className="font-mono font-medium text-slate-700">{t.emergency_contact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setCheckinTrekker(t)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-teal-700 transition"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Log Check-In
                    </button>

                    <button
                      onClick={() => handleInspectNetwork(t.id)}
                      className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition"
                    >
                      <Network className="h-3.5 w-3.5" />
                      Safety Network
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Companion Safety Network Panel */}
        <div className="alpine-card rounded-3xl p-6 h-fit sticky top-20 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Network className="h-5 w-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">Companion & Ranger Network</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Multi-degree reachability contacts and monitoring ranger stations for search and rescue operations.
          </p>

          {networkLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Traversing group reachability graph...
            </div>
          ) : selectedTrekkerNetwork ? (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">PRIMARY HIKER</span>
                <p className="text-base font-bold text-white mt-1">{selectedTrekkerNetwork.name}</p>
                <p className="text-xs text-slate-300">{selectedTrekkerNetwork.email}</p>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-amber-300">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Last Location: <strong>{selectedTrekkerNetwork.last_known_location || 'Lukla Gateway'}</strong></span>
                </div>
              </div>

              {/* Expedition Companions */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-teal-600" />
                  Linked Group Companions ({selectedTrekkerNetwork.expedition_companions?.length || 0})
                </h4>
                {selectedTrekkerNetwork.expedition_companions?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTrekkerNetwork.expedition_companions.map((c, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <p className="font-semibold text-slate-800">{c.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.emergency_contact || 'No phone'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No registered group companions for this solo permit.</p>
                )}
              </div>

              {/* Alert Ranger Posts */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                  Responsible Ranger Commands ({selectedTrekkerNetwork.alert_ranger_stations?.length || 0})
                </h4>
                {selectedTrekkerNetwork.alert_ranger_stations?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTrekkerNetwork.alert_ranger_stations.map((r, i) => (
                      <div key={i} className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/70 text-amber-900">
                        <p className="font-semibold text-xs">{r.name}</p>
                        <p className="text-[11px] text-amber-700 font-mono">Radio: {r.radio_channel} • {r.jurisdiction}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No assigned ranger command.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select any trekker and click <strong>"Safety Network"</strong> to inspect their topological group network and ranger frequencies.
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <AddTrekkerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onTrekkerCreated={loadTrekkers}
      />

      <CheckinModal
        isOpen={!!checkinTrekker}
        trekker={checkinTrekker}
        onClose={() => setCheckinTrekker(null)}
        onCheckinSuccess={loadTrekkers}
      />
    </div>
  );
}
