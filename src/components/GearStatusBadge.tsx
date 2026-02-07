import type { GearStatus } from '../types';

interface GearStatusBadgeProps {
  status: GearStatus;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<GearStatus, { label: string; color: string }> = {
  available: { label: 'Available', color: '#22c55e' },
  'checked-out': { label: 'Checked Out', color: '#f97316' },
  maintenance: { label: 'Maintenance', color: '#ef4444' },
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
