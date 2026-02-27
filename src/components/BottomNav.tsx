import { Users, Compass, Ruler, Info } from 'lucide-react';

export type TopLevelTab = 'family' | 'gear' | 'measure' | 'resources';

interface BottomNavProps {
  activeTab: TopLevelTab;
  onChange: (tab: TopLevelTab) => void;
}

const TABS: { id: TopLevelTab; label: string; Icon: React.ElementType }[] = [
  { id: 'family',    label: 'FAMILY',    Icon: Users    },
  { id: 'gear',      label: 'GEAR',      Icon: Compass  },
  { id: 'measure',   label: 'MEASURE',   Icon: Ruler    },
  { id: 'resources', label: 'RESOURCES', Icon: Info     },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <div className="bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.08)]">
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1.5 transition-all min-w-[56px] ${
              active ? 'text-[#008751] scale-110' : 'text-slate-300 hover:text-emerald-400'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
