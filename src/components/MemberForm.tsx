import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { FamilyMember, Measurements } from '../types';
import { ScreenHeader } from './ScreenHeader';
import {
  validateHeight,
  validateWeight,
  validateOptionalFootLength,
  validateOptionalFootWidth,
  validateOptionalUsShoeSize,
  validateOptionalEuShoeSize,
  validateOptionalHeadCircumference,
  validateOptionalHandSize,
  validateDateOfBirth,
} from '../services/validation';

interface MemberFormProps {
  member?: FamilyMember;
  onSubmit: (
    data: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onCancel: () => void;
  separateFeetHands?: boolean;
}

const emptyMeasurements: Measurements = {
  height: 0,
  weight: 0,
  footLengthLeft: 0,
  footLengthRight: 0,
  measuredAt: new Date().toISOString(),
};

// Reusable input class
const inputCls =
  'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#008751] placeholder:text-slate-300';
const labelCls = 'block text-xs font-black text-slate-500 uppercase tracking-widest mb-1';
const sectionTitleCls = 'block text-xs font-black text-slate-400 uppercase tracking-widest pb-2 mb-3 border-b border-slate-100';

// Height/weight unit conversion — the canonical stored value is always cm/kg;
// these only translate what the imperial fields show and write back.
function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return { feet, inches };
}
function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}
function kgToLbs(kg: number): number {
  return Math.round(kg * 2.2046 * 10) / 10;
}
function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.2046) * 10) / 10;
}

