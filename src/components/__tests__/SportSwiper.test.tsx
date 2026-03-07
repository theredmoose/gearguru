import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SportSwiper } from '../SportSwiper';
import type { Sport } from '../../types';

const SPORTS: Sport[] = ['alpine', 'nordic-classic', 'snowboard'];

describe('SportSwiper', () => {
  it('renders current sport label', () => {
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={vi.fn()} />);
    expect(screen.getByText('Downhill')).toBeInTheDocument();
  });

  it('renders dot indicators equal to sport count', () => {
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={vi.fn()} />);
    expect(screen.getAllByRole('presentation')).toHaveLength(SPORTS.length);
  });

  it('active dot is the first when value is first sport', () => {
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={vi.fn()} />);
    const dots = screen.getAllByRole('presentation');
    expect(dots[0]).toHaveAttribute('data-active', 'true');
    expect(dots[1]).toHaveAttribute('data-active', 'false');
  });

  it('calls onChange with next sport on left swipe', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 80 }] });  // Δx = -120
    expect(onChange).toHaveBeenCalledWith('nordic-classic');
  });

  it('calls onChange with previous sport on right swipe', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="nordic-classic" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 80 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 220 }] });  // Δx = +140
    expect(onChange).toHaveBeenCalledWith('alpine');
  });

  it('does not call onChange when swipe is below threshold', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 170 }] });  // Δx = -30
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not go past last sport on left swipe', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="snowboard" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 50 }] });
    expect(onChange).not.toHaveBeenCalled();
  });
});
