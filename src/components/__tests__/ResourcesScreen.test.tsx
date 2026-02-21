import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcesScreen } from '../ResourcesScreen';

describe('ResourcesScreen', () => {
  describe('rendering', () => {
    it('renders the Resources heading', () => {
      render(<ResourcesScreen />);
      expect(screen.getByText('Resources')).toBeInTheDocument();
    });

    it('renders the Quick sizing reference subtitle', () => {
      render(<ResourcesScreen />);
      expect(screen.getByText(/quick sizing reference/i)).toBeInTheDocument();
    });

    it('renders all four sport sections', () => {
      render(<ResourcesScreen />);
      expect(screen.getByRole('heading', { name: /nordic skiing/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /alpine skiing/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /snowboarding/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /hockey/i })).toBeInTheDocument();
    });

    it('renders Nordic Skiing rules', () => {
      render(<ResourcesScreen />);
      expect(screen.getByText('Classic Skis')).toBeInTheDocument();
      expect(screen.getByText('Skate Skis')).toBeInTheDocument();
      expect(screen.getByText('Classic Poles')).toBeInTheDocument();
      expect(screen.getByText('Skate Poles')).toBeInTheDocument();
    });

    it('renders Alpine Skiing rules', () => {
      render(<ResourcesScreen />);
      expect(screen.getByText('Ski Length')).toBeInTheDocument();
      expect(screen.getByText('Boot Size')).toBeInTheDocument();
      expect(screen.getByText('Boot Flex')).toBeInTheDocument();
      expect(screen.getByText('DIN Setting')).toBeInTheDocument();
    });

    it('renders Snowboarding rules', () => {
      render(<ResourcesScreen />);
      expect(screen.getByText('Board Length')).toBeInTheDocument();
      expect(screen.getByText('Stance Width')).toBeInTheDocument();
    });

    it('renders Hockey rules', () => {
      render(<ResourcesScreen />);
      expect(screen.getByText('Skate Size')).toBeInTheDocument();
      expect(screen.getByText('Bauer Width')).toBeInTheDocument();
      expect(screen.getByText('CCM Width')).toBeInTheDocument();
    });

    it('shows the disclaimer text', () => {
      render(<ResourcesScreen />);
      expect(screen.getByText(/always verify with a qualified shop technician/i)).toBeInTheDocument();
    });
  });
});
