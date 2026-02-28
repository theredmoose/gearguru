import type { FamilyMember, GearItem, Sport, GearType, GearStatus } from '../types';

interface GearLoadoutPanelProps {
  member: FamilyMember;
  sport: Sport;
  gearItems: GearItem[];
  onSlotTap: (slotType: GearType) => void;
  color: string;
  showHeader?: boolean;
}

interface GearSlot {
  type: GearType;
  label: string;
  x: number;
  y: number;
}

const SPORT_SLOTS: Record<Sport, GearSlot[]> = {
  'nordic-classic': [
    { type: 'helmet', label: 'Helmet', x: 50, y: 8 },
    { type: 'pole', label: 'Poles', x: 15, y: 45 },
    { type: 'ski', label: 'Skis', x: 85, y: 45 },
    { type: 'boot', label: 'Boots', x: 50, y: 85 },
  ],
  'nordic-skate': [
    { type: 'helmet', label: 'Helmet', x: 50, y: 8 },
    { type: 'pole', label: 'Poles', x: 15, y: 45 },
    { type: 'ski', label: 'Skis', x: 85, y: 45 },
    { type: 'boot', label: 'Boots', x: 50, y: 85 },
  ],
  'nordic-combi': [
    { type: 'helmet', label: 'Helmet', x: 50, y: 8 },
    { type: 'pole', label: 'Poles', x: 15, y: 45 },
    { type: 'ski', label: 'Skis', x: 85, y: 45 },
    { type: 'boot', label: 'Boots', x: 50, y: 85 },
  ],
  alpine: [
    { type: 'helmet', label: 'Helmet', x: 50, y: 8 },
    { type: 'pole', label: 'Poles', x: 15, y: 45 },
    { type: 'ski', label: 'Skis', x: 85, y: 45 },
    { type: 'boot', label: 'Boots', x: 50, y: 85 },
  ],
  snowboard: [
    { type: 'helmet', label: 'Helmet', x: 50, y: 8 },
    { type: 'snowboard', label: 'Board', x: 85, y: 45 },
    { type: 'boot', label: 'Boots', x: 50, y: 85 },
  ],
  hockey: [
    { type: 'helmet', label: 'Helmet', x: 50, y: 8 },
    { type: 'other', label: 'Stick', x: 15, y: 45 },
    { type: 'skate', label: 'Skates', x: 50, y: 85 },
  ],
};

function getSlotState(
  slotType: GearType,
  gearItems: GearItem[]
): { filled: boolean; status?: GearStatus; item?: GearItem } {
  const item = gearItems.find((g) => g.type === slotType);
  if (!item) {
    return { filled: false };
  }
  return { filled: true, status: item.status, item };
}

function getSlotColor(status?: GearStatus): string {
  switch (status) {
    case 'active':
      return '#3b82f6';
    case 'outgrown':
    case 'to-sell':
    case 'sold':
      return '#f97316';
    case 'needs-repair':
      return '#ef4444';
    case 'available':
    default:
      return '#22c55e';
  }
}

// SVG silhouettes for different sports
function SkierSilhouette({ color }: { color: string }) {
  return (
    <g fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" strokeOpacity="0.3">
      {/* Head */}
      <circle cx="100" cy="35" r="18" />
      {/* Body */}
      <ellipse cx="100" cy="85" rx="22" ry="35" />
      {/* Left Arm */}
      <line x1="78" y1="70" x2="45" y2="95" strokeWidth="8" strokeLinecap="round" />
      {/* Right Arm */}
      <line x1="122" y1="70" x2="155" y2="95" strokeWidth="8" strokeLinecap="round" />
      {/* Left Leg */}
      <line x1="88" y1="115" x2="75" y2="165" strokeWidth="10" strokeLinecap="round" />
      {/* Right Leg */}
      <line x1="112" y1="115" x2="125" y2="165" strokeWidth="10" strokeLinecap="round" />
    </g>
  );
}

