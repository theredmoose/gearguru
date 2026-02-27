import { useState, useMemo } from 'react';
import { Settings, PlusCircle, ChevronDown, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import type { FamilyMember, GearItem, Sport, SkillLevel, AppSettings, BootUnit } from '../types';
import { ScreenHeader } from './ScreenHeader';
import { GearTypeIcon } from './GearIcons';
import { GrowthWarningBadge } from './GrowthWarningBadge';
import { getShoeSizesFromFootLength } from '../services/shoeSize';
import { GEAR_TYPE_LABELS } from '../constants/labels';
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
  onGetSizing: () => void;
  onOpenConverter: () => void;
  onAddGear: () => void;
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
  { value: 'intermediate', label: 'Intermed.' },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'expert',       label: 'Expert' },
];


type LengthUnit = 'cm' | 'in';
const BOOT_UNIT_CYCLE: BootUnit[] = ['mp', 'eu', 'us-men', 'us-women'];

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

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Derive Ready/Update from gear condition
function gearFitStatus(item: GearItem): 'Ready' | 'Update' {
  return item.condition === 'worn' ? 'Update' : 'Ready';
}

interface SizingCard {
  label: string;
  type: 'ski' | 'boot' | 'pole' | 'helmet' | 'snowboard' | 'skate';
  toggleKind?: 'length' | 'boot';
  items: { label: string; value: string }[];
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
  onGetSizing,
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

  const [lengthUnit, setLengthUnit] = useState<LengthUnit>(settings?.skiLengthUnit ?? 'cm');
  const [bootUnit, setBootUnit] = useState<BootUnit>(settings?.bootUnit ?? 'mp');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(
    settings?.heightUnit === 'ft-in' ? 'ft' : 'cm'
  );
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(settings?.weightUnit ?? 'kg');

  function cycleBootUnit() {
    setBootUnit(u => {
      const idx = BOOT_UNIT_CYCLE.indexOf(u);
      const next = BOOT_UNIT_CYCLE[(idx + 1) % BOOT_UNIT_CYCLE.length];
      onUpdateSettings?.({ bootUnit: next });
      return next;
    });
  }

  const sizingCards = useMemo(
    () => getSizingCards(member, selectedSport, skillLevel, lengthUnit, bootUnit),
    [member, selectedSport, skillLevel, lengthUnit, bootUnit]
  );

  // Format shoe size for display
  const shoeDisplay = footLength > 0 ? `${footLength} cm` : '—';
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

  const showFoot = settings?.display.showFoot ?? true;
  const showHand = settings?.display.showHand ?? true;

