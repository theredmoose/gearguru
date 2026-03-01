import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeasurementHistoryScreen } from '../MeasurementHistoryScreen';
import { createFamilyMember } from '@tests/fixtures/familyMembers';
import { createMeasurements } from '@tests/fixtures/measurements';
import type { FamilyMember, MeasurementEntry } from '../../types';

vi.mock('../../services/firebase', () => ({
  deleteMeasurementEntry: vi.fn().mockResolvedValue(undefined),
}));

import { deleteMeasurementEntry } from '../../services/firebase';

function makeEntry(overrides: Partial<MeasurementEntry> = {}): MeasurementEntry {
  return {
    id: 'entry-1',
    recordedAt: '2025-06-01T00:00:00.000Z',
    height: 140,
    weight: 35,
    footLengthLeft: 22,
    footLengthRight: 22,
    ...overrides,
  };
}

const defaultProps = {
  onBack: vi.fn(),
  onEditEntry: vi.fn(),
  onAddEntry: vi.fn(),
  onHistoryUpdated: vi.fn(),
};

describe('MeasurementHistoryScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the member name in the header', () => {
      const member = createFamilyMember({ name: 'Alice' });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      expect(screen.getByText(/History — Alice/i)).toBeInTheDocument();
    });

    it('shows a bootstrapped entry when history is empty', () => {
      const member = createFamilyMember({
        measurements: createMeasurements({
          measuredAt: '2025-01-15T00:00:00.000Z',
          height: 142,
          weight: 38,
        }),
        measurementHistory: undefined,
      });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      // Height from current measurements
      expect(screen.getByText('142 cm')).toBeInTheDocument();
    });

    it('shows empty state when history is explicitly empty array', () => {
      const member = createFamilyMember({ measurementHistory: [] });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      // Bootstrapped entry from current measurements
      expect(screen.getByText(`${member.measurements.height} cm`)).toBeInTheDocument();
    });

    it('renders entries newest first', () => {
      const member = createFamilyMember({
        measurementHistory: [
          makeEntry({ id: 'e1', recordedAt: '2025-01-01T00:00:00.000Z', height: 130 }),
          makeEntry({ id: 'e2', recordedAt: '2025-06-01T00:00:00.000Z', height: 133 }),
        ],
      });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      const h133 = screen.getByText('133 cm');
      const h130 = screen.getByText('130 cm');
      // h133 (newer) should appear before h130 (older) in the DOM
      expect(
        h133.compareDocumentPosition(h130) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('shows Edit and Delete buttons for real entries', () => {
      const member = createFamilyMember({
        measurementHistory: [makeEntry()],
      });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      expect(screen.getByRole('button', { name: /edit entry/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete entry/i })).toBeInTheDocument();
    });

    it('does not show Edit/Delete for bootstrapped entry', () => {
      const member = createFamilyMember({ measurementHistory: undefined });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      expect(screen.queryByRole('button', { name: /edit entry/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete entry/i })).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onEditEntry with the correct entry when Edit is clicked', () => {
      const entry = makeEntry({ id: 'e1' });
      const member = createFamilyMember({ measurementHistory: [entry] });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /edit entry/i }));
      expect(defaultProps.onEditEntry).toHaveBeenCalledWith(entry);
    });

    it('calls onAddEntry when + button is clicked', () => {
      const member = createFamilyMember({ measurementHistory: [] });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /add entry/i }));
      expect(defaultProps.onAddEntry).toHaveBeenCalled();
    });

    it('calls onBack when back button is clicked', () => {
      const member = createFamilyMember();
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /go back/i }));
      expect(defaultProps.onBack).toHaveBeenCalled();
    });

    it('calls deleteMeasurementEntry and onHistoryUpdated when Delete confirmed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
      const entry = makeEntry({ id: 'e1' });
      const member: FamilyMember = createFamilyMember({ measurementHistory: [entry] });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /delete entry/i }));
      await waitFor(() => {
        expect(vi.mocked(deleteMeasurementEntry)).toHaveBeenCalledWith(member.id, 'e1');
        expect(defaultProps.onHistoryUpdated).toHaveBeenCalled();
      });
    });

    it('does NOT delete when confirm is cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
      const entry = makeEntry({ id: 'e1' });
      const member = createFamilyMember({ measurementHistory: [entry] });
      render(<MeasurementHistoryScreen member={member} {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /delete entry/i }));
      await waitFor(() => {
        expect(vi.mocked(deleteMeasurementEntry)).not.toHaveBeenCalled();
      });
    });
  });
});
