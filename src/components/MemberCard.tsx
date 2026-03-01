import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { FamilyMember, Sport } from '../types';
import { shouldWarnGrowth, isMeasurementStale, analyzeGrowthTrend } from '../services/growthAnalysis';
import { GrowthWarningBadge } from './GrowthWarningBadge';

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
  const age = calculateAge(member.dateOfBirth);
  const { measurements } = member;
  const showWarning = shouldWarnGrowth(member);
  const badgeReason = showWarning
    ? isMeasurementStale(member) && analyzeGrowthTrend(member.measurementHistory ?? []).isGrowing
      ? 'both'
      : isMeasurementStale(member)
        ? 'stale'
        : 'growing'
    : null;

  const sports = Object.keys(member.skillLevels ?? {}) as Sport[];

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
      className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
      onClick={() => onSelect(member)}
    >
      {/* Avatar */}
      <div className="w-13 h-13 w-[52px] h-[52px] rounded-xl bg-gradient-to-br from-emerald-50 to-slate-100 border border-slate-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xl font-black text-[#008751] select-none">
          {member.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-lg font-black text-slate-900 leading-tight truncate">
            {member.name}
          </p>
          {badgeReason && <GrowthWarningBadge reason={badgeReason} />}
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
          {age} yrs · {measurements.height} cm · {measurements.weight} kg
        </p>
        {sports.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {sports.map((sport) => (
              <span
                key={sport}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wide"
              >
                {SPORT_LABELS[sport]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-300 hover:text-[#008751]"
          onClick={handleEdit}
          aria-label="Edit member"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-slate-300 hover:text-red-400"
          onClick={handleDelete}
          aria-label="Delete member"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4 text-slate-200 ml-1" />
      </div>
    </div>
  );
}
