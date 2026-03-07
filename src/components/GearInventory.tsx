import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { FamilyMember, GearItem } from '../types';
import { GearCard } from './GearCard';
import { ScreenHeader } from './ScreenHeader';
import { BTN_ADD_CLS, BTN_PILL_ACTIVE_CLS, BTN_PILL_INACTIVE_CLS } from '../constants/design';

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

  const addForOwnerId = filterOwnerId === 'all'
    ? (members.length > 0 ? members[0].id : null)
    : filterOwnerId;

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
      <ScreenHeader
        title="Family Gear"
        onBack={onBack}
        right={
          addForOwnerId ? (
            <button
              onClick={() => onAddGear(addForOwnerId)}
              className={BTN_ADD_CLS}
              aria-label="Add gear"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : undefined
        }
      />

      {/* Filter bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterOwnerId('all')}
            className={filterOwnerId === 'all' ? BTN_PILL_ACTIVE_CLS : BTN_PILL_INACTIVE_CLS}
          >
            All
          </button>
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setFilterOwnerId(member.id)}
              className={filterOwnerId === member.id ? BTN_PILL_ACTIVE_CLS : BTN_PILL_INACTIVE_CLS}
            >
              {member.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 pt-6 pb-8">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-slate-400 font-bold text-sm">No gear found.</p>
            {filterOwnerId !== 'all' && (
              <button
                className="px-6 py-3 bg-[#008751] text-white text-sm font-bold rounded-2xl shadow-sm"
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
                  <h2 className="text-xs font-black text-slate-500 tracking-widest">
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
              className="w-full flex items-center justify-center py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-all mt-2"
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
