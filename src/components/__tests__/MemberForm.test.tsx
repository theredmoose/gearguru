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

    it('shows error when weight is zero', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1990-05-15' },
      });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '180' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Weight must be greater than 0')).toBeInTheDocument();
    });

    it('shows error when height exceeds 300 cm', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-05-15' } });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '301' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Height must be 300 cm or less')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when weight exceeds 300 kg', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-05-15' } });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '180' } });
      fireEvent.change(screen.getByLabelText(/weight \(kg\)/i), { target: { value: '301' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Weight must be 300 kg or less')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when date of birth is in the future', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '2099-01-01' },
      });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '180' } });
      fireEvent.change(screen.getByLabelText(/weight \(kg\)/i), { target: { value: '75' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Date of birth cannot be in the future')).toBeInTheDocument();
    });

    it('shows error when date of birth is too far in the past', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1800-01-01' },
      });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '180' } });
      fireEvent.change(screen.getByLabelText(/weight \(kg\)/i), { target: { value: '75' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Date of birth is too far in the past')).toBeInTheDocument();
    });

    const fillBasicValid = () => {
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-05-15' } });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '180' } });
      fireEvent.change(screen.getByLabelText(/weight \(kg\)/i), { target: { value: '75' } });
    };

    it('shows error when left foot width exceeds 15 cm', async () => {
      render(<MemberForm {...defaultProps} separateFeetHands />);
      fillBasicValid();
      fireEvent.change(screen.getByLabelText(/left width/i), { target: { value: '16' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Left foot width must be 15 cm or less')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when right foot width exceeds 15 cm', async () => {
      render(<MemberForm {...defaultProps} separateFeetHands />);
      fillBasicValid();
      fireEvent.change(screen.getByLabelText(/right width/i), { target: { value: '16' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Right foot width must be 15 cm or less')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when US shoe size exceeds 25', async () => {
      render(<MemberForm {...defaultProps} />);
      fillBasicValid();
      fireEvent.change(screen.getByLabelText(/us size/i), { target: { value: '26' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('US shoe size must be 25 or less')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when EU shoe size exceeds 60', async () => {
      render(<MemberForm {...defaultProps} />);
      fillBasicValid();
      fireEvent.change(screen.getByLabelText(/eu size/i), { target: { value: '61' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('EU shoe size must be 60 or less')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when head circumference is out of range', async () => {
      render(<MemberForm {...defaultProps} />);
      fillBasicValid();
      fireEvent.change(screen.getByLabelText(/head circumference/i), { target: { value: '80' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Head circumference must be between 40 and 70 cm')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when hand size is out of range', async () => {
      render(<MemberForm {...defaultProps} />);
      fillBasicValid();
      fireEvent.change(screen.getByLabelText(/hand size/i), { target: { value: '35' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      expect(await screen.findByText('Hand size must be between 4 and 30 cm')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // FORM SUBMISSION
  // ============================================
  describe('submission', () => {
    it('calls onSubmit with form data on valid submission', async () => {
      render(<MemberForm {...defaultProps} separateFeetHands />);

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
      expect(screen.getByRole('button', { name: /^male$/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('allows changing gender', () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^female$/i }));
      expect(screen.getByRole('button', { name: /^female$/i })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  // ============================================
  // SEPARATE FEET/HANDS TOGGLE
  // ============================================
  describe('foot/hand mode', () => {
    it('shows single Foot Length field by default', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByLabelText(/^foot length \(cm\)$/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/left foot/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/right foot/i)).not.toBeInTheDocument();
    });

    it('shows Left Foot and Right Foot fields when separateFeetHands is true', () => {
      render(<MemberForm {...defaultProps} separateFeetHands />);
      expect(screen.getByLabelText(/left foot/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/right foot/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/^foot length \(cm\)$/i)).not.toBeInTheDocument();
    });

    it('saves single foot value to both footLengthLeft and footLengthRight', async () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } });
      fireEvent.change(screen.getByLabelText(/height \(cm\)/i), { target: { value: '170' } });
      fireEvent.change(screen.getByLabelText(/weight \(kg\)/i), { target: { value: '65' } });
      fireEvent.change(screen.getByLabelText(/^foot length \(cm\)$/i), { target: { value: '26' } });
      fireEvent.click(screen.getByRole('button', { name: /add member/i }));
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            measurements: expect.objectContaining({
              footLengthLeft: 26,
              footLengthRight: 26,
            }),
          })
        );
      });
    });

    it('pre-fills single foot field with the larger foot when editing', () => {
      const member = { ...FAMILY_MEMBERS.john, measurements: { ...FAMILY_MEMBERS.john.measurements, footLengthLeft: 26.5, footLengthRight: 27 } };
      render(<MemberForm {...defaultProps} member={member} />);
      expect(screen.getByLabelText(/^foot length \(cm\)$/i)).toHaveValue(27);
    });

    it('shows single Hand Size field by default', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByLabelText(/^hand size \(cm\)$/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/left hand/i)).not.toBeInTheDocument();
    });

    it('shows Left Hand and Right Hand fields when separateFeetHands is true', () => {
      render(<MemberForm {...defaultProps} separateFeetHands />);
      expect(screen.getByLabelText(/left hand/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/right hand/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/^hand size \(cm\)$/i)).not.toBeInTheDocument();
    });
  });
});
