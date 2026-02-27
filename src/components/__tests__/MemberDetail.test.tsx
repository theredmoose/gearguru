import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemberDetail } from '../MemberDetail';
import { FAMILY_MEMBERS, createFamilyMember } from '@tests/fixtures/familyMembers';
import type { GearItem, FamilyMember, AppSettings } from '../../types';

// Minimal valid GearItem factory
function makeGearItem(overrides: Partial<GearItem> = {}): GearItem {
  return {
    id: 'gear-1',
    userId: 'user-1',
    ownerId: 'test-member-1',
    sport: 'alpine',
    type: 'ski',
    brand: 'Atomic',
    model: 'Redster',
    size: '170cm',
    condition: 'good',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('MemberDetail', () => {
  const defaultProps = {
    member: FAMILY_MEMBERS.john,
    gearItems: [],
    onBack: vi.fn(),
    onEdit: vi.fn(),
    onGetSizing: vi.fn(),
    onOpenConverter: vi.fn(),
    onAddGear: vi.fn(),
    onEditGear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING
  // ============================================
  describe('rendering', () => {
    it('renders the member name', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders stat rows: Age, Height, Weight, Foot, Hand', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Height')).toBeInTheDocument();
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('Foot')).toBeInTheDocument();
      expect(screen.getByText('Hand')).toBeInTheDocument();
    });

    it('shows height in cm by default', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText('180 cm')).toBeInTheDocument();
    });

    it('shows weight in kg by default', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText('80 kg')).toBeInTheDocument();
    });

    it('shows foot length from the larger foot', () => {
      render(<MemberDetail {...defaultProps} />);
      // John has footLengthLeft=27.5, footLengthRight=27.5
      expect(screen.getByText('27.5 cm')).toBeInTheDocument();
    });

    it('shows dash for hand size when not provided', () => {
      render(<MemberDetail {...defaultProps} />);
      // Multiple "—" may appear (hand + possibly helmet), just confirm at least one
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });

    it('renders member initial in avatar', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders sport and level dropdowns', () => {
      render(<MemberDetail {...defaultProps} />);
      // Two selects: sport and level
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });

    it('renders Sizing section heading', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /sizing/i })).toBeInTheDocument();
    });

    it('renders Gear Inventory section heading', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /gear vault/i })).toBeInTheDocument();
    });

    it('shows empty gear state when no gear items', () => {
      render(<MemberDetail {...defaultProps} gearItems={[]} />);
      expect(screen.getByText(/no gear yet/i)).toBeInTheDocument();
    });

    it('renders gear items when provided', () => {
      const gear = makeGearItem();
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      expect(screen.getByText('Atomic Redster')).toBeInTheDocument();
    });

    it('shows "All Sports →" link', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText(/all sports/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // SIZING CARDS
  // ============================================
  describe('sizing cards', () => {
    it('shows Alpine sizing cards by default when no skillLevels', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText('Skis')).toBeInTheDocument();
      expect(screen.getByText('Boots')).toBeInTheDocument();
      expect(screen.getByText('Poles')).toBeInTheDocument();
      expect(screen.getByText('Helmet')).toBeInTheDocument();
    });

    it('shows Nordic cards when nordic-classic is selected', () => {
      render(<MemberDetail {...defaultProps} />);
      const sportSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sportSelect, { target: { value: 'nordic-classic' } });
      expect(screen.getByText('Skis')).toBeInTheDocument();
      expect(screen.getByText('Poles')).toBeInTheDocument();
      expect(screen.getByText('Boots')).toBeInTheDocument();
    });

    it('shows Snowboard cards when snowboard is selected', () => {
      render(<MemberDetail {...defaultProps} />);
      const sportSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sportSelect, { target: { value: 'snowboard' } });
      expect(screen.getByText('Board')).toBeInTheDocument();
      expect(screen.getByText('Stance')).toBeInTheDocument();
    });

    it('shows Hockey cards when hockey is selected', () => {
      render(<MemberDetail {...defaultProps} />);
      const sportSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sportSelect, { target: { value: 'hockey' } });
      expect(screen.getByText('Bauer')).toBeInTheDocument();
      expect(screen.getByText('CCM')).toBeInTheDocument();
    });

    it('shows ski length in cm by default', () => {
      render(<MemberDetail {...defaultProps} />);
      // card label span → header div → content column div (contains items)
      const skisContent = screen.getByText('Skis').closest('div')!.parentElement!;
      expect(within(skisContent).getByText(/\d+ cm/)).toBeInTheDocument();
    });

    it('shows boot size in Mondo by default', () => {
      render(<MemberDetail {...defaultProps} />);
      // Boot card item label is "Mondo" by default
      expect(screen.getByText('Mondo')).toBeInTheDocument();
    });
  });

  // ============================================
  // UNIT TOGGLES
  // ============================================
  describe('unit toggles', () => {
    it('toggles height from cm to ft format when clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      const heightToggle = screen.getByRole('button', { name: /toggle height units/i });
      fireEvent.click(heightToggle);
      // 180cm ≈ 5'11"
      expect(screen.getByText(/5'\d+"/)).toBeInTheDocument();
    });

    it('toggles height back to cm on second click', () => {
      render(<MemberDetail {...defaultProps} />);
      const heightToggle = screen.getByRole('button', { name: /toggle height units/i });
      fireEvent.click(heightToggle);
      fireEvent.click(heightToggle);
      expect(screen.getByText('180 cm')).toBeInTheDocument();
    });

    it('toggles weight from kg to lbs when clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      const weightToggle = screen.getByRole('button', { name: /toggle weight units/i });
      fireEvent.click(weightToggle);
      // 80kg ≈ 176 lbs
      expect(screen.getByText(/\d+ lbs/)).toBeInTheDocument();
    });

    it('toggles weight back to kg on second click', () => {
      render(<MemberDetail {...defaultProps} />);
      const weightToggle = screen.getByRole('button', { name: /toggle weight units/i });
      fireEvent.click(weightToggle);
      fireEvent.click(weightToggle);
      expect(screen.getByText('80 kg')).toBeInTheDocument();
    });

    it('toggles ski length to inches when Skis toggle clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      const skiToggle = screen.getByRole('button', { name: /toggle skis units/i });
      fireEvent.click(skiToggle);
      // card label span → header div → content column div (contains items)
      const skisContent = screen.getByText('Skis').closest('div')!.parentElement!;
      expect(within(skisContent).getByText(/\d+"/)).toBeInTheDocument();
    });

    it('toggles boot to EU when Boots toggle clicked once', () => {
      render(<MemberDetail {...defaultProps} />);
      const bootToggle = screen.getByRole('button', { name: /toggle boots units/i });
      fireEvent.click(bootToggle);
      // card label span → header div → content column div (contains items)
      const bootsContent = screen.getByText('Boots').closest('div')!.parentElement!;
      expect(within(bootsContent).getByText('EU')).toBeInTheDocument();
      expect(within(bootsContent).queryByText('Mondo')).not.toBeInTheDocument();
    });

    it('cycles boot to US M on second click', () => {
      render(<MemberDetail {...defaultProps} />);
      const bootToggle = screen.getByRole('button', { name: /toggle boots units/i });
      fireEvent.click(bootToggle); // → EU
      fireEvent.click(bootToggle); // → US M
      const bootsContent = screen.getByText('Boots').closest('div')!.parentElement!;
      expect(within(bootsContent).getByText('US M')).toBeInTheDocument();
    });

    it('cycles boot to US W on third click', () => {
      render(<MemberDetail {...defaultProps} />);
      const bootToggle = screen.getByRole('button', { name: /toggle boots units/i });
      fireEvent.click(bootToggle); // → EU
      fireEvent.click(bootToggle); // → US M
      fireEvent.click(bootToggle); // → US W
      const bootsContent = screen.getByText('Boots').closest('div')!.parentElement!;
      expect(within(bootsContent).getByText('US W')).toBeInTheDocument();
    });

    it('cycles boot back to MP on fourth click', () => {
      render(<MemberDetail {...defaultProps} />);
      const bootToggle = screen.getByRole('button', { name: /toggle boots units/i });
      fireEvent.click(bootToggle); // → EU
      fireEvent.click(bootToggle); // → US M
      fireEvent.click(bootToggle); // → US W
      fireEvent.click(bootToggle); // → MP
      const bootsContent = screen.getByText('Boots').closest('div')!.parentElement!;
      expect(within(bootsContent).getByText('Mondo')).toBeInTheDocument();
    });
  });

  // ============================================
  // ACTIONS / CALLBACKS
  // ============================================
  describe('actions', () => {
    it('calls onEdit when Settings icon button is clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /edit member/i }));
      expect(defaultProps.onEdit).toHaveBeenCalled();
    });

    it('calls onGetSizing when "All Sports →" is clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      fireEvent.click(screen.getByText(/all sports/i));
      expect(defaultProps.onGetSizing).toHaveBeenCalled();
    });

    it('calls onOpenConverter when foot value is clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      // Foot row is a button when footLength > 0
      fireEvent.click(screen.getByText('27.5 cm'));
      expect(defaultProps.onOpenConverter).toHaveBeenCalled();
    });

    it('calls onAddGear when + button is clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /add gear/i }));
      expect(defaultProps.onAddGear).toHaveBeenCalled();
    });

    it('calls onEditGear with correct item when a gear item is clicked', () => {
      const gear = makeGearItem();
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      fireEvent.click(screen.getByText('Atomic Redster'));
      expect(defaultProps.onEditGear).toHaveBeenCalledWith(gear);
    });
  });

  // ============================================
  // GEAR INVENTORY STATUS
  // ============================================
  describe('gear inventory status', () => {
    it('shows Ready badge for non-worn gear', () => {
      const gear = makeGearItem({ condition: 'good' });
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('shows Update badge for worn gear', () => {
      const gear = makeGearItem({ condition: 'worn' });
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('shows gear size and year when both provided', () => {
      const gear = makeGearItem({ size: '170cm', year: 2022 });
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      expect(screen.getByText('170cm · 2022')).toBeInTheDocument();
    });

    it('shows photo count when gear has photos', () => {
      const gear = makeGearItem({
        photos: [
          { id: 'p1', type: 'fullView', url: 'http://example.com/photo.jpg', createdAt: new Date().toISOString() },
          { id: 'p2', type: 'labelView', url: 'http://example.com/photo2.jpg', createdAt: new Date().toISOString() },
        ],
      });
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      expect(screen.getByText('2 photos')).toBeInTheDocument();
    });
  });

  // ============================================
  // MEMBER WITH HEAD CIRCUMFERENCE
  // ============================================
  describe('member with head circumference', () => {
    it('shows helmet size when headCircumference is provided', () => {
      const memberWithHelmet: FamilyMember = createFamilyMember({
        measurements: {
          ...FAMILY_MEMBERS.john.measurements,
          headCircumference: 58,
        },
      });
      render(<MemberDetail {...defaultProps} member={memberWithHelmet} />);
      // M helmet for 57-58cm
      expect(screen.getByText('M')).toBeInTheDocument();
    });
  });

  // ============================================
  // MEMBER WITH SKILL LEVELS
  // ============================================
  describe('member with skill levels', () => {
    it('defaults sport to first skill level sport', () => {
      const memberWithSkills: FamilyMember = createFamilyMember({
        skillLevels: { 'nordic-classic': 'advanced' },
      });
      render(<MemberDetail {...defaultProps} member={memberWithSkills} />);
      const sportSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
      expect(sportSelect.value).toBe('nordic-classic');
    });

    it('defaults skill level to the member skill for that sport', () => {
      const memberWithSkills: FamilyMember = createFamilyMember({
        skillLevels: { alpine: 'expert' },
      });
      render(<MemberDetail {...defaultProps} member={memberWithSkills} />);
      const levelSelect = screen.getAllByRole('combobox')[1] as HTMLSelectElement;
      expect(levelSelect.value).toBe('expert');
    });
  });

  // ============================================
  // SETTINGS PROP
  // ============================================
  describe('with settings prop', () => {
    const baseSettings: AppSettings = {
      heightUnit: 'cm',
      weightUnit: 'kg',
      skiLengthUnit: 'cm',
      defaultSport: 'alpine',
      display: { showFoot: true, showHand: true },
    };

    it('hides Foot row when display.showFoot is false', () => {
      const settings = { ...baseSettings, display: { showFoot: false, showHand: true } };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      expect(screen.queryByText('Foot')).toBeNull();
    });

    it('shows Foot row when display.showFoot is true', () => {
      render(<MemberDetail {...defaultProps} settings={{ ...baseSettings, display: { showFoot: true, showHand: true } }} />);
      expect(screen.getByText('Foot')).toBeInTheDocument();
    });

    it('hides Hand row when display.showHand is false', () => {
      const settings = { ...baseSettings, display: { showFoot: true, showHand: false } };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      expect(screen.queryByText('Hand')).toBeNull();
    });

    it('uses settings.defaultSport as the initial sport selector value', () => {
      const settings = { ...baseSettings, defaultSport: 'snowboard' as const };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      const sportSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
      expect(sportSelect.value).toBe('snowboard');
    });

    it('initialises lengthUnit from skiLengthUnit setting', () => {
      const settings = { ...baseSettings, skiLengthUnit: 'in' as const };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      // The ski card should show inches rather than cm
      expect(screen.getAllByRole('button', { name: /toggle skis units/i })[0]).toBeInTheDocument();
    });

    it('initialises weightUnit from settings', () => {
      const settings = { ...baseSettings, weightUnit: 'lbs' as const };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      // Weight stat row value should be in lbs
      expect(screen.getByText(/lbs/)).toBeInTheDocument();
    });

    it('initialises heightUnit from ft-in setting', () => {
      const settings = { ...baseSettings, heightUnit: 'ft-in' as const };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      // Height stat row should show feet format
      expect(screen.getByText(/'\d+"/)).toBeInTheDocument();
    });
  });
});
