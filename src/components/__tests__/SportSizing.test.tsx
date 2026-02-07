import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SportSizing } from '../SportSizing';
import { FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';

describe('SportSizing', () => {
  const defaultProps = {
    member: FAMILY_MEMBERS.john,
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // INITIAL RENDERING
  // ============================================
  describe('initial rendering', () => {
    it('displays member name in back button', () => {
      render(<SportSizing {...defaultProps} />);
      expect(screen.getByRole('button', { name: /john doe/i })).toBeInTheDocument();
    });

    it('shows Nordic Classic content by default', () => {
      render(<SportSizing {...defaultProps} />);
      // Nordic Classic appears in both tab and header
      expect(screen.getAllByText('Nordic Classic').length).toBeGreaterThanOrEqual(1);
      // Skis and Poles appear in both loadout legend and sizing sections
      expect(screen.getAllByText('Skis').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Poles').length).toBeGreaterThanOrEqual(1);
    });

    it('displays all sport tabs', () => {
      render(<SportSizing {...defaultProps} />);
      // Use getAllByText since "Nordic Classic" appears in both tab and header
      expect(screen.getAllByText('Nordic Classic').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Nordic Skate').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Alpine').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Snowboard').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Hockey').length).toBeGreaterThanOrEqual(1);
    });

    it('displays skill level buttons', () => {
      render(<SportSizing {...defaultProps} />);
      expect(screen.getByRole('button', { name: /beg/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /int/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /exp/i })).toBeInTheDocument();
    });

    it('displays swipe indicator dots', () => {
      render(<SportSizing {...defaultProps} />);
      const dots = document.querySelectorAll('.swipe-dot');
      expect(dots).toHaveLength(5);
    });
  });

  // ============================================
  // TAB SWITCHING
  // ============================================
  describe('tab switching', () => {
    it('switches to Alpine tab when clicked', () => {
      render(<SportSizing {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /alpine/i }));
      expect(screen.getByText('DIN')).toBeInTheDocument();
      expect(screen.getByText('Boot Flex')).toBeInTheDocument();
    });

    it('switches to Snowboard tab when clicked', () => {
      render(<SportSizing {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /snowboard/i }));
      // Board appears in both loadout legend and sizing sections
      expect(screen.getAllByText('Board').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Board Waist')).toBeInTheDocument();
    });

    it('switches to Hockey tab when clicked', () => {
      render(<SportSizing {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /hockey/i }));
      expect(screen.getByText('Bauer Skates')).toBeInTheDocument();
      expect(screen.getByText('CCM Skates')).toBeInTheDocument();
    });

    it('hides skill selector for Hockey', () => {
      render(<SportSizing {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /hockey/i }));
      expect(screen.queryByRole('button', { name: /beg/i })).not.toBeInTheDocument();
    });
  });

  // ============================================
  // SKILL LEVEL
  // ============================================
  describe('skill level', () => {
    it('intermediate is selected by default', () => {
      render(<SportSizing {...defaultProps} />);
      const intButton = screen.getByRole('button', { name: /int/i });
      expect(intButton).toHaveClass('active');
    });

    it('changes active skill when clicked', () => {
      render(<SportSizing {...defaultProps} />);
      const expertButton = screen.getByRole('button', { name: /exp/i });
      fireEvent.click(expertButton);
      expect(expertButton).toHaveClass('active');
    });
  });

  // ============================================
  // NAVIGATION
  // ============================================
  describe('navigation', () => {
    it('calls onBack when back button is clicked', () => {
      render(<SportSizing {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /john doe/i }));
      expect(defaultProps.onBack).toHaveBeenCalled();
    });
  });

  // ============================================
  // SWIPE INDICATORS
  // ============================================
  describe('swipe indicators', () => {
    it('first dot is active initially', () => {
      render(<SportSizing {...defaultProps} />);
      const dots = document.querySelectorAll('.swipe-dot');
      expect(dots[0]).toHaveClass('active');
    });

    it('updates active dot when tab changes', () => {
      render(<SportSizing {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /alpine/i }));
      const dots = document.querySelectorAll('.swipe-dot');
      expect(dots[2]).toHaveClass('active'); // Alpine is third (index 2)
    });
  });
});
