import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Settings, 
  User, 
  Users,
  Compass, 
  PlusCircle,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Ruler,
  BookOpen
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('gear');
  const [selectedSport, setSelectedSport] = useState('Alpine Ski');
  const [skillLevel, setSkillLevel] = useState('Intermediate');

  // Primary Theme Colors
  const primaryGreen = "#008751";
  const subtleHeaderColor = "#1e3a32"; 

  // Refined Gear Illustrations
  const SkiIcon = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <defs>
        <linearGradient id="skiGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <path d="M22 58 L42 6 C43 4 45 2 41 2" fill="none" stroke="url(#skiGradRed)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M42 58 L22 6 C21 4 19 2 23 2" fill="none" stroke="url(#skiGradRed)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="29" y="29" width="6" height="6" rx="1" fill="#1e293b" transform="rotate(45 32 32)" />
    </svg>
  );

  const BootIcon = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <path d="M26 8 L42 10 C45 10.5 46 13 46 16 L44 44 L54 54 C56 56 54 60 50 60 L20 60 C16 60 16 56 18 52 L22 14 C22.5 10 23 8 26 8 Z" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="28" y="16" width="16" height="2.5" rx="1" fill="#f97316" />
      <rect x="26" y="24" width="18" height="2.5" rx="1" fill="#f97316" />
      <rect x="28" y="38" width="14" height="2.5" rx="1" fill="#f97316" />
      <rect x="30" y="46" width="14" height="2.5" rx="1" fill="#f97316" />
      <path d="M23 11 L45 13" stroke="#0f172a" strokeWidth="3" />
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
      <path d="M10 32 C10 12 22 8 32 8 C42 8 54 12 54 32 L54 48 C54 52 50 54 46 54 L18 54 C14 54 10 52 10 48 Z" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1.5" />
      <path d="M14 26 Q32 22 50 26 L50 36 Q32 32 14 36 Z" fill="#000000" />
      <path d="M18 29 Q25 28 28 30" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M10 38 Q7 42 10 48 L14 48 Q17 42 14 38 Z" fill="#1e293b" />
      <path d="M54 38 Q57 42 54 48 L50 48 Q47 42 50 38 Z" fill="#1e293b" />
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
    <div className="flex justify-center items-center min-h-screen bg-[#DDE4F0] p-0 sm:p-8 font-sans">
      <div className="w-full max-w-[420px] h-[880px] bg-[#F8FAFC] shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-[3.5rem] border-[12px] border-slate-900 overflow-hidden flex flex-col relative">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-lg z-20 border-b border-slate-100 shadow-sm">
          <div className="h-10 w-full flex items-center justify-between px-10 pt-4">
            <span className="text-xs font-black text-slate-900">9:41</span>
            <div className="flex gap-1.5 items-center">
              <svg className="w-5 h-5 fill-slate-900" viewBox="0 0 24 24"><path d="M12 21l-12-18h24z"/></svg>
              <div className="w-6 h-3 rounded-sm border border-slate-400 relative">
                <div className="absolute left-0 top-0 h-full w-4 bg-emerald-600"></div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <button className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Member <span style={{ color: primaryGreen }}>Details</span>
            </h1>
            <button className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide pt-4">
          
          <div className="bg-white p-4 rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.03)] border border-white mb-4 flex gap-5">
            <div className="w-1/2 flex flex-col gap-3">
              <div className="aspect-[3/4] bg-[#F1F5F9] rounded-[2rem] overflow-hidden relative border-2 border-slate-50">
                <img 
                  src="image_0bb9cc.jpg" 
                  alt="Sarah" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "image_016785.jpg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
              </div>
              
              <div className="group relative">
                <label className="text-[10px] text-emerald-700 font-black uppercase tracking-widest block mb-1">Sport</label>
                <select 
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full bg-[#ECFDF5] border-none rounded-xl px-2 py-2 text-[10px] font-black text-emerald-700 appearance-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Alpine Ski">Alpine Ski</option>
                  <option value="Snowboarding">Board</option>
                </select>
                <ChevronDown className="absolute right-1.5 bottom-2.5 w-3 h-3 text-emerald-400 pointer-events-none" />
              </div>
            </div>

            <div className="w-1/2 pt-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{memberDetails.name}</h2>
                <div className="w-2.5 h-2.5 rounded-full bg-[#008751] shadow-[0_0_10px_rgba(0,135,81,0.5)]"></div>
              </div>
              <div className="space-y-0.5 mb-3">
                {[
                  { label: "Age", value: memberDetails.age },
                  { label: "Height", value: memberDetails.height },
                  { label: "Weight", value: memberDetails.weight },
                  { label: "Feet", value: memberDetails.shoeSize },
                  { label: "Hands", value: memberDetails.handSize }
                ].map((attr, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-50 py-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attr.label}</span>
                    <span className="text-xs font-black text-slate-800">{attr.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="group relative">
                <label className="text-[10px] text-emerald-700 font-black uppercase tracking-widest block mb-1">Skill Level</label>
                <select 
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full bg-[#ECFDF5] border-none rounded-xl px-2 py-2 text-[10px] font-black text-emerald-700 appearance-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <ChevronDown className="absolute right-1.5 bottom-2.5 w-3 h-3 text-emerald-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sizing Section */}
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tighter mb-3 ml-2 uppercase" style={{ color: primaryGreen }}>
              Sizing <span style={{ color: subtleHeaderColor }}>Guide</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {sizingData.map((size, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] p-4 flex items-start gap-3 min-h-[86px] border border-white shadow-[0_15px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex-shrink-0 bg-slate-50 p-2 rounded-2xl relative z-10">
                    {size.icon}
                  </div>
                  <div className="flex flex-col flex-1 relative z-10">
                    <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest mb-1.5">
                      {size.label}
                    </span>
                    {size.isDetailed ? (
                      <div className="space-y-1">
                        {size.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
                            <span className="text-[10px] font-black text-slate-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      size.values.map((val, vIdx) => (
                        <span key={vIdx} className={`text-[12px] font-black block leading-tight ${vIdx > 0 ? 'text-slate-400 text-[9px] uppercase tracking-wider' : 'text-slate-900'}`}>
                          {val}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gear Inventory Section */}
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xl font-black tracking-tighter uppercase" style={{ color: primaryGreen }}>
              Gear <span style={{ color: subtleHeaderColor }}>Vault</span>
            </h2>
            <button className="bg-[#008751] p-2 rounded-xl text-white shadow-lg shadow-emerald-100 transition-all duration-500 active:scale-90">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {gearInventory.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-[2.5rem] p-4 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.02)] border border-white hover:border-emerald-100 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1.2rem] flex flex-col items-center justify-center transition-all bg-[#F8FAFC]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight mb-0.5">{item.brand}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.spec}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                    item.status === 'Update' ? 'bg-orange-100 text-orange-600' : 'bg-[#E3F9F1] text-[#008751]'
                  }`}>
                    {item.status}
                  </div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100">
                    {item.status === 'Update' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#008751]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation: Family, Gear, Measure, Resources */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100 px-8 py-7 flex justify-between items-center z-30">
          <button onClick={() => setActiveTab('family')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'family' ? 'text-[#008751] scale-110' : 'text-slate-300 hover:text-emerald-400'}`}>
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Family</span>
          </button>
          
          <button onClick={() => setActiveTab('gear')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'gear' ? 'text-[#008751] scale-110' : 'text-slate-300 hover:text-emerald-400'}`}>
            <Compass className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Gear</span>
          </button>

          <button onClick={() => setActiveTab('measure')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'measure' ? 'text-[#008751] scale-110' : 'text-slate-300 hover:text-emerald-400'}`}>
            <Ruler className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Measure</span>
          </button>

          <button onClick={() => setActiveTab('resources')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'resources' ? 'text-[#008751] scale-110' : 'text-slate-300 hover:text-emerald-400'}`}>
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Resources</span>
          </button>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-200 rounded-full z-40"></div>

      </div>
    </div>
  );
};

export default App;