import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GearStatusBadge } from '../GearStatusBadge';

describe('GearStatusBadge', () => {
  it('renders "Active" for active status', () => {
    render(<GearStatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders "Available" for available status', () => {
    render(<GearStatusBadge status="available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders "Outgrown" for outgrown status', () => {
    render(<GearStatusBadge status="outgrown" />);
    expect(screen.getByText('Outgrown')).toBeInTheDocument();
  });

  it('renders "To Sell" for to-sell status', () => {
    render(<GearStatusBadge status="to-sell" />);
    expect(screen.getByText('To Sell')).toBeInTheDocument();
  });

  it('renders "Sold" for sold status', () => {
    render(<GearStatusBadge status="sold" />);
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });

  it('renders "Needs Repair" for needs-repair status', () => {
    render(<GearStatusBadge status="needs-repair" />);
    expect(screen.getByText('Needs Repair')).toBeInTheDocument();
  });

  it('applies blue color for active status', () => {
    render(<GearStatusBadge status="active" />);
    expect(screen.getByText('Active')).toHaveStyle({ backgroundColor: '#3b82f6' });
  });

  it('applies green color for available status', () => {
    render(<GearStatusBadge status="available" />);
    expect(screen.getByText('Available')).toHaveStyle({ backgroundColor: '#22c55e' });
  });

  it('applies amber color for outgrown status', () => {
    render(<GearStatusBadge status="outgrown" />);
    expect(screen.getByText('Outgrown')).toHaveStyle({ backgroundColor: '#f59e0b' });
  });

  it('applies orange color for to-sell status', () => {
    render(<GearStatusBadge status="to-sell" />);
    expect(screen.getByText('To Sell')).toHaveStyle({ backgroundColor: '#f97316' });
  });

  it('applies gray color for sold status', () => {
    render(<GearStatusBadge status="sold" />);
    expect(screen.getByText('Sold')).toHaveStyle({ backgroundColor: '#94a3b8' });
  });

  it('applies red color for needs-repair status', () => {
    render(<GearStatusBadge status="needs-repair" />);
    expect(screen.getByText('Needs Repair')).toHaveStyle({ backgroundColor: '#ef4444' });
  });

  it('uses medium size class by default', () => {
    render(<GearStatusBadge status="available" />);
    expect(screen.getByText('Available')).toHaveClass('gear-status-badge--medium');
  });

  it('applies small size class when size="small"', () => {
    render(<GearStatusBadge status="available" size="small" />);
    expect(screen.getByText('Available')).toHaveClass('gear-status-badge--small');
  });

  it('always has gear-status-badge base class', () => {
    render(<GearStatusBadge status="needs-repair" />);
    expect(screen.getByText('Needs Repair')).toHaveClass('gear-status-badge');
  });
});
