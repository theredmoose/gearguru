import type { GearStatus } from '../types';

interface GearStatusBadgeProps {
  status: GearStatus;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<GearStatus, { label: string; color: string }> = {
  active:       { label: 'Active',       color: '#3b82f6' },
  available:    { label: 'Available',    color: '#22c55e' },
  outgrown:     { label: 'Outgrown',     color: '#f59e0b' },
  'to-sell':    { label: 'To Sell',      color: '#f97316' },
  sold:         { label: 'Sold',         color: '#94a3b8' },
  'needs-repair': { label: 'Needs Repair', color: '#ef4444' },
};

export function GearStatusBadge({ status, size = 'medium' }: GearStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`gear-status-badge gear-status-badge--${size}`}
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
}
