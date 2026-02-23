import { useState } from 'react';

function getOperationErrorMessage(err: unknown, context: 'load' | 'save' = 'save'): string {
  const code = (err as { code?: string })?.code ?? '';
  if (code === 'unavailable' || code === 'network-request-failed') {
    return context === 'load'
      ? 'Unable to load data — check your connection and try again.'
      : 'Unable to save — check your connection and try again.';
  }
  if (code === 'permission-denied') {
    return 'Permission denied. Please sign out and sign back in.';
  }
  if (err instanceof Error && err.message) return err.message;
  return 'Something went wrong. Please try again.';
}
import { Settings } from 'lucide-react';
import {
  MemberForm,
  MemberCard,
  MemberDetail,
  SportSizing,
  ShoeSizeConverter,
  AuthForm,
  GearForm,
  GearInventory,
  BottomNav,
  MeasureScreen,
  ResourcesScreen,
  SettingsScreen,
} from './components';
import type { TopLevelTab } from './components';
import { useFamilyMembers, useAuth, useGearItems, useSettings } from './hooks';
import type { FamilyMember, GearItem, Sport } from './types';

type View =
  | 'home'
  | 'add'
  | 'edit'
  | 'detail'
  | 'sizing'
  | 'converter'
  | 'inventory'
  | 'add-gear'
  | 'edit-gear'
  | 'settings';

