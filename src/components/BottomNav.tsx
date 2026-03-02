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
    <div
      className="bg-white border-t border-slate-100 px-8 flex justify-between items-center shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.08)]"
      style={{ paddingTop: '1.25rem', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-2 transition-all min-w-[56px] ${
              active ? 'text-[#008751] scale-110' : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-tighter">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
