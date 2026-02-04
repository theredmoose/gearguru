import { useState } from 'react';
import type { GearItem, GearType, Sport, GearPhoto, ExtendedGearDetails, AlpineSkiDetails, SkiProfile } from '../types';
import { PhotoCapture } from './PhotoCapture';
import { analyzeGearPhotos } from '../services/gearAnalysis';

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
  const [photos, setPhotos] = useState<GearPhoto[]>(item?.photos ?? []);
  const [extendedDetails, setExtendedDetails] = useState<ExtendedGearDetails | undefined>(
    item?.extendedDetails
  );

  // Extended detail fields for alpine skis
  const [profileTip, setProfileTip] = useState(
    (extendedDetails?.type === 'alpineSki' ? extendedDetails.details.profile?.tip?.toString() : '') ?? ''
  );
  const [profileWaist, setProfileWaist] = useState(
    (extendedDetails?.type === 'alpineSki' ? extendedDetails.details.profile?.waist?.toString() : '') ?? ''
  );
  const [profileTail, setProfileTail] = useState(
    (extendedDetails?.type === 'alpineSki' ? extendedDetails.details.profile?.tail?.toString() : '') ?? ''
  );
  const [radius, setRadius] = useState(
    (extendedDetails?.type === 'alpineSki' ? extendedDetails.details.radiusM?.toString() : '') ?? ''
  );
  const [bindingBrand, setBindingBrand] = useState(
    (extendedDetails?.type === 'alpineSki' ? extendedDetails.details.bindings?.brand : '') ?? ''
  );
  const [bindingModel, setBindingModel] = useState(
    (extendedDetails?.type === 'alpineSki' ? extendedDetails.details.bindings?.model : '') ?? ''
  );
  const [bindingDin, setBindingDin] = useState(
    (extendedDetails?.type === 'alpineSki' ? extendedDetails.details.bindings?.dinRange : '') ?? ''
  );

  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisNotes, setAnalysisNotes] = useState<string[]>([]);

  const handleAnalyzePhotos = async () => {
    if (photos.length === 0) {
      setError('Please add at least one photo to analyze.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisNotes([]);

    try {
      const result = await analyzeGearPhotos(photos, { sport, type });

      // Populate fields from analysis
      if (result.brand) setBrand(result.brand);
      if (result.model) setModel(result.model);
      if (result.size) setSize(result.size);
      if (result.year) setYear(result.year.toString());
      if (result.condition) setCondition(result.condition);

      // Handle extended details
      if (result.extendedDetails) {
        setExtendedDetails(result.extendedDetails);

        // Populate extended fields for alpine skis
        if (result.extendedDetails.type === 'alpineSki') {
          const details = result.extendedDetails.details;
          if (details.profile) {
            setProfileTip(details.profile.tip.toString());
            setProfileWaist(details.profile.waist.toString());
            setProfileTail(details.profile.tail.toString());
          }
          if (details.radiusM) setRadius(details.radiusM.toString());
          if (details.bindings) {
            setBindingBrand(details.bindings.brand);
            setBindingModel(details.bindings.model);
            if (details.bindings.dinRange) setBindingDin(details.bindings.dinRange);
          }
        }
      }

      if (result.notes && result.notes.length > 0) {
        setAnalysisNotes(result.notes);
      }

      setAnalysisNotes((prev) => [
        ...prev,
        `Analysis complete (${Math.round(result.confidence * 100)}% confidence). Please verify the details.`,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze photos.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brand.trim() || !model.trim() || !size.trim()) {
      setError('Brand, model, and size are required.');
      return;
    }

    setSubmitting(true);

    try {
      // Build extended details for alpine skis
      let finalExtendedDetails: ExtendedGearDetails | undefined = extendedDetails;

      if (type === 'ski' && sport === 'alpine') {
        const profile: SkiProfile | undefined =
          profileTip && profileWaist && profileTail
            ? {
                tip: parseInt(profileTip, 10),
                waist: parseInt(profileWaist, 10),
                tail: parseInt(profileTail, 10),
              }
            : undefined;

        const alpineDetails: AlpineSkiDetails = {
          lengthCm: parseInt(size, 10) || 0,
          profile,
          radiusM: radius ? parseFloat(radius) : undefined,
          bindings:
            bindingBrand || bindingModel
              ? {
                  brand: bindingBrand,
                  model: bindingModel,
                  dinRange: bindingDin || undefined,
                }
              : undefined,
        };

        finalExtendedDetails = { type: 'alpineSki', details: alpineDetails };
      }

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
        photos: photos.length > 0 ? photos : undefined,
        extendedDetails: finalExtendedDetails,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gear item.');
      setSubmitting(false);
    }
  };

  const showAlpineSkiDetails = type === 'ski' && sport === 'alpine';

  return (
    <form className="gear-form" onSubmit={handleSubmit}>
      <h2>{item ? 'Edit Gear' : 'Add Gear'}</h2>

      {error && <div className="form-error">{error}</div>}

      {analysisNotes.length > 0 && (
        <div className="form-info">
          {analysisNotes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      )}

      {/* Photo Section */}
      <div className="form-section">
        <h3>Photos</h3>
        <p className="form-hint">
          Add photos of your gear. The <strong>Label</strong> photo helps auto-fill specifications.
        </p>
        <PhotoCapture
          photos={photos}
          onPhotosChange={setPhotos}
          disabled={submitting}
        />
        {photos.length > 0 && (
          <button
            type="button"
            className="btn btn-analyze"
            onClick={handleAnalyzePhotos}
            disabled={analyzing || submitting}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Photos & Auto-Fill'}
          </button>
        )}
      </div>

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
              placeholder={showAlpineSkiDetails ? 'e.g., 170' : 'e.g., 186cm or 27.5'}
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
      </div>

      {/* Extended Details for Alpine Skis */}
      {showAlpineSkiDetails && (
        <div className="form-section">
          <h3>Ski Specifications</h3>

          <div className="form-group">
            <label>Profile (Tip / Waist / Tail mm)</label>
            <div className="form-row form-row-3">
              <input
                type="number"
                value={profileTip}
                onChange={(e) => setProfileTip(e.target.value)}
                placeholder="Tip"
                min="80"
                max="150"
              />
              <input
                type="number"
                value={profileWaist}
                onChange={(e) => setProfileWaist(e.target.value)}
                placeholder="Waist"
                min="60"
                max="120"
              />
              <input
                type="number"
                value={profileTail}
                onChange={(e) => setProfileTail(e.target.value)}
                placeholder="Tail"
                min="80"
                max="150"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="radius">Turn Radius (R value in meters)</label>
            <input
              id="radius"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="e.g., 15.5"
              step="0.1"
              min="5"
              max="40"
            />
          </div>

          <h4 className="form-subsection-title">Bindings</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bindingBrand">Binding Brand</label>
              <input
                id="bindingBrand"
                type="text"
                value={bindingBrand}
                onChange={(e) => setBindingBrand(e.target.value)}
                placeholder="e.g., Marker"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bindingModel">Binding Model</label>
              <input
                id="bindingModel"
                type="text"
                value={bindingModel}
                onChange={(e) => setBindingModel(e.target.value)}
                placeholder="e.g., Griffon 13"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bindingDin">DIN Range</label>
            <input
              id="bindingDin"
              type="text"
              value={bindingDin}
              onChange={(e) => setBindingDin(e.target.value)}
              placeholder="e.g., 4-13"
            />
          </div>
        </div>
      )}

      <div className="form-section">
        <h3>Notes</h3>
        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Needs waxing, base repair needed"
            rows={3}
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
        <button type="submit" className="btn btn-primary" disabled={submitting || analyzing}>
          {submitting ? 'Saving...' : item ? 'Update' : 'Add Gear'}
        </button>
      </div>
    </form>
  );
}
