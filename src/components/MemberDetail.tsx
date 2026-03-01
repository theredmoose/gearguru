import { useState, useMemo } from 'react';
import { Settings, PlusCircle, ChevronDown, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import type { FamilyMember, GearItem, Sport, SkillLevel, AppSettings, BootUnit } from '../types';
import { ScreenHeader } from './ScreenHeader';
import { GearTypeIcon } from './GearIcons';
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
  onGetSizing: () => void;
  onOpenConverter: () => void;
  onAddGear: (sport: Sport) => void;
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
  const separateFeetHands = settings?.display.separateFeetHands ?? false;

  // Format shoe size for display
  const shoeDisplay = footLength > 0
    ? (separateFeetHands && m.footLengthLeft !== m.footLengthRight
        ? `${m.footLengthLeft} / ${m.footLengthRight} cm`
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
            className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all"
            aria-label="Edit member"
          >
            <Settings className="w-5 h-5" />
          </button>
        }
      />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 pt-6 pb-28">

        {/* ── Profile Card ── */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.03)] border border-white mb-5 flex gap-4">

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
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none truncate">
                {member.name}
              </h2>
              <div className="w-2.5 h-2.5 rounded-full bg-[#008751] shadow-[0_0_10px_rgba(0,135,81,0.5)] flex-shrink-0" />
            </div>

            <div className="space-y-0.5 mb-3">
              {statRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {row.label}
                  </span>
                  {row.action ? (
                    <button
                      onClick={row.action}
                      className="text-xs font-extrabold text-[#008751] hover:text-emerald-800 transition-colors"
                    >
                      {row.value}
                    </button>
                  ) : row.onToggle ? (
                    <button
                      onClick={row.onToggle}
                      className="flex items-center gap-1 group"
                      aria-label={`Toggle ${row.label} units`}
                    >
                      <span className="text-xs font-black text-slate-800 group-hover:text-[#008751] transition-colors">{row.value}</span>
                      {row.badge && <GrowthWarningBadge reason={row.badge as 'stale' | 'growing' | 'both'} />}
                      <ArrowLeftRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  ) : (
                    <span className="text-xs font-black text-slate-800">{row.value}</span>
                  )}
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
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <label className="text-xs text-emerald-700 font-black uppercase tracking-widest block mb-1 ml-1">Sport</label>
            <select
              value={selectedSport}
              onChange={(e) => {
                const s = e.target.value as Sport;
                setSelectedSport(s);
                setSkillLevel(member.skillLevels?.[s] ?? 'intermediate');
              }}
              className="w-full bg-white border border-slate-100 rounded-2xl px-3 py-2.5 text-xs font-black text-[#008751] appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
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
              className="w-full bg-white border border-slate-100 rounded-2xl px-3 py-2.5 text-xs font-black text-[#008751] appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
            >
              {LEVEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 bottom-3 w-3 h-3 text-emerald-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Sizing ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 ml-2">
            <h2 className="text-xl font-black tracking-tighter uppercase" style={{ color: '#008751' }}>
              Sizing <span style={{ color: '#1e3a32' }}>Guide</span>
            </h2>
            <button
              onClick={onGetSizing}
              className="text-xs font-black text-[#008751] uppercase tracking-widest hover:text-emerald-800 transition-colors"
            >
              All Sports →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {sizingCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-[2rem] p-4 flex items-start gap-3 min-h-[86px] border border-white shadow-[0_15px_30px_rgba(0,0,0,0.02)] relative overflow-hidden"
              >
                <div className="flex-shrink-0 bg-slate-50 p-1.5 rounded-xl">
                  <GearTypeIcon type={card.type} className="w-7 h-7" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-emerald-700 font-black uppercase tracking-widest">
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
                  <div className="space-y-1">
                    {card.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-baseline gap-1 w-full">
                        <span className="text-xs font-bold text-slate-400 truncate min-w-0">{item.label}</span>
                        <span className="text-sm font-black text-slate-900 whitespace-nowrap">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Gear Vault ── */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-black tracking-tighter uppercase" style={{ color: '#008751' }}>
              Gear <span style={{ color: '#1e3a32' }}>Vault</span>
            </h2>
            <button
              onClick={() => onAddGear(selectedSport)}
              className="bg-[#008751] p-2 rounded-xl text-white shadow-lg shadow-emerald-100 transition-all active:scale-90"
              aria-label="Add gear"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {(() => {
            const sportLabel = SPORT_OPTIONS.find(o => o.value === selectedSport)?.label ?? selectedSport;
            const filteredGear = gearItems.filter((item) => item.sports.includes(selectedSport));
            if (filteredGear.length === 0) {
              return (
                <div className="flex flex-col items-center gap-2 py-8 bg-white rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.02)]">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <PlusCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm font-bold">
                    {gearItems.length === 0 ? 'No gear added yet' : `No ${sportLabel} gear yet`}
                  </p>
                  <p className="text-slate-300 text-xs">Tap + to add.</p>
                </div>
              );
            }
            return (
            <div className="space-y-3">
              {filteredGear.map((item) => {
                const status = gearFitStatus(item);
                const isUpdate = status === 'Update';
                const spec = [item.size, item.year].filter(Boolean).join(' · ');
                return (
                  <button
                    key={item.id}
                    onClick={() => onEditGear(item)}
                    className="w-full bg-white rounded-[2.5rem] p-4 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.02)] border border-white hover:border-emerald-100 active:scale-[0.98] transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon tile */}
                      <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 bg-[#F8FAFC]">
                        <GearTypeIcon type={item.type} className="w-9 h-9" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 leading-tight truncate mb-0.5">
                          {item.brand} {item.model}
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
                          {spec}
                        </p>
                        {item.photos && item.photos.length > 0 && (
                          <p className="text-xs text-emerald-500 font-bold mt-0.5">
                            {item.photos.length} photo{item.photos.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                      <div className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                        isUpdate ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-[#E3F9F1] text-[#008751]'
                      }`}>
                        {status}
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100">
                        {isUpdate
                          ? <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                          : <CheckCircle2 className="w-3.5 h-3.5 text-[#008751]" />
                        }
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
