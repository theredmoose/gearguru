import { Plus } from 'lucide-react';
import type { GearItem, GearType } from '../types';
import { GEAR_TYPE_LABELS } from '../constants/labels';
import { RADIUS_INNER } from '../constants/design';

interface Props {
  gearType: GearType;
  memberGear: GearItem[];
  onAddGear: () => void;
  onEditGear: (item: GearItem) => void;
  onClose: () => void;
}

export function GearAssignSheet({ gearType, memberGear, onAddGear, onEditGear, onClose }: Props) {
  const matching = memberGear.filter(g => g.type === gearType);
  const label = GEAR_TYPE_LABELS[gearType] ?? gearType;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        data-testid="sheet-backdrop"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className={`relative w-full bg-white rounded-t-3xl px-6 pt-5 pb-8 shadow-2xl`}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4">
          Add to {label}
        </p>

        {/* New button */}
        <button
          onClick={onAddGear}
          className={`w-full flex items-center gap-3 px-4 py-3 mb-4 bg-[#008751] text-white font-black text-sm ${RADIUS_INNER} active:scale-[0.98] transition-all`}
          aria-label="New gear"
        >
          <Plus className="w-4 h-4" />
          New {label}
        </button>

        {/* Existing gear */}
        {matching.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold text-center py-3">
            No existing {label.toLowerCase()} in inventory
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-2">
              Assign Existing
            </p>
            {matching.map(item => (
              <button
                key={item.id}
                onClick={() => onEditGear(item)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] ${RADIUS_INNER} hover:bg-emerald-50 transition-colors text-left`}
              >
                <span className="text-sm font-black text-slate-800">
                  {item.brand} {item.model}
                </span>
                <span className="text-xs font-bold text-slate-400">{item.size}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
