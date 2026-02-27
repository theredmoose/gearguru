import type { FamilyMember } from '../types';
import { ScreenHeader } from './ScreenHeader';
import { shouldWarnGrowth, isMeasurementStale, analyzeGrowthTrend } from '../services/growthAnalysis';
import { GrowthWarningBadge } from './GrowthWarningBadge';

interface MeasureScreenProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
}

export function MeasureScreen({ members, onSelectMember }: MeasureScreenProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScreenHeader title="Measure" />
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 py-6">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">
          Select a member to update measurements
        </p>

        {members.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            No family members yet. Add someone on the Family tab.
          </p>
        ) : (
          <div className="space-y-4">
            {members.map((member) => {
              const { measurements } = member;
              const showWarning = shouldWarnGrowth(member);
              const badgeReason = showWarning
                ? isMeasurementStale(member) && analyzeGrowthTrend(member.measurementHistory ?? []).isGrowing
                  ? 'both'
                  : isMeasurementStale(member)
                    ? 'stale'
                    : 'growing'
                : null;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-[#008751] select-none">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {member.name}
                        {badgeReason && <GrowthWarningBadge reason={badgeReason} />}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                        {measurements.height} cm · {measurements.weight} kg
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#008751] uppercase tracking-widest">
                    Edit →
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
