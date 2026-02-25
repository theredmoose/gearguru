import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditMeasurementEntryScreen } from '../EditMeasurementEntryScreen';
import { createFamilyMember, createMeasurementEntry } from '@tests/fixtures/familyMembers';

vi.mock('../../services/firebase', () => ({
  addMeasurementEntry: vi.fn().mockResolvedValue(undefined),
  updateMeasurementEntry: vi.fn().mockResolvedValue(undefined),
}));

import { addMeasurementEntry, updateMeasurementEntry } from '../../services/firebase';

const member = createFamilyMember();

const defaultAddProps = {
  member,
  entry: null,
  onBack: vi.fn(),
  onSaved: vi.fn(),
};

const existingEntry = createMeasurementEntry({
  id: 'entry-edit-1',
  recordedAt: '2025-06-01T12:00:00.000Z',
  height: 142,
  weight: 38,
  footLengthLeft: 22,
  footLengthRight: 22.5,
});

function fillRequiredFields(
  height = 142,
  weight = 38,
  footL = 22,
  footR = 22.5
) {
  fireEvent.change(screen.getByLabelText('Height (cm)'), {
    target: { value: String(height) },
  });
  fireEvent.change(screen.getByLabelText('Weight (kg)'), {
    target: { value: String(weight) },
  });
  fireEvent.change(screen.getByLabelText('Foot L (cm)'), {
    target: { value: String(footL) },
  });
  fireEvent.change(screen.getByLabelText('Foot R (cm)'), {
    target: { value: String(footR) },
  });
}

