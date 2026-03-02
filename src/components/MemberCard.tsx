import { useState } from 'react';
import { Pencil, Trash2, ArrowLeftRight } from 'lucide-react';
import type { FamilyMember, Sport } from '../types';
import { shouldWarnGrowth, isMeasurementStale, analyzeGrowthTrend } from '../services/growthAnalysis';
import { getShoeSizesFromFootLength } from '../services/shoeSize';
import { GrowthWarningBadge } from './GrowthWarningBadge';
import { STAT_ROW_CLS, STAT_LABEL_CLS, STAT_VALUE_CLS, BTN_ICON_INLINE_CLS, BTN_ICON_DANGER_CLS } from '../constants/design';

interface MemberCardProps {
  member: FamilyMember;
  onSelect: (member: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

const SPORT_LABELS: Record<Sport, string> = {
  'alpine':         'Alpine',
  'nordic-classic': 'Nordic',
  'nordic-skate':   'Skate',
  'nordic-combi':   'Combi',
  'snowboard':      'Snowboard',
  'hockey':         'Hockey',
};

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function MemberCard({ member, onSelect, onEdit, onDelete }: MemberCardProps) {
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [shoeUnit, setShoeUnit] = useState<'mp' | 'eu'>('mp');

  const age = calculateAge(member.dateOfBirth);
  const { measurements } = member;
  const footLength = Math.max(measurements.footLengthLeft, measurements.footLengthRight);
  const mondopoint = footLength > 0 ? Math.round(footLength * 10) : 0;
  const showWarning = shouldWarnGrowth(member);
  const badgeReason = showWarning
    ? isMeasurementStale(member) && analyzeGrowthTrend(member.measurementHistory ?? []).isGrowing
      ? 'both'
      : isMeasurementStale(member)
        ? 'stale'
        : 'growing'
    : null;

  const sports = Object.keys(member.skillLevels ?? {}) as Sport[];

  const heightDisplay = heightUnit === 'ft'
    ? (() => {
        const totalInches = measurements.height / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'${inches}"`;
      })()
    : `${measurements.height} cm`;

  const weightDisplay = weightUnit === 'lbs'
    ? `${Math.round(measurements.weight * 2.2046)} lbs`
    : `${measurements.weight} kg`;

  const shoeDisplay = mondopoint > 0
    ? shoeUnit === 'eu'
      ? `EU ${getShoeSizesFromFootLength(footLength).eu}`
      : `${mondopoint} MP`
    : '';

  const statRows = [
    { label: 'Height', value: heightDisplay, onToggle: () => setHeightUnit(u => u === 'cm' ? 'ft' : 'cm') },
    { label: 'Weight', value: weightDisplay, onToggle: () => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg') },
    ...(mondopoint > 0 ? [{ label: 'Shoe', value: shoeDisplay, onToggle: () => setShoeUnit(u => u === 'mp' ? 'eu' : 'mp') }] : []),
  ];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${member.name}?`)) {
      onDelete(member);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(member);
  };

  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
      onClick={() => onSelect(member)}
    >
      <div className="flex items-start gap-4 px-5 pt-5 pb-5">

        {/* Circular avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-50 to-slate-100 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xl font-black text-[#008751] select-none">
            {member.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Name + action buttons row */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className="text-xl font-black text-slate-900 leading-tight truncate">
                {member.name}
              </p>
              {badgeReason && <GrowthWarningBadge reason={badgeReason} />}
            </div>
            <div className="flex gap-0.5 flex-shrink-0 ml-2">
              <button
                className={BTN_ICON_INLINE_CLS}
                onClick={handleEdit}
                aria-label="Edit member"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                className={BTN_ICON_DANGER_CLS}
                onClick={handleDelete}
                aria-label="Delete member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-semibold mb-2">
            Age {age}{member.gender ? ` · ${member.gender}` : ''}
          </p>

          {sports.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {sports.map((sport) => (
                <span
                  key={sport}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase tracking-wide"
                >
                  {SPORT_LABELS[sport]}
                </span>
              ))}
            </div>
          )}

          {/* Stat rows */}
          <div className="border-t border-slate-100 pt-2">
            {statRows.map((row) => {
              const spaceIdx = row.value.lastIndexOf(' ');
              const num = spaceIdx >= 0 ? row.value.slice(0, spaceIdx) : row.value;
              const unit = spaceIdx >= 0 ? row.value.slice(spaceIdx + 1) : '';
              return (
                <div key={row.label} className={STAT_ROW_CLS}>
                  <span className={STAT_LABEL_CLS}>{row.label}</span>
                  <div className="flex items-center justify-end gap-0.5">
                    <span className={`${STAT_VALUE_CLS} text-right`}>{num}</span>
                    <span className="text-xs font-bold text-slate-500 w-7 text-left">{unit}</span>
                    {row.onToggle && (
                      <button
                        onClick={(e) => { e.stopPropagation(); row.onToggle!(); }}
                        aria-label={`Toggle ${row.label} units`}
                        className="text-slate-300 hover:text-emerald-400 transition-colors p-0.5"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
