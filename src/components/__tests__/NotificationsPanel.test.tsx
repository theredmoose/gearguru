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

    it('renders notification title and body', () => {
      render(<NotificationsPanel {...defaultProps} />);
      expect(screen.getByText("Replace Alice's Skis")).toBeInTheDocument();
      expect(screen.getByText(/worn out/i)).toBeInTheDocument();
    });

    it('shows "View dismissed" link', () => {
      render(<NotificationsPanel {...defaultProps} />);
      expect(screen.getByText('View dismissed')).toBeInTheDocument();
    });

    it('renders multiple notifications as separate bubbles', () => {
      const notifications = [
        makeNotification({ id: 'n1' }),
        makeNotification({ id: 'n2', title: 'Second notification' }),
      ];
      render(<NotificationsPanel notifications={notifications} onDismiss={vi.fn()} onViewDismissed={vi.fn()} />);
      expect(screen.getByText("Replace Alice's Skis")).toBeInTheDocument();
      expect(screen.getByText('Second notification')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onDismiss with notification id when X is clicked', () => {
      const onDismiss = vi.fn();
      render(<NotificationsPanel {...defaultProps} onDismiss={onDismiss} />);
      fireEvent.click(screen.getByRole('button', { name: /dismiss: Replace Alice's Skis/i }));
      expect(onDismiss).toHaveBeenCalledWith('worn-gear-1');
    });

    it('calls onViewDismissed when "View dismissed" is clicked', () => {
      const onViewDismissed = vi.fn();
      render(<NotificationsPanel {...defaultProps} onViewDismissed={onViewDismissed} />);
      fireEvent.click(screen.getByText('View dismissed'));
      expect(onViewDismissed).toHaveBeenCalled();
    });
  });
});
