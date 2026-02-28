import { describe, it, expect } from 'vitest';
import { generateNotifications } from '../notifications';
import type { FamilyMember, GearItem } from '../../types';

const CURRENT_YEAR = new Date().getFullYear();

function makeMember(overrides: Partial<FamilyMember> = {}): FamilyMember {
  return {
    id: 'member-1',
    userId: 'user-1',
    name: 'Alice',
    dateOfBirth: '2005-01-01',
    gender: 'female',
    measurements: {
      height: 160,
      weight: 50,
      footLengthLeft: 23,
      footLengthRight: 23,
      measuredAt: '2024-01-01T00:00:00.000Z',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeGearItem(overrides: Partial<GearItem> = {}): GearItem {
  return {
    id: 'gear-1',
    userId: 'user-1',
    ownerId: 'member-1',
    sport: 'alpine',
    type: 'ski',
    brand: 'Rossignol',
    model: 'Hero',
    size: '150cm',
    condition: 'good',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('generateNotifications', () => {
  it('returns empty array when no gear items', () => {
    const result = generateNotifications([makeMember()], []);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when no members', () => {
    const result = generateNotifications([], [makeGearItem()]);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when all gear is in good or new condition with no old year', () => {
    const item = makeGearItem({ condition: 'good', year: CURRENT_YEAR });
    const result = generateNotifications([makeMember()], [item]);
    expect(result).toHaveLength(0);
  });

  describe('worn gear → replace notification', () => {
    it('generates a replace notification for worn gear', () => {
      const item = makeGearItem({ condition: 'worn' });
      const [n] = generateNotifications([makeMember()], [item]);
      expect(n.type).toBe('replace');
      expect(n.id).toBe('worn-gear-1');
      expect(n.title).toContain("Alice's");
      expect(n.title).toContain('Skis');
      expect(n.body).toContain('worn out');
    });

    it('includes member name "Unknown" when member not found', () => {
      const item = makeGearItem({ condition: 'worn', ownerId: 'missing-id' });
      const [n] = generateNotifications([makeMember()], [item]);
      expect(n.title).toContain('Unknown');
    });

    it('includes brand and model in body', () => {
      const item = makeGearItem({ condition: 'worn', brand: 'Fischer', model: 'RC4' });
      const [n] = generateNotifications([makeMember()], [item]);
      expect(n.body).toContain('Fischer RC4');
    });
  });

  describe('fair gear → service notification', () => {
    it('generates a service notification for fair gear', () => {
      const item = makeGearItem({ condition: 'fair' });
      const [n] = generateNotifications([makeMember()], [item]);
      expect(n.type).toBe('service');
      expect(n.id).toBe('fair-gear-1');
      expect(n.title).toContain('Service');
      expect(n.body).toContain('fair condition');
    });
  });

  describe('old gear → old-gear notification', () => {
    it('generates an old-gear notification for skis older than 7 years', () => {
      const item = makeGearItem({ type: 'ski', year: CURRENT_YEAR - 7 });
      const [n] = generateNotifications([makeMember()], [item]);
      expect(n.type).toBe('old-gear');
      expect(n.id).toBe('old-gear-1');
      expect(n.title).toContain(String(CURRENT_YEAR - 7));
      expect(n.body).toContain('7 years old');
    });

    it('does not generate old-gear notification for skis 6 years old', () => {
      const item = makeGearItem({ type: 'ski', year: CURRENT_YEAR - 6 });
      const result = generateNotifications([makeMember()], [item]);
      expect(result.find((n) => n.type === 'old-gear')).toBeUndefined();
    });

    it('generates old-gear notification for boots older than 5 years', () => {
      const item = makeGearItem({ type: 'boot', year: CURRENT_YEAR - 5 });
      const result = generateNotifications([makeMember()], [item]);
      expect(result.find((n) => n.type === 'old-gear')).toBeDefined();
    });

    it('does not generate old-gear notification when year is not set', () => {
      const item = makeGearItem({ year: undefined });
      const result = generateNotifications([makeMember()], [item]);
      expect(result.find((n) => n.type === 'old-gear')).toBeUndefined();
    });
  });

  describe('multiple notifications', () => {
    it('can generate multiple notifications for the same item (worn + old)', () => {
      const item = makeGearItem({ condition: 'worn', year: CURRENT_YEAR - 8 });
      const result = generateNotifications([makeMember()], [item]);
      expect(result.some((n) => n.type === 'replace')).toBe(true);
      expect(result.some((n) => n.type === 'old-gear')).toBe(true);
    });

    it('sorts replace before service before old-gear', () => {
      const items = [
        makeGearItem({ id: 'g1', condition: 'good', year: CURRENT_YEAR - 8 }),          // old-gear
        makeGearItem({ id: 'g2', condition: 'fair' }),                                    // service
        makeGearItem({ id: 'g3', condition: 'worn' }),                                    // replace
      ];
      const result = generateNotifications([makeMember()], items);
      const types = result.map((n) => n.type);
      expect(types.indexOf('replace')).toBeLessThan(types.indexOf('service'));
      expect(types.indexOf('service')).toBeLessThan(types.indexOf('old-gear'));
    });
  });

  describe('notification IDs', () => {
    it('uses deterministic IDs based on condition and gear ID', () => {
      const wornItem  = makeGearItem({ id: 'abc', condition: 'worn' });
      const fairItem  = makeGearItem({ id: 'def', condition: 'fair' });
      const oldItem   = makeGearItem({ id: 'ghi', year: CURRENT_YEAR - 8 });
      const [r] = generateNotifications([makeMember()], [wornItem]);
      const [s] = generateNotifications([makeMember()], [fairItem]);
      const [o] = generateNotifications([makeMember()], [oldItem]);
      expect(r.id).toBe('worn-abc');
      expect(s.id).toBe('fair-def');
      expect(o.id).toBe('old-ghi');
    });
  });

  describe('gear type labels', () => {
    it('uses "Boots" label for boot type', () => {
      const item = makeGearItem({ type: 'boot', condition: 'worn' });
      const [n] = generateNotifications([makeMember()], [item]);
      expect(n.title).toContain('Boots');
    });

    it('uses "Skates" label for skate type', () => {
      const item = makeGearItem({ type: 'skate', condition: 'worn' });
      const [n] = generateNotifications([makeMember()], [item]);
      expect(n.title).toContain('Skates');
    });
  });
});
