import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsScreen } from '../SettingsScreen';
import type { AppSettings } from '../../types';
import type { User } from 'firebase/auth';

const defaultSettings: AppSettings = {
  heightUnit: 'cm',
  weightUnit: 'kg',
  skiLengthUnit: 'cm',
  defaultSport: 'alpine',
  display: { showFoot: true, showHand: true },
};

function makeUser(overrides: Partial<User> = {}): User {
  return {
    email: 'test@example.com',
    displayName: 'Test User',
    uid: 'user-1',
    providerData: [{ providerId: 'password', uid: 'user-1', displayName: null, email: 'test@example.com', phoneNumber: null, photoURL: null }],
    ...overrides,
  } as unknown as User;
}

const defaultProps = {
  settings: defaultSettings,
  user: makeUser(),
  onUpdateSettings: vi.fn(),
  onResetSettings: vi.fn(),
  onSignOut: vi.fn(),
  onSendPasswordReset: vi.fn().mockResolvedValue(undefined),
  onBack: vi.fn(),
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the Settings header', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders all section headings', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByText('Units')).toBeInTheDocument();
      expect(screen.getByText('Default Sport')).toBeInTheDocument();
      expect(screen.getByText('Display')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('displays user email in account section', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('shows Reset to Defaults button', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /reset all settings to defaults/i })).toBeInTheDocument();
    });
  });

  describe('units section', () => {
    it('shows current height unit label (cm)', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /toggle height unit/i })).toHaveTextContent('cm');
    });

    it('shows ft / in when heightUnit is ft-in', () => {
      render(<SettingsScreen {...defaultProps} settings={{ ...defaultSettings, heightUnit: 'ft-in' }} />);
      expect(screen.getByRole('button', { name: /toggle height unit/i })).toHaveTextContent('ft / in');
    });

    it('calls onUpdateSettings with toggled height unit', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /toggle height unit/i }));
      expect(defaultProps.onUpdateSettings).toHaveBeenCalledWith({ heightUnit: 'ft-in' });
    });

    it('calls onUpdateSettings with toggled weight unit', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /toggle weight unit/i }));
      expect(defaultProps.onUpdateSettings).toHaveBeenCalledWith({ weightUnit: 'lbs' });
    });

    it('shows lbs label when weightUnit is lbs', () => {
      render(<SettingsScreen {...defaultProps} settings={{ ...defaultSettings, weightUnit: 'lbs' }} />);
      expect(screen.getByRole('button', { name: /toggle weight unit/i })).toHaveTextContent('lbs');
    });

    it('calls onUpdateSettings with toggled ski length unit', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /toggle ski length unit/i }));
      expect(defaultProps.onUpdateSettings).toHaveBeenCalledWith({ skiLengthUnit: 'in' });
    });

    it('shows inches label when skiLengthUnit is in', () => {
      render(<SettingsScreen {...defaultProps} settings={{ ...defaultSettings, skiLengthUnit: 'in' }} />);
      expect(screen.getByRole('button', { name: /toggle ski length unit/i })).toHaveTextContent('inches');
    });
  });

  describe('default sport section', () => {
    it('shows Default label on active sport', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /set alpine.*default/i })).toHaveTextContent('Default');
    });

    it('calls onUpdateSettings when a sport is selected', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /set xc classic as default/i }));
      expect(defaultProps.onUpdateSettings).toHaveBeenCalledWith({ defaultSport: 'nordic-classic' });
    });

    it('shows Set label on inactive sports', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /set xc skate as default/i })).toHaveTextContent('Set');
    });
  });

  describe('display section', () => {
    it('foot length checkbox reflects showFoot setting (checked)', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByRole('checkbox', { name: /show foot length/i })).toBeChecked();
    });

    it('foot length checkbox reflects showFoot setting (unchecked)', () => {
      render(<SettingsScreen {...defaultProps} settings={{ ...defaultSettings, display: { showFoot: false, showHand: true } }} />);
      expect(screen.getByRole('checkbox', { name: /show foot length/i })).not.toBeChecked();
    });

    it('calls onUpdateSettings when foot toggle changes', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('checkbox', { name: /show foot length/i }));
      expect(defaultProps.onUpdateSettings).toHaveBeenCalledWith({
        display: { showFoot: false, showHand: true },
      });
    });

    it('calls onUpdateSettings when hand toggle changes', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('checkbox', { name: /show hand size/i }));
      expect(defaultProps.onUpdateSettings).toHaveBeenCalledWith({
        display: { showFoot: true, showHand: false },
      });
    });
  });

  describe('account section', () => {
    it('shows password reset button for email providers', () => {
      render(<SettingsScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /send password reset email/i })).toBeInTheDocument();
    });

    it('does not show password reset button for non-email providers', () => {
      const googleUser = makeUser({ providerData: [{ providerId: 'google.com', uid: 'user-1', displayName: null, email: null, phoneNumber: null, photoURL: null }] });
      render(<SettingsScreen {...defaultProps} user={googleUser} />);
      expect(screen.queryByRole('button', { name: /send password reset email/i })).toBeNull();
    });

    it('sends password reset and shows confirmation', async () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /send password reset email/i }));
      expect(defaultProps.onSendPasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(await screen.findByText(/reset email sent/i)).toBeInTheDocument();
    });

    it('shows error when password reset fails', async () => {
      const onSendPasswordReset = vi.fn().mockRejectedValue(new Error('Too many requests'));
      render(<SettingsScreen {...defaultProps} onSendPasswordReset={onSendPasswordReset} />);
      fireEvent.click(screen.getByRole('button', { name: /send password reset email/i }));
      expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
    });

    it('disables reset button after sending', async () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /send password reset email/i }));
      const btn = await screen.findByRole('button', { name: /send password reset email/i });
      expect(btn).toBeDisabled();
    });

    it('calls onSignOut when Sign Out button clicked', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
      expect(defaultProps.onSignOut).toHaveBeenCalled();
    });
  });

  describe('reset section', () => {
    it('calls onResetSettings when Reset to Defaults clicked', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /reset all settings to defaults/i }));
      expect(defaultProps.onResetSettings).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('calls onBack when back button clicked', () => {
      render(<SettingsScreen {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(defaultProps.onBack).toHaveBeenCalled();
    });
  });
});
