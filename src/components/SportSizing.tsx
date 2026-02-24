import { useState, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FamilyMember, GearItem, SkillLevel, Sport, GearType, SizingModel, SizingDisplay, AlpineTerrain } from '../types';
import { SIZING_MODEL_LABELS, ALPINE_TERRAIN_LABELS } from '../types';
import {
  calculateNordicSkiSizingByModel,
  calculateNordicBootSizing,
  calculateAlpineSkiSizing,
  calculateAlpineBootSizing,
  calculateAlpineWaistWidth,
  checkDINSafety,
  calculateSnowboardSizing,
  calculateSnowboardBootSizing,
  calculateHockeySkateSize,
  formatSizeRange,
} from '../services/sizing';
import { GearCard } from './GearCard';
import { GearLoadoutPanel } from './GearLoadoutPanel';
import { MemberInfoTable } from './MemberInfoTable';

interface SportSizingProps {
  member: FamilyMember;
  gearItems?: GearItem[];
  onBack: () => void;
  onSkillLevelChange?: (skillLevels: Partial<Record<Sport, SkillLevel>>) => void;
  onAddGear?: (sport: Sport, gearType?: GearType) => void;
  onEditGear?: (item: GearItem) => void;
  onDeleteGear?: (item: GearItem) => void;
  defaultSizingModel?: SizingModel;
  defaultSizingDisplay?: SizingDisplay;
}

const SPORTS: { id: Sport; label: string; icon: string; color: string }[] = [
  { id: 'nordic-classic', label: 'Nordic Classic', icon: '⛷️', color: '#0891b2' },
  { id: 'nordic-skate',   label: 'Nordic Skate',   icon: '⛷️', color: '#0d9488' },
  { id: 'alpine',         label: 'Alpine',          icon: '🎿', color: '#2563eb' },
  { id: 'snowboard',      label: 'Snowboard',       icon: '🏂', color: '#7c3aed' },
  { id: 'hockey',         label: 'Hockey',          icon: '🏒', color: '#dc2626' },
];

const NORDIC_MODELS: SizingModel[] = ['generic', 'fischer', 'evosports'];

