import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  Compass, 
  Ticket, 
  Users, 
  Network, 
  ShieldCheck, 
  RefreshCw, 
  Radio,
  Home,
  Sparkles
} from 'lucide-react';
import { fetchHealth, triggerSeedDb } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');

  const checkStatus = async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ database: { status: 'offline', connected: false } });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleReSeed = async () => {
    setIsSeeding(true);
    setSeedNotice('');
    try {
      const res = await triggerSeedDb();
      setSeedNotice(res.message ? 'Data synchronized successfully' : 'Synchronized');
      checkStatus();
      setTimeout(() => setSeedNotice(''), 5000);
    } catch (err) {
      setSeedNotice('Sync failed');
    } finally {
      setIsSeeding(false);
    }
  };

  const isConnected = health?.database?.connected;

  const navItems = [
    { id: 'landing', label: 'Explore', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'passes', label: 'Trek Permits', icon: Ticket },
    { id: 'trails', label: 'Trail Network', icon: Mountain },
    { id: 'routes', label: 'Route & Evac Finder', icon: ShieldCheck },
    { id: 'trekkers', label: 'Trekker Registry', icon: Users },
    { id: 'graph', label: 'Topology Explorer', icon: Network },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <Mountain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">TrekPass</span>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200/70">
                  Sagarmatha Authority
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Himalayan Expedition & Trail Safety</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Live Status Indicator & Seed */}
          <div className="flex items-center gap-2.5">
            {/* System Status Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-[11px] font-medium text-slate-700">
                  {isConnected ? 'Network Online' : 'Local Active'}
                </span>
              </div>
            </div>

            {/* Sync / Reset Button */}
            <button
              onClick={handleReSeed}
              disabled={isSeeding}
              title="Reset and synchronize Himalayan checkpoint network"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{isSeeding ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-200/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {seedNotice && (
          <div className="pb-2 text-center text-xs font-semibold text-teal-700 animate-fade-in">
            ✓ {seedNotice}
          </div>
        )}
      </div>
    </header>
  );
}
