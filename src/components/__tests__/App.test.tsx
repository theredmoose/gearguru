import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

// Helper: render App inside MemoryRouter (BrowserRouter is in main.tsx, not App)
function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );
}

// Mock Firebase hooks
vi.mock('../../hooks', () => ({
  useFamilyMembers: vi.fn(() => ({
    members: [],
    loading: false,
    error: null,
    addMember: vi.fn(),
    updateMember: vi.fn(),
    updateMeasurements: vi.fn(),
    updateSkillLevels: vi.fn(),
    deleteMember: vi.fn(),
  })),
  useGearItems: vi.fn(() => ({
    items: [],
    loading: false,
    error: null,
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  })),
  useAuth: vi.fn(() => ({
    user: { uid: 'u1', displayName: 'Test User', email: 'test@example.com', providerData: [] },
    loading: false,
    error: null,
    accountConflictEmail: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInGoogle: vi.fn(),
    signInFacebook: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    resendVerification: vi.fn(),
    clearError: vi.fn(),
    clearAccountConflict: vi.fn(),
  })),
  useSettings: vi.fn(() => ({
    settings: {
      heightUnit: 'cm',
      weightUnit: 'kg',
      skiLengthUnit: 'cm',
      defaultSport: 'alpine',
      display: { showFoot: true, showHand: true, separateFeetHands: false },
      sizingModel: 'generic',
      sizingDisplay: 'range',
      bootUnit: 'mp',
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
  })),
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('home view', () => {
    it('renders the app header', () => {
      renderApp();
      expect(screen.getByText(/gear/i, { selector: 'h1' })).toBeInTheDocument();
    });

    it('shows empty state when no members', () => {
      renderApp();
      expect(screen.getByText(/no family members yet/i)).toBeInTheDocument();
    });

    it('shows add member button', () => {
      renderApp();
      expect(screen.getByText(/add family member/i)).toBeInTheDocument();
    });
  });

  describe('navigation flow', () => {
    it('navigates to add member form when button clicked', () => {
      renderApp();
      fireEvent.click(screen.getByText(/add family member/i));
      expect(screen.getByText('Add Family Member')).toBeInTheDocument();
    });

    it('returns to home when cancel clicked on add form', () => {
      renderApp();
      fireEvent.click(screen.getByText(/add family member/i));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByText(/gear/i, { selector: 'h1' })).toBeInTheDocument();
    });
  });

  describe('with members loaded', () => {
    beforeEach(async () => {
      const { useFamilyMembers, useGearItems } = await import('../../hooks');
      vi.mocked(useFamilyMembers).mockReturnValue({
        members: [
          {
            id: '1',
            userId: 'u1',
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        loading: false,
        error: null,
        addMember: vi.fn(),
        updateMember: vi.fn(),
        updateMeasurements: vi.fn(),
        updateSkillLevels: vi.fn(),
        deleteMember: vi.fn(),
      });
      vi.mocked(useGearItems).mockReturnValue({
        items: [],
        loading: false,
        error: null,
        addItem: vi.fn(),
        updateItem: vi.fn(),
        deleteItem: vi.fn(),
      });
    });

    it('displays member cards when members exist', () => {
      renderApp();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows bottom navigation when members exist', () => {
      renderApp();
      expect(screen.getByText('FAMILY')).toBeInTheDocument();
      expect(screen.getByText('GEAR')).toBeInTheDocument();
    });

    it('navigates to member detail on card click', () => {
      renderApp();
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('Member Details')).toBeInTheDocument();
    });
  });
});

// ============================================
// AUTH STATES
// ============================================
describe('App auth states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth loading', () => {
    beforeEach(async () => {
      const { useAuth } = await import('../../hooks');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: true,
        error: null,
        accountConflictEmail: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInGoogle: vi.fn(),
        signInFacebook: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        resendVerification: vi.fn(),
        clearError: vi.fn(),
        clearAccountConflict: vi.fn(),
      });
    });

    it('shows Gear Guru title and loading indicator', () => {
      renderApp();
      expect(screen.getByText(/gear/i, { selector: 'h1' })).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('unauthenticated', () => {
    beforeEach(async () => {
      const { useAuth } = await import('../../hooks');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
        accountConflictEmail: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInGoogle: vi.fn(),
        signInFacebook: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        resendVerification: vi.fn(),
        clearError: vi.fn(),
        clearAccountConflict: vi.fn(),
      });
    });

    it('shows auth form when not logged in', () => {
      renderApp();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });
  });
});

