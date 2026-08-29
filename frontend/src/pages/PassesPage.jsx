import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Ban, 
  RotateCcw,
  Calendar,
  Mountain,
  User
} from 'lucide-react';
import { fetchAllPasses, updatePassStatus } from '../services/api';
import PassCardModal from '../components/PassCardModal';
import PassModal from '../components/PassModal';

export default function PassesPage() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPass, setSelectedPass] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    setLoading(true);
    try {
      const res = await fetchAllPasses();
      setPasses(res.data || []);
    } catch (err) {
      console.error('Failed to load passes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (passId, newStatus) => {
    try {
      await updatePassStatus(passId, newStatus);
      loadPasses();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredPasses = passes.filter((p) => {
    const matchesSearch = 
      p.pass_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.trekker?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.permitted_trails?.[0]?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Ticket className="h-6 w-6 text-teal-700" />
            Trekking Permits Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official mountain permits authorized for high-altitude Himalayan routes and conservation zones
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 shadow-md shadow-teal-700/20 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          Issue New Permit
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="alpine-card flex flex-col sm:flex-row gap-3 rounded-2xl p-3.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by permit number, trekker name, or trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Passes List Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        </div>
      ) : filteredPasses.length === 0 ? (
        <div className="alpine-card flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <Ticket className="h-10 w-10 text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No Trek Permits Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or issue a new permit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPasses.map((pass) => {
            const isActive = pass.status === 'ACTIVE';
            return (
              <div
                key={pass.id}
                className="alpine-card group relative flex flex-col justify-between rounded-2xl p-5 hover:border-teal-200 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {pass.pass_number}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {pass.status}
                    </span>
                  </div>

                  {/* Trekker */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-teal-700 font-bold text-xs">
                      {pass.trekker?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{pass.trekker?.name || 'Trekker'}</p>
                      <p className="text-[10px] text-slate-500">{pass.trekker?.country} • {pass.trekker?.experience_level}</p>
                    </div>
                  </div>

                  {/* Trail & Dates */}
                  <div className="mt-4 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <Mountain className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{pass.permitted_trails?.[0]?.name || 'Trail Route'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{pass.valid_from} → {pass.valid_to}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setSelectedPass(pass)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Digital Permit
                  </button>

                  <div className="flex items-center gap-1">
                    {isActive ? (
                      <button
                        onClick={() => handleStatusChange(pass.id, 'REVOKED')}
                        title="Revoke pass"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(pass.id, 'ACTIVE')}
                        title="Re-activate pass"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialogs */}
      {selectedPass && (
        <PassCardModal pass={selectedPass} onClose={() => setSelectedPass(null)} />
      )}

      <PassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPassCreated={loadPasses}
      />
    </div>
  );
}
