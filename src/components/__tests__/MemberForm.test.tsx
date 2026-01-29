import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemberForm } from '../MemberForm';
import { FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';

describe('MemberForm', () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING
  // ============================================
  describe('rendering', () => {
    it('renders add form when no member provided', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByText('Add Family Member')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add member/i })).toBeInTheDocument();
    });

    it('renders edit form when member provided', () => {
      render(<MemberForm {...defaultProps} member={FAMILY_MEMBERS.john} />);
      expect(screen.getByText('Edit Family Member')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });

    it('pre-fills form with member data in edit mode', () => {
      render(<MemberForm {...defaultProps} member={FAMILY_MEMBERS.john} />);
      expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
      expect(screen.getByLabelText(/height \(cm\)/i)).toHaveValue(180);
      expect(screen.getByLabelText(/weight \(kg\)/i)).toHaveValue(80);
    });

    it('renders all form sections', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Body Measurements')).toBeInTheDocument();
      expect(screen.getByText('Foot Measurements')).toBeInTheDocument();
      expect(screen.getByText('Shoe Sizes (Optional)')).toBeInTheDocument();
    });
  });

  // ============================================
  // VALIDATION
  // ============================================
  describe('validation', () => {
    it('shows error when name is empty', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Name is required')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when date of birth is empty', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Date of birth is required')).toBeInTheDocument();
    });

    it('shows error when height is zero', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1990-05-15' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Height must be greater than 0')).toBeInTheDocument();
    });
  });

  // ============================================
  // FORM SUBMISSION
  // ============================================
  describe('submission', () => {
    it('calls onSubmit with form data on valid submission', async () => {
      render(<MemberForm {...defaultProps} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1990-05-15' },
      });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '180' } });
      fireEvent.change(screen.getByLabelText(/weight \(kg\)/i), { target: { value: '75' } });
      fireEvent.change(screen.getByLabelText(/left foot/i), { target: { value: '27' } });
      fireEvent.change(screen.getByLabelText(/right foot/i), { target: { value: '27' } });

      fireEvent.click(screen.getByRole('button', { name: /add member/i }));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Doe',
            dateOfBirth: '1990-05-15',
            gender: 'male',
            measurements: expect.objectContaining({
              height: 180,
              weight: 75,
            }),
          })
        );
      });
    });
  });

  // ============================================
  // CANCEL BUTTON
  // ============================================
  describe('cancel button', () => {
    it('calls onCancel when clicked', () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  // ============================================
  // GENDER SELECTION
  // ============================================
  describe('gender selection', () => {
    it('defaults to male', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByLabelText(/gender/i)).toHaveValue('male');
    });

    it('allows changing gender', () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: 'female' } });
      expect(screen.getByLabelText(/gender/i)).toHaveValue('female');
    });
  });
});
