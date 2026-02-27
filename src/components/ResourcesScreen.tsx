import { ScreenHeader } from './ScreenHeader';

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
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 py-6 space-y-5">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
          Quick sizing reference
        </p>

        {SIZING_GUIDES.map((guide) => (
          <div key={guide.sport} className={`rounded-3xl border p-5 ${guide.color}`}>
            <h2 className={`text-xs font-black uppercase tracking-widest mb-4 ${guide.labelColor}`}>
              {guide.sport}
            </h2>
            <div className="space-y-3">
              {guide.rules.map((rule) => (
                <div key={rule.label} className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {rule.label}
                  </span>
                  <span className="text-[11px] font-black text-slate-800 text-right">
                    {rule.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="text-[10px] text-slate-400 text-center pb-2">
          All sizing is a starting point. Always verify with a qualified shop technician.
        </p>
      </div>
    </div>
  );
}