// ============================================
// TAB NAVIGATION
// ============================================
describe('App tab navigation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAuth, useFamilyMembers, useGearItems } = await import('../../hooks');
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'u1', displayName: 'Tester', email: 'test@test.com', providerData: [] } as any,
      loading: false,
      error: null,
      accountConflictEmail: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInGoogle: vi.fn(),
      signInFacebook: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      resendVerification: vi.fn(),
      clearError: vi.fn(),
      clearAccountConflict: vi.fn(),
    });
    vi.mocked(useFamilyMembers).mockReturnValue({
      members: [{
        id: 'm1', userId: 'u1', name: 'Tab User', dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        measurements: { height: 180, weight: 80, footLengthLeft: 27, footLengthRight: 27, measuredAt: '' },
        createdAt: '', updatedAt: '',
      }],
      loading: false,
      error: null,
      addMember: vi.fn(),
      updateMember: vi.fn(),
      updateMeasurements: vi.fn(),
      updateSkillLevels: vi.fn(),
      deleteMember: vi.fn(),
    });
    vi.mocked(useGearItems).mockReturnValue({
      items: [], loading: false, error: null,
      addItem: vi.fn(), updateItem: vi.fn(), deleteItem: vi.fn(),
    });
  });

  it('shows Gear Inventory when GEAR tab clicked', () => {
    renderApp();
    fireEvent.click(screen.getByText('GEAR'));
    expect(screen.getByRole('heading', { name: 'Family Gear' })).toBeInTheDocument();
  });

  it('shows Measure screen when MEASURE tab clicked', () => {
    renderApp();
    fireEvent.click(screen.getByText('MEASURE'));
    expect(screen.getByText('Measure')).toBeInTheDocument();
  });

  it('shows Resources screen when RESOURCES tab clicked', () => {
    renderApp();
    fireEvent.click(screen.getByText('RESOURCES'));
    expect(screen.getAllByText('Nordic Skiing').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates member from measure tab to edit form', () => {
    renderApp();
    fireEvent.click(screen.getByText('MEASURE'));
    fireEvent.click(screen.getByText('Tab User'));
    expect(screen.getByText('Edit Family Member')).toBeInTheDocument();
  });
});

