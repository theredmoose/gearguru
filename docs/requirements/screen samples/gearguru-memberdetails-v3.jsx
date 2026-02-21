import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Settings, 
  User, 
  Users,
  Info, 
  Compass, 
  Footprints, 
  Wind,
  PlusCircle,
  MoreVertical,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Ruler
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('gear');
  const [selectedSport, setSelectedSport] = useState('Downhill Ski');
  const [skillLevel, setSkillLevel] = useState('Intermediate');

  // Updated Gear Illustrations with more vertical skis and goggled helmet
  const SkiIcon = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <defs>
        <linearGradient id="skiGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      {/* More vertical crossed skis */}
      <path d="M22 58 L42 6 C43 4 45 2 41 2" fill="none" stroke="url(#skiGradRed)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M42 58 L22 6 C21 4 19 2 23 2" fill="none" stroke="url(#skiGradRed)" strokeWidth="3.5" strokeLinecap="round" />
      {/* Center crossing detail / Bindings */}
      <rect x="29" y="29" width="6" height="6" rx="1" fill="#1e293b" transform="rotate(45 32 32)" />
    </svg>
  );

  const BootIcon = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      {/* Slimmer, high-performance ski boot shell */}
      <path d="M26 8 L42 10 C45 10.5 46 13 46 16 L44 44 L54 54 C56 56 54 60 50 60 L20 60 C16 60 16 56 18 52 L22 14 C22.5 10 23 8 26 8 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
      {/* Narrow cuff details */}
      <rect x="28" y="16" width="16" height="2.5" rx="1" fill="#ef4444" />
      <rect x="26" y="24" width="18" height="2.5" rx="1" fill="#ef4444" />
      <rect x="28" y="38" width="14" height="2.5" rx="1" fill="#ef4444" />
      <rect x="30" y="46" width="14" height="2.5" rx="1" fill="#ef4444" />
      {/* Power Strap */}
      <path d="M23 11 L45 13" stroke="#0f172a" strokeWidth="3" />
      {/* Rigid Sole detail */}
      <path d="M18 54 L52 54 L49 60 L20 60 Z" fill="#0f172a" />
    </svg>
  );

  const PoleIcon = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <line x1="22" y1="6" x2="16" y2="58" stroke="#1e293b" strokeWidth="2" />
      <line x1="42" y1="6" x2="48" y2="58" stroke="#1e293b" strokeWidth="2" />
      <path d="M19 6 Q22 4 25 6 L23 18 Q20 20 17 18 Z" fill="#eab308" />
      <path d="M39 6 Q42 4 45 6 L43 18 Q40 20 37 18 Z" fill="#eab308" />
      <ellipse cx="17" cy="52" rx="5" ry="2" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      <ellipse cx="47" cy="52" rx="5" ry="2" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
    </svg>
  );

  const HelmetIcon = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      {/* Hard Shell Design */}
      <path d="M10 32 C10 12 22 8 32 8 C42 8 54 12 54 32 L54 48 C54 52 50 54 46 54 L18 54 C14 54 10 52 10 48 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
      {/* Goggle area - Black interior look */}
      <path d="M14 26 Q32 22 50 26 L50 36 Q32 32 14 36 Z" fill="#000000" />
      <path d="M16 28 Q32 25 48 28" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Goggle reflection highlight */}
      <path d="M18 29 Q25 28 28 30" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
      {/* Ear Protection side pieces */}
      <path d="M10 38 Q7 42 10 48 L14 48 Q17 42 14 38 Z" fill="#1e3a8a" />
      <path d="M54 38 Q57 42 54 48 L50 48 Q47 42 50 38 Z" fill="#1e3a8a" />
      {/* Hard plastic vents */}
      <rect x="22" y="14" width="4" height="2" rx="1" fill="white" fillOpacity="0.4" />
      <rect x="38" y="14" width="4" height="2" rx="1" fill="white" fillOpacity="0.4" />
    </svg>
  );

  const memberDetails = {
    name: "Sarah",
    age: 42,
    height: "6'0\"",
    weight: "180 lbs",
    shoeSize: "10 (US)",
    handSize: "L"
  };

  const sizingData = [
    { label: "Skis", values: ["170cm", "Carvers"], icon: <SkiIcon /> },
    { 
      label: "Boots", 
      isDetailed: true,
      items: [
        { label: "Mondo", value: "27" },
        { label: "Flex", value: "120" },
        { label: "Last", value: "98" }
      ], 
      icon: <BootIcon /> 
    },
    { label: "Poles", values: ["135cm"], icon: <PoleIcon /> },
    { 
      label: "Helmet", 
      isDetailed: true,
      items: [
        { label: "Size", value: "L" }
      ],
      icon: <HelmetIcon /> 
    }
  ];

  const gearInventory = [
    { id: 'skis', type: 'Skis', brand: 'Rossignol Black Ops', spec: '170cm', icon: <SkiIcon />, status: 'Ready' },
    { 
      id: 'boots', 
      type: 'Boots', 
      brand: 'Head Edge LYT', 
      spec: '27 Mondo / 98 Last / 120 Flex',
      icon: <BootIcon />, 
      status: 'Update' 
    },
    { id: 'poles', type: 'Poles', brand: 'K2 Carbon Guide', spec: '135cm', icon: <PoleIcon />, status: 'Ready' },
    { id: 'helmet', type: 'Helmet', brand: 'Giro Range MIPS', spec: 'Size L', icon: <HelmetIcon />, status: 'Ready' }
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-0 sm:p-8 font-sans">
      <div className="w-full max-w-[420px] h-[880px] bg-white shadow-2xl rounded-[3rem] border-[8px] border-slate-900 overflow-hidden flex flex-col relative">
        
        {/* Status Bar */}
        <div className="h-10 w-full bg-blue-700 flex items-center justify-between px-8 pt-4">
          <span className="text-sm font-bold text-white">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-full bg-white"></div>
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
          </div>
        </div>

        {/* Top Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-blue-700 border-b border-blue-800 shadow-sm">
          <button className="p-2 hover:bg-blue-600 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white uppercase tracking-wide">Member Details</h1>
          <button className="p-2 hover:bg-blue-600 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide bg-white">
          
          <div className="mt-6 mb-6 flex items-start gap-4">
            <div className="w-1/2 flex flex-col gap-3">
              <div className="aspect-[3/4] bg-slate-50 rounded-3xl border border-slate-100 shadow-inner overflow-hidden flex items-center justify-center relative">
                <img 
                  src="image_0bb9cc.jpg" 
                  alt="Sarah Skier" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "image_016785.jpg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>
              
              <div className="flex flex-row gap-2">
                <div className="flex-1 group">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block ml-1 mb-1">Sport</label>
                  <div className="relative">
                    <select 
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="Downhill Ski">Downhill</option>
                      <option value="Snowboarding">Snowboard</option>
                      <option value="Cross Country">XC Ski</option>
                      <option value="Telemark">Telemark</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="flex-1 group">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block ml-1 mb-1">Level</label>
                  <div className="relative">
                    <select 
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermed.</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/2 space-y-2 pt-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{memberDetails.name}</h2>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
              </div>
              
              <div className="space-y-0.5">
                {[
                  { label: "Age", value: memberDetails.age },
                  { label: "Height", value: memberDetails.height },
                  { label: "Weight", value: memberDetails.weight },
                  { label: "Shoe", value: memberDetails.shoeSize },
                  { label: "Hand", value: memberDetails.handSize }
                ].map((attr, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-50 py-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attr.label}</span>
                    <span className="text-sm font-extrabold text-slate-800">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full mb-6"></div>

          {/* Sizing Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-blue-700 tracking-tight">Sizing</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {sizingData.map((size, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-start gap-3 min-h-[92px]">
                  <div className="flex-shrink-0 pt-1">
                    {size.icon}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[11px] text-blue-700 font-bold uppercase tracking-wide block mb-1">
                      {size.label}
                    </span>
                    
                    {size.isDetailed ? (
                      <div className="space-y-0.5">
                        {size.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex justify-between items-center w-full pr-1">
                            <span className="text-xs font-bold text-black">{item.label}</span>
                            <span className="text-xs font-black text-black">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      size.values.map((val, vIdx) => (
                        <span key={vIdx} className="text-xs font-black text-black leading-tight block">
                          {val}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-700 tracking-tight">Gear Inventory</h2>
            <button className="text-blue-600 hover:text-blue-700 transition-colors p-1" aria-label="Add New Gear">
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {gearInventory.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden border ${
                    item.status === 'Update' 
                      ? 'bg-red-50 border-red-100' 
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 mt-0.5">{item.type}</span>
                  </div>

                  <div className="max-w-[180px]">
                    <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">{item.brand}</h3>
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight leading-tight">
                      {item.spec}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                    item.status === 'Update' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'
                  }`}>
                    {item.status}
                  </span>
                  <div className={`p-1 rounded-full ${
                    item.status === 'Update' ? 'bg-red-50 text-red-600' : (item.status === 'Ready' || item.status === 'Cleaned' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300')
                  }`}>
                    {item.status === 'Update' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-blue-700 border-t border-blue-800 px-6 py-6 flex justify-between items-center rounded-t-[2.5rem] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.2)]">
          <button onClick={() => setActiveTab('family')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'family' ? 'text-white scale-110' : 'text-blue-300 opacity-70 hover:opacity-100'}`}>
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold">FAMILY</span>
          </button>
          <button onClick={() => setActiveTab('gear')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'gear' ? 'text-white scale-110' : 'text-blue-300 opacity-70 hover:opacity-100'}`}>
            <Compass className="w-6 h-6" />
            <span className="text-[10px] font-bold">GEAR</span>
          </button>
          <button onClick={() => setActiveTab('measure')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'measure' ? 'text-white scale-110' : 'text-blue-300 opacity-70 hover:opacity-100'}`}>
            <Ruler className="w-6 h-6" />
            <span className="text-[10px] font-bold">MEASURE</span>
          </button>
          <button onClick={() => setActiveTab('resources')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'resources' ? 'text-white scale-110' : 'text-blue-300 opacity-70 hover:opacity-100'}`}>
            <Info className="w-6 h-6" />
            <span className="text-[10px] font-bold">RESOURCES</span>
          </button>
        </div>

        {/* Bottom Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-blue-900/30 rounded-full"></div>

      </div>
    </div>
  );
};

export default App;