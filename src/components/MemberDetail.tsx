import type { FamilyMember } from '../types';
import { getShoeSizesFromFootLength } from '../services/shoeSize';

interface MemberDetailProps {
  member: FamilyMember;
  onBack: () => void;
  onEdit: () => void;
  onGetSizing: () => void;
  onOpenConverter: () => void;
}

export function MemberDetail({
  member,
  onBack,
  onEdit,
  onGetSizing,
  onOpenConverter,
}: MemberDetailProps) {
  const { measurements } = member;
  const age = calculateAge(member.dateOfBirth);
  const footLength = Math.max(
    measurements.footLengthLeft,
    measurements.footLengthRight
  );
  const shoeSizes = footLength > 0 ? getShoeSizesFromFootLength(footLength) : null;

  return (
    <div className="member-detail">
      <header className="detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-edit" onClick={onEdit}>
          Edit
        </button>
      </header>

      <div className="detail-hero">
        <div className="detail-avatar">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <h1>{member.name}</h1>
        <p className="detail-subtitle">
          {age} years old • {member.gender}
        </p>
      </div>

      {/* Get Sizing CTA */}
      <div className="sizing-cta">
        <button className="btn btn-sizing" onClick={onGetSizing}>
          Get Equipment Sizing
        </button>
      </div>

      <section className="detail-section">
        <h2>Body Measurements</h2>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-value">{measurements.height}</span>
            <span className="stat-label">Height (cm)</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{measurements.weight}</span>
            <span className="stat-label">Weight (kg)</span>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <h2>Foot Measurements</h2>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-value">{measurements.footLengthLeft}</span>
            <span className="stat-label">Left (cm)</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{measurements.footLengthRight}</span>
            <span className="stat-label">Right (cm)</span>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="section-header">
          <h2>Shoe Sizes</h2>
          {shoeSizes && (
            <button className="btn-link" onClick={onOpenConverter}>
              Convert
            </button>
          )}
        </div>
        {shoeSizes ? (
          <div className="shoe-size-grid">
            <div className="shoe-size-item">
              <span className="shoe-size-value">{shoeSizes.eu}</span>
              <span className="shoe-size-label">EU</span>
            </div>
            <div className="shoe-size-item">
              <span className="shoe-size-value">{shoeSizes.usMen}</span>
              <span className="shoe-size-label">US M</span>
            </div>
            <div className="shoe-size-item">
              <span className="shoe-size-value">{shoeSizes.usWomen}</span>
              <span className="shoe-size-label">US W</span>
            </div>
            <div className="shoe-size-item">
              <span className="shoe-size-value">{shoeSizes.uk}</span>
              <span className="shoe-size-label">UK</span>
            </div>
            <div className="shoe-size-item">
              <span className="shoe-size-value">{shoeSizes.mondopoint}</span>
              <span className="shoe-size-label">Mondo</span>
            </div>
            <div className="shoe-size-item">
              <span className="shoe-size-value">{shoeSizes.cm}</span>
              <span className="shoe-size-label">CM</span>
            </div>
          </div>
        ) : (
          <p className="empty-state">Enter foot measurements to see shoe sizes.</p>
        )}
      </section>

      <section className="detail-section">
        <h2>Last Updated</h2>
        <p className="last-updated">
          {new Date(measurements.measuredAt).toLocaleDateString()}
        </p>
      </section>
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
