import { useState } from 'react';
import { Settings, PlusCircle, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import type { FamilyMember, GearItem, Sport, SkillLevel } from '../types';
import { ScreenHeader } from './ScreenHeader';
import { GearTypeIcon } from './GearIcons';
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
  onBack: () => void;
  onEdit: () => void;
  onGetSizing: () => void;
  onOpenConverter: () => void;
  onAddGear: () => void;
  onEditGear: (item: GearItem) => void;
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

const GEAR_TYPE_LABELS: Record<string, string> = {
  ski: 'Skis', pole: 'Poles', boot: 'Boots', binding: 'Bindings',
  snowboard: 'Snowboard', skate: 'Skates', helmet: 'Helmet', other: 'Other',
};

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
  items: { label: string; value: string }[];
}

function getSizingCards(
  member: FamilyMember,
  sport: Sport,
  skillLevel: SkillLevel
): SizingCard[] {
  const m = member.measurements;
  const helmetSizing = m.headCircumference ? calculateHelmetSizing(m.headCircumference) : null;

  switch (sport) {
    case 'alpine': {
      const ski  = calculateAlpineSkiSizing(m, skillLevel, member.gender);
      const boot = calculateAlpineBootSizing(m, skillLevel, member.gender);
      return [
        { label: 'Skis',   type: 'ski',  items: [{ label: 'Length', value: `${ski.skiLengthRecommended} cm` }] },
        { label: 'Boots',  type: 'boot', items: [
            { label: 'Mondo', value: String(boot.mondopoint) },
            { label: 'Flex',  value: `${boot.flexRating.min}–${boot.flexRating.max}` },
            { label: 'Last',  value: `${boot.lastWidthMm} mm` },
          ]},
        { label: 'Poles',  type: 'pole',   items: [{ label: 'Length', value: `${Math.round(m.height * 0.7)} cm` }] },
        { label: 'Helmet', type: 'helmet', items: [{ label: 'Size',   value: helmetSizing?.size ?? '—' }] },
      ];
    }
    case 'nordic-classic':
    case 'nordic-skate': {
      const ski  = calculateNordicSkiSizing(m, sport, skillLevel);
      const boot = calculateNordicBootSizing(m);
      return [
        { label: 'Skis',   type: 'ski',    items: [{ label: 'Length', value: `${ski.skiLengthRecommended} cm` }] },
        { label: 'Poles',  type: 'pole',   items: [{ label: 'Length', value: `${ski.poleLengthRecommended} cm` }] },
        { label: 'Boots',  type: 'boot',   items: [{ label: 'Mondo',  value: `${boot.mondopoint} MP` }] },
        { label: 'Helmet', type: 'helmet', items: [{ label: 'Size',   value: helmetSizing?.size ?? '—' }] },
      ];
    }
    case 'snowboard': {
      const board = calculateSnowboardSizing(m, skillLevel);
      const boot  = calculateSnowboardBootSizing(m);
      return [
        { label: 'Board',  type: 'snowboard', items: [{ label: 'Length', value: `${board.boardLengthRecommended} cm` }] },
        { label: 'Boots',  type: 'boot',      items: [{ label: 'Mondo',  value: `${boot.mondopoint} MP` }] },
        { label: 'Stance', type: 'ski',       items: [{ label: 'Width',  value: `${board.stanceWidth.min}–${board.stanceWidth.max} cm` }] },
        { label: 'Helmet', type: 'helmet',    items: [{ label: 'Size',   value: helmetSizing?.size ?? '—' }] },
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
  onBack,
  onEdit,
  onGetSizing,
  onOpenConverter,
  onAddGear,
  onEditGear,
}: MemberDetailProps) {
  const { measurements: m } = member;
  const age = calculateAge(member.dateOfBirth);
  const footLength = Math.max(m.footLengthLeft, m.footLengthRight);

  const defaultSport: Sport =
    (Object.keys(member.skillLevels ?? {})[0] as Sport | undefined) ?? 'alpine';
  const [selectedSport, setSelectedSport] = useState<Sport>(defaultSport);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    member.skillLevels?.[defaultSport] ?? 'intermediate'
  );

  const sizingCards = getSizingCards(member, selectedSport, skillLevel);

  // Format shoe size for display
  const shoeDisplay = footLength > 0 ? `${footLength} cm` : '—';
  // Hand size display
  const handDisplay = m.handSize ? `${m.handSize} cm` : '—';

  const statRows = [
    { label: 'Age',    value: `${age} yrs` },
    { label: 'Height', value: `${m.height} cm` },
    { label: 'Weight', value: `${m.weight} kg` },
    { label: 'Foot',   value: shoeDisplay, action: footLength > 0 ? onOpenConverter : undefined },
    { label: 'Hand',   value: handDisplay },
  ];

  return (
    <div className="member-detail flex flex-col min-h-screen">
      <ScreenHeader
        title="Member Details"
        onBack={onBack}
        right={
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-blue-600 rounded-full transition-colors"
            aria-label="Edit member"
          >
            <Settings className="w-5 h-5 text-white" />
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
              <span className="text-6xl font-black text-blue-700 select-none">
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
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
                      className="text-sm font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {row.value}
                    </button>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-800">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full mb-5" />

        {/* ── Sizing ── */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-blue-700 tracking-tight">Sizing</h2>
            <button
              onClick={onGetSizing}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
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
                  <span className="text-[11px] text-blue-700 font-bold uppercase tracking-wide block mb-1">
                    {card.label}
                  </span>
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
            <h2 className="text-lg font-black text-blue-700 tracking-tight">Gear Inventory</h2>
            <button
              onClick={onAddGear}
              className="text-blue-600 hover:text-blue-700 transition-colors"
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
                          <p className="text-[9px] text-blue-400 font-bold mt-0.5">
                            {item.photos.length} photo{item.photos.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                        isUpdate
                          ? 'bg-red-100 text-red-600 animate-pulse'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {status}
                      </span>
                      <div className={`p-1 rounded-full ${
                        isUpdate ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
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
