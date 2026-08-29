import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Mountain, 
  Calendar, 
  User, 
  Phone, 
  Radio, 
  CheckCircle2, 
  AlertOctagon, 
  QrCode,
  Globe
} from 'lucide-react';

export default function PassCardModal({ pass, onClose }) {
  if (!pass) return null;

  const isActive = pass.status === 'ACTIVE';
  const trekker = pass.trekker || {};
  const trails = pass.permitted_trails || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Header Ribbon */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isActive ? 'bg-teal-50 border-teal-100' : 'bg-rose-50 border-rose-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm border border-teal-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Official Trekking Permit</span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{pass.pass_number}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              isActive 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertOctagon className="h-3.5 w-3.5" />}
              {pass.status}
            </span>
            <button 
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 space-y-5">
          
          {/* Trekker Profile */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Permit Holder</p>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5 text-teal-700" />
                {trekker.name || 'Expedition Member'}
              </p>
              <p className="text-xs text-slate-500">{trekker.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Nationality & Tier</p>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Globe className="h-3.5 w-3.5 text-teal-600" />
                {trekker.country || 'International'}
              </p>
              <span className="inline-block mt-1 rounded bg-teal-100/70 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                {trekker.experience_level || 'ADVANCED'}
              </span>
            </div>
          </div>

          {/* Permit Validity & Pass Type */}
          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Pass Type</p>
              <p className="text-xs font-bold text-slate-900 mt-1 font-mono">{pass.pass_type}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Valid From</p>
              <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {pass.valid_from}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Valid To</p>
              <p className="text-xs font-bold text-amber-700 mt-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {pass.valid_to}
              </p>
            </div>
          </div>

          {/* Permitted Trails */}
          <div>
            <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Mountain className="h-4 w-4 text-teal-700" />
              Authorized High-Altitude Routes
            </p>
            <div className="space-y-2">
              {trails.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5 text-xs">
                  <span className="font-semibold text-slate-900">{t.name}</span>
                  <span className="rounded bg-teal-100/70 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-800">
                    {t.difficulty || 'MODERATE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts & Issuing Post */}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <Radio className="h-3.5 w-3.5 text-amber-600" />
                Issuing Ranger Post:
              </span>
              <span className="font-bold text-slate-900">{pass.issuing_station || 'Namche Sector HQ'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <Phone className="h-3.5 w-3.5 text-rose-500" />
                Emergency Rescue Hotline:
              </span>
              <span className="font-mono text-emerald-800 font-bold">{trekker.emergency_contact || 'Himalayan Rescue Association (+977 1 4440292)'}</span>
            </div>
            {pass.emergency_insurance_id && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Evacuation Policy ID:</span>
                <span className="font-mono text-slate-700 font-semibold">{pass.emergency_insurance_id}</span>
              </div>
            )}
          </div>

          {/* QR Verification Pattern Simulation */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1 text-slate-900 border border-slate-200">
                <QrCode className="h-10 w-10" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">National Park Authority Verified</p>
                <p className="text-[10px] text-slate-500">Scan at ranger checkpoint to validate entry</p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-md border border-teal-200">
              VERIFIED
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end bg-slate-50 px-6 py-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close Permit View
          </button>
        </div>
      </div>
    </div>
  );
}
