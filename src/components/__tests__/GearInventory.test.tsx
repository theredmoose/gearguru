import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearInventory } from '../GearInventory';
import type { FamilyMember, GearItem } from '../../types';

// Mock GearCard to isolate inventory logic from card rendering
vi.mock('../GearCard', () => ({
  GearCard: vi.fn(({ item, onEdit, onDelete }) => (
    <div data-testid={`gear-card-${item.id}`}>
      <span>{item.brand} {item.model}</span>
      <button onClick={() => onEdit(item)}>Edit</button>
      <button onClick={() => onDelete(item)}>Delete</button>
    </div>
  )),
}));

describe('GearInventory', () => {
  const mockOnBack = vi.fn();
  const mockOnAddGear = vi.fn();
  const mockOnEditGear = vi.fn();
  const mockOnDeleteGear = vi.fn();

  const members: FamilyMember[] = [
    {
      id: 'member-1',
      name: 'Alice',
      dateOfBirth: '1990-01-01',
      gender: 'female',
      measurements: {
        height: 165,
        weight: 60,
        footLengthLeft: 25,
        footLengthRight: 25,
        measuredAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FamilyMember,
    {
      id: 'member-2',
      name: 'Bob',
      dateOfBirth: '1992-06-15',
      gender: 'male',
      measurements: {
        height: 180,
        weight: 80,
        footLengthLeft: 28,
        footLengthRight: 28,
        measuredAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FamilyMember,
  ];

  const gearItems: GearItem[] = [
    {
      id: 'gear-1',
      userId: 'user-1',
      ownerId: 'member-1',
      sport: 'alpine',
      type: 'ski',
      brand: 'Atomic',
      model: 'Redster X9',
      size: '170cm',
      condition: 'good',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'gear-2',
      userId: 'user-1',
      ownerId: 'member-2',
      sport: 'nordic-classic',
      type: 'ski',
      brand: 'Fischer',
      model: 'RCS',
      size: '186cm',
      condition: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    members,
    gearItems,
    onBack: mockOnBack,
    onAddGear: mockOnAddGear,
    onEditGear: mockOnEditGear,
    onDeleteGear: mockOnDeleteGear,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING
  // ============================================
  describe('rendering', () => {
    it('shows "Family Gear" header', () => {
      render(<GearInventory {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Family Gear' })).toBeInTheDocument();
    });

    it('shows back button', () => {
      render(<GearInventory {...defaultProps} />);
      expect(screen.getByText('← Home')).toBeInTheDocument();
    });

    it('shows owner filter dropdown', () => {
      render(<GearInventory {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows All Members option in dropdown', () => {
      render(<GearInventory {...defaultProps} />);
      expect(screen.getByRole('option', { name: 'All Members' })).toBeInTheDocument();
    });

    it('shows each member in the dropdown', () => {
      render(<GearInventory {...defaultProps} />);
      expect(screen.getByRole('option', { name: 'Alice' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Bob' })).toBeInTheDocument();
    });

    it('shows empty state when no gear items exist', () => {
      render(<GearInventory {...defaultProps} gearItems={[]} />);
      expect(screen.getByText('No gear found.')).toBeInTheDocument();
    });

    it('does not show Add Gear button in empty state when viewing all members', () => {
      render(<GearInventory {...defaultProps} gearItems={[]} />);
      expect(screen.queryByText('+ Add Gear')).not.toBeInTheDocument();
    });

    it('shows Add Gear button in empty state when a specific owner is selected', () => {
      render(<GearInventory {...defaultProps} gearItems={[]} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
      expect(screen.getByText('+ Add Gear')).toBeInTheDocument();
    });
  });

  // ============================================
  // GROUPED VIEW (ALL MEMBERS)
  // ============================================
  describe('grouped view', () => {
    it('shows member name headers for members with gear', () => {
      render(<GearInventory {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Bob' })).toBeInTheDocument();
    });

    it('shows a + Add button for each owner group', () => {
      render(<GearInventory {...defaultProps} />);
      const addButtons = screen.getAllByText('+ Add');
      expect(addButtons).toHaveLength(2);
    });

    it('shows gear cards for all owners', () => {
      render(<GearInventory {...defaultProps} />);
      expect(screen.getByTestId('gear-card-gear-1')).toBeInTheDocument();
      expect(screen.getByTestId('gear-card-gear-2')).toBeInTheDocument();
    });

    it('does not show members with no gear in grouped view', () => {
      const onlyAlicesGear = gearItems.filter((g) => g.ownerId === 'member-1');
      render(<GearInventory {...defaultProps} gearItems={onlyAlicesGear} />);
      expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Bob' })).not.toBeInTheDocument();
    });
  });

  // ============================================
  // FILTERING
  // ============================================
  describe('filtering', () => {
    it('shows only selected owner gear when filtered', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
      expect(screen.getByTestId('gear-card-gear-1')).toBeInTheDocument();
      expect(screen.queryByTestId('gear-card-gear-2')).not.toBeInTheDocument();
    });

    it('hides items not belonging to selected owner', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-2' } });
      expect(screen.queryByTestId('gear-card-gear-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('gear-card-gear-2')).toBeInTheDocument();
    });

    it('shows all items when filter reset to All Members', () => {
      render(<GearInventory {...defaultProps} />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'member-1' } });
      fireEvent.change(select, { target: { value: 'all' } });
      expect(screen.getByTestId('gear-card-gear-1')).toBeInTheDocument();
      expect(screen.getByTestId('gear-card-gear-2')).toBeInTheDocument();
    });
  });

  // ============================================
  // FLAT VIEW (SINGLE OWNER SELECTED)
  // ============================================
  describe('flat view', () => {
    it('shows gear list when specific owner with gear is selected', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
      expect(screen.getByTestId('gear-card-gear-1')).toBeInTheDocument();
    });

    it('shows + Add Gear button at bottom of flat view', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
      expect(screen.getByText('+ Add Gear')).toBeInTheDocument();
    });
  });

  // ============================================
  // INTERACTIONS
  // ============================================
  describe('interactions', () => {
    it('calls onBack when back button is clicked', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.click(screen.getByText('← Home'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('calls onAddGear with memberId when + Add is clicked in group header', () => {
      render(<GearInventory {...defaultProps} />);
      // Alice is first member listed, her + Add button is first
      const addButtons = screen.getAllByText('+ Add');
      fireEvent.click(addButtons[0]);
      expect(mockOnAddGear).toHaveBeenCalledWith('member-1');
    });

    it('calls onAddGear with ownerId when + Add Gear is clicked in flat view', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-2' } });
      fireEvent.click(screen.getByText('+ Add Gear'));
      expect(mockOnAddGear).toHaveBeenCalledWith('member-2');
    });

    it('passes onEditGear through to GearCard', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.click(screen.getAllByText('Edit')[0]);
      expect(mockOnEditGear).toHaveBeenCalled();
    });

    it('passes onDeleteGear through to GearCard', () => {
      render(<GearInventory {...defaultProps} />);
      fireEvent.click(screen.getAllByText('Delete')[0]);
      expect(mockOnDeleteGear).toHaveBeenCalled();
    });

    it('calls onAddGear with the correct ownerId from empty state', () => {
      render(<GearInventory {...defaultProps} gearItems={[]} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
      fireEvent.click(screen.getByText('+ Add Gear'));
      expect(mockOnAddGear).toHaveBeenCalledWith('member-1');
    });
  });
});
