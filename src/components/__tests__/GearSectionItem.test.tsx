import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearSectionItem } from '../GearSectionItem';
import type { GearItem } from '../../types';

function makeItem(overrides: Partial<GearItem> = {}): GearItem {
  return {
    id: 'g1', userId: 'u1', ownerId: 'm1',
    sports: ['alpine'], type: 'ski',
    brand: 'Blizzard', model: 'Brahma', size: '170 cm',
    condition: 'good', createdAt: '', updatedAt: '',
    ...overrides,
  };
}

describe('GearSectionItem', () => {
  it('renders brand, model, and size', () => {
    render(<GearSectionItem item={makeItem()} onEdit={vi.fn()} />);
    expect(screen.getByText('Blizzard Brahma')).toBeInTheDocument();
    expect(screen.getByText('170')).toBeInTheDocument();
  });

  it('calls onEdit when tapped', () => {
    const onEdit = vi.fn();
    render(<GearSectionItem item={makeItem()} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onEdit).toHaveBeenCalledWith(makeItem());
  });

  it('renders tags as chips', () => {
    render(<GearSectionItem item={makeItem({ tags: ['carving', 'race'] })} onEdit={vi.fn()} />);
    expect(screen.getByText('carving')).toBeInTheDocument();
    expect(screen.getByText('race')).toBeInTheDocument();
  });

  it('renders nothing for tags when tags is empty', () => {
    const { container } = render(<GearSectionItem item={makeItem({ tags: [] })} onEdit={vi.fn()} />);
    expect(container.querySelectorAll('.tag-chip')).toHaveLength(0);
  });
});
