import type { FamilyMember } from '../types';

interface MemberCardProps {
  member: FamilyMember;
  onSelect: (member: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

export function MemberCard({
  member,
  onSelect,
  onEdit,
  onDelete,
}: MemberCardProps) {
  const age = calculateAge(member.dateOfBirth);
  const { measurements } = member;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${member.name}?`)) {
      onDelete(member);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(member);
  };

  return (
    <div className="member-card" onClick={() => onSelect(member)}>
      <div className="member-card-main">
        <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
        <div className="member-info">
          <span className="member-name">{member.name}</span>
          <span className="member-details">
            {age} yrs • {measurements.height} cm • {measurements.weight} kg
          </span>
        </div>
      </div>
      <div className="member-card-actions">
        <button
          className="btn-icon"
          onClick={handleEdit}
          aria-label="Edit member"
        >
          ✏️
        </button>
        <button
          className="btn-icon btn-icon-danger"
          onClick={handleDelete}
          aria-label="Delete member"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
