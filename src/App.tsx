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
} from './components';
import { useFamilyMembers, useAuth, useGearItems } from './hooks';
import type { FamilyMember, GearItem, Sport } from './types';

type View = 'home' | 'add' | 'edit' | 'detail' | 'sizing' | 'converter' | 'inventory' | 'add-gear' | 'edit-gear';

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
    useFamilyMembers();
  const { items: gearItems, addItem: addGearItem, updateItem: updateGearItem, deleteItem: deleteGearItem } =
    useGearItems();
  const [view, setView] = useState<View>('home');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [selectedGearItem, setSelectedGearItem] = useState<GearItem | null>(null);
  const [gearOwnerId, setGearOwnerId] = useState<string | null>(null);
  const [gearDefaultSport, setGearDefaultSport] = useState<Sport | undefined>(undefined);

  const handleAddMember = async (
    data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    await addMember(data);
    setView('home');
  };

  const handleUpdateMember = async (
    data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
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

  // Gear handlers
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

  const handleGearSubmit = async (data: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedGearItem) {
      await updateGearItem(selectedGearItem.id, data);
    } else {
      await addGearItem(data);
    }
    // Return to previous view
    if (view === 'add-gear' || view === 'edit-gear') {
      if (gearDefaultSport && selectedMember) {
        setView('sizing');
      } else {
        setView('inventory');
      }
    }
  };

  const handleGearCancel = () => {
    if (gearDefaultSport && selectedMember) {
      setView('sizing');
    } else {
      setView('inventory');
    }
  };

  // Auth Loading Screen
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

  // Auth Screen (not logged in)
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

  // Member Form View
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

  // Member Detail View
  if (view === 'detail' && selectedMember) {
    return (
      <div className="app">
        <MemberDetail
          member={selectedMember}
          onBack={() => {
            setSelectedMember(null);
            setView('home');
          }}
          onEdit={() => setView('edit')}
          onGetSizing={() => setView('sizing')}
          onOpenConverter={() => setView('converter')}
        />
      </div>
    );
  }

  // Sport Sizing View (swipeable)
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

  // Shoe Size Converter View
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

  // Gear Inventory View
  if (view === 'inventory') {
    return (
      <div className="app">
        <GearInventory
          members={members}
          gearItems={gearItems}
          onBack={() => setView('home')}
          onAddGear={handleAddGearFromInventory}
          onEditGear={handleEditGear}
          onDeleteGear={handleDeleteGear}
        />
      </div>
    );
  }

  // Gear Form View (Add/Edit)
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

  // Home View
  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="header-title">
            <h1>Gear Guru</h1>
            <p>Sports Equipment Sizing Calculator</p>
          </div>
          <div className="user-header">
            <span className="user-name">{user.displayName || user.email}</span>
            <button
              className="btn btn-secondary btn-signout"
              onClick={signOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="section">
          <h2>Family Members</h2>

          {loading && <p className="loading">Loading...</p>}

          {error && <p className="error-state">Error: {error.message}</p>}

          {!loading && !error && members.length === 0 && (
            <p className="empty-state">
              No family members yet. Add someone to get started with equipment sizing.
            </p>
          )}

          {!loading && members.length > 0 && (
            <div className="member-list">
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
            onClick={() => {
              setSelectedMember(null);
              setView('add');
            }}
          >
            + Add Family Member
          </button>
        </section>

        {members.length > 0 && (
          <section className="section">
            <button
              className="btn btn-secondary"
              onClick={() => setView('inventory')}
            >
              Family Gear Inventory
            </button>
          </section>
        )}

        {members.length > 0 && (
          <section className="section">
            <h2>Quick Tip</h2>
            <p className="tip-text">
              Tap a family member to view their measurements and get equipment
              sizing recommendations for Nordic, Alpine, Snowboard, and Hockey.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
