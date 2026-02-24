interface GrowthWarningBadgeProps {
  reason: 'stale' | 'growing' | 'both';
}

const TOOLTIP: Record<GrowthWarningBadgeProps['reason'], string> = {
  stale:   'Measurements are over 6 months old — consider re-measuring',
  growing: 'Active growth detected — gear sizes may need updating soon',
  both:    'Growing and measurements are over 6 months old — re-measure soon',
};

export function GrowthWarningBadge({ reason }: GrowthWarningBadgeProps) {
  const title = TOOLTIP[reason];
  return (
    <span
      title={title}
      aria-label={title}
      className="text-amber-500 text-xs ml-1"
    >
      ⚠
    </span>
  );
}
