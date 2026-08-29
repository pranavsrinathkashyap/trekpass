import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PassesPage from './pages/PassesPage';
import TrailsPage from './pages/TrailsPage';
import RouteFinderPage from './pages/RouteFinderPage';
import TrekkersPage from './pages/TrekkersPage';
import GraphPage from './pages/GraphPage';
import PassModal from './components/PassModal';
import { Mountain, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'landing' && (
            <LandingPage 
              setActiveTab={setActiveTab} 
              onOpenPassModal={() => setIsPassModalOpen(true)} 
            />
          )}
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onOpenPassModal={() => setIsPassModalOpen(true)} 
            />
          )}
          {activeTab === 'passes' && <PassesPage />}
          {activeTab === 'trails' && <TrailsPage setActiveTab={setActiveTab} />}
          {activeTab === 'routes' && <RouteFinderPage />}
          {activeTab === 'trekkers' && <TrekkersPage />}
          {activeTab === 'graph' && <GraphPage />}
        </main>
      </div>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-teal-700" />
            <span className="font-bold text-slate-800">TrekPass</span>
            <span>— Sagarmatha National Park Trail Safety & Expedition Permit System</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              High-Altitude Emergency Operations
            </span>
            <span>•</span>
            <span className="text-slate-500">Lukla • Namche • Everest Base Camp</span>
          </div>
        </div>
      </footer>

      {/* Global Issue Pass Modal */}
      <PassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onPassCreated={() => {
          if (activeTab === 'dashboard' || activeTab === 'passes') {
            window.dispatchEvent(new Event('reload-data'));
          }
        }}
      />
    </div>
  );
}
