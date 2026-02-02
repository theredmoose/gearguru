import { useState } from 'react';
import type { GearItem, GearType, Sport } from '../types';

interface GearFormProps {
  item?: GearItem;
  ownerId: string;
  defaultSport?: Sport;
  onSubmit: (data: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const SPORTS: { id: Sport; label: string }[] = [
  { id: 'nordic-classic', label: 'Nordic Classic' },
  { id: 'nordic-skate', label: 'Nordic Skate' },
  { id: 'nordic-combi', label: 'Nordic Combi' },
  { id: 'alpine', label: 'Alpine' },
  { id: 'snowboard', label: 'Snowboard' },
  { id: 'hockey', label: 'Hockey' },
];

const GEAR_TYPES: { id: GearType; label: string }[] = [
  { id: 'ski', label: 'Skis' },
  { id: 'pole', label: 'Poles' },
  { id: 'boot', label: 'Boots' },
  { id: 'binding', label: 'Bindings' },
  { id: 'snowboard', label: 'Snowboard' },
  { id: 'skate', label: 'Skates' },
  { id: 'helmet', label: 'Helmet' },
  { id: 'other', label: 'Other' },
];

const CONDITIONS = ['new', 'good', 'fair', 'worn'] as const;

export function GearForm({
  item,
  ownerId,
  defaultSport,
  onSubmit,
  onCancel,
}: GearFormProps) {
  const [sport, setSport] = useState<Sport>(item?.sport ?? defaultSport ?? 'alpine');
  const [type, setType] = useState<GearType>(item?.type ?? 'ski');
  const [brand, setBrand] = useState(item?.brand ?? '');
  const [model, setModel] = useState(item?.model ?? '');
  const [size, setSize] = useState(item?.size ?? '');
  const [year, setYear] = useState(item?.year?.toString() ?? '');
  const [condition, setCondition] = useState<'new' | 'good' | 'fair' | 'worn'>(
    item?.condition ?? 'good'
  );
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brand.trim() || !model.trim() || !size.trim()) {
      setError('Brand, model, and size are required.');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        ownerId,
        sport,
        type,
        brand: brand.trim(),
        model: model.trim(),
        size: size.trim(),
        year: year ? parseInt(year, 10) : undefined,
        condition,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gear item.');
      setSubmitting(false);
    }
  };

  return (
    <form className="gear-form" onSubmit={handleSubmit}>
      <h2>{item ? 'Edit Gear' : 'Add Gear'}</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h3>Gear Info</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sport">Sport</label>
            <select
              id="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value as Sport)}
            >
              {SPORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as GearType)}
            >
              {GEAR_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              id="brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Fischer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Model</label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., RCS Skate"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="size">Size</label>
            <input
              id="size"
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g., 186cm or 27.5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Year (optional)</label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2023"
              min="1990"
              max="2030"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as typeof condition)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Needs waxing"
          />
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
          {submitting ? 'Saving...' : item ? 'Update' : 'Add Gear'}
        </button>
      </div>
    </form>
  );
}
