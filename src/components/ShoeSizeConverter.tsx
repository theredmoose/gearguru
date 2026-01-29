import { useState, useMemo } from 'react';
import {
  getShoeSizesFromFootLength,
  convertShoeSize,
  type SizeSystem,
  type AllShoeSizes,
} from '../services/shoeSize';

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
      case 'cm':
        return allSizes.cm.toFixed(1);
      case 'mondopoint':
        return allSizes.mondopoint.toString();
      case 'eu':
        return allSizes.eu.toString();
      case 'uk':
        return allSizes.uk.toString();
      case 'us-men':
        return allSizes.usMen.toString();
      case 'us-women':
        return allSizes.usWomen.toString();
    }
  };

  return (
    <div className="size-converter">
      <header className="detail-header">
        <button className="btn-back" onClick={onClose}>
          ← Back
        </button>
        <span style={{ fontWeight: 500 }}>Size Converter</span>
        <span style={{ width: 60 }} />
      </header>

      <div className="converter-content">
        <div className="converter-input-section">
          <label>Enter a size</label>
          <div className="converter-input-row">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter size"
              step="0.5"
              min="0"
            />
            <select
              value={inputSystem}
              onChange={(e) => setInputSystem(e.target.value as SizeSystem)}
            >
              {SIZE_SYSTEMS.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="converter-results">
          <h3>Equivalent Sizes</h3>
          <div className="size-grid">
            {SIZE_SYSTEMS.map((sys) => (
              <div
                key={sys.id}
                className={`size-item ${sys.id === inputSystem ? 'input-system' : ''}`}
              >
                <span className="size-label">{sys.label}</span>
                <span className="size-value">{getSizeValue(sys.id)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="converter-note">
          <p>
            Sizes are approximate. Actual fit varies by brand and style. When in
            doubt, try shoes on or consult brand-specific charts.
          </p>
        </div>
      </div>
    </div>
  );
}