  const statRows = [
    { label: 'Age',    value: `${age} yrs` },
    { label: 'Height', value: heightDisplay, badge: growthBadgeReason, onToggle: () => setHeightUnit(u => u === 'cm' ? 'ft' : 'cm') },
    { label: 'Weight', value: weightDisplay, onToggle: () => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg') },
    ...(showFoot ? [{ label: 'Foot', value: shoeDisplay, action: footLength > 0 ? onOpenConverter : undefined }] : []),
    ...(showHand ? [{ label: 'Hand', value: handDisplay }] : []),
  ] as Array<{
    label: string;
    value: string;
    badge?: string | null;
    onToggle?: () => void;
    action?: () => void;
  }>;

  return (
    <div className="member-detail flex flex-col min-h-screen">
      <ScreenHeader
        title="Member Details"
        onBack={onBack}
        right={
          <button
            onClick={onEdit}
            className="p-2 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all"
            aria-label="Edit member"
          >
            <Settings className="w-5 h-5" />
          </button>
        }
      />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-white px-6 pb-6">

        {/* ── Profile ── */}
        <div className="mt-5 mb-5 flex items-start gap-4">

          {/* Left column: avatar + sport/level selectors */}
          <div className="w-[48%] flex flex-col gap-3">
            <div className="aspect-[3/4] bg-slate-100 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden">
              <span className="text-6xl font-black text-[#008751] select-none">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex gap-2">
              {/* Sport picker */}
              <div className="flex-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Sport</label>
                <div className="relative">
                  <select
                    value={selectedSport}
                    onChange={(e) => {
                      const s = e.target.value as Sport;
                      setSelectedSport(s);
                      setSkillLevel(member.skillLevels?.[s] ?? 'intermediate');
                    }}
                    className="w-full bg-[#ECFDF5] border-none rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#008751] appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    {SPORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Level picker */}
              <div className="flex-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Level</label>
                <div className="relative">
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                    className="w-full bg-[#ECFDF5] border-none rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#008751] appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    {LEVEL_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: name + stat rows */}
          <div className="flex-1 pt-1 space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {member.name}
              </h2>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200 flex-shrink-0" />
            </div>

            <div className="space-y-0.5">
              {statRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-slate-50 py-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {row.label}
                  </span>
                  {row.action ? (
                    <button
                      onClick={row.action}
                      className="text-sm font-extrabold text-[#008751] hover:text-emerald-800 transition-colors"
                    >
                      {row.value}
                    </button>
                  ) : row.onToggle ? (
                    <button
                      onClick={row.onToggle}
                      className="flex items-center gap-1 group"
                      aria-label={`Toggle ${row.label} units`}
                    >
                      <span className="text-sm font-extrabold text-slate-800 group-hover:text-[#008751] transition-colors">{row.value}</span>
                      {row.badge && <GrowthWarningBadge reason={row.badge as 'stale' | 'growing' | 'both'} />}
                      <ArrowLeftRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-800">{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* View History link */}
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="text-[10px] font-black text-[#008751] uppercase tracking-widest hover:text-emerald-800 transition-colors mt-2"
              >
                View History →
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full mb-5" />

        {/* ── Sizing ── */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black tracking-tight" style={{ color: '#008751' }}>Sizing</h2>
            <button
              onClick={onGetSizing}
              className="text-[10px] font-black text-[#008751] uppercase tracking-widest hover:text-emerald-800 transition-colors"
            >
              All Sports →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {sizingCards.map((card) => (
              <div
                key={card.label}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-start gap-3 min-h-[88px]"
              >
                <div className="flex-shrink-0 pt-0.5">
                  <GearTypeIcon type={card.type} className="w-9 h-9" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wide">
                      {card.label}
                    </span>
                    {card.toggleKind && (
                      <button
                        onClick={() => card.toggleKind === 'length'
                          ? setLengthUnit(u => u === 'cm' ? 'in' : 'cm')
                          : cycleBootUnit()
                        }
                        className="text-slate-300 hover:text-emerald-400 transition-colors ml-1 flex-shrink-0"
                        aria-label={`Toggle ${card.label} units`}
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {card.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center w-full">
                      <span className="text-[11px] font-bold text-slate-600 truncate">{item.label}</span>
                      <span className="text-[11px] font-black text-slate-900 ml-1 flex-shrink-0">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Gear Inventory ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black tracking-tight" style={{ color: '#008751' }}>Gear Vault</h2>
            <button
              onClick={onAddGear}
              className="bg-[#008751] p-1.5 rounded-xl text-white shadow-sm transition-all active:scale-95"
              aria-label="Add gear"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>

          {gearItems.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6 bg-slate-50 rounded-2xl">
              No gear yet. Tap + to add.
            </p>
          ) : (
            <div className="space-y-3">
              {gearItems.map((item) => {
                const status = gearFitStatus(item);
                const isUpdate = status === 'Update';
                const spec = [item.size, item.year].filter(Boolean).join(' · ');
                return (
                  <button
                    key={item.id}
                    onClick={() => onEditGear(item)}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon tile */}
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border flex-shrink-0 ${
                        isUpdate ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <GearTypeIcon type={item.type} className="w-9 h-9" />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 mt-0.5">
                          {GEAR_TYPE_LABELS[item.type] ?? item.type}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 leading-tight truncate">
                          {item.brand} {item.model}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-tight mt-0.5">
                          {spec}
                        </p>
                        {/* Photo indicator */}
                        {item.photos && item.photos.length > 0 && (
                          <p className="text-[9px] text-emerald-500 font-bold mt-0.5">
                            {item.photos.length} photo{item.photos.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                        isUpdate
                          ? 'bg-orange-100 text-orange-600 animate-pulse'
                          : 'bg-[#E3F9F1] text-[#008751]'
                      }`}>
                        {status}
                      </span>
                      <div className={`p-1 rounded-full ${
                        isUpdate ? 'bg-orange-50 text-orange-500' : 'bg-[#E3F9F1] text-[#008751]'
                      }`}>
                        {isUpdate
                          ? <AlertCircle className="w-4 h-4" />
                          : <CheckCircle2 className="w-4 h-4" />
                        }
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
