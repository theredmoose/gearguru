import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { PhotoCapture } from '../PhotoCapture';
import type { GearPhoto } from '../../types';

// ── Camera / media helpers ────────────────────────────────────────────────────

const mockTrack = { stop: vi.fn() };
const mockStream = { getTracks: vi.fn(() => [mockTrack]) };
const mockGetUserMedia = vi.fn();

// Stub canvas.getContext('2d') so capturePhoto can draw
const mockDrawImage = vi.fn();
const mockCtx = { drawImage: mockDrawImage };

// ── FileReader mock ───────────────────────────────────────────────────────────
class MockFileReader {
  onload: ((e: { target: { result: string } }) => void) | null = null;
  readAsDataURL(_file: File) {
    Promise.resolve().then(() => {
      this.onload?.({ target: { result: 'data:image/jpeg;base64,uploaded' } });
    });
  }
}

describe('PhotoCapture', () => {
  const mockOnPhotosChange = vi.fn();

  const defaultProps = {
    photos: [] as GearPhoto[],
    onPhotosChange: mockOnPhotosChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockStream);
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
      configurable: true,
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,captured');
    vi.stubGlobal('FileReader', MockFileReader);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Take')).toBeInTheDocument();
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

    it('shows Replace button when active slot has an existing photo', () => {
      const photos = [{
        id: 'photo-1',
        type: 'fullView' as const,
        url: 'data:image/jpeg;base64,test',
        createdAt: new Date().toISOString(),
      }];
      render(<PhotoCapture {...defaultProps} photos={photos} />);
      // Click the slot that has a photo to make it active
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]); // Click the fullView slot
      expect(screen.getByText('Replace')).toBeInTheDocument();
    });
  });

  // ============================================
  // ADDITIONAL PHOTOS
  // ============================================
  describe('additional photos section', () => {
    it('shows additional photos section when other type photos exist', () => {
      const photos = [{
        id: 'photo-extra',
        type: 'other' as const,
        url: 'data:image/jpeg;base64,other',
        createdAt: new Date().toISOString(),
      }];
      render(<PhotoCapture {...defaultProps} photos={photos} />);
      expect(screen.getByText('Additional Photos')).toBeInTheDocument();
    });

    it('renders additional photo image', () => {
      const photos = [{
        id: 'photo-extra',
        type: 'other' as const,
        url: 'data:image/jpeg;base64,other',
        createdAt: new Date().toISOString(),
      }];
      render(<PhotoCapture {...defaultProps} photos={photos} />);
      const img = document.querySelector('.additional-photo img');
      expect(img).toBeInTheDocument();
    });

    it('shows remove button for additional photo when not disabled', () => {
      const photos = [{
        id: 'photo-extra',
        type: 'other' as const,
        url: 'data:image/jpeg;base64,other',
        createdAt: new Date().toISOString(),
      }];
      render(<PhotoCapture {...defaultProps} photos={photos} />);
      const removeButtons = document.querySelectorAll('.additional-photo .photo-remove');
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('removes additional photo when remove button clicked', () => {
      const photos = [{
        id: 'photo-extra',
        type: 'other' as const,
        url: 'data:image/jpeg;base64,other',
        createdAt: new Date().toISOString(),
      }];
      render(<PhotoCapture {...defaultProps} photos={photos} />);
      const removeBtn = document.querySelector('.additional-photo .photo-remove')!;
      fireEvent.click(removeBtn);
      expect(mockOnPhotosChange).toHaveBeenCalledWith([]);
    });
  });

  // ============================================
  // SLOT DESELECTION
  // ============================================
  describe('slot deselection', () => {
    it('deselects slot when same slot is clicked again', () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      // First click — activates
      fireEvent.click(slots[0]);
      expect(slots[0]).toHaveClass('active');
      // Second click — deactivates
      fireEvent.click(slots[0]);
      expect(slots[0]).not.toHaveClass('active');
    });

    it('does not activate slot when disabled', () => {
      render(<PhotoCapture {...defaultProps} disabled />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);
      expect(slots[0]).not.toHaveClass('active');
    });
  });

  // ============================================
  // UPLOAD BUTTON
  // ============================================
  describe('upload flow', () => {
    it('Upload button triggers file input click', () => {
      render(<PhotoCapture {...defaultProps} />);
      // Activate Full View slot
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.click(screen.getByText('Upload'));
      expect(clickSpy).toHaveBeenCalled();
    });

    it('processes selected file and calls onPhotosChange', async () => {
      render(<PhotoCapture {...defaultProps} />);
      // Activate slot
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);
      fireEvent.click(screen.getByText('Upload'));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        // wait for MockFileReader.onload to fire
        await Promise.resolve();
      });

      expect(mockOnPhotosChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'fullView', url: 'data:image/jpeg;base64,uploaded' }),
        ])
      );
    });

    it('replaces existing photo of same type', async () => {
      const existing: GearPhoto[] = [{
        id: 'old-photo',
        type: 'fullView',
        url: 'data:image/jpeg;base64,old',
        createdAt: new Date().toISOString(),
      }];
      render(<PhotoCapture {...defaultProps} photos={existing} />);
      // Activate slot and click Replace
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);
      fireEvent.click(screen.getByText('Replace'));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['data'], 'new.jpg', { type: 'image/jpeg' });
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await Promise.resolve();
      });

      const updated = mockOnPhotosChange.mock.calls.at(-1)?.[0] as GearPhoto[];
      expect(updated).toHaveLength(1);
      expect(updated[0].url).toBe('data:image/jpeg;base64,uploaded');
    });

    it('handleFileSelect returns early if no file selected', async () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [] } });
        await Promise.resolve();
      });
      expect(mockOnPhotosChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // CAMERA FLOW
  // ============================================
  describe('camera flow', () => {
    it('shows camera UI after Take button clicked (getUserMedia succeeds)', async () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);

      await act(async () => {
        fireEvent.click(screen.getByText('Take'));
        await Promise.resolve();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({ video: expect.anything() })
      );
      expect(document.querySelector('.photo-capture-camera')).toBeInTheDocument();
    });

    it('displays the active photo type name in camera hint', async () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[1]); // Label slot

      await act(async () => {
        fireEvent.click(screen.getByText('Take'));
        await Promise.resolve();
      });

      expect(screen.getByText(/Taking Label photo/)).toBeInTheDocument();
    });

    it('Cancel button stops camera and returns to main UI', async () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);

      await act(async () => {
        fireEvent.click(screen.getByText('Take'));
        await Promise.resolve();
      });

      expect(document.querySelector('.photo-capture-camera')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));

      expect(document.querySelector('.photo-capture-camera')).not.toBeInTheDocument();
      expect(document.querySelector('.photo-capture')).toBeInTheDocument();
      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('Capture button takes photo and exits camera', async () => {
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);

      await act(async () => {
        fireEvent.click(screen.getByText('Take'));
        await Promise.resolve();
      });

      const captureBtn = document.querySelector('.btn-capture') as HTMLElement;
      fireEvent.click(captureBtn);

      await waitFor(() => {
        expect(document.querySelector('.photo-capture-camera')).not.toBeInTheDocument();
      });
      expect(mockOnPhotosChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'fullView', url: 'data:image/jpeg;base64,captured' }),
        ])
      );
    });

    it('falls back to file input when getUserMedia fails', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
      render(<PhotoCapture {...defaultProps} />);
      const slots = document.querySelectorAll('.photo-slot');
      fireEvent.click(slots[0]);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      await act(async () => {
        fireEvent.click(screen.getByText('Take'));
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(clickSpy).toHaveBeenCalled();
      // Should not enter camera mode
      expect(document.querySelector('.photo-capture-camera')).not.toBeInTheDocument();
    });
  });
});
