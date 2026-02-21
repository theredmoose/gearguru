import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GearStatusBadge } from '../GearStatusBadge';

describe('GearStatusBadge', () => {
  it('renders "Available" for available status', () => {
    render(<GearStatusBadge status="available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders "Checked Out" for checked-out status', () => {
    render(<GearStatusBadge status="checked-out" />);
    expect(screen.getByText('Checked Out')).toBeInTheDocument();
  });

  it('renders "Maintenance" for maintenance status', () => {
    render(<GearStatusBadge status="maintenance" />);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  it('applies green color for available status', () => {
    render(<GearStatusBadge status="available" />);
    const badge = screen.getByText('Available');
    expect(badge).toHaveStyle({ backgroundColor: '#22c55e' });
  });

  it('applies orange color for checked-out status', () => {
    render(<GearStatusBadge status="checked-out" />);
    const badge = screen.getByText('Checked Out');
    expect(badge).toHaveStyle({ backgroundColor: '#f97316' });
  });

  it('applies red color for maintenance status', () => {
    render(<GearStatusBadge status="maintenance" />);
    const badge = screen.getByText('Maintenance');
    expect(badge).toHaveStyle({ backgroundColor: '#ef4444' });
  });

  it('uses medium size class by default', () => {
    render(<GearStatusBadge status="available" />);
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass('gear-status-badge--medium');
  });

  it('applies small size class when size="small"', () => {
    render(<GearStatusBadge status="available" size="small" />);
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass('gear-status-badge--small');
  });

  it('always has gear-status-badge base class', () => {
    render(<GearStatusBadge status="maintenance" />);
    const badge = screen.getByText('Maintenance');
    expect(badge).toHaveClass('gear-status-badge');
  });
});