function SnowboarderSilhouette({ color }: { color: string }) {
  return (
    <g fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" strokeOpacity="0.3">
      {/* Head */}
      <circle cx="100" cy="35" r="18" />
      {/* Body - slightly angled for snowboard stance */}
      <ellipse cx="100" cy="85" rx="24" ry="35" transform="rotate(-5 100 85)" />
      {/* Left Arm - extended for balance */}
      <line x1="76" y1="68" x2="35" y2="80" strokeWidth="8" strokeLinecap="round" />
      {/* Right Arm */}
      <line x1="124" y1="72" x2="160" y2="60" strokeWidth="8" strokeLinecap="round" />
      {/* Legs - together on board */}
      <line x1="92" y1="115" x2="85" y2="165" strokeWidth="10" strokeLinecap="round" />
      <line x1="108" y1="115" x2="115" y2="165" strokeWidth="10" strokeLinecap="round" />
    </g>
  );
}

function HockeyPlayerSilhouette({ color }: { color: string }) {
  return (
    <g fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" strokeOpacity="0.3">
      {/* Head */}
      <circle cx="100" cy="35" r="18" />
      {/* Body - slightly crouched */}
      <ellipse cx="100" cy="82" rx="25" ry="32" />
      {/* Left Arm - holding stick */}
      <line x1="75" y1="70" x2="40" y2="100" strokeWidth="8" strokeLinecap="round" />
      {/* Right Arm - on stick */}
      <line x1="125" y1="75" x2="145" y2="95" strokeWidth="8" strokeLinecap="round" />
      {/* Left Leg */}
      <line x1="85" y1="110" x2="70" y2="165" strokeWidth="10" strokeLinecap="round" />
      {/* Right Leg */}
      <line x1="115" y1="110" x2="130" y2="165" strokeWidth="10" strokeLinecap="round" />
    </g>
  );
}

export function GearLoadoutPanel({
  member,
  sport,
  gearItems,
  onSlotTap,
  color,
  showHeader = true,
}: GearLoadoutPanelProps) {
  const slots = SPORT_SLOTS[sport];

  const renderSilhouette = () => {
    switch (sport) {
      case 'snowboard':
        return <SnowboarderSilhouette color={color} />;
      case 'hockey':
        return <HockeyPlayerSilhouette color={color} />;
      default:
        return <SkierSilhouette color={color} />;
    }
  };

  return (
    <div className="gear-loadout-panel">
      {showHeader && (
        <div className="loadout-header">
          <span className="loadout-title">{member.name}'s Gear</span>
        </div>
      )}
      <div className="loadout-silhouette">
        <svg viewBox="0 0 200 180" preserveAspectRatio="xMidYMid meet">
          {renderSilhouette()}

          {/* Gear slots */}
          {slots.map((slot) => {
            const { filled, status } = getSlotState(slot.type, gearItems);
            const slotColor = filled ? getSlotColor(status) : '#94a3b8';

            return (
              <g
                key={slot.type}
                className="gear-slot"
                onClick={() => onSlotTap(slot.type)}
                style={{ cursor: 'pointer' }}
              >
                {/* Slot circle */}
                <circle
                  cx={slot.x * 2}
                  cy={slot.y * 1.8}
                  r="14"
                  fill={filled ? slotColor : 'white'}
                  stroke={slotColor}
                  strokeWidth={filled ? 2 : 2}
                  strokeDasharray={filled ? 'none' : '4 2'}
                />
                {/* Slot icon/label */}
                <text
                  x={slot.x * 2}
                  y={slot.y * 1.8 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill={filled ? 'white' : slotColor}
                  fontWeight="600"
                >
                  {filled ? '✓' : '+'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="loadout-legend">
        {slots.map((slot) => {
          const slotState = getSlotState(slot.type, gearItems);
          return (
            <button
              key={slot.type}
              className={`loadout-legend-item ${slotState.filled ? 'filled' : 'empty'}`}
              onClick={() => onSlotTap(slot.type)}
              style={{
                borderColor: slotState.filled ? getSlotColor(slotState.status) : undefined,
              }}
            >
              <span className="legend-label">{slot.label}</span>
              {slotState.filled && slotState.item && (
                <span className="legend-info">{slotState.item.brand} {slotState.item.size}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
