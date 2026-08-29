import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Mountain, User, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { fetchTrekkers, fetchTrails, createPass } from '../services/api';

export default function PassModal({ isOpen, onClose, onPassCreated }) {
  const [trekkers, setTrekkers] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    trekker_id: '',
    trail_id: '',
    pass_type: 'SOLO',
    valid_from: today,
    valid_to: nextWeek,
    emergency_insurance_id: '',
    station_id: 'ranger-1',
  });

  useEffect(() => {
    if (isOpen) {
      loadSelectOptions();
    }
  }, [isOpen]);

  const loadSelectOptions = async () => {
    setLoading(true);
    setError('');
    try {
      const [trekkersRes, trailsRes] = await Promise.all([fetchTrekkers(), fetchTrails()]);
      const tList = trekkersRes.data || [];
      const trList = trailsRes.data || [];
      setTrekkers(tList);
      setTrails(trList);
      if (tList.length > 0 && !formData.trekker_id) {
        setFormData((prev) => ({ ...prev, trekker_id: tList[0].id }));
      }
      if (trList.length > 0 && !formData.trail_id) {
        setFormData((prev) => ({ ...prev, trail_id: trList[0].id }));
      }
    } catch (err) {
      setError('Failed to load trekkers or trails');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.trekker_id || !formData.trail_id) {
      setError('Please select both a trekker and a trail');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createPass(formData);
      onPassCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to issue permit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Issue Official Trekking Permit</h3>
              <p className="text-xs text-slate-500">Registers mountain access and emergency rescue eligibility</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Trekker Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-teal-600" />
              Select Registered Trekker
            </label>
            <select
              value={formData.trekker_id}
              onChange={(e) => setFormData({ ...formData, trekker_id: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
              disabled={loading || submitting}
            >
              {trekkers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.country || 'International'} • {t.experience_level})
                </option>
              ))}
            </select>
          </div>

          {/* Trail Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mountain className="h-3.5 w-3.5 text-teal-600" />
              Select Permitted Route
            </label>
            <select
              value={formData.trail_id}
              onChange={(e) => setFormData({ ...formData, trail_id: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
              disabled={loading || submitting}
            >
              {trails.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.name} ({tr.distance_km} km • {tr.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Pass Type & Ranger Post */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Permit Tier</label>
              <select
                value={formData.pass_type}
                onChange={(e) => setFormData({ ...formData, pass_type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
              >
                <option value="SOLO">Solo Trekker Permit</option>
                <option value="EXPEDITION">Expedition Group Pass</option>
                <option value="LOCAL_GUIDED">Local Guided Permit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Post</label>
              <select
                value={formData.station_id}
                onChange={(e) => setFormData({ ...formData, station_id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
              >
                <option value="ranger-1">Namche Central Sector Post</option>
                <option value="ranger-2">Lobuche High Altitude Command</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-teal-600" />
                Valid From
              </label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-600" />
                Valid To
              </label>
              <input
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Insurance ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Rescue Insurance ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. GLOBAL-RESCUE-9812 or ALLIANZ-ALPINE-330"
              value={formData.emergency_insurance_id}
              onChange={(e) => setFormData({ ...formData, emergency_insurance_id: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-700/20 hover:bg-teal-800 disabled:opacity-50 transition"
            >
              <PlusCircle className="h-4 w-4" />
              {submitting ? 'Authorizing...' : 'Issue Permit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
