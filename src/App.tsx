import { useState } from 'react';
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
} from './components';
import type { TopLevelTab } from './components';
import { useFamilyMembers, useAuth, useGearItems } from './hooks';
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
  | 'edit-gear';

function App() {
  const {
    user,
    loading: authLoading,
    error: authError,
    signIn,
    signUp,
    signInGoogle,
    signInFacebook,
    signOut,
    sendPasswordReset,
    clearError: clearAuthError,
  } = useAuth();
  const { members, loading, error, addMember, updateMember, updateSkillLevels, deleteMember } =
    useFamilyMembers(user?.uid ?? null);
  const { items: gearItems, addItem: addGearItem, updateItem: updateGearItem, deleteItem: deleteGearItem } =
    useGearItems(user?.uid ?? null);

  const [view, setView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<TopLevelTab>('family');
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
    await addMember({ ...data, userId: user.uid });
    setView('home');
  };

  const handleUpdateMember = async (
    data: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedMember) {
      await updateMember(selectedMember.id, data);
      setSelectedMember({ ...selectedMember, ...data });
      setView('detail');
    }
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    await deleteMember(member.id);
    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
      setView('home');
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
      />
    );
  }

  // ── Full-screen overlay views (no bottom nav) ────────────────────
  if (view === 'add' || view === 'edit') {
    return (
      <div className="app">
        <MemberForm
          member={view === 'edit' ? selectedMember ?? undefined : undefined}
          onSubmit={view === 'edit' ? handleUpdateMember : handleAddMember}
          onCancel={() => setView(selectedMember ? 'detail' : 'home')}
        />
      </div>
    );
  }

  if (view === 'detail' && selectedMember) {
    const memberGear = gearItems.filter((item) => item.ownerId === selectedMember.id);
    return (
      <div className="app">
        <MemberDetail
          member={selectedMember}
          gearItems={memberGear}
          onBack={() => { setSelectedMember(null); setView('home'); }}
          onEdit={() => setView('edit')}
          onGetSizing={() => setView('sizing')}
          onOpenConverter={() => setView('converter')}
          onAddGear={() => handleAddGearFromSizing('alpine')}
          onEditGear={handleEditGear}
        />
      </div>
    );
  }

  if (view === 'sizing' && selectedMember) {
    const memberGear = gearItems.filter((item) => item.ownerId === selectedMember.id);
    return (
      <div className="app">
        <SportSizing
          member={selectedMember}
          gearItems={memberGear}
          onBack={() => setView('detail')}
          onSkillLevelChange={(levels) => updateSkillLevels(selectedMember.id, levels)}
          onAddGear={handleAddGearFromSizing}
          onEditGear={handleEditGear}
          onDeleteGear={handleDeleteGear}
        />
      </div>
    );
  }

  if (view === 'converter' && selectedMember) {
    const footLength = Math.max(
      selectedMember.measurements.footLengthLeft,
      selectedMember.measurements.footLengthRight
    );
    return (
      <div className="app">
        <ShoeSizeConverter
          footLengthCm={footLength}
          onClose={() => setView('detail')}
        />
      </div>
    );
  }

  if ((view === 'add-gear' || view === 'edit-gear') && gearOwnerId) {
    return (
      <div className="app">
        <GearForm
          item={view === 'edit-gear' ? selectedGearItem ?? undefined : undefined}
          ownerId={gearOwnerId}
          defaultSport={gearDefaultSport}
          onSubmit={handleGearSubmit}
          onCancel={handleGearCancel}
        />
      </div>
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
                  onClick={signOut}
                  className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
              {loading && <p className="loading">Loading...</p>}
              {error && <p className="error-state">Error: {error.message}</p>}

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

  return (
    <div className="app flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {renderTabContent()}
      </div>
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}

export default App;
