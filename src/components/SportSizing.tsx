import { useState, useRef } from 'react';
import type { FamilyMember, SkillLevel, Sport } from '../types';
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

interface SportSizingProps {
  member: FamilyMember;
  onBack: () => void;
}

const SPORTS: { id: Sport; label: string; icon: string; color: string }[] = [
  { id: 'nordic-classic', label: 'Nordic Classic', icon: '⛷️', color: '#0891b2' },
  { id: 'nordic-skate', label: 'Nordic Skate', icon: '⛷️', color: '#0d9488' },
  { id: 'alpine', label: 'Alpine', icon: '🎿', color: '#2563eb' },
  { id: 'snowboard', label: 'Snowboard', icon: '🏂', color: '#7c3aed' },
  { id: 'hockey', label: 'Hockey', icon: '🏒', color: '#dc2626' },
];

export function SportSizing({ member, onBack }: SportSizingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentSport = SPORTS[currentIndex];

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

  const renderSportContent = () => {
    const sport = currentSport.id;

    switch (sport) {
      case 'nordic-classic':
      case 'nordic-skate':
      case 'nordic-combi':
        return renderNordicContent(sport);
      case 'alpine':
        return renderAlpineContent();
      case 'snowboard':
        return renderSnowboardContent();
      case 'hockey':
        return renderHockeyContent();
      default:
        return null;
    }
  };

  const renderNordicContent = (
    style: 'nordic-classic' | 'nordic-skate' | 'nordic-combi'
  ) => {
    const skiSizing = calculateNordicSkiSizing(
      member.measurements,
      style,
      skillLevel
    );
    const bootSizing = calculateNordicBootSizing(member.measurements);

    return (
      <div className="sizing-grid">
        <div className="sizing-card">
          <h3>Ski Length</h3>
          <div className="sizing-main">
            <span className="sizing-value">{skiSizing.skiLengthRecommended}</span>
            <span className="sizing-unit">cm</span>
          </div>
          <p className="sizing-range">
            {formatSizeRange(skiSizing.skiLengthMin, skiSizing.skiLengthMax)}
          </p>
        </div>

        <div className="sizing-card">
          <h3>Pole Length</h3>
          <div className="sizing-main">
            <span className="sizing-value">{skiSizing.poleLengthRecommended}</span>
            <span className="sizing-unit">cm</span>
          </div>
          <p className="sizing-range">
            {formatSizeRange(skiSizing.poleLengthMin, skiSizing.poleLengthMax)}
          </p>
        </div>

        <div className="sizing-card">
          <h3>Boot Size</h3>
          <div className="sizing-main">
            <span className="sizing-value">{bootSizing.mondopoint}</span>
            <span className="sizing-unit">MP</span>
          </div>
          <p className="sizing-range">
            EU {bootSizing.euSize} / US {bootSizing.usSize}
          </p>
        </div>
      </div>
    );
  };

  const renderAlpineContent = () => {
    const skiSizing = calculateAlpineSkiSizing(
      member.measurements,
      skillLevel,
      member.gender
    );
    const bootSizing = calculateAlpineBootSizing(
      member.measurements,
      skillLevel,
      member.gender
    );

    return (
      <div className="sizing-grid">
        <div className="sizing-card">
          <h3>Ski Length</h3>
          <div className="sizing-main">
            <span className="sizing-value">{skiSizing.skiLengthRecommended}</span>
            <span className="sizing-unit">cm</span>
          </div>
          <p className="sizing-range">
            {formatSizeRange(skiSizing.skiLengthMin, skiSizing.skiLengthMax)}
          </p>
        </div>

        <div className="sizing-card">
          <h3>DIN Setting</h3>
          <div className="sizing-main">
            <span className="sizing-value">
              {skiSizing.din.min}-{skiSizing.din.max}
            </span>
          </div>
          <p className="sizing-note">Verify with tech</p>
        </div>

        <div className="sizing-card">
          <h3>Boot Size</h3>
          <div className="sizing-main">
            <span className="sizing-value">{bootSizing.mondopoint}</span>
            <span className="sizing-unit">MP</span>
          </div>
          <p className="sizing-range">Shell {bootSizing.shellSize}</p>
        </div>

        <div className="sizing-card">
          <h3>Boot Flex</h3>
          <div className="sizing-main">
            <span className="sizing-value">
              {bootSizing.flexRating.min}-{bootSizing.flexRating.max}
            </span>
          </div>
          <p className="sizing-range">{bootSizing.lastWidth} width</p>
        </div>
      </div>
    );
  };

  const renderSnowboardContent = () => {
    const boardSizing = calculateSnowboardSizing(member.measurements, skillLevel);
    const bootSizing = calculateSnowboardBootSizing(member.measurements);

    return (
      <div className="sizing-grid">
        <div className="sizing-card">
          <h3>Board Length</h3>
          <div className="sizing-main">
            <span className="sizing-value">{boardSizing.boardLengthRecommended}</span>
            <span className="sizing-unit">cm</span>
          </div>
          <p className="sizing-range">
            {formatSizeRange(boardSizing.boardLengthMin, boardSizing.boardLengthMax)}
          </p>
        </div>

        <div className="sizing-card">
          <h3>Waist Width</h3>
          <div className="sizing-main">
            <span className="sizing-value">{boardSizing.waistWidthMin}+</span>
            <span className="sizing-unit">mm</span>
          </div>
          <p className="sizing-range">minimum</p>
        </div>

        <div className="sizing-card">
          <h3>Stance Width</h3>
          <div className="sizing-main">
            <span className="sizing-value">
              {boardSizing.stanceWidth.min}-{boardSizing.stanceWidth.max}
            </span>
            <span className="sizing-unit">cm</span>
          </div>
        </div>

        <div className="sizing-card">
          <h3>Boot Size</h3>
          <div className="sizing-main">
            <span className="sizing-value">{bootSizing.mondopoint}</span>
            <span className="sizing-unit">MP</span>
          </div>
          <p className="sizing-range">
            EU {bootSizing.euSize} / US {bootSizing.usSize}
          </p>
        </div>
      </div>
    );
  };

  const renderHockeyContent = () => {
    const bauerSizing = calculateHockeySkateSize(member.measurements, 'bauer');
    const ccmSizing = calculateHockeySkateSize(member.measurements, 'ccm');

    return (
      <div className="sizing-grid">
        <div className="sizing-card">
          <h3>Bauer</h3>
          <div className="sizing-main">
            <span className="sizing-value">{bauerSizing.skateSizeUS}</span>
            <span className="sizing-unit">{bauerSizing.width}</span>
          </div>
          <p className="sizing-range">EU {bauerSizing.skateSizeEU}</p>
        </div>

        <div className="sizing-card">
          <h3>CCM</h3>
          <div className="sizing-main">
            <span className="sizing-value">{ccmSizing.skateSizeUS}</span>
            <span className="sizing-unit">{ccmSizing.width}</span>
          </div>
          <p className="sizing-range">EU {ccmSizing.skateSizeEU}</p>
        </div>

        <div className="sizing-card sizing-card-wide">
          <p className="sizing-tip">
            Hockey skates run 1-1.5 sizes smaller than shoes. Try with hockey socks.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="sport-sizing">
      <header className="detail-header">
        <button className="btn-back" onClick={onBack}>
          ← {member.name}
        </button>
      </header>

      {/* Sport tabs */}
      <div className="sport-tabs">
        {SPORTS.map((sport, index) => (
          <button
            key={sport.id}
            className={`sport-tab ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            style={
              index === currentIndex
                ? { borderColor: sport.color, color: sport.color }
                : undefined
            }
          >
            <span className="sport-tab-icon">{sport.icon}</span>
            <span className="sport-tab-label">{sport.label}</span>
          </button>
        ))}
      </div>

      {/* Swipeable content area */}
      <div
        ref={containerRef}
        className="sport-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ backgroundColor: currentSport.color + '10' }}
      >
        <div
          className="sport-header"
          style={{ backgroundColor: currentSport.color }}
        >
          <span className="sport-icon">{currentSport.icon}</span>
          <h1>{currentSport.label}</h1>
        </div>

        {/* Skill level selector (not for hockey) */}
        {currentSport.id !== 'hockey' && (
          <div className="skill-selector">
            <div className="skill-buttons">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map(
                (level) => (
                  <button
                    key={level}
                    className={`skill-btn ${skillLevel === level ? 'active' : ''}`}
                    onClick={() => setSkillLevel(level)}
                    style={
                      skillLevel === level
                        ? { backgroundColor: currentSport.color, borderColor: currentSport.color }
                        : undefined
                    }
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1, 3)}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {renderSportContent()}

        {/* Swipe indicator */}
        <div className="swipe-indicator">
          {SPORTS.map((_, index) => (
            <span
              key={index}
              className={`swipe-dot ${index === currentIndex ? 'active' : ''}`}
              style={
                index === currentIndex
                  ? { backgroundColor: currentSport.color }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="swipe-hint">Swipe for more sports</p>
      </div>
    </div>
  );
}
