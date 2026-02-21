import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeasureScreen } from '../MeasureScreen';
import { ALL_FAMILY_MEMBERS, FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';

describe('MeasureScreen', () => {
  const mockOnSelectMember = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the Measure heading', () => {
      render(<MeasureScreen members={[]} onSelectMember={mockOnSelectMember} />);
      expect(screen.getByText('Measure')).toBeInTheDocument();
    });

    it('renders the instruction subtitle', () => {
      render(<MeasureScreen members={[]} onSelectMember={mockOnSelectMember} />);
      expect(screen.getByText(/select a member to update measurements/i)).toBeInTheDocument();
    });

    it('shows empty state message when no members', () => {
      render(<MeasureScreen members={[]} onSelectMember={mockOnSelectMember} />);
      expect(screen.getByText(/no family members yet/i)).toBeInTheDocument();
    });

    it('renders a button for each member', () => {
      render(<MeasureScreen members={ALL_FAMILY_MEMBERS} onSelectMember={mockOnSelectMember} />);
      ALL_FAMILY_MEMBERS.forEach((m) => {
        expect(screen.getByText(m.name)).toBeInTheDocument();
      });
    });

    it('shows height and weight for each member', () => {
      render(<MeasureScreen members={[FAMILY_MEMBERS.john]} onSelectMember={mockOnSelectMember} />);
      const { height, weight } = FAMILY_MEMBERS.john.measurements;
      expect(screen.getByText(new RegExp(`${height} cm`))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${weight} kg`))).toBeInTheDocument();
    });

    it('shows initial avatar letter for each member', () => {
      render(<MeasureScreen members={[FAMILY_MEMBERS.john]} onSelectMember={mockOnSelectMember} />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('shows "Edit →" label on each member button', () => {
      render(<MeasureScreen members={[FAMILY_MEMBERS.john]} onSelectMember={mockOnSelectMember} />);
      expect(screen.getByText(/edit →/i)).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onSelectMember with the correct member when clicked', () => {
      render(<MeasureScreen members={ALL_FAMILY_MEMBERS} onSelectMember={mockOnSelectMember} />);
      fireEvent.click(screen.getByText(FAMILY_MEMBERS.john.name));
      expect(mockOnSelectMember).toHaveBeenCalledWith(FAMILY_MEMBERS.john);
    });

    it('calls onSelectMember with different member when that member is clicked', () => {
      render(<MeasureScreen members={ALL_FAMILY_MEMBERS} onSelectMember={mockOnSelectMember} />);
      fireEvent.click(screen.getByText(FAMILY_MEMBERS.jane.name));
      expect(mockOnSelectMember).toHaveBeenCalledWith(FAMILY_MEMBERS.jane);
    });
  });
});
