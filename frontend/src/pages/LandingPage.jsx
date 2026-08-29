import React from 'react';
import { 
  Mountain, 
  ShieldCheck, 
  Navigation, 
  Ticket, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  HeartPulse, 
  Compass, 
  CheckCircle2, 
  Flame, 
  Award,
  ChevronRight
} from 'lucide-react';

const FEATURED_TRAILS = [
  {
    id: 'trail-ebc-main',
    name: 'Classic Everest Base Camp Expedition',
    subtitle: 'Nepal • 5,364m Elevation',
    distance: '65.0 km',
    duration: '12-14 Days',
    difficulty: 'Challenging',
    elevationGain: '+2,800m',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop',
    description: 'The quintessential high-altitude Himalayan pilgrimage through Sherpa villages, ancient monasteries, and rugged glacial moraines leading to the foot of Mount Everest.'
  },
  {
    id: 'trail-gokyo-link',
    name: 'Gokyo Lakes & Cho La Pass Circuit',
    subtitle: 'Khumbu Sanctuary • 5,368m Elevation',
    distance: '48.0 km',
    duration: '14-16 Days',
    difficulty: 'Expert',
    elevationGain: '+2,400m',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    description: 'Breathtaking turquoise glacial lakes and technical alpine pass crossings offering panoramic 360° vistas of Cho Oyu, Lhotse, Makalu, and Everest.'
  },
  {
    id: 'trail-namche-panorama',
    name: 'Namche Acclimatization & Cultural Trail',
    subtitle: 'Sagarmatha Gateway • 3,880m Elevation',
    distance: '18.0 km',
    duration: '4-6 Days',
    difficulty: 'Moderate',
    elevationGain: '+600m',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
    description: 'Scenic low-altitude trail suitable for acclimatization, cultural heritage discovery, and sweeping valley viewpoints overlooking Ama Dablam.'
  }
];

export default function LandingPage({ setActiveTab, onOpenPassModal }) {
  return (
    <div className="space-y-16 animate-fade-in pb-12">
      
      {/* 1. Epic Hero Section (Inspired by High-End Himalayan Mountaineering) */}
      <div className="relative overflow-hidden rounded-3xl min-h-[580px] sm:min-h-[640px] flex items-center shadow-2xl border border-slate-200">
        
        {/* Background Photo with Cinematic Dark/Icy Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1800&auto=format&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-6 sm:px-12 py-16 max-w-2xl text-white space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/15 tracking-wide">
            <Mountain className="h-4 w-4" />
            SAGARMATHA NATIONAL PARK • 8,848M
          </div>

          <div className="space-y-2">
            <p className="text-amber-400 font-bold uppercase tracking-widest text-xs sm:text-sm">
              Official Expedition Permits & Mountain Safety
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Everest.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-teal-200 to-white">
                Set your sights high.
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal">
            Authorized high-altitude permit management, multi-stage acclimatization navigation, and real-time emergency medical tracking across the world's most iconic mountain trails.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-900/40 transition-all transform active:scale-95"
            >
              <Compass className="h-4 w-4" />
              Launch Operations Dashboard
            </button>
            <button
              onClick={onOpenPassModal}
              className="flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all"
            >
              <Ticket className="h-4 w-4 text-amber-300" />
              Apply for Trek Permit
            </button>
          </div>

          {/* Key Altitude Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-300">Summit Peak</p>
              <p className="text-lg font-bold text-white font-mono">8,848m</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-300">Base Camp</p>
              <p className="text-lg font-bold text-white font-mono">5,364m</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-300">Rescue Clinics</p>
              <p className="text-lg font-bold text-white font-mono">6 Stations</p>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Introduction Narrative (Nimsdai Style Storytelling) */}
      <div className="alpine-card rounded-3xl p-8 sm:p-12 border border-slate-200/80">
        <div className="max-w-3xl space-y-4">
          <div className="inline-block border-b-2 border-amber-500 pb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-800">
              The Himalayan Experience
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Mount Everest, Nepal — Sagarmatha (8,848m)
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            Known dearly to the people of Nepal as <em>Sagarmatha</em> ("Goddess of the Sky"), standing on her trails still holds one of the greatest lures in human exploration. TrekPass provides seamless trail permit authorizations, topological waypoint tracking, and emergency medical egress routing to ensure every trekker ascends safely.
          </p>
        </div>
      </div>

      {/* 3. Featured Trails Showcase with Photos */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700">Official Routes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Authorized Expedition Trails
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('trails')}
            className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            View All Checkpoints & Map <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_TRAILS.map((trail) => (
            <div
              key={trail.id}
              className="alpine-card rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-teal-300 transition-all duration-300 group"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={trail.image}
                    alt={trail.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-teal-300 border border-white/20">
                      {trail.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[11px] font-mono text-amber-300 font-semibold">{trail.subtitle}</span>
                    <h3 className="text-base font-bold text-white leading-snug">{trail.name}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {trail.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center border border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">Distance</p>
                      <p className="font-bold text-slate-900 font-mono mt-0.5">{trail.distance}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">Duration</p>
                      <p className="font-bold text-slate-900 mt-0.5">{trail.duration}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">Climb</p>
                      <p className="font-bold text-teal-700 font-mono mt-0.5">{trail.elevationGain}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setActiveTab('routes')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 group-hover:bg-teal-700 group-hover:text-white px-4 py-2.5 text-xs font-bold text-slate-800 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Explore Waypoint Route
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 4. Safety & Operational Core Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="alpine-card rounded-3xl p-7 space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 border border-teal-200">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Digital Permit Cards with QR</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Authorized trekking permits linked to medical insurance, permitted trail zones, and official ranger post verification.
          </p>
        </div>

        <div className="alpine-card rounded-3xl p-7 space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
            <Navigation className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Multi-Stage Acclimatization</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Topological routing algorithms calculate safe elevation progression between waypoints from Lukla (2,860m) to EBC (5,364m).
          </p>
        </div>

        <div className="alpine-card rounded-3xl p-7 space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-800 border border-rose-200">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Emergency Medical Egress</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated emergency navigation discovers the quickest safe evacuation path to the nearest high-altitude clinic when rockfalls occur.
          </p>
        </div>

      </div>

    </div>
  );
}
