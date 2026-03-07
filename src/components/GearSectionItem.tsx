import type { GearItem } from '../types';
import { RADIUS_INNER } from '../constants/design';

interface Props {
  item: GearItem;
  onEdit: (item: GearItem) => void;
}

/** Split "170 cm" → { num: "170", unit: "cm" } for styled display. */
function splitSize(size: string): { num: string; unit: string } | null {
  const m = size.match(/^([\d.,–/]+)\s+([A-Za-z"'%]+)$/);
  return m ? { num: m[1], unit: m[2] } : null;
}

export function GearSectionItem({ item, onEdit }: Props) {
  const parts = splitSize(item.size);

  return (
    <button
      onClick={() => onEdit(item)}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#F8FAFC] ${RADIUS_INNER} hover:bg-emerald-50 active:scale-[0.98] transition-all text-left`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-slate-800 leading-tight truncate">
          {item.brand} {item.model}
        </p>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.tags.map(tag => (
              <span key={tag} className="tag-chip text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-[2px] flex-shrink-0">
        <span className="text-xs font-black text-slate-700">
          {parts ? parts.num : item.size}
        </span>
        {parts && (
          <span className="text-[10px] font-bold text-slate-400">{parts.unit}</span>
        )}
      </div>
    </button>
  );
}
