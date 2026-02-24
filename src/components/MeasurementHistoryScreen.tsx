import type { FamilyMember, MeasurementEntry } from '../types';
import { ScreenHeader } from './ScreenHeader';
import { deleteMeasurementEntry } from '../services/firebase';

interface MeasurementHistoryScreenProps {
  member: FamilyMember;
  onBack: () => void;
  onEditEntry: (entry: MeasurementEntry) => void;
  onAddEntry: () => void;
  onHistoryUpdated: (updatedMember: FamilyMember) => void;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function MeasurementHistoryScreen({
  member,
  onBack,
  onEditEntry,
  onAddEntry,
  onHistoryUpdated,
}: MeasurementHistoryScreenProps) {
  // Bootstrap a single entry from current measurements if history is empty
  const bootstrappedEntry: MeasurementEntry | null =
    !member.measurementHistory || member.measurementHistory.length === 0
      ? {
          id: '__bootstrap__',
          recordedAt: member.measurements.measuredAt,
          height: member.measurements.height,
          weight: member.measurements.weight,
          footLengthLeft: member.measurements.footLengthLeft,
          footLengthRight: member.measurements.footLengthRight,
          footWidthLeft: member.measurements.footWidthLeft,
          footWidthRight: member.measurements.footWidthRight,
          usShoeSize: member.measurements.usShoeSize,
          euShoeSize: member.measurements.euShoeSize,
          armLength: member.measurements.armLength,
          inseam: member.measurements.inseam,
          headCircumference: member.measurements.headCircumference,
          handSize: member.measurements.handSize,
        }
      : null;

  // Entries sorted newest first
  const entries: MeasurementEntry[] = bootstrappedEntry
    ? [bootstrappedEntry]
    : [...(member.measurementHistory ?? [])].sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );

  const handleDelete = async (entryId: string) => {
    if (!confirm('Delete this measurement entry?')) return;
    await deleteMeasurementEntry(member.id, entryId);
    const updated: FamilyMember = {
      ...member,
      measurementHistory: (member.measurementHistory ?? []).filter(
        (e) => e.id !== entryId
      ),
    };
    onHistoryUpdated(updated);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ScreenHeader
        title={`History — ${member.name}`}
        onBack={onBack}
        right={
          <button
            onClick={onAddEntry}
            aria-label="Add entry"
            className="text-white text-lg font-black hover:text-blue-200 transition-colors"
          >
            +
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-white px-4 py-4">
        {entries.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            No measurement history yet. Tap + to add an entry.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4"
              >
                {/* Date row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
                    {formatDate(entry.recordedAt)}
                  </span>
                  {entry.id !== '__bootstrap__' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditEntry(entry)}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                        aria-label={`Edit entry from ${formatDate(entry.recordedAt)}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                        aria-label={`Delete entry from ${formatDate(entry.recordedAt)}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Measurements grid */}
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="Height" value={`${entry.height} cm`} />
                  <Stat label="Weight" value={`${entry.weight} kg`} />
                  <Stat
                    label="Foot"
                    value={`${Math.max(entry.footLengthLeft, entry.footLengthRight)} cm`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}
