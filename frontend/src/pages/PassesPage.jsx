import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  Mountain, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  Ban,
  RotateCcw
} from 'lucide-react';
import { fetchAllPasses, updatePassStatus } from '../services/api';
import PassCardModal from '../components/PassCardModal';
import PassModal from '../components/PassModal';

export default function PassesPage() {
  const [passes, setPasses] = useState([]);
  const [filteredPasses, setFilteredPasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusNotice, setStatusNotice] = useState('');

  const loadPasses = async () => {
    setLoading(true);
    try {
      const res = await fetchAllPasses();
      const list = res.data || [];
      setPasses(list);
      setFilteredPasses(list);
    } catch (err) {
      console.error('Error loading passes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  useEffect(() => {
    let list = passes;
    if (statusFilter !== 'ALL') {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.pass_number?.toLowerCase().includes(q) ||
          p.trekker?.name?.toLowerCase().includes(q) ||
          p.permitted_trails?.some((tr) => tr.name?.toLowerCase().includes(q))
      );
    }
    setFilteredPasses(list);
  }, [search, statusFilter, passes]);

  const handleStatusChange = async (passId, newStatus, passNumber) => {
    setUpdatingId(passId);
    
    // Optimistic local state update
    setPasses((prev) =>
      prev.map((p) => (p.id === passId || p.pass_number === passNumber ? { ...p, status: newStatus } : p))
    );

    try {
      await updatePassStatus(passId, newStatus);
      setStatusNotice(`Permit ${passNumber} status updated to ${newStatus}.`);
      setTimeout(() => setStatusNotice(''), 4000);
      loadPasses();
    } catch (err) {
      console.error('Status update failed:', err);
      loadPasses();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevokePass = async (passId, passNumber) => {
    if (!window.confirm(`Are you sure you want to revoke permit ${passNumber}? It will be moved to the Revoked list.`)) {
      return;
    }
    await handleStatusChange(passId, 'REVOKED', passNumber);
  };

  const handleReactivatePass = async (passId, passNumber) => {
    await handleStatusChange(passId, 'ACTIVE', passNumber);
  };

  const activeCount = passes.filter((p) => p.status === 'ACTIVE').length;
  const revokedCount = passes.filter((p) => p.status === 'REVOKED').length;
  const expiredCount = passes.filter((p) => p.status === 'EXPIRED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-teal-700" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Trekking Permits Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official mountain permits authorized for high-altitude Himalayan routes and conservation zones
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 transition transform active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          Issue New Permit
        </button>
      </div>

      {statusNotice && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-fade-in">
          ✓ {statusNotice}
        </div>
      )}

      {/* Filters & Search */}
      <div className="alpine-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by permit number, trekker name, or trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'ALL'
                ? 'bg-teal-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({passes.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('REVOKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              statusFilter === 'REVOKED'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Revoked ({revokedCount})
          </button>
          <button
            onClick={() => setStatusFilter('EXPIRED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'EXPIRED'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Expired ({expiredCount})
          </button>
        </div>
      </div>

      {/* Grid of Permits */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">
          Loading authorized permits...
        </div>
      ) : filteredPasses.length === 0 ? (
        <div className="alpine-card rounded-3xl py-16 text-center text-slate-500">
          <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">No Trek Permits Found in {statusFilter} List</p>
          <p className="text-xs text-slate-400 mt-1">Try switching tabs or issue a new permit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPasses.map((p) => {
            const isRevoked = p.status === 'REVOKED';
            const isActive = p.status === 'ACTIVE';
            return (
              <div
                key={p.id}
                className={`alpine-card rounded-2xl p-5 flex flex-col justify-between transition group border ${
                  isRevoked
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'hover:shadow-lg hover:border-teal-200'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {p.pass_number}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isRevoked
                        ? 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Trekker Info */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs border ${
                      isRevoked
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-teal-50 text-teal-800 border-teal-100'
                    }`}>
                      {p.trekker?.name ? p.trekker.name[0] : 'T'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {p.trekker?.name || 'Trekker'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {p.trekker?.country || 'International'} • {p.trekker?.experience_level || 'Hiker'}
                      </p>
                    </div>
                  </div>

                  {/* Permitted Trail */}
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold truncate">
                      <Mountain className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{p.permitted_trails?.[0]?.name || 'Everest Base Camp'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>{p.valid_from} → {p.valid_to}</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedPass(p)}
                    className="flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-900 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </button>

                  <div className="flex items-center gap-2">
                    {isRevoked ? (
                      <button
                        onClick={() => handleReactivatePass(p.id, p.pass_number)}
                        disabled={updatingId === p.id}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200 transition"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevokePass(p.id, p.pass_number)}
                        disabled={updatingId === p.id}
                        className="flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200 transition"
                      >
                        <Ban className="h-3 w-3 text-rose-600" />
                        Revoke Permit
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Digital Pass View Modal */}
      {selectedPass && (
        <PassCardModal pass={selectedPass} onClose={() => setSelectedPass(null)} />
      )}

      {/* Create Modal */}
      <PassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPassCreated={loadPasses}
      />
    </div>
  );
}
