import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GearForm } from '../GearForm';
import type { GearItem } from '../../types';

// Mock PhotoCapture to avoid camera/file API dependencies
vi.mock('../PhotoCapture', () => ({
  PhotoCapture: vi.fn(({ onPhotosChange, disabled }) => (
    <div data-testid="photo-capture">
      <button
        type="button"
        onClick={() =>
          onPhotosChange([
            { id: 'p1', type: 'fullView', url: 'https://example.com/photo.jpg', createdAt: '' },
          ])
        }
        disabled={disabled}
      >
        Add Photo
      </button>
    </div>
  )),
}));

// Mock gear photo analysis service
vi.mock('../../services/gearAnalysis', () => ({
  analyzeGearPhotos: vi.fn(),
}));

describe('GearForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  const baseGearItem: GearItem = {
    id: 'gear-1',
    userId: 'user-1',
    ownerId: 'member-1',
    sport: 'nordic-classic',
    type: 'ski',
    brand: 'Fischer',
    model: 'RCS Skate',
    size: '186cm',
    year: 2022,
    condition: 'good',
    status: 'available',
    notes: 'Good condition',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultProps = {
    ownerId: 'member-1',
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  // ============================================
  // RENDERING
  // ============================================
  describe('rendering', () => {
    it('shows "Add Gear" heading for a new item', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Add Gear' })).toBeInTheDocument();
    });

    it('shows "Edit Gear" heading when item prop is provided', () => {
      render(<GearForm {...defaultProps} item={baseGearItem} />);
      expect(screen.getByRole('heading', { name: 'Edit Gear' })).toBeInTheDocument();
    });

    it('shows the Sport field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Sport')).toBeInTheDocument();
    });

    it('shows the Type field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Type')).toBeInTheDocument();
    });

    it('shows the Brand field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Brand')).toBeInTheDocument();
    });

    it('shows the Model field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Model')).toBeInTheDocument();
    });

    it('shows the Size field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Size')).toBeInTheDocument();
    });

    it('shows the Condition field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Condition')).toBeInTheDocument();
    });

    it('shows the Status field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('shows the Year optional field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Year (optional)')).toBeInTheDocument();
    });

    it('shows the Location optional field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Location (optional)')).toBeInTheDocument();
    });

    it('shows the Notes optional field', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.getByLabelText('Notes (optional)')).toBeInTheDocument();
    });

    it('pre-populates brand when editing', () => {
      render(<GearForm {...defaultProps} item={baseGearItem} />);
      expect(screen.getByDisplayValue('Fischer')).toBeInTheDocument();
    });

    it('pre-populates model when editing', () => {
      render(<GearForm {...defaultProps} item={baseGearItem} />);
      expect(screen.getByDisplayValue('RCS Skate')).toBeInTheDocument();
    });

    it('pre-populates size when editing', () => {
      render(<GearForm {...defaultProps} item={baseGearItem} />);
      expect(screen.getByDisplayValue('186cm')).toBeInTheDocument();
    });

    it('pre-populates year when editing', () => {
      render(<GearForm {...defaultProps} item={baseGearItem} />);
      expect(screen.getByDisplayValue('2022')).toBeInTheDocument();
    });
  });

  // ============================================
  // ALPINE SKI EXTENDED DETAILS
  // ============================================
  describe('alpine ski extended details', () => {
    it('shows ski specifications section when sport=alpine and type=ski', () => {
      render(<GearForm {...defaultProps} />);
      // Default state is sport=alpine, type=ski
      expect(screen.getByText('Ski Specifications')).toBeInTheDocument();
    });

    it('hides ski specifications section when type is changed to boot', () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'boot' } });
      expect(screen.queryByText('Ski Specifications')).not.toBeInTheDocument();
    });

    it('hides ski specifications section when sport is changed to nordic', () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Sport'), { target: { value: 'nordic-classic' } });
      expect(screen.queryByText('Ski Specifications')).not.toBeInTheDocument();
    });

    it('shows ski specifications when editing an alpine ski', () => {
      const alpineSkiItem: GearItem = { ...baseGearItem, sport: 'alpine', type: 'ski' };
      render(<GearForm {...defaultProps} item={alpineSkiItem} />);
      expect(screen.getByText('Ski Specifications')).toBeInTheDocument();
    });

    it('does not show ski specifications for non-alpine sport', () => {
      const nordicSkiItem: GearItem = { ...baseGearItem, sport: 'nordic-classic', type: 'ski' };
      render(<GearForm {...defaultProps} item={nordicSkiItem} />);
      expect(screen.queryByText('Ski Specifications')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // PHOTO SECTION
  // ============================================
  describe('photo section', () => {
    it('hides the analyze button when no photos exist', () => {
      render(<GearForm {...defaultProps} />);
      expect(screen.queryByText('Analyze Photos & Auto-Fill')).not.toBeInTheDocument();
    });

    it('shows the analyze button after photos are added', () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.click(screen.getByText('Add Photo'));
      expect(screen.getByText('Analyze Photos & Auto-Fill')).toBeInTheDocument();
    });
  });

  // ============================================
  // VALIDATION
  // ============================================
  describe('validation', () => {
    it('shows an error when submitting with empty brand', async () => {
      render(<GearForm {...defaultProps} />);
      // Use whitespace to pass HTML required constraint while failing JS .trim() validation
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Some Model' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      expect(await screen.findByText('Brand, model, and size are required.')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows an error when submitting with empty model', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      expect(await screen.findByText('Brand, model, and size are required.')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows an error when submitting with empty size', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '   ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      expect(await screen.findByText('Brand, model, and size are required.')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // SUBMIT
  // ============================================
  describe('submit', () => {
    it('calls onSubmit with correct data on valid form submission', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            ownerId: 'member-1',
            brand: 'Atomic',
            model: 'Redster',
            size: '170',
          })
        )
      );
    });

    it('includes optional year in submission when provided', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.change(screen.getByLabelText('Year (optional)'), { target: { value: '2023' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ year: 2023 })
        )
      );
    });

    it('excludes year from submission when empty', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ year: undefined })
        )
      );
    });

    it('shows "Saving..." on the submit button while submitting', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      expect(await screen.findByText('Saving...')).toBeInTheDocument();
    });

    it('shows "Update" button text when editing an existing item', () => {
      render(<GearForm {...defaultProps} item={baseGearItem} />);
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('shows submit error when onSubmit rejects', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Network failure'));
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      expect(await screen.findByText('Network failure')).toBeInTheDocument();
    });
  });

  // ============================================
  // CHECKED OUT TO FIELD
  // ============================================
  describe('checked out to field', () => {
    it('shows "Checked Out To" field when status is checked-out', () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'checked-out' } });
      expect(screen.getByLabelText('Checked Out To')).toBeInTheDocument();
    });

    it('hides "Checked Out To" when status changes back to available', () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'checked-out' } });
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'available' } });
      expect(screen.queryByLabelText('Checked Out To')).not.toBeInTheDocument();
    });

    it('includes checkedOutTo in submission when status is checked-out', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'checked-out' } });
      fireEvent.change(screen.getByLabelText('Checked Out To'), { target: { value: 'Bob' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'checked-out', checkedOutTo: 'Bob' })
        )
      );
    });
  });

  // ============================================
  // NOTES
  // ============================================
  describe('notes field', () => {
    it('includes notes in submission when entered', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.change(screen.getByLabelText('Notes (optional)'), { target: { value: 'Needs wax' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ notes: 'Needs wax' })
        )
      );
    });

    it('omits notes from submission when empty', async () => {
      render(<GearForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ notes: undefined })
        )
      );
    });
  });

  // ============================================
  // SKI SPECIFICATIONS SUBMISSION
  // ============================================
  describe('alpine ski specs submission', () => {
    it('includes extendedDetails with profile/radius/bindings on submit', async () => {
      render(<GearForm {...defaultProps} />);
      // Default is alpine/ski, so ski specs section is shown
      fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Fischer' } });
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Ranger' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: '178' } });
      // Fill profile fields (by placeholder)
      fireEvent.change(screen.getByPlaceholderText('Tip'), { target: { value: '123' } });
      fireEvent.change(screen.getByPlaceholderText('Waist'), { target: { value: '75' } });
      fireEvent.change(screen.getByPlaceholderText('Tail'), { target: { value: '108' } });
      fireEvent.change(screen.getByLabelText('Turn Radius (R value in meters)'), { target: { value: '16.5' } });
      fireEvent.change(screen.getByLabelText('Binding Brand'), { target: { value: 'Marker' } });
      fireEvent.change(screen.getByLabelText('Binding Model'), { target: { value: 'Griffon' } });
      fireEvent.change(screen.getByLabelText('DIN Range'), { target: { value: '4-13' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            extendedDetails: expect.objectContaining({
              type: 'alpineSki',
              details: expect.objectContaining({
                profile: { tip: 123, waist: 75, tail: 108 },
                radiusM: 16.5,
                bindings: expect.objectContaining({ brand: 'Marker', model: 'Griffon' }),
              }),
            }),
          })
        )
      );
    });
  });

  // ============================================
  // PHOTO ANALYSIS
  // ============================================
  describe('photo analysis', () => {
    it('auto-fills brand and model after successful analysis', async () => {
      const { analyzeGearPhotos } = await import('../../services/gearAnalysis');
      vi.mocked(analyzeGearPhotos).mockResolvedValue({
        brand: 'Fischer',
        model: 'Crown Eboard',
        size: '186cm',
        year: 2023,
        condition: 'good',
        notes: ['Detected from label photo'],
        confidence: 0.9,
      } as any);

      render(<GearForm {...defaultProps} />);
      fireEvent.click(screen.getByText('Add Photo'));
      fireEvent.click(screen.getByText('Analyze Photos & Auto-Fill'));

      await waitFor(() => expect(screen.getByDisplayValue('Fischer')).toBeInTheDocument());
      expect(screen.getByDisplayValue('Crown Eboard')).toBeInTheDocument();
    });

    it('shows analysis notes and confidence after analysis', async () => {
      const { analyzeGearPhotos } = await import('../../services/gearAnalysis');
      vi.mocked(analyzeGearPhotos).mockResolvedValue({
        brand: 'Atomic',
        model: 'Redster',
        size: '170',
        year: 2022,
        condition: 'good',
        notes: ['Detected brand from label'],
        confidence: 0.85,
      } as any);

      render(<GearForm {...defaultProps} />);
      fireEvent.click(screen.getByText('Add Photo'));
      fireEvent.click(screen.getByText('Analyze Photos & Auto-Fill'));

      await waitFor(() =>
        expect(screen.getByText(/85% confidence/i)).toBeInTheDocument()
      );
      expect(screen.getByText('Detected brand from label')).toBeInTheDocument();
    });

    it('shows error message when analysis fails', async () => {
      const { analyzeGearPhotos } = await import('../../services/gearAnalysis');
      vi.mocked(analyzeGearPhotos).mockRejectedValue(new Error('Analysis failed'));

      render(<GearForm {...defaultProps} />);
      fireEvent.click(screen.getByText('Add Photo'));
      fireEvent.click(screen.getByText('Analyze Photos & Auto-Fill'));

      await waitFor(() =>
        expect(screen.getByText('Analysis failed')).toBeInTheDocument()
      );
    });

    it('populates ski spec fields when analysis returns alpineSki extendedDetails', async () => {
      const { analyzeGearPhotos } = await import('../../services/gearAnalysis');
      vi.mocked(analyzeGearPhotos).mockResolvedValue({
        brand: 'Fischer',
        model: 'Ranger 98',
        size: '178',
        year: 2023,
        condition: 'good',
        notes: [],
        confidence: 0.9,
        extendedDetails: {
          type: 'alpineSki',
          details: {
            lengthCm: 178,
            profile: { tip: 123, waist: 75, tail: 108 },
            radiusM: 16.5,
            bindings: { brand: 'Marker', model: 'Griffon 13', dinRange: '4-13' },
          },
        },
      } as any);

      render(<GearForm {...defaultProps} />);
      fireEvent.click(screen.getByText('Add Photo'));
      fireEvent.click(screen.getByText('Analyze Photos & Auto-Fill'));

      await waitFor(() => expect(screen.getByDisplayValue('Fischer')).toBeInTheDocument());
      expect((screen.getByPlaceholderText('Tip') as HTMLInputElement).value).toBe('123');
      expect((screen.getByPlaceholderText('Waist') as HTMLInputElement).value).toBe('75');
      expect(screen.getByDisplayValue('Marker')).toBeInTheDocument();
    });
  });
});
