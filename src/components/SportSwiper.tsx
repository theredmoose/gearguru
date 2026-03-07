import { useRef } from 'react';
import type { Sport } from '../types';

const SPORT_DISPLAY: Partial<Record<Sport, string>> = {
  alpine:           'Downhill',
  'nordic-classic': 'XC Classic',
  'nordic-skate':   'XC Skate',
  'nordic-combi':   'XC Combi',
  snowboard:        'Snowboard',
  hockey:           'Hockey',
};

const SWIPE_THRESHOLD = 60; // px

interface Props {
  sports: Sport[];
  value: Sport;
  onChange: (sport: Sport) => void;
}

export function SportSwiper({ sports, value, onChange }: Props) {
  const touchStartX = useRef<number | null>(null);
  const activeIdx = sports.indexOf(value);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (delta < -SWIPE_THRESHOLD && activeIdx < sports.length - 1) {
      onChange(sports[activeIdx + 1]);
    } else if (delta > SWIPE_THRESHOLD && activeIdx > 0) {
      onChange(sports[activeIdx - 1]);
    }
  }

  return (
    <div
      data-testid="swipe-zone"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="select-none"
    >
      {/* Sport name */}
      <p className="text-center text-xs font-black text-[#008751] uppercase tracking-widest mb-2">
        {SPORT_DISPLAY[value] ?? value}
      </p>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5">
        {sports.map((sport, i) => (
          <span
            key={sport}
            role="presentation"
            data-active={String(i === activeIdx)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx
                ? 'w-4 h-1.5 bg-[#008751]'
                : 'w-1.5 h-1.5 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
