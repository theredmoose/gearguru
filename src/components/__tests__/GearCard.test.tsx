import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearCard } from '../GearCard';
import type { GearItem, GearPhoto } from '../../types';

describe('GearCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const baseGearItem: GearItem = {
    id: 'gear-1',
    ownerId: 'member-1',
    sport: 'alpine',
    type: 'ski',
    brand: 'Atomic',
    model: 'Redster X9',
    size: '170cm',
    year: 2023,
    condition: 'good',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultProps = {
    item: baseGearItem,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  // ============================================
  // BASIC RENDERING
  // ============================================
  describe('basic rendering', () => {
    it('displays gear type label', () => {
      render(<GearCard {...defaultProps} />);
      expect(screen.getByText('Skis')).toBeInTheDocument();
    });

    it('displays brand and model', () => {
      render(<GearCard {...defaultProps} />);
      expect(screen.getByText('Atomic Redster X9')).toBeInTheDocument();
    });

    it('displays size', () => {
      render(<GearCard {...defaultProps} />);
      expect(screen.getByText('Size: 170cm')).toBeInTheDocument();
    });

    it('displays year when provided', () => {
      render(<GearCard {...defaultProps} />);
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('displays condition badge', () => {
      render(<GearCard {...defaultProps} />);
      expect(screen.getByText('good')).toBeInTheDocument();
    });

    it('displays sport label', () => {
      render(<GearCard {...defaultProps} />);
      expect(screen.getByText('Alpine')).toBeInTheDocument();
    });
  });

  // ============================================
  // CONDITION COLORS
  // ============================================
  describe('condition colors', () => {
    it('shows green for new condition', () => {
      const item = { ...baseGearItem, condition: 'new' as const };
      render(<GearCard {...defaultProps} item={item} />);
      const badge = screen.getByText('new');
      expect(badge).toHaveStyle({ backgroundColor: '#22c55e' });
    });

    it('shows blue for good condition', () => {
      render(<GearCard {...defaultProps} />);
      const badge = screen.getByText('good');
      expect(badge).toHaveStyle({ backgroundColor: '#3b82f6' });
    });

    it('shows amber for fair condition', () => {
      const item = { ...baseGearItem, condition: 'fair' as const };
      render(<GearCard {...defaultProps} item={item} />);
      const badge = screen.getByText('fair');
      expect(badge).toHaveStyle({ backgroundColor: '#f59e0b' });
    });

    it('shows red for worn condition', () => {
      const item = { ...baseGearItem, condition: 'worn' as const };
      render(<GearCard {...defaultProps} item={item} />);
      const badge = screen.getByText('worn');
      expect(badge).toHaveStyle({ backgroundColor: '#ef4444' });
    });
  });

  // ============================================
  // PHOTO DISPLAY
  // ============================================
  describe('photo display', () => {
    const photoItem: GearItem = {
      ...baseGearItem,
      photos: [
        {
          id: 'photo-1',
          type: 'fullView',
          url: 'https://example.com/ski-full.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    it('displays photo thumbnail when photo exists', () => {
      render(<GearCard {...defaultProps} item={photoItem} />);
      const photoContainer = document.querySelector('.gear-card-photo');
      expect(photoContainer).toBeInTheDocument();
    });

    it('displays photo image with correct src', () => {
      render(<GearCard {...defaultProps} item={photoItem} />);
      const img = document.querySelector('.gear-card-photo img');
      expect(img).toHaveAttribute('src', 'https://example.com/ski-full.jpg');
    });

    it('does not show photo container when no photos', () => {
      render(<GearCard {...defaultProps} />);
      const photoContainer = document.querySelector('.gear-card-photo');
      expect(photoContainer).not.toBeInTheDocument();
    });

    it('prefers fullView photo over labelView', () => {
      const multiPhotoItem: GearItem = {
        ...baseGearItem,
        photos: [
          {
            id: 'photo-1',
            type: 'labelView',
            url: 'https://example.com/label.jpg',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'photo-2',
            type: 'fullView',
            url: 'https://example.com/full.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      render(<GearCard {...defaultProps} item={multiPhotoItem} />);
      const img = document.querySelector('.gear-card-photo img');
      expect(img).toHaveAttribute('src', 'https://example.com/full.jpg');
    });

    it('shows photo count badge when multiple photos', () => {
      const multiPhotoItem: GearItem = {
        ...baseGearItem,
        photos: [
          { id: 'p1', type: 'fullView', url: 'url1', createdAt: '' },
          { id: 'p2', type: 'labelView', url: 'url2', createdAt: '' },
          { id: 'p3', type: 'other', url: 'url3', createdAt: '' },
        ],
      };
      render(<GearCard {...defaultProps} item={multiPhotoItem} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('does not show photo count for single photo', () => {
      render(<GearCard {...defaultProps} item={photoItem} />);
      const countBadge = document.querySelector('.photo-count');
      expect(countBadge).not.toBeInTheDocument();
    });
  });

  // ============================================
  // EXTENDED DETAILS
  // ============================================
  describe('extended details', () => {
    const extendedItem: GearItem = {
      ...baseGearItem,
      extendedDetails: {
        type: 'alpineSki',
        details: {
          lengthCm: 170,
          profile: { tip: 121, waist: 68, tail: 103 },
          radiusM: 15.5,
          bindings: {
            brand: 'Marker',
            model: 'Griffon 13',
            dinRange: '4-13',
          },
        },
      },
    };

    it('displays profile dimensions', () => {
      render(<GearCard {...defaultProps} item={extendedItem} />);
      expect(screen.getByText('121/68/103mm')).toBeInTheDocument();
    });

    it('displays radius value', () => {
      render(<GearCard {...defaultProps} item={extendedItem} />);
      expect(screen.getByText('R15.5m')).toBeInTheDocument();
    });

    it('displays binding info', () => {
      render(<GearCard {...defaultProps} item={extendedItem} />);
      expect(screen.getByText('Marker Griffon 13')).toBeInTheDocument();
    });

    it('does not show extended details section when not present', () => {
      render(<GearCard {...defaultProps} />);
      const extendedDetails = document.querySelector('.gear-extended-details');
      expect(extendedDetails).not.toBeInTheDocument();
    });
  });

  // ============================================
  // INTERACTIONS
  // ============================================
  describe('interactions', () => {
    it('calls onEdit when card is clicked', () => {
      render(<GearCard {...defaultProps} />);
      fireEvent.click(document.querySelector('.gear-card')!);
      expect(mockOnEdit).toHaveBeenCalledWith(baseGearItem);
    });

    it('calls onEdit when edit button is clicked', () => {
      render(<GearCard {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Edit gear'));
      expect(mockOnEdit).toHaveBeenCalledWith(baseGearItem);
    });

    it('calls onDelete when delete button is clicked and confirmed', () => {
      render(<GearCard {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Delete gear'));
      expect(mockOnDelete).toHaveBeenCalledWith(baseGearItem);
    });

    it('does not call onDelete when delete is cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<GearCard {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Delete gear'));
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // OWNER DISPLAY
  // ============================================
  describe('owner display', () => {
    const members = [
      {
        id: 'member-1',
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        measurements: {
          height: 180,
          weight: 75,
          footLengthLeft: 27,
          footLengthRight: 27,
          measuredAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    it('shows owner name when showOwner is true', () => {
      render(<GearCard {...defaultProps} showOwner members={members} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows Unknown when owner not found', () => {
      render(<GearCard {...defaultProps} showOwner members={[]} />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('hides sport label when showing owner', () => {
      render(<GearCard {...defaultProps} showOwner members={members} />);
      expect(screen.queryByText('Alpine')).not.toBeInTheDocument();
    });
  });
});
