import { useState, useMemo } from 'react';
import {
  getShoeSizesFromFootLength,
  convertShoeSize,
  type SizeSystem,
  type AllShoeSizes,
} from '../services/shoeSize';
import { ScreenHeader } from './ScreenHeader';

interface ShoeSizeConverterProps {
  footLengthCm?: number;
  onClose: () => void;
}

const SIZE_SYSTEMS: { id: SizeSystem; label: string }[] = [
  { id: 'cm', label: 'CM' },
  { id: 'mondopoint', label: 'Mondopoint' },
  { id: 'eu', label: 'EU' },
  { id: 'uk', label: 'UK' },
  { id: 'us-men', label: 'US Men' },
  { id: 'us-women', label: 'US Women' },
];

export function ShoeSizeConverter({
  footLengthCm,
  onClose,
}: ShoeSizeConverterProps) {
  const [inputSystem, setInputSystem] = useState<SizeSystem>(
    footLengthCm ? 'cm' : 'eu'
  );
  const [inputValue, setInputValue] = useState<string>(
    footLengthCm?.toString() ?? ''
  );

  const allSizes = useMemo<AllShoeSizes | null>(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) return null;

    if (inputSystem === 'cm') {
      return getShoeSizesFromFootLength(value);
    }

    const cm = convertShoeSize(value, inputSystem, 'cm');
    return getShoeSizesFromFootLength(cm);
  }, [inputValue, inputSystem]);

  const getSizeValue = (system: SizeSystem): string => {
    if (!allSizes) return '-';

    switch (system) {
      case 'cm':          return allSizes.cm.toFixed(1);
      case 'mondopoint':  return allSizes.mondopoint.toString();
      case 'eu':          return allSizes.eu.toString();
      case 'uk':          return allSizes.uk.toString();
      case 'us-men':      return allSizes.usMen.toString();
      case 'us-women':    return allSizes.usWomen.toString();
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScreenHeader title="Size Converter" onBack={onClose} />

      <div className="flex-1 overflow-y-auto bg-white px-6 py-5 flex flex-col gap-6">
        {/* Input section */}
        <section>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Enter a size
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter size"
              step="0.5"
              min="0"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300"
            />
            <select
              value={inputSystem}
              onChange={(e) => setInputSystem(e.target.value as SizeSystem)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {SIZE_SYSTEMS.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Results grid */}
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            Equivalent Sizes
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {SIZE_SYSTEMS.map((sys) => (
              <div
                key={sys.id}
                className={`size-item flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${
                  sys.id === inputSystem
                    ? 'input-system bg-blue-600 border-blue-700'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${sys.id === inputSystem ? 'text-blue-100' : 'text-slate-400'}`}>
                  {sys.label}
                </span>
                <span className={`text-lg font-black tabular-nums ${sys.id === inputSystem ? 'text-white' : 'text-slate-800'}`}>
                  {getSizeValue(sys.id)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-slate-400 font-bold leading-relaxed text-center px-2">
          Sizes are approximate. Actual fit varies by brand and style. When in
          doubt, try shoes on or consult brand-specific charts.
        </p>
      </div>
    </div>
  );
}
