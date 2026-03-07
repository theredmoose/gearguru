import { useState, useMemo } from 'react';
import { Settings, ChevronDown, ArrowLeftRight } from 'lucide-react';
import type { FamilyMember, GearItem, Sport, GearType, SkillLevel, AppSettings, BootUnit } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import type { SizingCard } from '../types/sizing';
import { GearSectionList } from './GearSectionList';
import { ScreenHeader } from './ScreenHeader';
import {
  SECTION_HEADER_CLS, COLOR_PRIMARY, COLOR_ACCENT,
  BTN_ICON_HEADER_CLS,
  SURFACE_FLOAT, RADIUS_CARD_LG, RADIUS_INNER,
} from '../constants/design';
import { GearLoadoutPanel } from './GearLoadoutPanel';
import { GrowthWarningBadge } from './GrowthWarningBadge';
import { getShoeSizesFromFootLength } from '../services/shoeSize';
import { shouldWarnGrowth, isMeasurementStale, analyzeGrowthTrend } from '../services/growthAnalysis';
import {
  calculateAlpineSkiSizing,
  calculateAlpineBootSizing,
  calculateNordicSkiSizing,
  calculateNordicBootSizing,
  calculateSnowboardSizing,
  calculateSnowboardBootSizing,
  calculateHockeySkateSize,
  calculateHelmetSizing,
} from '../services/sizing';

interface MemberDetailProps {
  member: FamilyMember;
  gearItems: GearItem[];
  settings?: AppSettings;
  onUpdateSettings?: (patch: Partial<AppSettings>) => void;
  onBack: () => void;
  onEdit: () => void;
  onGetSizing?: () => void;
  onOpenConverter: () => void;
  onAddGear: (sport: Sport, gearType?: GearType) => void;
  onEditGear: (item: GearItem) => void;
  onViewHistory?: () => void;
}

const SPORT_OPTIONS: { value: Sport; label: string }[] = [
  { value: 'alpine',        label: 'Downhill' },
  { value: 'nordic-classic', label: 'XC Classic' },
  { value: 'nordic-skate',  label: 'XC Skate' },
  { value: 'snowboard',     label: 'Snowboard' },
  { value: 'hockey',        label: 'Hockey' },
];

const LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'expert',       label: 'Expert' },
];


type LengthUnit = 'cm' | 'in';

function fmtLength(cm: number, unit: LengthUnit): string {
  return unit === 'in' ? `${Math.round(cm / 2.54)}"` : `${cm} cm`;
}

function fmtRange(min: number, max: number, unit: LengthUnit): string {
  if (unit === 'in') return `${Math.round(min / 2.54)}–${Math.round(max / 2.54)}"`;
  return `${min}–${max} cm`;
}

function fmtBoot(mondopoint: number, unit: BootUnit): { label: string; value: string } {
  const sizes = getShoeSizesFromFootLength(mondopoint / 10);
  switch (unit) {
    case 'mp':       return { label: 'Mondo',  value: `${mondopoint} MP` };
    case 'eu':       return { label: 'EU',     value: String(sizes.eu) };
    case 'us-men':   return { label: 'US M',   value: String(sizes.usMen) };
    case 'us-women': return { label: 'US W',   value: String(sizes.usWomen) };
  }
}

/**
 * Split "173 cm" → { num: "173", unit: "cm" }.
 * Matches a numeric/range token followed by a unit word.
 * Returns null when no split applies (e.g. "5'10"", "—", "M/L").
 */