function App() {
  const {
    user,
    loading: authLoading,
    error: authError,
    accountConflictEmail,
    signIn,
    signUp,
    signInGoogle,
    signInFacebook,
    signOut,
    sendPasswordReset,
    resendVerification,
    clearError: clearAuthError,
    clearAccountConflict,
  } = useAuth();
  const { members, loading, error, addMember, updateMember, updateSkillLevels, deleteMember } =
    useFamilyMembers(user?.uid ?? null);
  const { items: gearItems, addItem: addGearItem, updateItem: updateGearItem, deleteItem: deleteGearItem } =
    useGearItems(user?.uid ?? null);
  const { settings, updateSettings, resetSettings } = useSettings();

  const [view, setView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<TopLevelTab>('family');
  const [operationError, setOperationError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [selectedGearItem, setSelectedGearItem] = useState<GearItem | null>(null);
  const [gearOwnerId, setGearOwnerId] = useState<string | null>(null);
  const [gearDefaultSport, setGearDefaultSport] = useState<Sport | undefined>(undefined);

  // ── Tab navigation ──────────────────────────────────────────────
  const handleTabChange = (tab: TopLevelTab) => {
    setActiveTab(tab);
    // Reset detail views when switching top-level tabs
    setView('home');
    setSelectedMember(null);
    setSelectedGearItem(null);
  };

  // ── Member handlers ─────────────────────────────────────────────
  const handleAddMember = async (
    data: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    try {
      await addMember({ ...data, userId: user.uid });
      setView('home');
    } catch (err) {
      setOperationError(getOperationErrorMessage(err));
    }
  };

  const handleUpdateMember = async (
    data: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedMember) {
      try {
        await updateMember(selectedMember.id, data);
        setSelectedMember({ ...selectedMember, ...data });
        setView('detail');
      } catch (err) {
        setOperationError(getOperationErrorMessage(err));
      }
    }
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    try {
      await deleteMember(member.id);
      if (selectedMember?.id === member.id) {
        setSelectedMember(null);
        setView('home');
      }
    } catch (err) {
      setOperationError(getOperationErrorMessage(err));
    }
  };

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setView('detail');
  };

  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setView('edit');
  };

  // ── Gear handlers ────────────────────────────────────────────────
  const handleAddGearFromSizing = (sport: Sport) => {
    if (selectedMember) {
      setGearOwnerId(selectedMember.id);
      setGearDefaultSport(sport);
      setSelectedGearItem(null);
      setView('add-gear');
    }
  };

  const handleAddGearFromInventory = (ownerId: string) => {
    setGearOwnerId(ownerId);
    setGearDefaultSport(undefined);
    setSelectedGearItem(null);
    setView('add-gear');
  };

  const handleEditGear = (item: GearItem) => {
    setSelectedGearItem(item);
    setGearOwnerId(item.ownerId);
    setGearDefaultSport(item.sport);
    setView('edit-gear');
  };

  const handleDeleteGear = async (item: GearItem) => {
    await deleteGearItem(item.id);
  };

  const handleGearSubmit = async (
    data: Omit<GearItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    try {
      if (selectedGearItem) {
        await updateGearItem(selectedGearItem.id, data);
      } else {
        await addGearItem({ ...data, userId: user.uid });
      }
      if (gearDefaultSport && selectedMember) {
        setView('sizing');
      } else {
        setView('home');
      }
    } catch (err) {
      setOperationError(getOperationErrorMessage(err));
    }
  };

  const handleGearCancel = () => {
    if (gearDefaultSport && selectedMember) {
      setView('sizing');
    } else {
      setView('home');
    }
  };

  // ── Auth screens ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app">
        <div className="auth-loading">
          <h1>Gear Guru</h1>
          <p className="loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        onEmailSignIn={signIn}
        onEmailSignUp={signUp}
        onGoogleSignIn={signInGoogle}
        onFacebookSignIn={signInFacebook}
        onPasswordReset={sendPasswordReset}
        error={authError}
        loading={authLoading}
        onClearError={clearAuthError}
        accountConflictEmail={accountConflictEmail}
        onClearAccountConflict={clearAccountConflict}
      />
    );
  }

  // ── Main tabbed shell ────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'gear':
        return (
          <GearInventory
            members={members}
            gearItems={gearItems}
            onBack={() => handleTabChange('family')}
            onAddGear={handleAddGearFromInventory}
            onEditGear={handleEditGear}
            onDeleteGear={handleDeleteGear}
          />
        );
      case 'measure':
        return (
          <MeasureScreen
            members={members}
            onSelectMember={(member) => {
              setSelectedMember(member);
              setView('edit');
            }}
          />
        );
      case 'resources':
        return <ResourcesScreen />;
      default: // 'family'
        return (
          <div className="flex flex-col min-h-0 flex-1">
            {/* Blue app header */}
            <div className="px-6 py-4 bg-blue-700 border-b border-blue-800 shadow-sm flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">Gear Guru</h1>
                <p className="text-blue-200 text-xs">Sports equipment sizing</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-200 text-xs truncate max-w-[100px]">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={() => setView('settings')}
                  className="p-1.5 hover:bg-blue-600 rounded-full transition-colors"
                  aria-label="Open settings"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
              {loading && <p className="loading">Loading...</p>}
              {error && <p className="error-state">{getOperationErrorMessage(error, 'load')}</p>}

              {!loading && !error && members.length === 0 && (
                <p className="empty-state">
                  No family members yet. Add someone to get started with equipment sizing.
                </p>
              )}

              {!loading && members.length > 0 && (
                <div className="member-list mb-4">
                  {members.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onSelect={handleSelectMember}
                      onEdit={handleEditMember}
                      onDelete={handleDeleteMember}
                    />
                  ))}
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={() => { setSelectedMember(null); setView('add'); }}
              >
                + Add Family Member
              </button>
            </div>
          </div>
        );
    }
  };

  const renderView = () => {
    if (view === 'settings') {
      return (
        <SettingsScreen
          settings={settings}
          user={user}
          onUpdateSettings={updateSettings}
          onResetSettings={resetSettings}
          onSignOut={signOut}
          onSendPasswordReset={sendPasswordReset}
          onBack={() => setView('home')}
        />
      );
    }

    if (view === 'add' || view === 'edit') {
      return (
        <MemberForm
          member={view === 'edit' ? selectedMember ?? undefined : undefined}
          onSubmit={view === 'edit' ? handleUpdateMember : handleAddMember}
          onCancel={() => setView(selectedMember ? 'detail' : 'home')}
        />
      );
    }

    if (view === 'detail' && selectedMember) {
      const memberGear = gearItems.filter((item) => item.ownerId === selectedMember.id);
      return (
        <MemberDetail
          member={selectedMember}
          gearItems={memberGear}
          settings={settings}
          onUpdateSettings={updateSettings}
          onBack={() => { setSelectedMember(null); setView('home'); }}
          onEdit={() => setView('edit')}
          onGetSizing={() => setView('sizing')}
          onOpenConverter={() => setView('converter')}
          onAddGear={() => handleAddGearFromSizing('alpine')}
          onEditGear={handleEditGear}
        />
      );
    }

    if (view === 'sizing' && selectedMember) {
      const memberGear = gearItems.filter((item) => item.ownerId === selectedMember.id);
      return (
        <SportSizing
          member={selectedMember}
          gearItems={memberGear}
          onBack={() => setView('detail')}
          onSkillLevelChange={(levels) => updateSkillLevels(selectedMember.id, levels)}
          onAddGear={handleAddGearFromSizing}
          onEditGear={handleEditGear}
          onDeleteGear={handleDeleteGear}
          defaultSizingModel={settings.sizingModel}
          defaultSizingDisplay={settings.sizingDisplay}
        />
      );
    }

    if (view === 'converter' && selectedMember) {
      const footLength = Math.max(
        selectedMember.measurements.footLengthLeft,
        selectedMember.measurements.footLengthRight
      );
      return (
        <ShoeSizeConverter
          footLengthCm={footLength}
          onClose={() => setView('detail')}
        />
      );
    }

    if ((view === 'add-gear' || view === 'edit-gear') && gearOwnerId) {
      return (
        <GearForm
          item={view === 'edit-gear' ? selectedGearItem ?? undefined : undefined}
          ownerId={gearOwnerId}
          defaultSport={gearDefaultSport}
          defaultDIN={settings.defaultDIN}
          onSubmit={handleGearSubmit}
          onCancel={handleGearCancel}
        />
      );
    }

    // Default: main tabbed shell
    return (
      <>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderTabContent()}
        </div>
        <BottomNav activeTab={activeTab} onChange={handleTabChange} />
      </>
    );
  };

  // Show email verification banner for email/password accounts that haven't verified yet
  const isEmailProvider = user.providerData?.some(p => p.providerId === 'password');
  const showVerificationBanner = isEmailProvider && !user.emailVerified;
  const [verificationResent, setVerificationResent] = useState(false);

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      setVerificationResent(true);
    } catch {
      // error already set in hook
    }
  };

  return (
    <div className="app flex flex-col" style={{ minHeight: '100dvh' }}>
      {showVerificationBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-amber-800 font-semibold">
            {verificationResent
              ? 'Verification email sent — check your inbox.'
              : 'Please verify your email address.'}
          </span>
          {!verificationResent && (
            <button
              className="text-amber-700 font-black underline hover:text-amber-900 whitespace-nowrap"
              onClick={handleResendVerification}
            >
              Resend email
            </button>
          )}
        </div>
      )}
      {renderView()}
      {operationError && (
        <div
          role="alert"
          className="fixed bottom-20 left-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between"
        >
          <span className="text-sm font-semibold">{operationError}</span>
          <button
            onClick={() => setOperationError(null)}
            aria-label="Dismiss error"
            className="ml-3 text-white hover:text-red-200 font-bold text-lg leading-none"
          >✕</button>
        </div>
      )}
    </div>
  );
}

export default App;
