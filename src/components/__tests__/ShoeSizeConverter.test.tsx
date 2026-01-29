import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoeSizeConverter } from '../ShoeSizeConverter';

describe('ShoeSizeConverter', () => {
  const defaultProps = {
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING
  // ============================================
  describe('rendering', () => {
    it('displays header with back button', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByText('Size Converter')).toBeInTheDocument();
    });

    it('displays input field and system selector', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      expect(screen.getByPlaceholderText(/enter size/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays equivalent sizes section', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      expect(screen.getByText('Equivalent Sizes')).toBeInTheDocument();
    });

    it('displays note about approximate sizing', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      expect(screen.getByText(/sizes are approximate/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // INITIAL VALUES
  // ============================================
  describe('initial values', () => {
    it('pre-fills with foot length when provided', () => {
      render(<ShoeSizeConverter {...defaultProps} footLengthCm={27} />);
      const input = screen.getByPlaceholderText(/enter size/i);
      expect(input).toHaveValue(27);
    });

    it('uses CM as default system when foot length provided', () => {
      render(<ShoeSizeConverter {...defaultProps} footLengthCm={27} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('cm');
    });

    it('uses EU as default system when no foot length provided', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('eu');
    });

    it('shows empty input when no foot length provided', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      const input = screen.getByPlaceholderText(/enter size/i);
      expect(input).toHaveValue(null);
    });
  });

  // ============================================
  // CONVERSION DISPLAY
  // ============================================
  describe('conversion display', () => {
    it('shows dashes when input is empty', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      const sizeValues = screen.getAllByText('-');
      expect(sizeValues.length).toBeGreaterThan(0);
    });

    it('calculates conversions when foot length provided', () => {
      render(<ShoeSizeConverter {...defaultProps} footLengthCm={27} />);
      // Should show converted values instead of dashes
      expect(screen.queryAllByText('-').length).toBe(0);
    });

    it('shows size system result items', () => {
      render(<ShoeSizeConverter {...defaultProps} footLengthCm={27} />);
      // The component renders size-item elements for each system
      const sizeItems = document.querySelectorAll('.size-item');
      expect(sizeItems.length).toBe(6);
    });
  });

  // ============================================
  // INPUT CHANGES
  // ============================================
  describe('input changes', () => {
    it('updates conversions when value entered', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      const input = screen.getByPlaceholderText(/enter size/i);
      fireEvent.change(input, { target: { value: '42' } });
      // Should now show converted values
      expect(screen.queryAllByText('-').length).toBe(0);
    });

    it('updates when system changes', () => {
      render(<ShoeSizeConverter {...defaultProps} footLengthCm={27} />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'eu' } });
      expect(select).toHaveValue('eu');
    });
  });

  // ============================================
  // NAVIGATION
  // ============================================
  describe('navigation', () => {
    it('calls onClose when back button clicked', () => {
      render(<ShoeSizeConverter {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  // ============================================
  // HIGHLIGHTED INPUT SYSTEM
  // ============================================
  describe('input system highlight', () => {
    it('highlights the current input system in results', () => {
      render(<ShoeSizeConverter {...defaultProps} footLengthCm={27} />);
      const highlightedItem = document.querySelector('.size-item.input-system');
      expect(highlightedItem).toBeInTheDocument();
    });
  });
});
