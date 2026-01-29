import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberCard } from '../MemberCard';
import { FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';

describe('MemberCard', () => {
  const defaultProps = {
    member: FAMILY_MEMBERS.john,
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING
  // ============================================
  describe('rendering', () => {
    it('displays member name', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays avatar with first letter of name', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('displays height and weight', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByText(/180 cm/)).toBeInTheDocument();
      expect(screen.getByText(/80 kg/)).toBeInTheDocument();
    });
  });

  // ============================================
  // INTERACTIONS
  // ============================================
  describe('interactions', () => {
    it('calls onSelect when card is clicked', () => {
      render(<MemberCard {...defaultProps} />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith(FAMILY_MEMBERS.john);
    });

    it('calls onEdit when edit button is clicked', () => {
      render(<MemberCard {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      expect(defaultProps.onEdit).toHaveBeenCalledWith(FAMILY_MEMBERS.john);
      expect(defaultProps.onSelect).not.toHaveBeenCalled();
    });

    it('shows confirmation and calls onDelete when confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<MemberCard {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(window.confirm).toHaveBeenCalledWith('Delete John Doe?');
      expect(defaultProps.onDelete).toHaveBeenCalledWith(FAMILY_MEMBERS.john);
    });

    it('does not call onDelete when confirmation cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<MemberCard {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(defaultProps.onDelete).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // DIFFERENT MEMBERS
  // ============================================
  describe('different members', () => {
    it('displays correct info for child member', () => {
      render(<MemberCard {...defaultProps} member={FAMILY_MEMBERS.tommy} />);
      expect(screen.getByText('Tommy Doe')).toBeInTheDocument();
      expect(screen.getByText('T')).toBeInTheDocument();
      expect(screen.getByText(/140 cm/)).toBeInTheDocument();
    });

    it('displays correct info for female member', () => {
      render(<MemberCard {...defaultProps} member={FAMILY_MEMBERS.jane} />);
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText(/165 cm/)).toBeInTheDocument();
    });
  });
});