function splitNumUnit(val: string): { num: string; unit: string } | null {
  if (!val || val === '—') return null;
  const m = val.match(/^([\d.,–/]+(?:\s*\/\s*[\d.,–/]+)?)\s+([A-Za-z"'%]+)$/);
  return m ? { num: m[1], unit: m[2] } : null;
}

function renderStatValue(val: string, mode: 'toggle' | 'plain'): React.ReactNode {
  const isToggle = mode === 'toggle';
  const parts = splitNumUnit(val);
  const numCls = `text-sm font-black leading-none ${isToggle ? 'text-slate-800 group-hover:text-[#008751] transition-colors' : 'text-slate-800'}`;
  if (!parts) {
    return <span className={numCls}>{val}</span>;
  }
  return (
    <>
      <span className={numCls}>{parts.num}</span>
      <span className="text-xs font-bold text-slate-400 leading-none">{parts.unit}</span>
    </>
  );
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getSizingCards(
  member: FamilyMember,
  sport: Sport,
  skillLevel: SkillLevel,
  lengthUnit: LengthUnit,
  bootUnit: BootUnit,
): SizingCard[] {
  const m = member.measurements;
  const helmetSizing = m.headCircumference ? calculateHelmetSizing(m.headCircumference) : null;

  switch (sport) {
    case 'alpine': {
      const ski  = calculateAlpineSkiSizing(m, skillLevel, member.gender);
      const boot = calculateAlpineBootSizing(m, skillLevel, member.gender);
      return [
        { label: 'Skis',   type: 'ski',    toggleKind: 'length', items: [{ label: 'Length', value: fmtLength(ski.skiLengthRecommended, lengthUnit) }] },
        { label: 'Boots',  type: 'boot',   toggleKind: 'boot',   items: [
            fmtBoot(boot.mondopoint, bootUnit),
            { label: 'Flex', value: `${boot.flexRating.min}–${boot.flexRating.max}` },
            { label: 'Last', value: `${boot.lastWidthMm} mm` },
          ]},
        { label: 'Poles',  type: 'pole',   toggleKind: 'length', items: [{ label: 'Length', value: fmtLength(Math.round(m.height * 0.7), lengthUnit) }] },
        { label: 'Helmet', type: 'helmet',                        items: [{ label: 'Size',   value: helmetSizing?.size ?? '—' }] },
      ];
    }
    case 'nordic-classic':
    case 'nordic-skate': {
      const ski  = calculateNordicSkiSizing(m, sport, skillLevel);
      const boot = calculateNordicBootSizing(m);
      return [
        { label: 'Skis',   type: 'ski',    toggleKind: 'length', items: [{ label: 'Length', value: fmtLength(ski.skiLengthRecommended, lengthUnit) }] },
        { label: 'Poles',  type: 'pole',   toggleKind: 'length', items: [{ label: 'Length', value: fmtLength(ski.poleLengthRecommended, lengthUnit) }] },
        { label: 'Boots',  type: 'boot',   toggleKind: 'boot',   items: [fmtBoot(boot.mondopoint, bootUnit)] },
        { label: 'Helmet', type: 'helmet',                        items: [{ label: 'Size',   value: helmetSizing?.size ?? '—' }] },
      ];
    }
    case 'snowboard': {
      const board = calculateSnowboardSizing(m, skillLevel);
      const boot  = calculateSnowboardBootSizing(m);
      return [
        { label: 'Board',  type: 'snowboard', toggleKind: 'length', items: [{ label: 'Length', value: fmtLength(board.boardLengthRecommended, lengthUnit) }] },
        { label: 'Boots',  type: 'boot',      toggleKind: 'boot',   items: [fmtBoot(boot.mondopoint, bootUnit)] },
        { label: 'Stance', type: 'ski',        toggleKind: 'length', items: [{ label: 'Width',  value: fmtRange(board.stanceWidth.min, board.stanceWidth.max, lengthUnit) }] },
        { label: 'Helmet', type: 'helmet',                            items: [{ label: 'Size',   value: helmetSizing?.size ?? '—' }] },
      ];
    }
    case 'hockey': {
      const bauer = calculateHockeySkateSize(m, 'bauer');
      const ccm   = calculateHockeySkateSize(m, 'ccm');
      return [
        { label: 'Bauer', type: 'skate', items: [{ label: `${bauer.skateSizeUS} ${bauer.width}`, value: `EU ${bauer.skateSizeEU}` }] },
        { label: 'CCM',   type: 'skate', items: [{ label: `${ccm.skateSizeUS} ${ccm.width}`,     value: `EU ${ccm.skateSizeEU}` }] },
      ];
    }
    default:
      return [];
  }
}

export function MemberDetail({
  member,
  gearItems,
  settings,
  onUpdateSettings,
  onBack,
  onEdit,
  onOpenConverter,
  onAddGear,
  onEditGear,
  onViewHistory,
}: MemberDetailProps) {
  const { measurements: m } = member;
  const age = calculateAge(member.dateOfBirth);
  const showGrowthWarning = shouldWarnGrowth(member);
  const growthBadgeReason = showGrowthWarning
    ? isMeasurementStale(member) && analyzeGrowthTrend(member.measurementHistory ?? []).isGrowing
      ? 'both'
      : isMeasurementStale(member)
        ? 'stale'
        : 'growing'
    : null;
  const footLength = Math.max(m.footLengthLeft, m.footLengthRight);

  const defaultSport: Sport =
    settings?.defaultSport ??
    (Object.keys(member.skillLevels ?? {})[0] as Sport | undefined) ??
    'alpine';
  const [selectedSport, setSelectedSport] = useState<Sport>(defaultSport);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    member.skillLevels?.[defaultSport] ?? 'intermediate'
  );

  const lengthUnit: LengthUnit = settings?.skiLengthUnit ?? 'cm';
  const bootUnit: BootUnit = settings?.bootUnit ?? 'mp';
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(
    settings?.heightUnit === 'ft-in' ? 'ft' : 'cm'
  );
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(settings?.weightUnit ?? 'kg');
  const [footUnit, setFootUnit] = useState<'cm' | 'in'>('cm');

  const handleSlotTap = (slotType: import('../types').GearType) => {
    const existing = gearItems.find(
      (g) => g.type === slotType && g.sports.includes(selectedSport)
    );
    if (existing) {
      onEditGear(existing);
    } else {
      onAddGear(selectedSport);
    }
  };

  const sizingCards = useMemo(
    () => getSizingCards(member, selectedSport, skillLevel, lengthUnit, bootUnit),
    [member, selectedSport, skillLevel, lengthUnit, bootUnit]
  );

  const showFoot = settings?.display.showFoot ?? true;
  const showHand = settings?.display.showHand ?? true;
  const headDisplay = m.headCircumference ? `${m.headCircumference} cm` : '—';
  const separateFeetHands = settings?.display.separateFeetHands ?? false;

  // Format shoe size for display
  const shoeDisplay = footLength > 0
    ? (separateFeetHands && m.footLengthLeft !== m.footLengthRight
        ? footUnit === 'in'
          ? `${(m.footLengthLeft / 2.54).toFixed(1)} / ${(m.footLengthRight / 2.54).toFixed(1)} in`
          : `${m.footLengthLeft} / ${m.footLengthRight} cm`
        : footUnit === 'in'
          ? `${(footLength / 2.54).toFixed(1)} in`
          : `${footLength} cm`)
    : '—';
  // Hand size display
  const handDisplay = m.handSize ? `${m.handSize} cm` : '—';

  // Height display
  const heightDisplay = (() => {
    if (heightUnit === 'ft') {
      const totalInches = m.height / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${m.height} cm`;
  })();

  // Weight display
  const weightDisplay = weightUnit === 'lbs'
    ? `${Math.round(m.weight * 2.2046)} lbs`
    : `${m.weight} kg`;

  type StatRow = { label: string; value: string; badge?: string | null; onToggle?: () => void; action?: () => void };

  const statGroup1: StatRow[] = [
    { label: 'Age',    value: `${age} yrs` },
    { label: 'Height', value: heightDisplay, badge: growthBadgeReason, onToggle: () => setHeightUnit(u => u === 'cm' ? 'ft' : 'cm') },
    { label: 'Weight', value: weightDisplay, onToggle: () => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg') },
  ];

  const statGroup2: StatRow[] = [
    { label: 'Head', value: headDisplay },
    ...(showHand ? [{ label: 'Hand', value: handDisplay }] : []),
    ...(showFoot ? [{ label: 'Foot', value: shoeDisplay, action: footLength > 0 ? onOpenConverter : undefined, onToggle: footLength > 0 ? () => setFootUnit(u => u === 'cm' ? 'in' : 'cm') : undefined }] : []),
  ];

  return (
    <div className="member-detail flex flex-col min-h-screen">
      <ScreenHeader
        title="Member Details"
        onBack={onBack}
        right={
          <button
            onClick={onEdit}
            className={BTN_ICON_HEADER_CLS}
            aria-label="Edit member"
          >
            <Settings className="w-5 h-5" />
          </button>
        }
      />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 pt-6 pb-28">

        {/* ── Profile Card ── */}
        <div className={`${SURFACE_FLOAT} ${RADIUS_CARD_LG} p-5 mb-7 flex gap-4`}>

          {/* Left column: interactive gear diagram */}
          <div className="w-[46%] flex-shrink-0">
            <GearLoadoutPanel
              member={member}
              sport={selectedSport}
              gearItems={gearItems}
              onSlotTap={handleSlotTap}
              color="#008751"
              showHeader={false}
            />
          </div>

          {/* Right column: name + stats + history */}
          <div className="flex-1 pt-1 min-w-0">
            <div className="flex items-center gap-2 mb-0">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none truncate">
                {member.name}
              </h2>
            </div>

            <div className="mb-3 mt-0">
              {[...statGroup1, ...statGroup2].map((row, i) => (
                <div key={row.label} className="flex items-center border-b border-slate-100 py-2.5" style={(i === 0 || i === 1 || i === statGroup1.length) ? { marginTop: '8px' } : undefined}>
                  <span className="flex-1 pl-[18px] text-[11px] text-slate-400 font-bold tracking-widest">
                    {row.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {row.action && row.onToggle ? (
                      /* Foot: green value link (opens converter) + separate toggle icon */
                      <>
                        <button
                          onClick={row.action}
                          className="flex items-baseline gap-[3px] text-[#008751] hover:text-emerald-800 transition-colors"
                          aria-label={`Open ${row.label} converter`}
                        >
                          {renderStatValue(row.value, 'toggle')}
                        </button>
                        <button
                          onClick={row.onToggle}
                          className="text-slate-300 hover:text-emerald-400 transition-colors flex-shrink-0"
                          aria-label={`Toggle ${row.label} units`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : row.onToggle ? (
                      /* Height, Weight: single combined button (value + badge + icon) */
                      <button
                        onClick={row.onToggle}
                        className="flex items-center gap-1.5 group"
                        aria-label={`Toggle ${row.label} units`}
                      >
                        <span className="flex items-baseline gap-[3px]">
                          {renderStatValue(row.value, 'toggle')}
                        </span>
                        {row.badge && <GrowthWarningBadge reason={row.badge as 'stale' | 'growing' | 'both'} />}
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                      </button>
                    ) : (
                      /* Age, Hand: plain value + spacer for alignment */
                      <>
                        <span className="flex items-baseline gap-[3px]">
                          {renderStatValue(row.value, 'plain')}
                        </span>
                        <span className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="text-xs font-black text-[#008751] uppercase tracking-widest hover:text-emerald-800 transition-colors"
              >
                View History →
              </button>
            )}
          </div>
        </div>

        {/* ── Sport & Skill Level ── */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <label className="text-xs text-emerald-700 font-black uppercase tracking-widest block mb-1 ml-1">Sport</label>
            <select
              value={selectedSport}
              onChange={(e) => {
                const s = e.target.value as Sport;
                setSelectedSport(s);
                setSkillLevel(member.skillLevels?.[s] ?? 'intermediate');
              }}
              className={`w-full bg-white border border-slate-100 ${RADIUS_INNER} px-3 py-2.5 text-xs font-black text-[#008751] appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]`}
            >
              {SPORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 bottom-3 w-3 h-3 text-emerald-400 pointer-events-none" />
          </div>
          <div className="flex-1 relative">
            <label className="text-xs text-emerald-700 font-black uppercase tracking-widest block mb-1 ml-1">Skill Level</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
              className={`w-full bg-white border border-slate-100 ${RADIUS_INNER} px-3 py-2.5 text-xs font-black text-[#008751] appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]`}
            >
              {LEVEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 bottom-3 w-3 h-3 text-emerald-400 pointer-events-none" />
          </div>
        </div>


        {/* ── Gear Sections ── */}
        <div className="h-5" />
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5 ml-1">
            <h2 className={SECTION_HEADER_CLS} style={{ color: COLOR_PRIMARY }}>
              Gear <span style={{ color: COLOR_ACCENT }}>Setup</span>
            </h2>
          </div>
          <GearSectionList
            member={member}
            gearItems={gearItems}
            selectedSport={selectedSport}
            sizingCards={sizingCards}
            settings={settings ?? DEFAULT_SETTINGS}
            onUpdateSettings={onUpdateSettings ?? (() => {})}
            onAddGear={(gearType) => onAddGear(selectedSport, gearType)}
            onEditGear={onEditGear}
          />
        </div>
      </div>
    </div>
  );
}