export function SportSizing({
  member,
  gearItems = [],
  onBack,
  onSkillLevelChange,
  onAddGear,
  onEditGear,
  onDeleteGear,
  defaultSizingModel = 'generic',
  defaultSizingDisplay = 'range',
}: SportSizingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sizingModel, setSizingModel] = useState<SizingModel>(defaultSizingModel);
  const [sizingDisplay, setSizingDisplay] = useState<SizingDisplay>(defaultSizingDisplay);
  const [alpineTerrain, setAlpineTerrain] = useState<AlpineTerrain>('all-mountain');
  const [skillLevels, setSkillLevels] = useState<Record<Sport, SkillLevel>>(() => ({
    'nordic-classic': member.skillLevels?.['nordic-classic'] ?? 'intermediate',
    'nordic-skate':   member.skillLevels?.['nordic-skate']   ?? 'intermediate',
    'nordic-combi':   member.skillLevels?.['nordic-combi']   ?? 'intermediate',
    'alpine':         member.skillLevels?.['alpine']         ?? 'intermediate',
    'snowboard':      member.skillLevels?.['snowboard']      ?? 'intermediate',
    'hockey':         member.skillLevels?.['hockey']         ?? 'intermediate',
  }));
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentSport = SPORTS[currentIndex];
  const skillLevel = skillLevels[currentSport.id] ?? 'intermediate';

  const sportGearItems = gearItems.filter((item) => item.sport === currentSport.id);

  const handleSlotTap = (slotType: GearType) => {
    const existingGear = sportGearItems.find((item) => item.type === slotType);
    if (existingGear && onEditGear) {
      onEditGear(existingGear);
    } else if (onAddGear) {
      onAddGear(currentSport.id, slotType);
    }
  };

  const setSkillLevel = (level: SkillLevel) => {
    const newSkillLevels = { ...skillLevels, [currentSport.id]: level };
    setSkillLevels(newSkillLevels);
    const { 'nordic-combi': _unused, ...persistable } = newSkillLevels;
    onSkillLevelChange?.(persistable);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold && currentIndex < SPORTS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (diff < -threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // ── Sizing content renderers ──────────────────────────────────────

  const renderNordicContent = (style: 'nordic-classic' | 'nordic-skate' | 'nordic-combi') => {
    const skiSizing  = calculateNordicSkiSizingByModel(member.measurements, style, skillLevel, sizingModel);
    const bootSizing = calculateNordicBootSizing(member.measurements);
    const showRange  = sizingDisplay === 'range';

    return (
      <div className="sizing-sections">
        <section className="sizing-section">
          <div className="section-header">
            <h2>Equipment Sizing</h2>
            <button
              className="btn-link text-[10px] font-bold uppercase tracking-wide"
              onClick={() => setSizingDisplay(d => d === 'range' ? 'single' : 'range')}
              aria-label="Toggle range or single size display"
            >
              {showRange ? 'Single' : 'Range'}
            </button>
          </div>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Skis</span>
              <div className="sizing-value-group">
                {showRange ? (
                  <>
                    <span className="sizing-value">{skiSizing.skiLengthRecommended}</span>
                    <span className="sizing-unit">cm</span>
                    <span className="sizing-range">({formatSizeRange(skiSizing.skiLengthMin, skiSizing.skiLengthMax)})</span>
                  </>
                ) : (
                  <>
                    <span className="sizing-value">{skiSizing.skiLengthRecommended}</span>
                    <span className="sizing-unit">cm</span>
                  </>
                )}
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Poles</span>
              <div className="sizing-value-group">
                {showRange ? (
                  <>
                    <span className="sizing-value">{skiSizing.poleLengthRecommended}</span>
                    <span className="sizing-unit">cm</span>
                    <span className="sizing-range">({formatSizeRange(skiSizing.poleLengthMin, skiSizing.poleLengthMax)})</span>
                  </>
                ) : (
                  <>
                    <span className="sizing-value">{skiSizing.poleLengthRecommended}</span>
                    <span className="sizing-unit">cm</span>
                  </>
                )}
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Boots</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{bootSizing.mondopoint}</span>
                <span className="sizing-unit">MP</span>
                <span className="sizing-range">(EU {bootSizing.euSize} / US {bootSizing.usSize})</span>
              </div>
            </div>
            {skiSizing.faValueRange && (
              <div className="sizing-row">
                <span className="sizing-label">FA Value</span>
                <div className="sizing-value-group">
                  <span className="sizing-value">{skiSizing.faValueRange.min}–{skiSizing.faValueRange.max}</span>
                  <span className="sizing-unit">kg</span>
                </div>
              </div>
            )}
          </div>
          {skiSizing.modelNotes && skiSizing.modelNotes.length > 0 && (
            <div className="mt-2 space-y-1">
              {skiSizing.modelNotes.map((note, i) => (
                <p key={i} className="sizing-tip">{note}</p>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderAlpineContent = () => {
    const skiSizing  = calculateAlpineSkiSizing(member.measurements, skillLevel, member.gender);
    const bootSizing = calculateAlpineBootSizing(member.measurements, skillLevel, member.gender);
    const waistWidth = calculateAlpineWaistWidth(alpineTerrain);
    const showRange  = sizingDisplay === 'range';

    // Collect gear items that have a DIN setting stored so we can check safety
    const skisWithDIN = sportGearItems.filter(
      (item) =>
        item.extendedDetails?.type === 'alpineSki' &&
        item.extendedDetails.details.bindings?.dinSetting !== undefined
    );

    return (
      <div className="sizing-sections">
        <section className="sizing-section">
          <div className="section-header">
            <h2>Equipment Sizing</h2>
            <button
              className="btn-link text-[10px] font-bold uppercase tracking-wide"
              onClick={() => setSizingDisplay(d => d === 'range' ? 'single' : 'range')}
              aria-label="Toggle range or single size display"
            >
              {showRange ? 'Single' : 'Range'}
            </button>
          </div>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Skis</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{skiSizing.skiLengthRecommended}</span>
                <span className="sizing-unit">cm</span>
                {showRange && (
                  <span className="sizing-range">({formatSizeRange(skiSizing.skiLengthMin, skiSizing.skiLengthMax)})</span>
                )}
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Ski Waist</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{waistWidth.min}–{waistWidth.max}</span>
                <span className="sizing-unit">mm</span>
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Boots</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{bootSizing.mondopoint}</span>
                <span className="sizing-unit">MP</span>
                <span className="sizing-range">(Shell {bootSizing.shellSize}, {bootSizing.lastWidth})</span>
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Boot Flex</span>
              <div className="sizing-value-group">
                {showRange ? (
                  <span className="sizing-value">{bootSizing.flexRating.min}–{bootSizing.flexRating.max}</span>
                ) : (
                  <span className="sizing-value">{Math.round((bootSizing.flexRating.min + bootSizing.flexRating.max) / 2)}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="sizing-section">
          <h2>Gear Settings</h2>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">DIN</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{skiSizing.din.min}–{skiSizing.din.max}</span>
                <span className="sizing-note">Verify with tech</span>
              </div>
            </div>
          </div>

          {/* DIN safety check — shown when gear items have a stored DIN setting */}
          {skisWithDIN.length > 0 && (
            <div className="mt-3 space-y-2">
              {skisWithDIN.map((ski) => {
                const ext = ski.extendedDetails;
                const alpineDetails = ext?.type === 'alpineSki' ? ext.details : null;
                const din = alpineDetails?.bindings?.dinSetting ?? 0;
                const status = checkDINSafety(din, skiSizing.din);
                const name = [ski.brand, ski.model].filter(Boolean).join(' ');
                return (
                  <div
                    key={ski.id}
                    role="alert"
                    className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs border ${
                      status === 'safe'
                        ? 'bg-green-50 border-green-100 text-green-700'
                        : status === 'too-low'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    <span className="font-black flex-shrink-0 mt-px" aria-hidden="true">
                      {status === 'safe' ? '✓' : '⚠'}
                    </span>
                    <p className="font-semibold leading-snug">
                      <span className="font-black">{name}</span>
                      {' DIN '}{din}
                      {status === 'safe' && ' — within safe range'}
                      {status === 'too-low' && ` — below recommended (${skiSizing.din.min}–${skiSizing.din.max}). May pre-release.`}
                      {status === 'too-high' && ` — above recommended (${skiSizing.din.min}–${skiSizing.din.max}). Injury risk.`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderSnowboardContent = () => {
    const boardSizing = calculateSnowboardSizing(member.measurements, skillLevel);
    const bootSizing  = calculateSnowboardBootSizing(member.measurements);
    const showRange   = sizingDisplay === 'range';

    return (
      <div className="sizing-sections">
        <section className="sizing-section">
          <div className="section-header">
            <h2>Equipment Sizing</h2>
            <button
              className="btn-link text-[10px] font-bold uppercase tracking-wide"
              onClick={() => setSizingDisplay(d => d === 'range' ? 'single' : 'range')}
              aria-label="Toggle range or single size display"
            >
              {showRange ? 'Single' : 'Range'}
            </button>
          </div>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Board</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{boardSizing.boardLengthRecommended}</span>
                <span className="sizing-unit">cm</span>
                {showRange && (
                  <span className="sizing-range">({formatSizeRange(boardSizing.boardLengthMin, boardSizing.boardLengthMax)})</span>
                )}
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Board Waist</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{boardSizing.waistWidthMin}+</span>
                <span className="sizing-unit">mm</span>
                <span className="sizing-range">(minimum)</span>
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Boots</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{bootSizing.mondopoint}</span>
                <span className="sizing-unit">MP</span>
                <span className="sizing-range">(EU {bootSizing.euSize} / US {bootSizing.usSize})</span>
              </div>
            </div>
          </div>
        </section>

        <section className="sizing-section">
          <h2>Gear Settings</h2>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Stance Width</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{boardSizing.stanceWidth.min}-{boardSizing.stanceWidth.max}</span>
                <span className="sizing-unit">cm</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderHockeyContent = () => {
    const bauerSizing = calculateHockeySkateSize(member.measurements, 'bauer');
    const ccmSizing   = calculateHockeySkateSize(member.measurements, 'ccm');

    return (
      <div className="sizing-sections">
        <section className="sizing-section">
          <h2>Equipment Sizing</h2>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Bauer Skates</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{bauerSizing.skateSizeUS}</span>
                <span className="sizing-unit">{bauerSizing.width}</span>
                <span className="sizing-range">(EU {bauerSizing.skateSizeEU})</span>
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">CCM Skates</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{ccmSizing.skateSizeUS}</span>
                <span className="sizing-unit">{ccmSizing.width}</span>
                <span className="sizing-range">(EU {ccmSizing.skateSizeEU})</span>
              </div>
            </div>
          </div>
          <p className="sizing-tip">
            Hockey skates run 1-1.5 sizes smaller than shoes. Try with hockey socks.
          </p>
        </section>
      </div>
    );
  };

  const renderSportContent = () => {
    switch (currentSport.id) {
      case 'nordic-classic':
      case 'nordic-skate':
      case 'nordic-combi':
        return renderNordicContent(currentSport.id);
      case 'alpine':    return renderAlpineContent();
      case 'snowboard': return renderSnowboardContent();
      case 'hockey':    return renderHockeyContent();
      default:          return null;
    }
  };

  return (
    <div className="sport-sizing flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-700 border-b border-blue-800 shadow-sm flex items-center gap-2">
        <button
          className="flex items-center gap-1 text-white font-bold text-sm hover:text-blue-200 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="w-5 h-5" />
          {member.name}
        </button>
      </div>

      {/* Sport tabs */}
      <div className="sport-tabs flex overflow-x-auto border-b border-slate-100 bg-white">
        {SPORTS.map((sport, index) => (
          <button
            key={sport.id}
            className={`sport-tab flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wide border-b-2 transition-colors ${
              index === currentIndex
                ? 'border-current'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setCurrentIndex(index)}
            style={index === currentIndex ? { color: sport.color, borderColor: sport.color } : undefined}
          >
            <span className="text-base leading-none">{sport.icon}</span>
            <span className="sport-tab-label">{sport.label}</span>
          </button>
        ))}
      </div>

      {/* Swipeable content */}
      <div
        ref={containerRef}
        className="sport-content flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ backgroundColor: currentSport.color + '10' }}
      >
        {/* Sport header banner */}
        <div
          className="sport-header flex items-center gap-3 px-6 py-4"
          style={{ backgroundColor: currentSport.color }}
        >
          <span className="text-2xl">{currentSport.icon}</span>
          <h1 className="text-base font-black text-white uppercase tracking-wide">
            {currentSport.label}
          </h1>
        </div>

        {/* Skill level selector */}
        {currentSport.id !== 'hockey' && (
          <div className="skill-selector px-6 py-3 bg-white border-b border-slate-100">
            <div className="skill-buttons flex gap-2">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map((level) => (
                <button
                  key={level}
                  className={`skill-btn flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border-2 transition-colors ${
                    skillLevel === level
                      ? 'active text-white border-transparent'
                      : 'text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSkillLevel(level)}
                  style={
                    skillLevel === level
                      ? { backgroundColor: currentSport.color, borderColor: currentSport.color }
                      : undefined
                  }
                >
                  {level.charAt(0).toUpperCase() + level.slice(1, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizing model selector (Nordic only) */}
        {(currentSport.id === 'nordic-classic' || currentSport.id === 'nordic-skate' || currentSport.id === 'nordic-combi') && (
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Model</span>
            {NORDIC_MODELS.map((m) => (
              <button
                key={m}
                onClick={() => setSizingModel(m)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  sizingModel === m
                    ? 'text-white border-transparent'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
                style={sizingModel === m ? { backgroundColor: currentSport.color, borderColor: currentSport.color } : undefined}
                aria-pressed={sizingModel === m}
              >
                {SIZING_MODEL_LABELS[m]}
              </button>
            ))}
          </div>
        )}

        {/* Terrain selector (Alpine only) */}
        {currentSport.id === 'alpine' && (
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Terrain</span>
            {(['groomed', 'all-mountain', 'powder'] as AlpineTerrain[]).map((t) => (
              <button
                key={t}
                onClick={() => setAlpineTerrain(t)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  alpineTerrain === t
                    ? 'text-white border-transparent'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
                style={alpineTerrain === t ? { backgroundColor: currentSport.color, borderColor: currentSport.color } : undefined}
                aria-pressed={alpineTerrain === t}
              >
                {ALPINE_TERRAIN_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* Loadout + member info */}
        <div className="sizing-sections">
          <GearLoadoutPanel
            member={member}
            sport={currentSport.id}
            gearItems={sportGearItems}
            onSlotTap={handleSlotTap}
            color={currentSport.color}
          />
          <MemberInfoTable
            member={member}
            sport={currentSport.id}
            skillLevel={skillLevel}
          />
        </div>

        {renderSportContent()}

        {/* My Gear section */}
        {(onAddGear || onEditGear || onDeleteGear) && (
          <div className="sizing-sections">
            <section className="sizing-section gear-section">
              <div className="section-header">
                <h2>My Gear</h2>
                {onAddGear && (
                  <button
                    className="btn-link"
                    onClick={() => onAddGear(currentSport.id)}
                  >
                    + Add
                  </button>
                )}
              </div>
              {sportGearItems.length === 0 ? (
                <p className="gear-empty-hint">No gear yet for {currentSport.label}.</p>
              ) : (
                <div className="gear-list">
                  {sportGearItems.map((item) => (
                    <GearCard
                      key={item.id}
                      item={item}
                      onEdit={onEditGear ?? (() => {})}
                      onDelete={onDeleteGear ?? (() => {})}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Swipe indicator dots */}
        <div className="swipe-indicator flex justify-center gap-2 py-4">
          {SPORTS.map((_, index) => (
            <span
              key={index}
              className={`swipe-dot w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'active scale-125' : 'bg-slate-300'
              }`}
              style={index === currentIndex ? { backgroundColor: currentSport.color } : undefined}
            />
          ))}
        </div>

        <p className="swipe-hint text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-4">
          Swipe for more sports
        </p>
      </div>
    </div>
  );
}
