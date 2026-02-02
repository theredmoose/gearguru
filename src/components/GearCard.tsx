import type { GearItem, FamilyMember } from '../types';

interface GearCardProps {
  item: GearItem;
  onEdit: (item: GearItem) => void;
  onDelete: (item: GearItem) => void;
  showOwner?: boolean;
  members?: FamilyMember[];
}

const GEAR_TYPE_LABELS: Record<string, string> = {
  ski: 'Skis',
  pole: 'Poles',
  boot: 'Boots',
  binding: 'Bindings',
  snowboard: 'Snowboard',
  skate: 'Skates',
  helmet: 'Helmet',
  other: 'Other',
};

const SPORT_LABELS: Record<string, string> = {
  'nordic-classic': 'Nordic Classic',
  'nordic-skate': 'Nordic Skate',
  'nordic-combi': 'Nordic Combi',
  alpine: 'Alpine',
  snowboard: 'Snowboard',
  hockey: 'Hockey',
};

const CONDITION_COLORS: Record<string, string> = {
  new: '#22c55e',
  good: '#3b82f6',
  fair: '#f59e0b',
  worn: '#ef4444',
};

export function GearCard({
  item,
  onEdit,
  onDelete,
  showOwner = false,
  members = [],
}: GearCardProps) {
  const ownerName = members.find((m) => m.id === item.ownerId)?.name ?? 'Unknown';

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

  return (
    <div className="gear-card" onClick={() => onEdit(item)}>
      <div className="gear-card-main">
        <div className="gear-card-info">
          <div className="gear-card-header">
            <span className="gear-type">{GEAR_TYPE_LABELS[item.type] || item.type}</span>
            <span
              className="gear-condition"
              style={{ backgroundColor: CONDITION_COLORS[item.condition] }}
            >
              {item.condition}
            </span>
          </div>
          <div className="gear-brand-model">
            {item.brand} {item.model}
          </div>
          <div className="gear-details">
            <span className="gear-size">Size: {item.size}</span>
            {item.year && <span className="gear-year">{item.year}</span>}
          </div>
          {showOwner && <div className="gear-owner">{ownerName}</div>}
          {!showOwner && (
            <div className="gear-sport">{SPORT_LABELS[item.sport] || item.sport}</div>
          )}
        </div>
      </div>
      <div className="gear-card-actions">
        <button
          className="btn-icon"
          onClick={handleEdit}
          aria-label="Edit gear"
        >
          ✏️
        </button>
        <button
          className="btn-icon btn-icon-danger"
          onClick={handleDelete}
          aria-label="Delete gear"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
