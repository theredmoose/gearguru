import { useState } from 'react';
import type { GearItem, GearType, Sport, GearPhoto, ExtendedGearDetails, AlpineSkiDetails, SkiProfile, GearStatus } from '../types';
import { PhotoCapture } from './PhotoCapture';
import { analyzeGearPhotos } from '../services/gearAnalysis';
import { ScreenHeader } from './ScreenHeader';

interface GearFormProps {
  item?: GearItem;
  ownerId: string;
  defaultSport?: Sport;
  defaultDIN?: number;
  onSubmit: (data: Omit<GearItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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

const STATUSES: { id: GearStatus; label: string }[] = [
  { id: 'available', label: 'Available' },
  { id: 'checked-out', label: 'Checked Out' },
  { id: 'maintenance', label: 'In Maintenance' },
];

// Shared input/label classes
const inputCls =
  'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#008751] placeholder:text-slate-300';
const labelCls = 'block text-xs font-black text-slate-500 uppercase tracking-widest mb-1';
const sectionTitleCls = 'text-xs font-black text-slate-400 uppercase tracking-widest pb-2 mb-3 border-b border-slate-100';

export function GearForm({
  item,
  ownerId,
  defaultSport,
  defaultDIN,
  onSubmit,
  onCancel,
}: GearFormProps) {
  const [selectedSports, setSelectedSports] = useState<Sport[]>(
    item?.sports ?? (defaultSport ? [defaultSport] : ['alpine'])
  );
  const toggleSport = (sportId: Sport) => {
    setSelectedSports((prev) =>
      prev.includes(sportId) ? prev.filter((s) => s !== sportId) : [...prev, sportId]
    );
  };
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
  const [status, setStatus] = useState<GearStatus>(item?.status ?? 'available');
  const [location, setLocation] = useState(item?.location ?? '');
  const [checkedOutTo, setCheckedOutTo] = useState(item?.checkedOutTo ?? '');

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
  const [dinSetting, setDinSetting] = useState<string>(() => {
    // Prefer the value already saved on this gear item
    const saved = extendedDetails?.type === 'alpineSki'
      ? extendedDetails.details.bindings?.dinSetting
      : undefined;
    if (saved !== undefined) return saved.toString();
    // Fall back to the user's default DIN
    if (defaultDIN !== undefined) return defaultDIN.toString();
    return '';
  });

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
      const result = await analyzeGearPhotos(photos, { sport: selectedSports[0] ?? 'alpine', type });

      if (result.brand) setBrand(result.brand);
      if (result.model) setModel(result.model);
      if (result.size) setSize(result.size);
      if (result.year) setYear(result.year.toString());
      if (result.condition) setCondition(result.condition);

      if (result.extendedDetails) {
        setExtendedDetails(result.extendedDetails);

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

    if (selectedSports.length === 0) {
      setError('Select at least one sport.');
      return;
    }

    if (!brand.trim() || !model.trim() || !size.trim()) {
      setError('Brand, model, and size are required.');
      return;
    }

    if (year) {
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1980 || yearNum > currentYear + 1) {
        setError(`Year must be between 1980 and ${currentYear + 1}.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      let finalExtendedDetails: ExtendedGearDetails | undefined = extendedDetails;

      if (type === 'ski' && selectedSports.includes('alpine')) {
        const tipN = parseInt(profileTip, 10);
        const waistN = parseInt(profileWaist, 10);
        const tailN = parseInt(profileTail, 10);
        const profile: SkiProfile | undefined =
          profileTip && profileWaist && profileTail &&
          !isNaN(tipN) && !isNaN(waistN) && !isNaN(tailN)
            ? { tip: tipN, waist: waistN, tail: tailN }
            : undefined;

        const parsedDinSetting = dinSetting ? parseFloat(dinSetting) : undefined;
        const alpineDetails: AlpineSkiDetails = {
          lengthCm: parseInt(size, 10) || 0,
          profile,
          radiusM: radius ? parseFloat(radius) : undefined,
          bindings:
            bindingBrand || bindingModel || bindingDin || parsedDinSetting !== undefined
              ? {
                  brand: bindingBrand,
                  model: bindingModel,
                  dinRange: bindingDin || undefined,
                  dinSetting: parsedDinSetting,
                }
              : undefined,
        };

        finalExtendedDetails = { type: 'alpineSki', details: alpineDetails };
      }

      await onSubmit({
        ownerId,
        sports: selectedSports,
        type,
        brand: brand.trim(),
        model: model.trim(),
        size: size.trim(),
        year: year ? parseInt(year, 10) : undefined,
        condition,
        status,
        location: location.trim() || undefined,
        checkedOutTo: status === 'checked-out' ? checkedOutTo.trim() || undefined : undefined,
        checkedOutDate: status === 'checked-out' ? new Date().toISOString() : undefined,
        notes: notes.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined,
        extendedDetails: finalExtendedDetails,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gear item.');
      setSubmitting(false);
    }
  };

  const showAlpineSkiDetails = type === 'ski' && selectedSports.includes('alpine');

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScreenHeader
        title={item ? 'Edit Gear' : 'Add Gear'}
        onBack={onCancel}
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 min-h-0"
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-white px-6 py-5 flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {analysisNotes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3 flex flex-col gap-1">
              {analysisNotes.map((note, i) => (
                <p key={i}>{note}</p>
              ))}
            </div>
          )}

          {/* Photos */}
          <section>
            <h3 className={sectionTitleCls}>Photos</h3>
            <p className="text-xs text-slate-400 font-bold mb-3">
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
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                onClick={handleAnalyzePhotos}
                disabled={analyzing || submitting}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Photos & Auto-Fill'}
              </button>
            )}
          </section>

          {/* Gear Info */}
          <section>
            <h3 className={sectionTitleCls}>Gear Info</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Sport</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {SPORTS.map((s) => {
                    const active = selectedSports.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleSport(s.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-colors ${
                          active
                            ? 'bg-[#008751] text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>Type</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {GEAR_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={type === t.id}
                      onClick={() => setType(t.id)}
                      className={`px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-colors min-h-[36px] ${
                        type === t.id
                          ? 'bg-[#008751] text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="brand" className={labelCls}>Brand</label>
                  <input
                    id="brand"
                    type="text"
                    className={inputCls}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Fischer"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="model" className={labelCls}>Model</label>
                  <input
                    id="model"
                    type="text"
                    className={inputCls}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., RCS Skate"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="size" className={labelCls}>Size</label>
                  <input
                    id="size"
                    type="text"
                    className={inputCls}
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder={showAlpineSkiDetails ? 'e.g., 170' : 'e.g., 186cm'}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="year" className={labelCls}>Year (optional)</label>
                  <input
                    id="year"
                    type="number"
                    className={inputCls}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2023"
                    min="1980"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Condition</label>
                <div className="flex gap-1.5 mt-1">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={condition === c}
                      onClick={() => setCondition(c)}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-wide transition-colors min-h-[36px] ${
                        condition === c
                          ? 'bg-[#008751] text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <div className="flex gap-1.5 mt-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={status === s.id}
                      onClick={() => setStatus(s.id)}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-wide transition-colors min-h-[36px] leading-tight text-center ${
                        status === s.id
                          ? 'bg-[#008751] text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="location" className={labelCls}>Location (optional)</label>
                <input
                  id="location"
                  type="text"
                  className={inputCls}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Garage, Ski locker, Car"
                />
              </div>

              {status === 'checked-out' && (
                <div>
                  <label htmlFor="checkedOutTo" className={labelCls}>Checked Out To</label>
                  <input
                    id="checkedOutTo"
                    type="text"
                    className={inputCls}
                    value={checkedOutTo}
                    onChange={(e) => setCheckedOutTo(e.target.value)}
                    placeholder="e.g., Friend's name, Rental shop"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Ski Specifications (alpine skis only) */}
          {showAlpineSkiDetails && (
            <section>
              <h3 className={sectionTitleCls}>Ski Specifications</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Profile (Tip / Waist / Tail mm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      className={inputCls}
                      value={profileTip}
                      onChange={(e) => setProfileTip(e.target.value)}
                      placeholder="Tip"
                      min="80"
                      max="150"
                    />
                    <input
                      type="number"
                      className={inputCls}
                      value={profileWaist}
                      onChange={(e) => setProfileWaist(e.target.value)}
                      placeholder="Waist"
                      min="60"
                      max="120"
                    />
                    <input
                      type="number"
                      className={inputCls}
                      value={profileTail}
                      onChange={(e) => setProfileTail(e.target.value)}
                      placeholder="Tail"
                      min="80"
                      max="150"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="radius" className={labelCls}>Turn Radius (R value in meters)</label>
                  <input
                    id="radius"
                    type="number"
                    className={inputCls}
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    placeholder="e.g., 15.5"
                    step="0.1"
                    min="5"
                    max="40"
                  />
                </div>

                <p className="text-xs font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 mb-1">Bindings</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="bindingBrand" className={labelCls}>Binding Brand</label>
                    <input
                      id="bindingBrand"
                      type="text"
                      className={inputCls}
                      value={bindingBrand}
                      onChange={(e) => setBindingBrand(e.target.value)}
                      placeholder="e.g., Marker"
                    />
                  </div>
                  <div>
                    <label htmlFor="bindingModel" className={labelCls}>Binding Model</label>
                    <input
                      id="bindingModel"
                      type="text"
                      className={inputCls}
                      value={bindingModel}
                      onChange={(e) => setBindingModel(e.target.value)}
                      placeholder="e.g., Griffon 13"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bindingDin" className={labelCls}>DIN Range (binding capacity)</label>
                  <input
                    id="bindingDin"
                    type="text"
                    className={inputCls}
                    value={bindingDin}
                    onChange={(e) => setBindingDin(e.target.value)}
                    placeholder="e.g., 4-13"
                  />
                </div>

                <div>
                  <label htmlFor="dinSetting" className={labelCls}>
                    DIN Setting
                    {defaultDIN !== undefined && !dinSetting && (
                      <span className="ml-1 text-blue-500 normal-case font-semibold tracking-normal">
                        (default: {defaultDIN})
                      </span>
                    )}
                  </label>
                  <input
                    id="dinSetting"
                    type="number"
                    className={inputCls}
                    value={dinSetting}
                    onChange={(e) => setDinSetting(e.target.value)}
                    placeholder={defaultDIN !== undefined ? `Default: ${defaultDIN}` : 'DIN Setting'}
                    step="0.5"
                    min="1"
                    max="14"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    The release value set by your technician. Verify with a certified shop.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          <section>
            <h3 className={sectionTitleCls}>Notes</h3>
            <div>
              <label htmlFor="notes" className={labelCls}>Notes (optional)</label>
              <textarea
                id="notes"
                className={`${inputCls} resize-none`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Needs waxing, base repair needed"
                rows={3}
              />
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
            disabled={submitting || analyzing}
          >
            {submitting ? 'Saving...' : item ? 'Update' : 'Add Gear'}
          </button>
        </div>
      </form>
    </div>
  );
}
