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
      className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer overflow-hidden"
      onClick={() => onSelect(member)}
    >
      {/* Top section — identity + actions */}
      <div className="flex items-center gap-4 px-5 pt-5 pb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 border border-slate-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-black text-[#008751] select-none">
            {member.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name + sport chips */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xl font-black text-slate-900 leading-tight truncate">
              {member.name}
            </p>
            {badgeReason && <GrowthWarningBadge reason={badgeReason} />}
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">
            {age} yrs{member.gender ? ` · ${member.gender}` : ''}
          </p>
          {sports.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
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
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-300 hover:text-[#008751]"
            onClick={handleEdit}
            aria-label="Edit member"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-slate-300 hover:text-red-400"
            onClick={handleDelete}
            aria-label="Delete member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-100" />

      {/* Bottom section — stats */}
      <div className="flex items-center px-5 py-4 gap-0">
        {[
          { label: 'Height', value: `${measurements.height}`, unit: 'cm' },
          { label: 'Weight', value: `${measurements.weight}`, unit: 'kg' },
          { label: 'Foot', value: measurements.footLengthLeft ? `${measurements.footLengthLeft}` : '—', unit: measurements.footLengthLeft ? 'cm' : '' },
        ].map(({ label, value, unit }, i) => (
          <div key={label} className={`flex-1 flex flex-col items-center ${i > 0 ? 'border-l border-slate-100' : ''}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-lg font-black text-slate-800 leading-tight mt-0.5">
              {value}<span className="text-xs font-semibold text-slate-400 ml-0.5">{unit}</span>
            </p>
          </div>
        ))}
        <ChevronRight className="w-4 h-4 text-slate-300 ml-3 flex-shrink-0" />
      </div>
    </div>
  );
}
