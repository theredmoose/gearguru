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
    <div className="bg-blue-700 border-t border-blue-800 px-4 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.2)]">
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 transition-all min-w-[56px] ${
              active ? 'text-white scale-110' : 'text-blue-300 opacity-70 hover:opacity-100'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
