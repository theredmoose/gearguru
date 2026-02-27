import { Pencil, Trash2, MapPin } from 'lucide-react';
import type { GearItem, FamilyMember } from '../types';
import { GearStatusBadge } from './GearStatusBadge';
import { GearTypeIcon } from './GearIcons';
import { GEAR_TYPE_LABELS, SPORT_LABELS } from '../constants/labels';

interface GearCardProps {
  item: GearItem;
  onEdit: (item: GearItem) => void;
  onDelete: (item: GearItem) => void;
  showOwner?: boolean;
  members?: FamilyMember[];
}

const CONDITION_COLORS: Record<string, string> = {
  new:  '#22c55e',
  good: '#3b82f6',
  fair: '#f59e0b',
  worn: '#ef4444',
};

const CONDITION_ICON_CLASSES: Record<string, string> = {
  new:  'bg-green-50 border-green-100',
  good: 'bg-slate-50 border-slate-100',
  fair: 'bg-amber-50 border-amber-100',
  worn: 'bg-red-50 border-red-100',
};

function formatProfile(profile: { tip: number; waist: number; tail: number }): string {
  return `${profile.tip}/${profile.waist}/${profile.tail}`;
}

export function GearCard({
  item,
  onEdit,
  onDelete,
  showOwner = false,
  members = [],
}: GearCardProps) {
  const ownerName = members.find((m) => m.id === item.ownerId)?.name ?? 'Unknown';

  // Prefer fullView photo, fall back to any photo
  const displayPhoto = item.photos?.find((p) => p.type === 'fullView')
    ?? item.photos?.find((p) => p.type === 'labelView')
    ?? item.photos?.[0];

  const alpineDetails = item.extendedDetails?.type === 'alpineSki'
    ? item.extendedDetails.details
    : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${item.brand} ${item.model}?`)) {
      onDelete(item);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };

  const iconTileClass = CONDITION_ICON_CLASSES[item.condition] ?? 'bg-slate-50 border-slate-100';

  return (
    <div
      className="gear-card bg-white border border-slate-200 rounded-3xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer mb-3"
      onClick={() => onEdit(item)}
    >
      {/* Icon tile or photo */}
      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border flex-shrink-0 overflow-hidden ${iconTileClass}`}>
        {displayPhoto ? (
          <div className="gear-card-photo w-full h-full relative">
            <img
              src={displayPhoto.url}
              alt={`${item.brand} ${item.model}`}
              className="w-full h-full object-cover"
            />
            {item.photos && item.photos.length > 1 && (
              <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[8px] font-bold px-1 rounded-sm">
                {item.photos.length}
              </span>
            )}
          </div>
        ) : (
          <GearTypeIcon type={item.type} className="w-9 h-9" />
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {GEAR_TYPE_LABELS[item.type] ?? item.type}
          </span>
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide text-white"
            style={{ backgroundColor: CONDITION_COLORS[item.condition] ?? '#94a3b8' }}
          >
            {item.condition}
          </span>
          {item.status && item.status !== 'available' && (
            <GearStatusBadge status={item.status} size="small" />
          )}
        </div>

        <p className="text-sm font-black text-slate-900 leading-tight truncate">
          {item.brand} {item.model}
        </p>

        <p className="text-[10px] font-bold text-slate-500 mt-0.5">
          <span>Size: {item.size}</span>
          {item.year && <><span> · </span><span>{item.year}</span></>}
        </p>

        {/* Extended details for alpine skis */}
        {alpineDetails && (
          <div className="flex flex-wrap gap-1 mt-1">
            {alpineDetails.profile && (
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                {formatProfile(alpineDetails.profile)}mm
              </span>
            )}
            {alpineDetails.radiusM && (
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                R{alpineDetails.radiusM}m
              </span>
            )}
            {alpineDetails.bindings && (
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                {alpineDetails.bindings.brand} {alpineDetails.bindings.model}
              </span>
            )}
          </div>
        )}

        {/* Location */}
        {item.location && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-bold">{item.location}</span>
          </div>
        )}

        {/* Checkout */}
        {item.status === 'checked-out' && item.checkedOutTo && (
          <p className="text-[10px] text-orange-500 font-bold mt-0.5">
            Out: {item.checkedOutTo}
          </p>
        )}

        {/* Owner / Sport */}
        {showOwner
          ? <p className="text-[10px] text-slate-400 font-bold mt-0.5">{ownerName}</p>
          : <p className="text-[10px] text-slate-400 font-bold mt-0.5">{SPORT_LABELS[item.sport] ?? item.sport}</p>
        }
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-[#008751]"
          onClick={handleEdit}
          aria-label="Edit gear"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
          onClick={handleDelete}
          aria-label="Delete gear"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
