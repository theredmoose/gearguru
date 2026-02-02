import { useState } from 'react';
import type { FamilyMember, GearItem } from '../types';
import { GearCard } from './GearCard';

interface GearInventoryProps {
  members: FamilyMember[];
  gearItems: GearItem[];
  onBack: () => void;
  onAddGear: (ownerId: string) => void;
  onEditGear: (item: GearItem) => void;
  onDeleteGear: (item: GearItem) => void;
}

export function GearInventory({
  members,
  gearItems,
  onBack,
  onAddGear,
  onEditGear,
  onDeleteGear,
}: GearInventoryProps) {
  const [filterOwnerId, setFilterOwnerId] = useState<string>('all');

  const filteredItems =
    filterOwnerId === 'all'
      ? gearItems
      : gearItems.filter((item) => item.ownerId === filterOwnerId);

  // Group gear by owner for display
  const groupedByOwner = members.reduce(
    (acc, member) => {
      const memberGear = filteredItems.filter((item) => item.ownerId === member.id);
      if (memberGear.length > 0 || filterOwnerId === member.id) {
        acc[member.id] = {
          member,
          items: memberGear,
        };
      }
      return acc;
    },
    {} as Record<string, { member: FamilyMember; items: GearItem[] }>
  );

  return (
    <div className="gear-inventory">
      <header className="detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Home
        </button>
        <h1>Family Gear</h1>
        <div style={{ width: 60 }} /> {/* Spacer for centering */}
      </header>

      <div className="inventory-content">
        <div className="inventory-filter">
          <label htmlFor="owner-filter">Filter by owner:</label>
          <select
            id="owner-filter"
            value={filterOwnerId}
            onChange={(e) => setFilterOwnerId(e.target.value)}
          >
            <option value="all">All Members</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>No gear found.</p>
            {filterOwnerId !== 'all' && (
              <button
                className="btn btn-primary"
                onClick={() => onAddGear(filterOwnerId)}
                style={{ marginTop: '1rem' }}
              >
                + Add Gear
              </button>
            )}
          </div>
        ) : filterOwnerId === 'all' ? (
          // Show grouped by owner when viewing all
          <div className="inventory-groups">
            {Object.values(groupedByOwner).map(({ member, items }) => (
              <div key={member.id} className="inventory-group">
                <div className="inventory-group-header">
                  <h2>{member.name}</h2>
                  <button
                    className="btn-link"
                    onClick={() => onAddGear(member.id)}
                  >
                    + Add
                  </button>
                </div>
                {items.length === 0 ? (
                  <p className="inventory-group-empty">No gear yet</p>
                ) : (
                  <div className="gear-list">
                    {items.map((item) => (
                      <GearCard
                        key={item.id}
                        item={item}
                        onEdit={onEditGear}
                        onDelete={onDeleteGear}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Flat list when filtering by specific owner
          <div className="gear-list">
            {filteredItems.map((item) => (
              <GearCard
                key={item.id}
                item={item}
                onEdit={onEditGear}
                onDelete={onDeleteGear}
              />
            ))}
            <button
              className="btn btn-primary"
              onClick={() => onAddGear(filterOwnerId)}
            >
              + Add Gear
            </button>
          </div>
        )}

        {filterOwnerId === 'all' && members.length > 0 && (
          <div className="inventory-add-section">
            <p className="inventory-add-hint">
              Select a member from the filter above to add gear for them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
