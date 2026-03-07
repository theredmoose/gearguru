import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearSectionRow } from '../GearSectionRow';
import type { GearItem } from '../../types';

function makeSki(id: string): GearItem {
  return {
    id, userId: 'u1', ownerId: 'm1',
    sports: ['alpine'], type: 'ski',
    brand: 'Blizzard', model: 'Brahma', size: '170 cm',
    condition: 'good', createdAt: '', updatedAt: '',
  };
}

const baseProps = {
  gearType: 'ski' as const,
  assignedGear: [],
  memberGear: [],
  sizingItems: [{ label: 'Length', value: '170 cm' }],
  onAddGear: vi.fn(),
  onEditGear: vi.fn(),
};

describe('GearSectionRow', () => {
  it('renders the gear type label', () => {
    render(<GearSectionRow {...baseProps} />);
    expect(screen.getByText('Skis')).toBeInTheDocument();
  });

  it('renders sizing value in left column', () => {
    render(<GearSectionRow {...baseProps} />);
    expect(screen.getByText('170')).toBeInTheDocument();
  });

  it('shows dash in sizing col when sizingItems is null', () => {
    render(<GearSectionRow {...baseProps} sizingItems={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders assigned gear items', () => {
    render(<GearSectionRow {...baseProps} assignedGear={[makeSki('g1')]} />);
    expect(screen.getByText('Blizzard Brahma')).toBeInTheDocument();
  });

  it('opens assign sheet when + is tapped', () => {
    render(<GearSectionRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/add gear to skis/i));
    expect(screen.getByTestId('sheet-backdrop')).toBeInTheDocument();
  });

  it('closes assign sheet when backdrop is tapped', () => {
    render(<GearSectionRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/add gear to skis/i));
    fireEvent.click(screen.getByTestId('sheet-backdrop'));
    expect(screen.queryByTestId('sheet-backdrop')).not.toBeInTheDocument();
  });
});
