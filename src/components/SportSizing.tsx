import { useState, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FamilyMember, GearItem, SkillLevel, Sport, GearType } from '../types';
import {
  calculateNordicSkiSizing,
  calculateNordicBootSizing,
  calculateAlpineSkiSizing,
  calculateAlpineBootSizing,
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
}

const SPORTS: { id: Sport; label: string; icon: string; color: string }[] = [
  { id: 'nordic-classic', label: 'Nordic Classic', icon: '⛷️', color: '#0891b2' },
  { id: 'nordic-skate',   label: 'Nordic Skate',   icon: '⛷️', color: '#0d9488' },
  { id: 'alpine',         label: 'Alpine',          icon: '🎿', color: '#2563eb' },
  { id: 'snowboard',      label: 'Snowboard',       icon: '🏂', color: '#7c3aed' },
  { id: 'hockey',         label: 'Hockey',          icon: '🏒', color: '#dc2626' },
];

export function SportSizing({
  member,
  gearItems = [],
  onBack,
  onSkillLevelChange,
  onAddGear,
  onEditGear,
  onDeleteGear,
}: SportSizingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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
    const skiSizing  = calculateNordicSkiSizing(member.measurements, style, skillLevel);
    const bootSizing = calculateNordicBootSizing(member.measurements);

    return (
      <div className="sizing-sections">
        <section className="sizing-section">
          <h2>Equipment Sizing</h2>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Skis</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{skiSizing.skiLengthRecommended}</span>
                <span className="sizing-unit">cm</span>
                <span className="sizing-range">({formatSizeRange(skiSizing.skiLengthMin, skiSizing.skiLengthMax)})</span>
              </div>
            </div>
            <div className="sizing-row">
              <span className="sizing-label">Poles</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{skiSizing.poleLengthRecommended}</span>
                <span className="sizing-unit">cm</span>
                <span className="sizing-range">({formatSizeRange(skiSizing.poleLengthMin, skiSizing.poleLengthMax)})</span>
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
      </div>
    );
  };

  const renderAlpineContent = () => {
    const skiSizing  = calculateAlpineSkiSizing(member.measurements, skillLevel, member.gender);
    const bootSizing = calculateAlpineBootSizing(member.measurements, skillLevel, member.gender);

    return (
      <div className="sizing-sections">
        <section className="sizing-section">
          <h2>Equipment Sizing</h2>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Skis</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{skiSizing.skiLengthRecommended}</span>
                <span className="sizing-unit">cm</span>
                <span className="sizing-range">({formatSizeRange(skiSizing.skiLengthMin, skiSizing.skiLengthMax)})</span>
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
                <span className="sizing-value">{bootSizing.flexRating.min}-{bootSizing.flexRating.max}</span>
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
                <span className="sizing-value">{skiSizing.din.min}-{skiSizing.din.max}</span>
                <span className="sizing-note">Verify with tech</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderSnowboardContent = () => {
    const boardSizing = calculateSnowboardSizing(member.measurements, skillLevel);
    const bootSizing  = calculateSnowboardBootSizing(member.measurements);

    return (
      <div className="sizing-sections">
        <section className="sizing-section">
          <h2>Equipment Sizing</h2>
          <div className="sizing-list">
            <div className="sizing-row">
              <span className="sizing-label">Board</span>
              <div className="sizing-value-group">
                <span className="sizing-value">{boardSizing.boardLengthRecommended}</span>
                <span className="sizing-unit">cm</span>
                <span className="sizing-range">({formatSizeRange(boardSizing.boardLengthMin, boardSizing.boardLengthMax)})</span>
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