export function MemberForm({ member, onSubmit, onCancel, separateFeetHands = false }: MemberFormProps) {
  const [name, setName] = useState(member?.name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(member?.dateOfBirth ?? '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    member?.gender ?? 'male'
  );
  const [measurements, setMeasurements] = useState<Measurements>(
    member?.measurements ?? emptyMeasurements
  );
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!member;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!dateOfBirth) {
      setError('Date of birth is required');
      return;
    }

    const heightError = validateHeight(measurements.height);
    if (heightError) { setError(heightError); return; }

    const weightError = validateWeight(measurements.weight);
    if (weightError) { setError(weightError); return; }

    const footLeftError = validateOptionalFootLength(measurements.footLengthLeft, 'left');
    if (footLeftError) { setError(footLeftError); return; }

    const footRightError = validateOptionalFootLength(measurements.footLengthRight, 'right');
    if (footRightError) { setError(footRightError); return; }

    const footWidthLeftError = validateOptionalFootWidth(measurements.footWidthLeft, 'left');
    if (footWidthLeftError) { setError(footWidthLeftError); return; }

    const footWidthRightError = validateOptionalFootWidth(measurements.footWidthRight, 'right');
    if (footWidthRightError) { setError(footWidthRightError); return; }

    const usShoeSizeError = validateOptionalUsShoeSize(measurements.usShoeSize);
    if (usShoeSizeError) { setError(usShoeSizeError); return; }

    const euShoeSizeError = validateOptionalEuShoeSize(measurements.euShoeSize);
    if (euShoeSizeError) { setError(euShoeSizeError); return; }

    const headCircError = validateOptionalHeadCircumference(measurements.headCircumference);
    if (headCircError) { setError(headCircError); return; }

    const handSizeError = validateOptionalHandSize(measurements.handSize);
    if (handSizeError) { setError(handSizeError); return; }

    const dobError = validateDateOfBirth(dateOfBirth);
    if (dobError) { setError(dobError); return; }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        dateOfBirth,
        gender,
        measurements: {
          ...measurements,
          measuredAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSubmitting(false);
    }
  };

  const updateMeasurement = <K extends keyof Measurements>(
    key: K,
    value: Measurements[K]
  ) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScreenHeader
        title={`${isEdit ? 'Edit' : 'Add'} Family Member`}
        onBack={onCancel}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col flex-1 min-h-0"
      >
        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 pt-6 pb-8 flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <section>
            <h3 className={sectionTitleCls}>Basic Info</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="name" className={labelCls}>Name</label>
                <input
                  id="name"
                  type="text"
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="dob" className={labelCls}>Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  className={inputCls}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Gender</label>
                <div className="flex gap-2 mt-1">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={gender === g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide transition-colors min-h-[44px] ${
                        gender === g
                          ? 'bg-[#008751] text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Body Measurements */}
          <section>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className={`${sectionTitleCls} !pb-0 !mb-0 !border-0`}>Body Measurements</h3>
              <button
                type="button"
                onClick={() => setUnitSystem((u) => (u === 'metric' ? 'imperial' : 'metric'))}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-100 text-emerald-700 text-xs font-black uppercase tracking-wide"
                aria-label="Switch between metric and imperial units"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
              </button>
            </div>
            {unitSystem === 'metric' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="height" className={labelCls}>Height (cm)</label>
                  <input
                    id="height"
                    type="number"
                    className={inputCls}
                    value={measurements.height || ''}
                    onChange={(e) =>
                      updateMeasurement('height', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    max="300"
                    step="0.5"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className={labelCls}>Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    className={inputCls}
                    value={measurements.weight || ''}
                    onChange={(e) =>
                      updateMeasurement('weight', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    max="300"
                    step="0.5"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label htmlFor="heightFeet" className={labelCls}>Height (ft)</label>
                  <input
                    id="heightFeet"
                    type="number"
                    className={inputCls}
                    value={measurements.height ? cmToFeetInches(measurements.height).feet || '' : ''}
                    onChange={(e) => {
                      const feet = parseFloat(e.target.value) || 0;
                      const { inches } = cmToFeetInches(measurements.height);
                      updateMeasurement('height', feetInchesToCm(feet, inches));
                    }}
                    min="0"
                    max="9"
                    step="1"
                  />
                </div>

                <div>
                  <label htmlFor="heightInches" className={labelCls}>Height (in)</label>
                  <input
                    id="heightInches"
                    type="number"
                    className={inputCls}
                    value={measurements.height ? cmToFeetInches(measurements.height).inches || '' : ''}
                    onChange={(e) => {
                      const inches = parseFloat(e.target.value) || 0;
                      const { feet } = cmToFeetInches(measurements.height);
                      updateMeasurement('height', feetInchesToCm(feet, inches));
                    }}
                    min="0"
                    max="11.9"
                    step="0.5"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="weightLbs" className={labelCls}>Weight (lbs)</label>
                  <input
                    id="weightLbs"
                    type="number"
                    className={inputCls}
                    value={measurements.weight ? kgToLbs(measurements.weight) || '' : ''}
                    onChange={(e) =>
                      updateMeasurement('weight', lbsToKg(parseFloat(e.target.value) || 0))
                    }
                    min="0"
                    max="660"
                    step="0.5"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Foot Measurements */}
          <section>
            <h3 className={sectionTitleCls}>Foot Measurements</h3>
            <div className="grid grid-cols-2 gap-3">
              {separateFeetHands ? (
                <>
                  <div>
                    <label htmlFor="footLeft" className={labelCls}>Left Foot (cm)</label>
                    <input
                      id="footLeft"
                      type="number"
                      className={inputCls}
                      value={measurements.footLengthLeft || ''}
                      onChange={(e) =>
                        updateMeasurement('footLengthLeft', parseFloat(e.target.value) || 0)
                      }
                      min="12"
                      max="30"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label htmlFor="footRight" className={labelCls}>Right Foot (cm)</label>
                    <input
                      id="footRight"
                      type="number"
                      className={inputCls}
                      value={measurements.footLengthRight || ''}
                      onChange={(e) =>
                        updateMeasurement('footLengthRight', parseFloat(e.target.value) || 0)
                      }
                      min="12"
                      max="30"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label htmlFor="footWidthLeft" className={labelCls}>Left Width (cm)</label>
                    <input
                      id="footWidthLeft"
                      type="number"
                      className={inputCls}
                      value={measurements.footWidthLeft || ''}
                      onChange={(e) =>
                        updateMeasurement(
                          'footWidthLeft',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      max="15"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label htmlFor="footWidthRight" className={labelCls}>Right Width (cm)</label>
                    <input
                      id="footWidthRight"
                      type="number"
                      className={inputCls}
                      value={measurements.footWidthRight || ''}
                      onChange={(e) =>
                        updateMeasurement(
                          'footWidthRight',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      max="15"
                      step="0.1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="footLength" className={labelCls}>Foot Length (cm)</label>
                    <input
                      id="footLength"
                      type="number"
                      className={inputCls}
                      value={Math.max(measurements.footLengthLeft, measurements.footLengthRight) || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setMeasurements((prev) => ({ ...prev, footLengthLeft: val, footLengthRight: val }));
                      }}
                      min="12"
                      max="30"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label htmlFor="footWidth" className={labelCls}>Foot Width (cm)</label>
                    <input
                      id="footWidth"
                      type="number"
                      className={inputCls}
                      value={measurements.footWidthLeft || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setMeasurements((prev) => ({ ...prev, footWidthLeft: val, footWidthRight: val }));
                      }}
                      min="0"
                      max="15"
                      step="0.1"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Shoe Sizes */}
          <section>
            <h3 className={sectionTitleCls}>Shoe Sizes (Optional)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="usShoe" className={labelCls}>US Size</label>
                <input
                  id="usShoe"
                  type="number"
                  className={inputCls}
                  value={measurements.usShoeSize || ''}
                  onChange={(e) =>
                    updateMeasurement(
                      'usShoeSize',
                      e.target.value === '' ? undefined : parseFloat(e.target.value)
                    )
                  }
                  min="0"
                  max="25"
                  step="0.5"
                />
              </div>

              <div>
                <label htmlFor="euShoe" className={labelCls}>EU Size</label>
                <input
                  id="euShoe"
                  type="number"
                  className={inputCls}
                  value={measurements.euShoeSize || ''}
                  onChange={(e) =>
                    updateMeasurement(
                      'euShoeSize',
                      e.target.value === '' ? undefined : parseFloat(e.target.value)
                    )
                  }
                  min="0"
                  max="60"
                  step="1"
                />
              </div>
            </div>
          </section>

          {/* Head & Hand */}
          <section>
            <h3 className={sectionTitleCls}>Head & Hand (Optional)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="headCircumference" className={labelCls}>Head Circumference (cm)</label>
                <input
                  id="headCircumference"
                  type="number"
                  className={inputCls}
                  value={measurements.headCircumference || ''}
                  onChange={(e) =>
                    updateMeasurement(
                      'headCircumference',
                      e.target.value === '' ? undefined : parseFloat(e.target.value)
                    )
                  }
                  min="40"
                  max="70"
                  step="0.5"
                />
              </div>

              {separateFeetHands ? (
                <>
                  <div>
                    <label htmlFor="handSizeLeft" className={labelCls}>Left Hand (cm)</label>
                    <input
                      id="handSizeLeft"
                      type="number"
                      className={inputCls}
                      value={measurements.handSizeLeft || ''}
                      onChange={(e) =>
                        updateMeasurement(
                          'handSizeLeft',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      min="4"
                      max="30"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="handSizeRight" className={labelCls}>Right Hand (cm)</label>
                    <input
                      id="handSizeRight"
                      type="number"
                      className={inputCls}
                      value={measurements.handSizeRight || ''}
                      onChange={(e) =>
                        updateMeasurement(
                          'handSizeRight',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      min="4"
                      max="30"
                      step="0.5"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="handSize" className={labelCls}>Hand Size (cm)</label>
                  <input
                    id="handSize"
                    type="number"
                    className={inputCls}
                    value={measurements.handSize || ''}
                    onChange={(e) =>
                      updateMeasurement(
                        'handSize',
                        e.target.value === '' ? undefined : parseFloat(e.target.value)
                      )
                    }
                    min="4"
                    max="30"
                    step="0.5"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex gap-3">
          <button
            type="button"
            className="flex-1 btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEdit ? 'Update' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
