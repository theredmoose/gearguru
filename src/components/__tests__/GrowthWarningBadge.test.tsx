import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GrowthWarningBadge } from '../GrowthWarningBadge';

describe('GrowthWarningBadge', () => {
  it('renders the ⚠ character', () => {
    render(<GrowthWarningBadge reason="stale" />);
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('has correct aria-label for stale reason', () => {
    render(<GrowthWarningBadge reason="stale" />);
    expect(
      screen.getByLabelText(/measurements are over 6 months old/i)
    ).toBeInTheDocument();
  });

  it('has correct aria-label for growing reason', () => {
    render(<GrowthWarningBadge reason="growing" />);
    expect(
      screen.getByLabelText(/active growth detected/i)
    ).toBeInTheDocument();
  });

  it('has correct aria-label for both reason', () => {
    render(<GrowthWarningBadge reason="both" />);
    expect(
      screen.getByLabelText(/growing and measurements are over 6 months old/i)
    ).toBeInTheDocument();
  });

  it('has a title attribute for tooltip', () => {
    render(<GrowthWarningBadge reason="growing" />);
    const badge = screen.getByLabelText(/active growth detected/i);
    expect(badge).toHaveAttribute('title');
  });
});
