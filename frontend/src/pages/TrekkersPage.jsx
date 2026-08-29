import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Globe, 
  Radio, 
  Network, 
  UserPlus, 
  X,
  CheckCircle2
} from 'lucide-react';
import { fetchTrekkers, fetchTrekkerSafetyNetwork } from '../services/api';
import CheckinModal from '../components/CheckinModal';
import AddTrekkerModal from '../components/AddTrekkerModal';

export default function TrekkersPage() {
  const [trekkers, setTrekkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isAddTrekkerOpen, setIsAddTrekkerOpen] = useState(false);
  const [fetchingNetwork, setFetchingNetwork] = useState(false);

  useEffect(() => {
    loadTrekkers();
  }, []);

  const loadTrekkers = async () => {
    setLoading(true);
    try {
      const res = await fetchTrekkers();
      setTrekkers(res.data || []);
    } catch (err) {
      console.error('Failed to load trekkers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectSafetyNetwork = async (trekkerId) => {
    setFetchingNetwork(true);
    try {
      const res = await fetchTrekkerSafetyNetwork(trekkerId);
      setSelectedNetwork(res.data);
    } catch (err) {
      alert('Failed to load safety network');
    } finally {
      setFetchingNetwork(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-teal-700" />
            Trekker Registry & Mountain Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered high-altitude trekkers, live checkpoint waypoints, and expedition group networks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddTrekkerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 transition"
          >
            <UserPlus className="h-4 w-4" />
            Register New Trekker
          </button>
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <MapPin className="h-4 w-4 text-teal-600" />
            Log Check-In
          </button>
        </div>
      </div>

      {/* Trekkers Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trekkers.map((t) => (
            <div
              key={t.id}
              className="alpine-card flex flex-col justify-between rounded-2xl p-5 hover:border-teal-200 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800 font-bold border border-teal-200">
                      {t.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-slate-400" />
                        {t.country || 'International'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 border border-slate-200">
                    {t.experience_level || 'ADVANCED'}
                  </span>
                </div>

                {/* Last Seen Checkpoint */}
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-teal-600" />
                    Last Known Mountain Position
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    {t.last_known_location || 'Lukla Gateway (2,860m)'}
                  </p>
                </div>

                {/* Emergency Contact */}
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {t.email}
                  </p>
                  <p className="flex items-center gap-1.5 truncate font-mono text-[11px] text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    {t.emergency_contact}
                  </p>
                </div>
              </div>

              {/* Action: Companion Network */}
              <div className="mt-5 border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleInspectSafetyNetwork(t.id)}
                  disabled={fetchingNetwork}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 px-3 py-2 text-xs font-semibold text-teal-900 transition"
                >
                  <Network className="h-3.5 w-3.5 text-teal-700" />
                  View Expedition Group & Contacts
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Network Modal */}
      {selectedNetwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Expedition Group & Safety Network</h3>
                  <p className="text-xs text-slate-500">Connected companions & monitoring stations for {selectedNetwork.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNetwork(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Companions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Connected Expedition Companions
                </p>
                {(selectedNetwork.expedition_companions || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Solo trekker (No group companions linked)
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedNetwork.expedition_companions.map((comp) => (
                      <div key={comp.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{comp.name}</p>
                          <p className="text-[11px] text-slate-500">{comp.email}</p>
                        </div>
                        <span className="font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {comp.emergency_contact}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Responsible Ranger Stations */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Responsible Ranger Posts & Radio Frequencies
                </p>
                <div className="space-y-2">
                  {(selectedNetwork.alert_ranger_stations || []).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{r.name}</p>
                        <p className="text-[11px] text-slate-500">{r.jurisdiction}</p>
                      </div>
                      <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Radio className="h-3 w-3" />
                        {r.radio_channel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end bg-slate-50/80 px-6 py-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedNetwork(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddTrekkerModal
        isOpen={isAddTrekkerOpen}
        onClose={() => setIsAddTrekkerOpen(false)}
        onTrekkerAdded={loadTrekkers}
      />

      <CheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onCheckinComplete={loadTrekkers}
      />
    </div>
  );
}
