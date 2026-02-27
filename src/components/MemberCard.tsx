import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { FamilyMember } from '../types';
import { shouldWarnGrowth, isMeasurementStale, analyzeGrowthTrend } from '../services/growthAnalysis';
import { GrowthWarningBadge } from './GrowthWarningBadge';

interface MemberCardProps {
  member: FamilyMember;
  onSelect: (member: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

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
      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer mb-3"
      onClick={() => onSelect(member)}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 border border-slate-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-black text-[#008751] select-none">
            {member.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-black text-slate-900 leading-tight">
            {member.name}
            {badgeReason && <GrowthWarningBadge reason={badgeReason} />}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
            {age} yrs · {measurements.height} cm · {measurements.weight} kg
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-[#008751]"
          onClick={handleEdit}
          aria-label="Edit member"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
          onClick={handleDelete}
          aria-label="Delete member"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
      </div>
    </div>
  );
}
