import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearSectionList } from '../GearSectionList';
import type { FamilyMember, AppSettings } from '../../types';
import { DEFAULT_SETTINGS } from '../../types';

const member: FamilyMember = {
  id: 'm1',
  userId: 'u1',
  name: 'Alex',
  dateOfBirth: '2010-01-01',
  gender: 'other',
  measurements: {
    height: 155,
    weight: 45,
    footLengthLeft: 23,
    footLengthRight: 23,
    measuredAt: '2024-01-01',
  },
  skillLevels: {},
  createdAt: '',
  updatedAt: '',
};

const props = {
  member,
  gearItems: [],
  selectedSport: 'alpine' as const,
  sizingCards: [],
  settings: DEFAULT_SETTINGS,
  onUpdateSettings: vi.fn(),
  onAddGear: vi.fn(),
  onEditGear: vi.fn(),
};

describe('GearSectionList', () => {
  it('renders default sections for alpine sport', () => {
    render(<GearSectionList {...props} />);
    expect(screen.getByText('Skis')).toBeInTheDocument();
    expect(screen.getByText('Boots')).toBeInTheDocument();
    expect(screen.getByText('Poles')).toBeInTheDocument();
    expect(screen.getByText('Helmet')).toBeInTheDocument();
  });

  it('renders Add Section button', () => {
    render(<GearSectionList {...props} />);
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
  });

  it('shows optional section menu when Add Section is tapped', () => {
    render(<GearSectionList {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    expect(screen.getByText('Jacket')).toBeInTheDocument();
  });

  it('calls onUpdateSettings when optional section is added', () => {
    render(<GearSectionList {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    fireEvent.click(screen.getByText('Jacket'));
    expect(props.onUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ sportSections: expect.any(Object) })
    );
  });
});
