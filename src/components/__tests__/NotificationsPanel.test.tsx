import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsPanel } from '../NotificationsPanel';
import type { AppNotification } from '../../types';

function makeNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 'worn-gear-1',
    type: 'replace',
    title: "Replace Alice's Skis",
    body: 'Fischer Hero Skis is worn out. Time to replace or sell.',
    gearItemId: 'gear-1',
    memberId: 'member-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const defaultProps = {
  notifications: [makeNotification()],
  onDismiss: vi.fn(),
  onViewDismissed: vi.fn(),
};

describe('NotificationsPanel', () => {
  describe('rendering', () => {
    it('renders nothing when notifications array is empty', () => {
      const { container } = render(
        <NotificationsPanel notifications={[]} onDismiss={vi.fn()} onViewDismissed={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('shows notification count in header', () => {
      render(<NotificationsPanel {...defaultProps} />);
      expect(screen.getByText('1 gear notification')).toBeInTheDocument();
    });

    it('uses plural label for multiple notifications', () => {
      const notifications = [
        makeNotification({ id: 'n1' }),
        makeNotification({ id: 'n2', title: 'Second notification' }),
      ];
      render(<NotificationsPanel notifications={notifications} onDismiss={vi.fn()} onViewDismissed={vi.fn()} />);
      expect(screen.getByText('2 gear notifications')).toBeInTheDocument();
    });

    it('renders notification title and body', () => {
      render(<NotificationsPanel {...defaultProps} />);
      expect(screen.getByText("Replace Alice's Skis")).toBeInTheDocument();
      expect(screen.getByText(/worn out/i)).toBeInTheDocument();
    });

    it('shows "View dismissed notifications" link', () => {
      render(<NotificationsPanel {...defaultProps} />);
      expect(screen.getByText('View dismissed notifications')).toBeInTheDocument();
    });

    it('shows type badge', () => {
      render(<NotificationsPanel {...defaultProps} />);
      expect(screen.getByText('Replace')).toBeInTheDocument();
    });
  });

  describe('collapse / expand', () => {
    it('starts expanded', () => {
      render(<NotificationsPanel {...defaultProps} />);
      expect(screen.getByText("Replace Alice's Skis")).toBeVisible();
    });

    it('collapses when header is clicked', () => {
      render(<NotificationsPanel {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /collapse gear notifications/i }));
      expect(screen.queryByText("Replace Alice's Skis")).not.toBeInTheDocument();
    });

    it('expands again after second click', () => {
      render(<NotificationsPanel {...defaultProps} />);
      const btn = screen.getByRole('button', { name: /collapse gear notifications/i });
      fireEvent.click(btn);
      fireEvent.click(screen.getByRole('button', { name: /expand gear notifications/i }));
      expect(screen.getByText("Replace Alice's Skis")).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onDismiss with notification id when X is clicked', () => {
      const onDismiss = vi.fn();
      render(<NotificationsPanel {...defaultProps} onDismiss={onDismiss} />);
      fireEvent.click(screen.getByRole('button', { name: /dismiss notification: Replace Alice's Skis/i }));
      expect(onDismiss).toHaveBeenCalledWith('worn-gear-1');
    });

    it('calls onViewDismissed when "View dismissed" link is clicked', () => {
      const onViewDismissed = vi.fn();
      render(<NotificationsPanel {...defaultProps} onViewDismissed={onViewDismissed} />);
      fireEvent.click(screen.getByText('View dismissed notifications'));
      expect(onViewDismissed).toHaveBeenCalled();
    });
  });

  describe('notification types', () => {
    it('shows "Service" badge for service type', () => {
      const n = makeNotification({ type: 'service', title: "Service Alice's Boots" });
      render(<NotificationsPanel notifications={[n]} onDismiss={vi.fn()} onViewDismissed={vi.fn()} />);
      expect(screen.getByText('Service')).toBeInTheDocument();
    });

    it('shows "Old Gear" badge for old-gear type', () => {
      const n = makeNotification({ type: 'old-gear', title: "Check Alice's 2015 Skis" });
      render(<NotificationsPanel notifications={[n]} onDismiss={vi.fn()} onViewDismissed={vi.fn()} />);
      expect(screen.getByText('Old Gear')).toBeInTheDocument();
    });
  });
});
