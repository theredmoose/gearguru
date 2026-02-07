import type { FamilyMember, Sport, SkillLevel } from '../types';
import {
  calculateNordicSkiSizing,
  calculateNordicBootSizing,
  calculateAlpineSkiSizing,
  calculateAlpineBootSizing,
  calculateSnowboardSizing,
  calculateSnowboardBootSizing,
  calculateHelmetSizing,
} from '../services/sizing';

interface MemberInfoTableProps {
  member: FamilyMember;
  sport: Sport;
  skillLevel: SkillLevel;
}

export function MemberInfoTable({ member, sport, skillLevel }: MemberInfoTableProps) {
  const { measurements } = member;
  const footLength = Math.max(measurements.footLengthLeft, measurements.footLengthRight);

  // Get sport-specific sizing recommendations
  const getSizingRecommendations = () => {
    switch (sport) {
      case 'nordic-classic':
      case 'nordic-skate':
      case 'nordic-combi': {
        const skiSizing = calculateNordicSkiSizing(measurements, sport, skillLevel);
        const bootSizing = calculateNordicBootSizing(measurements);
        return {
          skis: `${skiSizing.skiLengthRecommended} cm`,
          poles: `${skiSizing.poleLengthRecommended} cm`,
          boots: `${bootSizing.mondopoint} MP`,
        };
      }
      case 'alpine': {
        const skiSizing = calculateAlpineSkiSizing(measurements, skillLevel, member.gender);
        const bootSizing = calculateAlpineBootSizing(measurements, skillLevel, member.gender);
        return {
          skis: `${skiSizing.skiLengthRecommended} cm`,
          poles: `${Math.round(measurements.height * 0.7)} cm`,
          boots: `${bootSizing.mondopoint} MP`,
        };
      }
      case 'snowboard': {
        const boardSizing = calculateSnowboardSizing(measurements, skillLevel);
        const bootSizing = calculateSnowboardBootSizing(measurements);
        return {
          board: `${boardSizing.boardLengthRecommended} cm`,
          boots: `${bootSizing.mondopoint} MP`,
        };
      }
      case 'hockey':
        return {
          skates: `US ${Math.round((measurements.usShoeSize ?? footLength * 1.5 + 2 - 32) - 1.5)}`,
        };
      default:
        return {};
    }
  };

  const sizing = getSizingRecommendations();
  const helmetSizing = measurements.headCircumference
    ? calculateHelmetSizing(measurements.headCircumference)
    : null;

  return (
    <div className="member-info-table">
      <table>
        <tbody>
          <tr>
            <th>Height</th>
            <td>{measurements.height} cm</td>
            <th>Weight</th>
            <td>{measurements.weight} kg</td>
          </tr>
          <tr>
            <th>Foot</th>
            <td>{footLength} cm</td>
            <th>Head</th>
            <td>{measurements.headCircumference ? `${measurements.headCircumference} cm` : '—'}</td>
          </tr>
          <tr className="member-info-table-divider">
            <td colSpan={4}></td>
          </tr>
          {sizing.skis && (
            <tr>
              <th>Skis</th>
              <td>{sizing.skis}</td>
              <th>Poles</th>
              <td>{sizing.poles}</td>
            </tr>
          )}
          {sizing.board && (
            <tr>
              <th>Board</th>
              <td>{sizing.board}</td>
              <th>Boots</th>
              <td>{sizing.boots}</td>
            </tr>
          )}
          {sizing.skates && (
            <tr>
              <th>Skates</th>
              <td>{sizing.skates}</td>
              <th></th>
              <td></td>
            </tr>
          )}
          {sizing.boots && !sizing.board && (
            <tr>
              <th>Boots</th>
              <td>{sizing.boots}</td>
              <th>Helmet</th>
              <td>{helmetSizing ? helmetSizing.size : '—'}</td>
            </tr>
          )}
          {!sizing.boots && helmetSizing && (
            <tr>
              <th>Helmet</th>
              <td>{helmetSizing.size}</td>
              <th></th>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
