import React, { useState, useEffect } from 'react';
import { X, MapPin, CheckCircle, User, AlertCircle } from 'lucide-react';
import { fetchTrekkers, fetchCheckpoints, checkinTrekker } from '../services/api';

export default function CheckinModal({ isOpen, onClose, onCheckinComplete }) {
  const [trekkers, setTrekkers] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    trekker_id: '',
    checkpoint_id: '',
    status: 'CHECKED_IN',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, cRes] = await Promise.all([fetchTrekkers(), fetchCheckpoints()]);
      const tList = tRes.data || [];
      const cList = cRes.data || [];
      setTrekkers(tList);
      setCheckpoints(cList);
      if (tList.length > 0 && !formData.trekker_id) {
        setFormData((prev) => ({ ...prev, trekker_id: tList[0].id }));
      }
      if (cList.length > 0 && !formData.checkpoint_id) {
        setFormData((prev) => ({ ...prev, checkpoint_id: cList[0].id }));
      }
    } catch (err) {
      setError('Failed to load trekkers or checkpoints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await checkinTrekker(formData.trekker_id, formData.checkpoint_id, formData.status);
      onCheckinComplete();
      onClose();
    } catch (err) {
      setError('Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Checkpoint Check-In</h3>
              <p className="text-xs text-slate-500">Record trekker waypoint for search & rescue</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-teal-600" />
              Trekker
            </label>
            <select
              value={formData.trekker_id}
              onChange={(e) => setFormData({ ...formData, trekker_id: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
              disabled={loading || submitting}
            >
              {trekkers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Last: {t.last_known_location || 'Lukla Gateway'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-600" />
              Checkpoint Location
            </label>
            <select
              value={formData.checkpoint_id}
              onChange={(e) => setFormData({ ...formData, checkpoint_id: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
              disabled={loading || submitting}
            >
              {checkpoints.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.has_medical ? '🏥 [Clinic Unit]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transit Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none transition"
            >
              <option value="CHECKED_IN">Checked In (Normal Transit)</option>
              <option value="RESTING">Resting / Acclimatizing</option>
              <option value="MEDICAL_ATTENTION">Received Medical Check</option>
            </select>
          </div>

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
              <CheckCircle className="h-4 w-4" />
              {submitting ? 'Logging...' : 'Confirm Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
