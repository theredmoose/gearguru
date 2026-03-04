import { ScreenHeader } from './ScreenHeader';
import { SECTION_HEADER_CLS, RADIUS_CARD, COLOR_PRIMARY } from '../constants/design';

const SIZING_GUIDES = [
  {
    sport: 'Nordic Skiing',
    color: 'bg-cyan-50 border-cyan-100',
    labelColor: 'text-cyan-700',
    rules: [
      { label: 'Classic Skis', value: 'Height + 10–20 cm' },
      { label: 'Skate Skis',   value: 'Height + 5–15 cm' },
      { label: 'Classic Poles', value: 'Height × 0.83' },
      { label: 'Skate Poles',  value: 'Height × 0.89' },
      { label: 'Boots',        value: 'Mondopoint = foot length (mm)' },
    ],
  },
  {
    sport: 'Alpine Skiing',
    color: 'bg-blue-50 border-blue-100',
    labelColor: 'text-blue-700',
    rules: [
      { label: 'Ski Length',   value: 'Chin to forehead (by skill)' },
      { label: 'Boot Size',    value: 'Mondo = foot length (cm × 10)' },
      { label: 'Boot Flex',    value: 'Beginner 60–80 · Expert 120+' },
      { label: 'Boot Last',    value: 'Narrow ≤97 mm · Wide ≥102 mm' },
      { label: 'DIN Setting',  value: 'Based on weight + skill + height' },
    ],
  },
  {
    sport: 'Snowboarding',
    color: 'bg-violet-50 border-violet-100',
    labelColor: 'text-violet-700',
    rules: [
      { label: 'Board Length', value: 'Collarbone to chin (by weight)' },
      { label: 'Board Waist',  value: 'Foot length (mm) + 10–20 mm' },
      { label: 'Stance Width', value: 'Shoulder width ± 2.5 cm' },
      { label: 'Boots',        value: 'Mondo = foot length (mm)' },
    ],
  },
  {
    sport: 'Hockey',
    color: 'bg-red-50 border-red-100',
    labelColor: 'text-red-700',
    rules: [
      { label: 'Skate Size',   value: 'US shoe size − 1 to 1.5' },
      { label: 'Bauer Width',  value: 'D (regular) · EE (wide)' },
      { label: 'CCM Width',    value: 'Standard · Wide' },
      { label: 'Try with',     value: 'Hockey socks, not street socks' },
    ],
  },
];

export function ResourcesScreen() {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScreenHeader title="Resources" />
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-5 pt-8 pb-8 space-y-7">
        <h2 className={SECTION_HEADER_CLS} style={{ color: COLOR_PRIMARY }}>
          Quick Sizing Reference
        </h2>

        {SIZING_GUIDES.map((guide) => (
          <div key={guide.sport} className={`${RADIUS_CARD} border px-5 pt-5 pb-4 ${guide.color}`}>
            <h2 className={`text-xs font-black tracking-widest uppercase mb-4 ${guide.labelColor}`}>
              {guide.sport}
            </h2>
            <div className="grid grid-cols-[5fr_7fr] items-center pb-2 mb-1 border-b border-black/10">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">Gear</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sizing Calculation</span>
            </div>
            <div>
              {guide.rules.map((rule, i) => (
                <div
                  key={rule.label}
                  className={`grid grid-cols-[5fr_7fr] items-center py-1.5 ${i < guide.rules.length - 1 ? 'border-b border-black/5' : ''}`}
                >
                  <span className="text-sm font-bold text-slate-500 tracking-wide">{rule.label}</span>
                  <span className="text-sm text-slate-600">{rule.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-slate-400 text-center pb-2 px-2">
          All sizing is a starting point. Always verify with a qualified shop technician.
        </p>
      </div>
    </div>
  );
}
