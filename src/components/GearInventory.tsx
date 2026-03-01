import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 shadow-sm flex items-center gap-3">
        <button
          className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all flex-shrink-0"
          onClick={onBack}
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="sr-only">← Home</span>
        </button>
        <h1 className="text-base font-black text-slate-900 uppercase tracking-tight flex-1">Family Gear</h1>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
        <label htmlFor="owner-filter" className="text-xs font-bold text-slate-500 uppercase tracking-wide flex-shrink-0">
          Filter by owner:
        </label>
        <select
          id="owner-filter"
          value={filterOwnerId}
          onChange={(e) => setFilterOwnerId(e.target.value)}
          className="flex-1 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008751]/30"
        >
          <option value="all">All Members</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-slate-400 font-bold text-sm">No gear found.</p>
            {filterOwnerId !== 'all' && (
              <button
                className="btn btn-primary"
                onClick={() => onAddGear(filterOwnerId)}
              >
                + Add Gear
              </button>
            )}
          </div>
        ) : filterOwnerId === 'all' ? (
          // Grouped by owner
          <div className="flex flex-col gap-6">
            {Object.values(groupedByOwner).map(({ member, items }) => (
              <div key={member.id}>
                {/* Group header */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {member.name}
                  </h2>
                  <button
                    className="text-xs font-bold text-[#008751] hover:text-emerald-800 transition-colors"
                    onClick={() => onAddGear(member.id)}
                  >
                    + Add
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold py-2">No gear yet</p>
                ) : (
                  <div>
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
          // Flat list for a specific owner
          <div>
            {filteredItems.map((item) => (
              <GearCard
                key={item.id}
                item={item}
                onEdit={onEditGear}
                onDelete={onDeleteGear}
              />
            ))}
            <button
              className="btn btn-primary w-full mt-2"
              onClick={() => onAddGear(filterOwnerId)}
            >
              + Add Gear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
