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
  });
});
