import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoCapture } from '../PhotoCapture';
import type { GearPhoto } from '../../types';

describe('PhotoCapture', () => {
  const mockOnPhotosChange = vi.fn();

  const defaultProps = {
    photos: [] as GearPhoto[],
    onPhotosChange: mockOnPhotosChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // INITIAL RENDERING
  // ============================================
  describe('initial rendering', () => {
    it('renders three photo slots', () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      expect(slots).toHaveLength(3);
    });

    it('displays Full View slot', () => {
      render(<PhotoCapture {...defaultProps} />);
      expect(screen.getByText('Full View')).toBeInTheDocument();
    });

    it('displays Label slot', () => {
      render(<PhotoCapture {...defaultProps} />);
      expect(screen.getByText('Label')).toBeInTheDocument();
    });

    it('displays Other slot', () => {
      render(<PhotoCapture {...defaultProps} />);
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('shows upload and take photo buttons when slot is clicked', () => {
      render(<PhotoCapture {...defaultProps} />);
      fireEvent.click(screen.getByText('Full View'));
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
    });

    it('shows placeholder descriptions', () => {
      render(<PhotoCapture {...defaultProps} />);
      expect(screen.getByText('Full photo of the gear')).toBeInTheDocument();
      expect(screen.getByText('Photo of the label/specs')).toBeInTheDocument();
    });
  });

  // ============================================
  // WITH EXISTING PHOTOS
  // ============================================
  describe('with existing photos', () => {
    const photosWithFullView: GearPhoto[] = [
      {
        id: 'photo-1',
        type: 'fullView',
        url: 'data:image/jpeg;base64,test123',
        createdAt: new Date().toISOString(),
      },
    ];

    it('displays photo preview when photo exists', () => {
      render(<PhotoCapture {...defaultProps} photos={photosWithFullView} />);
      const img = document.querySelector('.photo-preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,test123');
    });

    it('shows photo type badge on existing photo', () => {
      render(<PhotoCapture {...defaultProps} photos={photosWithFullView} />);
      expect(screen.getByText('Full View')).toBeInTheDocument();
    });

    it('shows remove button on hover for existing photo', () => {
      render(<PhotoCapture {...defaultProps} photos={photosWithFullView} />);
      const removeButtons = document.querySelectorAll('.photo-remove');
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('marks slot as has-photo when photo exists', () => {
      render(<PhotoCapture {...defaultProps} photos={photosWithFullView} />);
      const slots = document.querySelectorAll('.photo-slot.has-photo');
      expect(slots).toHaveLength(1);
    });
  });

  // ============================================
  // PHOTO REMOVAL
  // ============================================
  describe('photo removal', () => {
    const photosWithFullView: GearPhoto[] = [
      {
        id: 'photo-1',
        type: 'fullView',
        url: 'data:image/jpeg;base64,test123',
        createdAt: new Date().toISOString(),
      },
    ];

    it('calls onPhotosChange when remove button clicked', () => {
      render(<PhotoCapture {...defaultProps} photos={photosWithFullView} />);
      const removeButton = document.querySelector('.photo-remove');
      expect(removeButton).toBeInTheDocument();
      fireEvent.click(removeButton!);
      expect(mockOnPhotosChange).toHaveBeenCalledWith([]);
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================
  describe('disabled state', () => {
    it('hides action buttons when disabled', () => {
      render(<PhotoCapture {...defaultProps} disabled />);
      expect(screen.queryByText('Upload Photo')).not.toBeInTheDocument();
      expect(screen.queryByText('Take Photo')).not.toBeInTheDocument();
    });

    it('hides remove buttons when disabled', () => {
      const photos: GearPhoto[] = [
        {
          id: 'photo-1',
          type: 'fullView',
          url: 'data:image/jpeg;base64,test123',
          createdAt: new Date().toISOString(),
        },
      ];
      render(<PhotoCapture {...defaultProps} photos={photos} disabled />);
      const removeButtons = document.querySelectorAll('.photo-remove');
      expect(removeButtons).toHaveLength(0);
    });
  });

  // ============================================
  // MULTIPLE PHOTOS
  // ============================================
  describe('multiple photos', () => {
    const multiplePhotos: GearPhoto[] = [
      {
        id: 'photo-1',
        type: 'fullView',
        url: 'data:image/jpeg;base64,full',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'photo-2',
        type: 'labelView',
        url: 'data:image/jpeg;base64,label',
        createdAt: new Date().toISOString(),
      },
    ];

    it('displays multiple photos in their respective slots', () => {
      render(<PhotoCapture {...defaultProps} photos={multiplePhotos} />);
      const photoSlots = document.querySelectorAll('.photo-slot.has-photo');
      expect(photoSlots).toHaveLength(2);
    });

    it('shows correct images for each slot', () => {
      render(<PhotoCapture {...defaultProps} photos={multiplePhotos} />);
      const images = document.querySelectorAll('.photo-preview');
      expect(images).toHaveLength(2);
    });
  });

  // ============================================
  // SLOT INTERACTION
  // ============================================
  describe('slot interaction', () => {
    it('makes clicked slot active', () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[1]); // Click Label slot
      expect(slots[1]).toHaveClass('active');
    });
  });
});
