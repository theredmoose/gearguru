import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FamilyMember, GearItem, Sport, GearType, AppSettings } from '../types';
import type { SizingCard } from '../types/sizing';
import { GearSectionRow } from './GearSectionRow';
import { GEAR_TYPE_LABELS } from '../constants/labels';
import { DEFAULT_SPORT_SECTIONS, OPTIONAL_SPORT_SECTIONS } from '../constants/sportSections';
import { RADIUS_INNER } from '../constants/design';

interface Props {
  member: FamilyMember;
  gearItems: GearItem[];
  selectedSport: Sport;
  sizingCards: SizingCard[];
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onAddGear: (gearType: GearType) => void;
  onEditGear: (item: GearItem) => void;
}

export function GearSectionList({
  member,
  gearItems,
  selectedSport,
  sizingCards,
  settings,
  onUpdateSettings,
  onAddGear,
  onEditGear,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Resolve enabled sections: user preference or sport default
  const enabledSections: GearType[] =
    settings.sportSections?.[selectedSport] ?? DEFAULT_SPORT_SECTIONS[selectedSport] ?? [];

  // Optional sections not yet enabled
  const availableOptional = (OPTIONAL_SPORT_SECTIONS[selectedSport] ?? []).filter(
    t => !enabledSections.includes(t)
  );

  const memberGear = gearItems.filter(g => g.ownerId === member.id);

  function addSection(gearType: GearType) {
    const updated = [...enabledSections, gearType];
    onUpdateSettings({
      sportSections: {
        ...settings.sportSections,
        [selectedSport]: updated,
      },
    });
    setMenuOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {enabledSections.map(gearType => {
        const sizingCard = sizingCards.find(c => c.type === gearType) ?? null;
        const assignedGear = memberGear.filter(
          g => g.type === gearType && g.sports.includes(selectedSport)
        );

        return (
          <GearSectionRow
            key={gearType}
            gearType={gearType}
            assignedGear={assignedGear}
            memberGear={memberGear}
            sizingItems={sizingCard?.items ?? null}
            onAddGear={() => onAddGear(gearType)}
            onEditGear={onEditGear}
          />
        );
      })}

      {/* Add Section */}
      <div className="relative mt-1">
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Add section"
          className={`flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          Add Section
        </button>

        {menuOpen && availableOptional.length > 0 && (
          <div className={`absolute left-0 mt-2 bg-white border border-slate-100 ${RADIUS_INNER} shadow-lg z-10 min-w-[140px]`}>
            {availableOptional.map(gearType => (
              <button
                key={gearType}
                onClick={() => addSection(gearType)}
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {GEAR_TYPE_LABELS[gearType]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
