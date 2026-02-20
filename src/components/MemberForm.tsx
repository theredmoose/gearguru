import { useState } from 'react';
import type { FamilyMember, Measurements } from '../types';

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

    if (measurements.weight <= 0) {
      setError('Weight must be greater than 0');
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
    <form className="member-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Edit' : 'Add'} Family Member</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h3>Basic Info</h3>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) =>
              setGender(e.target.value as 'male' | 'female' | 'other')
            }
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Body Measurements</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              type="number"
              value={measurements.height || ''}
              onChange={(e) =>
                updateMeasurement('height', parseFloat(e.target.value) || 0)
              }
              placeholder="175"
              min="0"
              step="0.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              value={measurements.weight || ''}
              onChange={(e) =>
                updateMeasurement('weight', parseFloat(e.target.value) || 0)
              }
              placeholder="70"
              min="0"
              step="0.5"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Foot Measurements</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="footLeft">Left Foot (cm)</label>
            <input
              id="footLeft"
              type="number"
              value={measurements.footLengthLeft || ''}
              onChange={(e) =>
                updateMeasurement(
                  'footLengthLeft',
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="27.0"
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="footRight">Right Foot (cm)</label>
            <input
              id="footRight"
              type="number"
              value={measurements.footLengthRight || ''}
              onChange={(e) =>
                updateMeasurement(
                  'footLengthRight',
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="27.0"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="footWidthLeft">Left Width (cm)</label>
            <input
              id="footWidthLeft"
              type="number"
              value={measurements.footWidthLeft || ''}
              onChange={(e) =>
                updateMeasurement(
                  'footWidthLeft',
                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                )
              }
              placeholder="10.0"
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="footWidthRight">Right Width (cm)</label>
            <input
              id="footWidthRight"
              type="number"
              value={measurements.footWidthRight || ''}
              onChange={(e) =>
                updateMeasurement(
                  'footWidthRight',
                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                )
              }
              placeholder="10.0"
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Shoe Sizes (Optional)</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="usShoe">US Size</label>
            <input
              id="usShoe"
              type="number"
              value={measurements.usShoeSize || ''}
              onChange={(e) =>
                updateMeasurement(
                  'usShoeSize',
                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                )
              }
              placeholder="10"
              min="0"
              step="0.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="euShoe">EU Size</label>
            <input
              id="euShoe"
              type="number"
              value={measurements.euShoeSize || ''}
              onChange={(e) =>
                updateMeasurement(
                  'euShoeSize',
                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                )
              }
              placeholder="43"
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Head & Hand (Optional)</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="headCircumference">Head Circumference (cm)</label>
            <input
              id="headCircumference"
              type="number"
              value={measurements.headCircumference || ''}
              onChange={(e) =>
                updateMeasurement(
                  'headCircumference',
                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                )
              }
              placeholder="57"
              min="40"
              max="70"
              step="0.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="handSize">Hand Size (cm)</label>
            <input
              id="handSize"
              type="number"
              value={measurements.handSize || ''}
              onChange={(e) =>
                updateMeasurement(
                  'handSize',
                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                )
              }
              placeholder="19"
              min="10"
              max="30"
              step="0.5"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}
