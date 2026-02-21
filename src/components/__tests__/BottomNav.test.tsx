import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from '../BottomNav';
import type { TopLevelTab } from '../BottomNav';

describe('BottomNav', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all four tab labels', () => {
      render(<BottomNav activeTab="family" onChange={mockOnChange} />);
      expect(screen.getByText('FAMILY')).toBeInTheDocument();
      expect(screen.getByText('GEAR')).toBeInTheDocument();
      expect(screen.getByText('MEASURE')).toBeInTheDocument();
      expect(screen.getByText('RESOURCES')).toBeInTheDocument();
    });

    it('renders four buttons', () => {
      render(<BottomNav activeTab="family" onChange={mockOnChange} />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });
  });

  describe('active state', () => {
    const TABS: TopLevelTab[] = ['family', 'gear', 'measure', 'resources'];

    TABS.forEach((tab) => {
      it(`applies active scale class to "${tab}" tab when it is active`, () => {
        render(<BottomNav activeTab={tab} onChange={mockOnChange} />);
        const label = tab.toUpperCase();
        const btn = screen.getByText(label).closest('button')!;
        expect(btn).toHaveClass('scale-110');
      });
    });

    it('does not apply active class to inactive tabs', () => {
      render(<BottomNav activeTab="family" onChange={mockOnChange} />);
      const gearBtn = screen.getByText('GEAR').closest('button')!;
      expect(gearBtn).not.toHaveClass('scale-110');
    });
  });

  describe('interaction', () => {
    it('calls onChange with "family" when FAMILY tab clicked', () => {
      render(<BottomNav activeTab="gear" onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('FAMILY'));
      expect(mockOnChange).toHaveBeenCalledWith('family');
    });

    it('calls onChange with "gear" when GEAR tab clicked', () => {
      render(<BottomNav activeTab="family" onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('GEAR'));
      expect(mockOnChange).toHaveBeenCalledWith('gear');
    });

    it('calls onChange with "measure" when MEASURE tab clicked', () => {
      render(<BottomNav activeTab="family" onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('MEASURE'));
      expect(mockOnChange).toHaveBeenCalledWith('measure');
    });

    it('calls onChange with "resources" when RESOURCES tab clicked', () => {
      render(<BottomNav activeTab="family" onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('RESOURCES'));
      expect(mockOnChange).toHaveBeenCalledWith('resources');
    });
  });
});
