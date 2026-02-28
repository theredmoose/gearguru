import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsScreen } from '../NotificationsScreen';
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

describe('NotificationsScreen', () => {
  describe('rendering', () => {
    it('renders the header', () => {
      render(<NotificationsScreen notifications={[]} onUndismiss={vi.fn()} onBack={vi.fn()} />);
      expect(screen.getByText('Dismissed Notifications')).toBeInTheDocument();
    });

    it('shows empty state when no dismissed notifications', () => {
      render(<NotificationsScreen notifications={[]} onUndismiss={vi.fn()} onBack={vi.fn()} />);
      expect(screen.getByText('No dismissed notifications.')).toBeInTheDocument();
    });

    it('renders dismissed notification title and body', () => {
      render(
        <NotificationsScreen
          notifications={[makeNotification()]}
          onUndismiss={vi.fn()}
          onBack={vi.fn()}
        />
      );
      expect(screen.getByText("Replace Alice's Skis")).toBeInTheDocument();
      expect(screen.getByText(/worn out/i)).toBeInTheDocument();
    });

    it('shows description text when notifications are present', () => {
      render(
        <NotificationsScreen
          notifications={[makeNotification()]}
          onUndismiss={vi.fn()}
          onBack={vi.fn()}
        />
      );
      expect(screen.getByText(/restore them to show/i)).toBeInTheDocument();
    });

    it('renders a Restore button for each notification', () => {
      render(
        <NotificationsScreen
          notifications={[makeNotification(), makeNotification({ id: 'n2', title: 'Second' })]}
          onUndismiss={vi.fn()}
          onBack={vi.fn()}
        />
      );
      expect(screen.getAllByRole('button', { name: /restore notification/i })).toHaveLength(2);
    });

    it('shows type badge for each notification', () => {
      render(
        <NotificationsScreen
          notifications={[makeNotification({ type: 'service' })]}
          onUndismiss={vi.fn()}
          onBack={vi.fn()}
        />
      );
      expect(screen.getByText('Service')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onUndismiss with notification id when Restore is clicked', () => {
      const onUndismiss = vi.fn();
      render(
        <NotificationsScreen
          notifications={[makeNotification()]}
          onUndismiss={onUndismiss}
          onBack={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /restore notification: Replace Alice's Skis/i }));
      expect(onUndismiss).toHaveBeenCalledWith('worn-gear-1');
    });

    it('calls onBack when back button is clicked', () => {
      const onBack = vi.fn();
      render(<NotificationsScreen notifications={[]} onUndismiss={vi.fn()} onBack={onBack} />);
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(onBack).toHaveBeenCalled();
    });
  });
});
