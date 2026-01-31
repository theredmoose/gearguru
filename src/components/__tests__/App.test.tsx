import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock Firebase hooks
vi.mock('../../hooks', () => ({
  useFamilyMembers: vi.fn(() => ({
    members: [],
    loading: false,
    error: null,
    addMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
  })),
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('home view', () => {
    it('renders the app header', () => {
      render(<App />);
      expect(screen.getByText('Gear Guru')).toBeInTheDocument();
      expect(screen.getByText('Sports Equipment Sizing Calculator')).toBeInTheDocument();
    });

    it('shows empty state when no members', () => {
      render(<App />);
      expect(screen.getByText(/no family members yet/i)).toBeInTheDocument();
    });

    it('shows add member button', () => {
      render(<App />);
      expect(screen.getByText(/add family member/i)).toBeInTheDocument();
    });
  });

  describe('navigation flow', () => {
    it('navigates to add member form when button clicked', () => {
      render(<App />);
      fireEvent.click(screen.getByText(/add family member/i));
      expect(screen.getByText('Add Family Member')).toBeInTheDocument();
    });

    it('returns to home when cancel clicked on add form', () => {
      render(<App />);
      fireEvent.click(screen.getByText(/add family member/i));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByText('Gear Guru')).toBeInTheDocument();
    });
  });

  describe('with members loaded', () => {
    beforeEach(async () => {
      const { useFamilyMembers } = await import('../../hooks');
      vi.mocked(useFamilyMembers).mockReturnValue({
        members: [
          {
            id: '1',
            name: 'John Doe',
            dateOfBirth: '1990-01-15',
            gender: 'male',
            measurements: {
              height: 180,
              weight: 75,
              footLengthLeft: 27,
              footLengthRight: 27,
              measuredAt: new Date().toISOString(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        loading: false,
        error: null,
        addMember: vi.fn(),
        updateMember: vi.fn(),
        deleteMember: vi.fn(),
      });
    });

    it('displays member cards when members exist', () => {
      render(<App />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows quick tip section when members exist', () => {
      render(<App />);
      expect(screen.getByText('Quick Tip')).toBeInTheDocument();
    });

    it('navigates to member detail on card click', () => {
      render(<App />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('Body Measurements')).toBeInTheDocument();
      expect(screen.getByText('Get Equipment Sizing')).toBeInTheDocument();
    });
  });
});
