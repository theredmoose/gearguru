import { useState } from 'react';
import {
  MemberForm,
  MemberCard,
  MemberDetail,
  SportSizing,
  ShoeSizeConverter,
} from './components';
import { useFamilyMembers } from './hooks';
import type { FamilyMember } from './types';

type View = 'home' | 'add' | 'edit' | 'detail' | 'sizing' | 'converter';

function App() {
  const { members, loading, error, addMember, updateMember, deleteMember } =
    useFamilyMembers();
  const [view, setView] = useState<View>('home');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

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
    return (
      <div className="app">
        <SportSizing
          member={selectedMember}
          onBack={() => setView('detail')}
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

  // Home View
  return (
    <div className="app">
      <header className="header">
        <h1>Gear Guru</h1>
        <p>Sports Equipment Sizing Calculator</p>
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
