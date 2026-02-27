import { useState } from 'react';
import type { FamilyMember, MeasurementEntry } from '../types';
import { ScreenHeader } from './ScreenHeader';
import { addMeasurementEntry, updateMeasurementEntry } from '../services/firebase';

interface EditMeasurementEntryScreenProps {
  member: FamilyMember;
  /** When provided, we're editing; when null, we're adding a new entry. */
  entry: MeasurementEntry | null;
  onBack: () => void;
  onSaved: (updatedMember: FamilyMember) => void;
}

const inputCls =
  'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300';
const labelCls =
  'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1';

function toDateInputValue(isoString: string): string {
  // yyyy-MM-dd from ISO string
  return isoString.slice(0, 10);
}

export function EditMeasurementEntryScreen({
  member,
  entry,
  onBack,
  onSaved,
}: EditMeasurementEntryScreenProps) {
  const isNew = entry === null;

  const [recordedAt, setRecordedAt] = useState<string>(
    entry ? toDateInputValue(entry.recordedAt) : toDateInputValue(new Date().toISOString())
  );
  const [height, setHeight] = useState(entry?.height ?? 0);
  const [weight, setWeight] = useState(entry?.weight ?? 0);
  const [footLengthLeft, setFootLengthLeft] = useState(entry?.footLengthLeft ?? 0);
  const [footLengthRight, setFootLengthRight] = useState(entry?.footLengthRight ?? 0);
  const [footWidthLeft, setFootWidthLeft] = useState(entry?.footWidthLeft ?? '');
  const [footWidthRight, setFootWidthRight] = useState(entry?.footWidthRight ?? '');
  const [usShoeSize, setUsShoeSize] = useState(entry?.usShoeSize ?? '');
  const [euShoeSize, setEuShoeSize] = useState(entry?.euShoeSize ?? '');
  const [armLength, setArmLength] = useState(entry?.armLength ?? '');
  const [inseam, setInseam] = useState(entry?.inseam ?? '');
  const [headCircumference, setHeadCircumference] = useState(
    entry?.headCircumference ?? ''
  );
  const [handSize, setHandSize] = useState(entry?.handSize ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recordedAt) { setError('Date is required'); return; }
    if (height <= 0) { setError('Height must be greater than 0'); return; }
    if (height > 300) { setError('Height must be 300 cm or less'); return; }
    if (weight <= 0) { setError('Weight must be greater than 0'); return; }
    if (weight > 300) { setError('Weight must be 300 kg or less'); return; }
    if (footLengthLeft <= 0) { setError('Left foot length is required'); return; }
    if (footLengthLeft > 30) { setError('Left foot length must be 30 cm or less'); return; }
    if (footLengthRight <= 0) { setError('Right foot length is required'); return; }
    if (footLengthRight > 30) { setError('Right foot length must be 30 cm or less'); return; }
    if (footWidthLeft !== '' && Number(footWidthLeft) > 15) { setError('Left foot width must be 15 cm or less'); return; }
    if (footWidthRight !== '' && Number(footWidthRight) > 15) { setError('Right foot width must be 15 cm or less'); return; }
    if (usShoeSize !== '' && Number(usShoeSize) > 25) { setError('US shoe size must be 25 or less'); return; }
    if (euShoeSize !== '' && Number(euShoeSize) > 60) { setError('EU shoe size must be 60 or less'); return; }
    if (armLength !== '' && Number(armLength) > 120) { setError('Arm length must be 120 cm or less'); return; }
    if (inseam !== '' && Number(inseam) > 120) { setError('Inseam must be 120 cm or less'); return; }
    if (headCircumference !== '' && (Number(headCircumference) < 40 || Number(headCircumference) > 70)) { setError('Head circumference must be between 40 and 70 cm'); return; }
    if (handSize !== '' && Number(handSize) < 4) { setError('Hand size must be 4 cm or more'); return; }
    if (handSize !== '' && Number(handSize) > 30) { setError('Hand size must be 30 cm or less'); return; }

    const recordedAtIso = new Date(recordedAt + 'T12:00:00').toISOString();

    const updates: Partial<Omit<MeasurementEntry, 'id'>> = {
      recordedAt: recordedAtIso,
      height,
      weight,
      footLengthLeft,
      footLengthRight,
      ...(footWidthLeft !== '' && { footWidthLeft: Number(footWidthLeft) }),
      ...(footWidthRight !== '' && { footWidthRight: Number(footWidthRight) }),
      ...(usShoeSize !== '' && { usShoeSize: Number(usShoeSize) }),
      ...(euShoeSize !== '' && { euShoeSize: Number(euShoeSize) }),
      ...(armLength !== '' && { armLength: Number(armLength) }),
      ...(inseam !== '' && { inseam: Number(inseam) }),
      ...(headCircumference !== '' && { headCircumference: Number(headCircumference) }),
      ...(handSize !== '' && { handSize: Number(handSize) }),
    };

    setSubmitting(true);
    try {
      if (isNew) {
        const newEntry: MeasurementEntry = {
          id: crypto.randomUUID(),
          recordedAt: recordedAtIso,
          height,
          weight,
          footLengthLeft,
          footLengthRight,
          ...(footWidthLeft !== '' && { footWidthLeft: Number(footWidthLeft) }),
          ...(footWidthRight !== '' && { footWidthRight: Number(footWidthRight) }),
          ...(usShoeSize !== '' && { usShoeSize: Number(usShoeSize) }),
          ...(euShoeSize !== '' && { euShoeSize: Number(euShoeSize) }),
          ...(armLength !== '' && { armLength: Number(armLength) }),
          ...(inseam !== '' && { inseam: Number(inseam) }),
          ...(headCircumference !== '' && { headCircumference: Number(headCircumference) }),
          ...(handSize !== '' && { handSize: Number(handSize) }),
        };
        await addMeasurementEntry(member.id, newEntry);
        const updatedMember: FamilyMember = {
          ...member,
          measurementHistory: [newEntry, ...(member.measurementHistory ?? [])],
        };
        onSaved(updatedMember);
      } else {
        await updateMeasurementEntry(member.id, entry!.id, updates);
        const updatedHistory = (member.measurementHistory ?? []).map((e) =>
          e.id === entry!.id ? { ...e, ...updates } : e
        );
        onSaved({ ...member, measurementHistory: updatedHistory });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ScreenHeader
        title={isNew ? 'Add Measurement' : 'Edit Measurement'}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto bg-white px-5 py-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Date */}
          <div>
            <label className={labelCls} htmlFor="em-recorded-at">Date</label>
            <input
              id="em-recorded-at"
              type="date"
              className={inputCls}
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              max={toDateInputValue(new Date().toISOString())}
            />
          </div>

          {/* Height */}
          <div>
            <label className={labelCls} htmlFor="em-height">Height (cm)</label>
            <input
              id="em-height"
              type="number"
              className={inputCls}
              value={height || ''}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              min="0"
              max="300"
              step="0.1"
            />
          </div>

          {/* Weight */}
          <div>
            <label className={labelCls} htmlFor="em-weight">Weight (kg)</label>
            <input
              id="em-weight"
              type="number"
              className={inputCls}
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              min="0"
              max="300"
              step="0.1"
            />
          </div>

          {/* Foot lengths */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="em-foot-left">Foot L (cm)</label>
              <input
                id="em-foot-left"
                type="number"
                className={inputCls}
                value={footLengthLeft || ''}
                onChange={(e) => setFootLengthLeft(parseFloat(e.target.value) || 0)}
                min="12"
                max="30"
                step="0.1"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="em-foot-right">Foot R (cm)</label>
              <input
                id="em-foot-right"
                type="number"
                className={inputCls}
                value={footLengthRight || ''}
                onChange={(e) => setFootLengthRight(parseFloat(e.target.value) || 0)}
                min="12"
                max="30"
                step="0.1"
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="em-foot-width-left">Foot W L (cm)</label>
              <input
                id="em-foot-width-left"
                type="number"
                className={inputCls}
                value={footWidthLeft}
                onChange={(e) => setFootWidthLeft(e.target.value)}
                placeholder="optional"
                min="0"
                max="15"
                step="0.1"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="em-foot-width-right">Foot W R (cm)</label>
              <input
                id="em-foot-width-right"
                type="number"
                className={inputCls}
                value={footWidthRight}
                onChange={(e) => setFootWidthRight(e.target.value)}
                placeholder="optional"
                min="0"
                max="15"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="em-us-shoe">US Shoe</label>
              <input
                id="em-us-shoe"
                type="number"
                className={inputCls}
                value={usShoeSize}
                onChange={(e) => setUsShoeSize(e.target.value)}
                placeholder="optional"
                min="0"
                max="25"
                step="0.5"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="em-eu-shoe">EU Shoe</label>
              <input
                id="em-eu-shoe"
                type="number"
                className={inputCls}
                value={euShoeSize}
                onChange={(e) => setEuShoeSize(e.target.value)}
                placeholder="optional"
                min="0"
                max="60"
                step="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="em-arm">Arm Length (cm)</label>
              <input
                id="em-arm"
                type="number"
                className={inputCls}
                value={armLength}
                onChange={(e) => setArmLength(e.target.value)}
                placeholder="optional"
                min="0"
                max="120"
                step="0.1"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="em-inseam">Inseam (cm)</label>
              <input
                id="em-inseam"
                type="number"
                className={inputCls}
                value={inseam}
                onChange={(e) => setInseam(e.target.value)}
                placeholder="optional"
                min="0"
                max="120"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="em-head">Head Circ. (cm)</label>
              <input
                id="em-head"
                type="number"
                className={inputCls}
                value={headCircumference}
                onChange={(e) => setHeadCircumference(e.target.value)}
                placeholder="optional"
                min="40"
                max="70"
                step="0.1"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="em-hand">Hand Size (cm)</label>
              <input
                id="em-hand"
                type="number"
                className={inputCls}
                value={handSize}
                onChange={(e) => setHandSize(e.target.value)}
                placeholder="optional"
                min="4"
                max="30"
                step="0.1"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
