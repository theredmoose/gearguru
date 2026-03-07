import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { GearItem, GearType } from '../types';
import { GEAR_TYPE_LABELS } from '../constants/labels';
import { GearTypeIcon } from './GearIcons';
import { GearSectionItem } from './GearSectionItem';
import { GearAssignSheet } from './GearAssignSheet';
import { SURFACE_FLOAT, RADIUS_CARD } from '../constants/design';

interface SizingRow {
  label: string;
  value: string;
}

interface Props {
  gearType: GearType;
  assignedGear: GearItem[];   // items of this type for selected sport
  memberGear: GearItem[];     // all member gear (for assign sheet picker)
  sizingItems: SizingRow[] | null;
  onAddGear: () => void;
  onEditGear: (item: GearItem) => void;
}

/** Split "170 cm" into num + unit for styled display. */
function splitVal(val: string): { num: string; unit: string } | null {
  const m = val.match(/^([\d.,–/]+)\s+([A-Za-z"'%]+)$/);
  return m ? { num: m[1], unit: m[2] } : null;
}

export function GearSectionRow({
  gearType,
  assignedGear,
  memberGear,
  sizingItems,
  onAddGear,
  onEditGear,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const label = GEAR_TYPE_LABELS[gearType] ?? gearType;

  const handleAddGear = () => {
    setSheetOpen(false);
    onAddGear();
  };

  const handleEditGear = (item: GearItem) => {
    setSheetOpen(false);
    onEditGear(item);
  };

  return (
    <>
      <div className={`${SURFACE_FLOAT} ${RADIUS_CARD} overflow-hidden`}>
        <div className="flex min-h-[72px]">
          {/* Left: sizing col (30%) */}
          <div className="w-[30%] flex-shrink-0 border-r border-slate-50 px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="flex-shrink-0">
                <GearTypeIcon type={gearType} className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">
                {label}
              </span>
            </div>
            {sizingItems ? (
              sizingItems.map((row, i) => {
                const parts = splitVal(row.value);
                return (
                  <div key={i} className="flex items-baseline gap-[2px]">
                    <span className="text-xs font-black text-slate-800">
                      {parts ? parts.num : row.value}
                    </span>
                    {parts && (
                      <span className="text-[10px] font-bold text-slate-400">{parts.unit}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-slate-300 font-bold">—</span>
            )}
          </div>

          {/* Right: gear items col (70%) */}
          <div className="flex-1 px-3 py-3 flex flex-col gap-1.5">
            {assignedGear.map(item => (
              <GearSectionItem key={item.id} item={item} onEdit={onEditGear} />
            ))}
            <button
              onClick={() => setSheetOpen(true)}
              aria-label={`Add gear to ${label}`}
              className="flex items-center gap-1 text-[10px] font-black text-slate-300 hover:text-emerald-500 transition-colors mt-0.5 self-start"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <GearAssignSheet
          gearType={gearType}
          memberGear={memberGear}
          onAddGear={handleAddGear}
          onEditGear={handleEditGear}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