// ============================================
// MEMBER OPERATIONS
// ============================================
describe('App member operations', () => {
  const mockSignOut = vi.fn();
  const mockDeleteMember = vi.fn().mockResolvedValue(undefined);
  const mockUpdateMember = vi.fn().mockResolvedValue(undefined);
  const mockUpdateSkillLevels = vi.fn().mockResolvedValue(undefined);
  const mockAddGearItem = vi.fn().mockResolvedValue({ id: 'g1' });

  const testMember = {
    id: 'member-1',
    userId: 'user-1',
    name: 'Jane Smith',
    dateOfBirth: '1985-06-20',
    gender: 'female' as const,
    measurements: {
      height: 165,
      weight: 60,
      footLengthLeft: 25,
      footLengthRight: 25,
      measuredAt: '',
    },
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { useAuth, useFamilyMembers, useGearItems } = await import('../../hooks');
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user-1', displayName: 'Jane', email: 'jane@example.com', providerData: [] } as any,
      loading: false,
      error: null,
      accountConflictEmail: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInGoogle: vi.fn(),
      signInFacebook: vi.fn(),
      signOut: mockSignOut,
      sendPasswordReset: vi.fn(),
      resendVerification: vi.fn(),
      clearError: vi.fn(),
      clearAccountConflict: vi.fn(),
    });
    vi.mocked(useFamilyMembers).mockReturnValue({
      members: [testMember],
      loading: false,
      error: null,
      addMember: vi.fn(),
      updateMember: mockUpdateMember,
      updateMeasurements: vi.fn(),
      updateSkillLevels: mockUpdateSkillLevels,
      deleteMember: mockDeleteMember,
    });
    vi.mocked(useGearItems).mockReturnValue({
      items: [], loading: false, error: null,
      addItem: mockAddGearItem, updateItem: vi.fn(), deleteItem: vi.fn(),
    });
  });

  it('calls signOut via settings screen', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows loading text when members are loading', async () => {
    const { useFamilyMembers } = await import('../../hooks');
    vi.mocked(useFamilyMembers).mockReturnValue({
      members: [], loading: true, error: null,
      addMember: vi.fn(), updateMember: vi.fn(), updateMeasurements: vi.fn(),
      updateSkillLevels: vi.fn(), deleteMember: vi.fn(),
    });
    renderApp();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when members fail to load', async () => {
    const { useFamilyMembers } = await import('../../hooks');
    vi.mocked(useFamilyMembers).mockReturnValue({
      members: [], loading: false, error: new Error('DB error'),
      addMember: vi.fn(), updateMember: vi.fn(), updateMeasurements: vi.fn(),
      updateSkillLevels: vi.fn(), deleteMember: vi.fn(),
    });
    renderApp();
    expect(screen.getByText(/db error/i)).toBeInTheDocument();
  });

  it('calls deleteMember when delete confirmed on member card', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(mockDeleteMember).toHaveBeenCalledWith('member-1');
  });

  it('shows edit form when member card edit button clicked', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByText('Edit Family Member')).toBeInTheDocument();
  });

  it('navigates to member detail when card clicked', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    expect(screen.getByText('Member Details')).toBeInTheDocument();
  });

  it('navigates back to home from detail view', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText(/gear/i, { selector: 'h1' })).toBeInTheDocument();
  });

  it('shows sport sizing from detail view', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByText(/all sports/i));
    expect(screen.getAllByText('Alpine').length).toBeGreaterThanOrEqual(1);
  });

  it('shows shoe size converter from detail view', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByText('25 cm'));
    expect(screen.getByText('Size Converter')).toBeInTheDocument();
  });

  it('shows gear form when Add Gear clicked from detail view', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByRole('button', { name: /add gear/i }));
    expect(screen.getByRole('heading', { name: 'Add Gear' })).toBeInTheDocument();
  });

  it('returns to sizing when gear form cancelled from detail view', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByRole('button', { name: /add gear/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    // from=/family/member-1/sizing → navigates to sizing page
    expect(screen.getAllByText('Alpine').length).toBeGreaterThanOrEqual(1);
  });

  it('submits gear form and calls addGearItem', async () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByRole('button', { name: /add gear/i }));
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
    await waitFor(() => expect(mockAddGearItem).toHaveBeenCalled());
  });

  it('navigates to edit member form from detail view', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByRole('button', { name: /edit member/i }));
    expect(screen.getByText('Edit Family Member')).toBeInTheDocument();
  });

  it('returns to detail when edit member form cancelled', () => {
    renderApp();
    fireEvent.click(screen.getByText('Jane Smith'));
    fireEvent.click(screen.getByRole('button', { name: /edit member/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Member Details')).toBeInTheDocument();
  });
});

// ============================================
// GEAR OPERATIONS FROM INVENTORY
// ============================================
describe('App gear from inventory', () => {
  const mockAddGearItem = vi.fn().mockResolvedValue({ id: 'g1' });

  const testMember = {
    id: 'member-1', userId: 'user-1', name: 'Gear User',
    dateOfBirth: '1990-01-01', gender: 'male' as const,
    measurements: { height: 180, weight: 80, footLengthLeft: 27, footLengthRight: 27, measuredAt: '' },
    createdAt: '', updatedAt: '',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAuth, useFamilyMembers, useGearItems } = await import('../../hooks');
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user-1', displayName: 'Tester', email: 't@t.com', providerData: [] } as any,
      loading: false, error: null,
      accountConflictEmail: null,
      signIn: vi.fn(), signUp: vi.fn(), signInGoogle: vi.fn(),
      signInFacebook: vi.fn(), signOut: vi.fn(),
      sendPasswordReset: vi.fn(), resendVerification: vi.fn(),
      clearError: vi.fn(), clearAccountConflict: vi.fn(),
    });
    vi.mocked(useFamilyMembers).mockReturnValue({
      members: [testMember], loading: false, error: null,
      addMember: vi.fn(), updateMember: vi.fn(), updateMeasurements: vi.fn(),
      updateSkillLevels: vi.fn(), deleteMember: vi.fn(),
    });
    vi.mocked(useGearItems).mockReturnValue({
      items: [], loading: false, error: null,
      addItem: mockAddGearItem, updateItem: vi.fn(), deleteItem: vi.fn(),
    });
  });

  it('shows gear form from inventory add gear button', () => {
    renderApp();
    fireEvent.click(screen.getByText('GEAR'));
    // Select specific member to show Add Gear button
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
    fireEvent.click(screen.getByText('+ Add Gear'));
    expect(screen.getByRole('heading', { name: 'Add Gear' })).toBeInTheDocument();
  });

  it('returns to gear view when gear form cancelled from inventory', () => {
    renderApp();
    fireEvent.click(screen.getByText('GEAR'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
    fireEvent.click(screen.getByText('+ Add Gear'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Family Gear' })).toBeInTheDocument();
  });

  it('calls addGearItem on gear form submit from inventory', async () => {
    renderApp();
    fireEvent.click(screen.getByText('GEAR'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'member-1' } });
    fireEvent.click(screen.getByText('+ Add Gear'));
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Fischer' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Crown' } });
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: '190cm' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
    await waitFor(() => expect(mockAddGearItem).toHaveBeenCalled());
  });
});
