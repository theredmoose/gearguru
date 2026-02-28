import { useState } from 'react';
import type { FamilyMember, Measurements } from '../types';
import { ScreenHeader } from './ScreenHeader';

interface MemberFormProps {
  member?: FamilyMember;
  onSubmit: (
    data: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onCancel: () => void;
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

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [name, setName] = useState(member?.name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(member?.dateOfBirth ?? '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    member?.gender ?? 'male'
  );
  const [measurements, setMeasurements] = useState<Measurements>(
    member?.measurements ?? emptyMeasurements
  );
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

    if (measurements.height <= 0) {
      setError('Height must be greater than 0');
      return;
    }
    if (measurements.height > 300) {
      setError('Height must be 300 cm or less');
      return;
    }

    if (measurements.weight <= 0) {
      setError('Weight must be greater than 0');
      return;
    }
    if (measurements.weight > 300) {
      setError('Weight must be 300 kg or less');
      return;
    }

    if (measurements.footLengthLeft > 0 && (measurements.footLengthLeft < 12 || measurements.footLengthLeft > 30)) {
      setError('Left foot length must be between 12 and 30 cm');
      return;
    }
    if (measurements.footLengthRight > 0 && (measurements.footLengthRight < 12 || measurements.footLengthRight > 30)) {
      setError('Right foot length must be between 12 and 30 cm');
      return;
    }
    if (measurements.footWidthLeft !== undefined && measurements.footWidthLeft > 15) {
      setError('Left foot width must be 15 cm or less');
      return;
    }
    if (measurements.footWidthRight !== undefined && measurements.footWidthRight > 15) {
      setError('Right foot width must be 15 cm or less');
      return;
    }
    if (measurements.usShoeSize !== undefined && measurements.usShoeSize > 25) {
      setError('US shoe size must be 25 or less');
      return;
    }
    if (measurements.euShoeSize !== undefined && measurements.euShoeSize > 60) {
      setError('EU shoe size must be 60 or less');
      return;
    }
    if (measurements.headCircumference !== undefined && (measurements.headCircumference < 40 || measurements.headCircumference > 70)) {
      setError('Head circumference must be between 40 and 70 cm');
      return;
    }
    if (measurements.handSize !== undefined && (measurements.handSize < 4 || measurements.handSize > 30)) {
      setError('Hand size must be between 4 and 30 cm');
      return;
    }

    const dobDate = new Date(dateOfBirth);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    if (dobDate > today) {
      setError('Date of birth cannot be in the future');
      return;
    }
    if (dobDate < minDate) {
      setError('Date of birth is too far in the past');
      return;
    }

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
        <div className="flex-1 overflow-y-auto bg-white px-6 py-5 flex flex-col gap-6">
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
            <h3 className={sectionTitleCls}>Body Measurements</h3>
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
          </section>

          {/* Foot Measurements */}
          <section>
            <h3 className={sectionTitleCls}>Foot Measurements</h3>
            <div className="grid grid-cols-2 gap-3">
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