describe('EditMeasurementEntryScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // ADD MODE (entry = null)
  // ============================================
  describe('add mode', () => {
    it('shows "Add Measurement" title', () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      expect(screen.getByText('Add Measurement')).toBeInTheDocument();
    });

    it('defaults date to today', () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      const today = new Date().toISOString().slice(0, 10);
      expect(screen.getByLabelText('Date')).toHaveValue(today);
    });

    it('starts with empty numeric fields', () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      // Number inputs with value='' give null from toHaveValue
      expect(screen.getByLabelText('Height (cm)')).toHaveValue(null);
      expect(screen.getByLabelText('Weight (kg)')).toHaveValue(null);
    });

    it('renders all optional fields', () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      expect(screen.getByLabelText('Arm Length (cm)')).toBeInTheDocument();
      expect(screen.getByLabelText('Inseam (cm)')).toBeInTheDocument();
      expect(screen.getByLabelText('Head Circ. (cm)')).toBeInTheDocument();
      expect(screen.getByLabelText('Hand Size (cm)')).toBeInTheDocument();
    });

    // ── Validation ─────────────────────────────────────────────────
    describe('validation', () => {
      it('shows error when date is cleared', async () => {
        render(<EditMeasurementEntryScreen {...defaultAddProps} />);
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '' } });
        fillRequiredFields();
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        await waitFor(() => {
          expect(screen.getByText('Date is required')).toBeInTheDocument();
        });
        expect(addMeasurementEntry).not.toHaveBeenCalled();
      });

      it('shows error when height is zero', async () => {
        render(<EditMeasurementEntryScreen {...defaultAddProps} />);
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        await waitFor(() => {
          expect(
            screen.getByText('Height must be greater than 0')
          ).toBeInTheDocument();
        });
        expect(addMeasurementEntry).not.toHaveBeenCalled();
      });

      it('shows error when weight is zero', async () => {
        render(<EditMeasurementEntryScreen {...defaultAddProps} />);
        fireEvent.change(screen.getByLabelText('Height (cm)'), {
          target: { value: '142' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        await waitFor(() => {
          expect(
            screen.getByText('Weight must be greater than 0')
          ).toBeInTheDocument();
        });
      });

      it('shows error when left foot length is zero', async () => {
        render(<EditMeasurementEntryScreen {...defaultAddProps} />);
        fireEvent.change(screen.getByLabelText('Height (cm)'), {
          target: { value: '142' },
        });
        fireEvent.change(screen.getByLabelText('Weight (kg)'), {
          target: { value: '38' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        await waitFor(() => {
          expect(
            screen.getByText('Left foot length is required')
          ).toBeInTheDocument();
        });
      });

      it('shows error when right foot length is zero', async () => {
        render(<EditMeasurementEntryScreen {...defaultAddProps} />);
        fireEvent.change(screen.getByLabelText('Height (cm)'), {
          target: { value: '142' },
        });
        fireEvent.change(screen.getByLabelText('Weight (kg)'), {
          target: { value: '38' },
        });
        fireEvent.change(screen.getByLabelText('Foot L (cm)'), {
          target: { value: '22' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        await waitFor(() => {
          expect(
            screen.getByText('Right foot length is required')
          ).toBeInTheDocument();
        });
      });
    });

    // ── Successful submission ───────────────────────────────────────
    it('calls addMeasurementEntry with required fields and calls onSaved', async () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      fillRequiredFields(142, 38, 22, 22.5);
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(addMeasurementEntry).toHaveBeenCalledWith(
          member.id,
          expect.objectContaining({
            height: 142,
            weight: 38,
            footLengthLeft: 22,
            footLengthRight: 22.5,
          })
        );
        expect(defaultAddProps.onSaved).toHaveBeenCalled();
      });
    });

    it('includes optional fields in the new entry when provided', async () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      fillRequiredFields();
      fireEvent.change(screen.getByLabelText('Arm Length (cm)'), {
        target: { value: '65' },
      });
      fireEvent.change(screen.getByLabelText('Inseam (cm)'), {
        target: { value: '80' },
      });
      fireEvent.change(screen.getByLabelText('Head Circ. (cm)'), {
        target: { value: '56' },
      });
      fireEvent.change(screen.getByLabelText('Hand Size (cm)'), {
        target: { value: '19' },
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(addMeasurementEntry).toHaveBeenCalledWith(
          member.id,
          expect.objectContaining({
            armLength: 65,
            inseam: 80,
            headCircumference: 56,
            handSize: 19,
          })
        );
      });
    });

    it('includes foot width and shoe sizes when provided', async () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      fillRequiredFields();
      fireEvent.change(screen.getByLabelText('Foot W L (cm)'), {
        target: { value: '9.5' },
      });
      fireEvent.change(screen.getByLabelText('Foot W R (cm)'), {
        target: { value: '9.6' },
      });
      fireEvent.change(screen.getByLabelText('US Shoe'), {
        target: { value: '8' },
      });
      fireEvent.change(screen.getByLabelText('EU Shoe'), {
        target: { value: '41' },
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(addMeasurementEntry).toHaveBeenCalledWith(
          member.id,
          expect.objectContaining({
            footWidthLeft: 9.5,
            footWidthRight: 9.6,
            usShoeSize: 8,
            euShoeSize: 41,
          })
        );
      });
    });

    it('omits optional fields from the entry when left blank', async () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        const call = vi.mocked(addMeasurementEntry).mock.calls[0][1];
        expect(call).not.toHaveProperty('armLength');
        expect(call).not.toHaveProperty('footWidthLeft');
        expect(call).not.toHaveProperty('usShoeSize');
      });
    });

    it('shows error message when addMeasurementEntry throws', async () => {
      vi.mocked(addMeasurementEntry).mockRejectedValueOnce(
        new Error('Network error')
      );
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      expect(defaultAddProps.onSaved).not.toHaveBeenCalled();
    });

    it('shows generic error when a non-Error is thrown', async () => {
      vi.mocked(addMeasurementEntry).mockRejectedValueOnce('unknown failure');
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText('Failed to save')).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // EDIT MODE (entry provided)
  // ============================================
  describe('edit mode', () => {
    it('shows "Edit Measurement" title', () => {
      render(
        <EditMeasurementEntryScreen {...defaultAddProps} entry={existingEntry} />
      );
      expect(screen.getByText('Edit Measurement')).toBeInTheDocument();
    });

    it('pre-fills all fields from the entry', () => {
      render(
        <EditMeasurementEntryScreen {...defaultAddProps} entry={existingEntry} />
      );
      expect(screen.getByLabelText('Height (cm)')).toHaveValue(142);
      expect(screen.getByLabelText('Weight (kg)')).toHaveValue(38);
      expect(screen.getByLabelText('Foot L (cm)')).toHaveValue(22);
      expect(screen.getByLabelText('Foot R (cm)')).toHaveValue(22.5);
    });

    it('pre-fills optional fields when entry has them', () => {
      const entryWithOptionals = createMeasurementEntry({
        id: 'entry-2',
        recordedAt: '2025-06-01T12:00:00.000Z',
        height: 150,
        weight: 40,
        footLengthLeft: 23,
        footLengthRight: 23,
        armLength: 60,
        headCircumference: 54,
      });
      render(
        <EditMeasurementEntryScreen
          {...defaultAddProps}
          entry={entryWithOptionals}
        />
      );
      expect(screen.getByLabelText('Arm Length (cm)')).toHaveValue(60);
      expect(screen.getByLabelText('Head Circ. (cm)')).toHaveValue(54);
    });

    it('pre-fills date from entry recordedAt', () => {
      render(
        <EditMeasurementEntryScreen {...defaultAddProps} entry={existingEntry} />
      );
      expect(screen.getByLabelText('Date')).toHaveValue('2025-06-01');
    });

    it('calls updateMeasurementEntry with modified values and calls onSaved', async () => {
      render(
        <EditMeasurementEntryScreen {...defaultAddProps} entry={existingEntry} />
      );
      fireEvent.change(screen.getByLabelText('Height (cm)'), {
        target: { value: '145' },
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(updateMeasurementEntry).toHaveBeenCalledWith(
          member.id,
          existingEntry.id,
          expect.objectContaining({ height: 145 })
        );
        expect(defaultAddProps.onSaved).toHaveBeenCalled();
      });
    });

    it('shows error when updateMeasurementEntry throws', async () => {
      vi.mocked(updateMeasurementEntry).mockRejectedValueOnce(
        new Error('Save failed')
      );
      render(
        <EditMeasurementEntryScreen {...defaultAddProps} entry={existingEntry} />
      );
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });

    it('passes updates including optional field when filled in', async () => {
      render(
        <EditMeasurementEntryScreen {...defaultAddProps} entry={existingEntry} />
      );
      fireEvent.change(screen.getByLabelText('Arm Length (cm)'), {
        target: { value: '65' },
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(updateMeasurementEntry).toHaveBeenCalledWith(
          member.id,
          existingEntry.id,
          expect.objectContaining({ armLength: 65 })
        );
      });
    });
  });

  // ============================================
  // NAVIGATION
  // ============================================
  describe('navigation', () => {
    it('calls onBack when Cancel is clicked', () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultAddProps.onBack).toHaveBeenCalled();
    });

    it('calls onBack from the screen header back button', () => {
      render(<EditMeasurementEntryScreen {...defaultAddProps} />);
      // ScreenHeader renders a back button
      const backButtons = screen.getAllByRole('button');
      const headerBack = backButtons.find(
        (b) => b !== screen.queryByRole('button', { name: /cancel/i }) &&
               b !== screen.queryByRole('button', { name: /save/i })
      );
      if (headerBack) {
        fireEvent.click(headerBack);
        expect(defaultAddProps.onBack).toHaveBeenCalled();
      }
    });
  });
});
