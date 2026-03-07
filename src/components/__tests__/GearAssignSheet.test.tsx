import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearAssignSheet } from '../GearAssignSheet';
import type { GearItem, GearType } from '../../types';

function makeItem(id: string, type: GearType = 'ski'): GearItem {
  return {
    id, userId: 'u1', ownerId: 'm1',
    sports: ['alpine'], type,
    brand: 'Brand', model: `Model ${id}`, size: '170 cm',
    condition: 'good', createdAt: '', updatedAt: '',
  };
}

describe('GearAssignSheet', () => {
  const props = {
    gearType: 'ski' as GearType,
    memberGear: [makeItem('a', 'ski'), makeItem('b', 'boot')],
    onAddGear: vi.fn(),
    onEditGear: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders "New" button', () => {
    render(<GearAssignSheet {...props} />);
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
  });

  it('shows only gear items matching the gearType', () => {
    render(<GearAssignSheet {...props} />);
    expect(screen.getByText('Brand Model a')).toBeInTheDocument();
    expect(screen.queryByText('Brand Model b')).not.toBeInTheDocument();
  });

  it('calls onAddGear when New is tapped', () => {
    render(<GearAssignSheet {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    expect(props.onAddGear).toHaveBeenCalled();
  });

  it('calls onEditGear when existing item is tapped', () => {
    render(<GearAssignSheet {...props} />);
    fireEvent.click(screen.getByText('Brand Model a'));
    expect(props.onEditGear).toHaveBeenCalledWith(makeItem('a', 'ski'));
  });

  it('shows empty state when no matching gear', () => {
    render(<GearAssignSheet {...props} memberGear={[]} />);
    expect(screen.getByText(/no existing/i)).toBeInTheDocument();
  });

  it('calls onClose when backdrop is tapped', () => {
    render(<GearAssignSheet {...props} />);
    fireEvent.click(screen.getByTestId('sheet-backdrop'));
    expect(props.onClose).toHaveBeenCalled();
  });
});
