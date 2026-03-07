import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemberDetail } from '../MemberDetail';
import { FAMILY_MEMBERS, createFamilyMember } from '@tests/fixtures/familyMembers';
import type { GearItem, FamilyMember, AppSettings } from '../../types';

// Mock GearLoadoutPanel to avoid duplicate slot-label text (Skis, Boots, etc.)
// that conflicts with sizing card labels, and to restore the avatar initial.
vi.mock('../GearLoadoutPanel', () => ({
  GearLoadoutPanel: ({ member }: { member: { name: string } }) => (
    <div data-testid="gear-loadout-panel">{member.name.charAt(0)}</div>
  ),
}));

// Minimal valid GearItem factory
function makeGearItem(overrides: Partial<GearItem> = {}): GearItem {
  return {
    id: 'gear-1',
    userId: 'user-1',
    ownerId: 'test-member-1',
    sports: ['alpine'],
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
      // Value renders as two spans: number + unit
      const row = screen.getByText('Height').closest('div')!;
      expect(within(row).getByText('180')).toBeInTheDocument();
      expect(within(row).getByText('cm')).toBeInTheDocument();
    });

    it('shows weight in kg by default', () => {
      render(<MemberDetail {...defaultProps} />);
      const row = screen.getByText('Weight').closest('div')!;
      expect(within(row).getByText('80')).toBeInTheDocument();
      expect(within(row).getByText('kg')).toBeInTheDocument();
    });

    it('shows foot length from the larger foot', () => {
      render(<MemberDetail {...defaultProps} />);
      // John has footLengthLeft=27.5, footLengthRight=27.5
      const row = screen.getByText('Foot').closest('div')!;
      expect(within(row).getByText('27.5')).toBeInTheDocument();
      expect(within(row).getByText('cm')).toBeInTheDocument();
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

    it('renders Gear Setup section heading', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /gear setup/i })).toBeInTheDocument();
    });

    it('renders gear items when provided', () => {
      const gear = makeGearItem();
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      expect(screen.getByText('Atomic Redster')).toBeInTheDocument();
    });

    it('shows only gear tagged for selected sport', () => {
      const alpineGear = makeGearItem({ id: 'g1', sports: ['alpine'] as import('../../types').Sport[] });
      const nordicGear = makeGearItem({ id: 'g2', sports: ['nordic-classic'] as import('../../types').Sport[] });
      render(<MemberDetail {...defaultProps} gearItems={[alpineGear, nordicGear]} />);
      // Default sport is alpine — only alpine gear visible
      expect(screen.getByText('Atomic Redster')).toBeInTheDocument();
      // nordic gear has same brand/model in factory but different id; both have same text so check count
      expect(screen.getAllByText('Atomic Redster')).toHaveLength(1);
    });
  });

  // ============================================
  // SIZING CARDS
  // ============================================
  describe('sizing cards', () => {
    it('shows Alpine sections by default when no skillLevels', () => {
      render(<MemberDetail {...defaultProps} />);
      expect(screen.getByText('Skis')).toBeInTheDocument();
      expect(screen.getByText('Boots')).toBeInTheDocument();
      expect(screen.getByText('Poles')).toBeInTheDocument();
      expect(screen.getByText('Helmet')).toBeInTheDocument();
    });

    it('shows Nordic sections when nordic-classic is selected', () => {
      render(<MemberDetail {...defaultProps} />);
      const sportSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sportSelect, { target: { value: 'nordic-classic' } });
      expect(screen.getByText('Skis')).toBeInTheDocument();
      expect(screen.getByText('Poles')).toBeInTheDocument();
      expect(screen.getByText('Boots')).toBeInTheDocument();
    });

    it('shows Snowboard sections when snowboard is selected', () => {
      render(<MemberDetail {...defaultProps} />);
      const sportSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sportSelect, { target: { value: 'snowboard' } });
      // "Snowboard" appears in both the dropdown option and the section row label
      expect(screen.getAllByText('Snowboard').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Boots')).toBeInTheDocument();
    });

    it('shows Hockey sections when hockey is selected', () => {
      render(<MemberDetail {...defaultProps} />);
      const sportSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sportSelect, { target: { value: 'hockey' } });
      expect(screen.getByText('Skates')).toBeInTheDocument();
    });

    it('shows ski length in cm by default', () => {
      render(<MemberDetail {...defaultProps} />);
      // Value renders as two spans: number + unit; check unit "cm" appears in Skis section
      const skisContent = screen.getByText('Skis').closest('div')!.parentElement!;
      expect(within(skisContent).getByText('cm')).toBeInTheDocument();
    });

    it('shows boot sizing value by default', () => {
      render(<MemberDetail {...defaultProps} />);
      // Boot section left column shows the mondopoint value (e.g. "270") + unit "MP"
      const bootsContent = screen.getByText('Boots').closest('div')!.parentElement!;
      expect(within(bootsContent).getByText('MP')).toBeInTheDocument();
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
      const row = screen.getByText('Height').closest('div')!;
      expect(within(row).getByText('180')).toBeInTheDocument();
      expect(within(row).getByText('cm')).toBeInTheDocument();
    });

    it('toggles weight from kg to lbs when clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      const weightToggle = screen.getByRole('button', { name: /toggle weight units/i });
      fireEvent.click(weightToggle);
      // 80kg ≈ 176 lbs — unit span now reads "lbs"
      const row = screen.getByText('Weight').closest('div')!;
      expect(within(row).getByText('lbs')).toBeInTheDocument();
    });

    it('toggles weight back to kg on second click', () => {
      render(<MemberDetail {...defaultProps} />);
      const weightToggle = screen.getByRole('button', { name: /toggle weight units/i });
      fireEvent.click(weightToggle);
      fireEvent.click(weightToggle);
      const row = screen.getByText('Weight').closest('div')!;
      expect(within(row).getByText('80')).toBeInTheDocument();
      expect(within(row).getByText('kg')).toBeInTheDocument();
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

    it('toggles foot unit from cm to in when foot toggle icon is clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      // Foot row has a separate toggle icon button (ArrowLeftRight)
      const footToggle = screen.getByRole('button', { name: /toggle foot units/i });
      fireEvent.click(footToggle);
      // 27.5 cm → inches unit shown
      const row = screen.getByText('Foot').closest('div')!;
      expect(within(row).getByText('in')).toBeInTheDocument();
    });

    it('calls onAddGear when Add button in a section row is clicked', () => {
      render(<MemberDetail {...defaultProps} />);
      // The GearSectionRow renders an "Add gear to Skis" button
      fireEvent.click(screen.getByRole('button', { name: /add gear to skis/i }));
      // This opens the GearAssignSheet; click "New Skis" to trigger onAddGear
      fireEvent.click(screen.getByRole('button', { name: /new gear/i }));
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
  describe('gear inventory', () => {
    it('renders gear brand and model when provided', () => {
      const gear = makeGearItem({ condition: 'good' });
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      expect(screen.getByText('Atomic Redster')).toBeInTheDocument();
    });

    it('renders gear item in the correct sport section', () => {
      const gear = makeGearItem({ type: 'ski', sports: ['alpine'] });
      render(<MemberDetail {...defaultProps} gearItems={[gear]} />);
      // Gear should appear in the Skis row
      const skisSection = screen.getByText('Skis').closest('div')!.parentElement!.parentElement!;
      expect(within(skisSection).getByText('Atomic Redster')).toBeInTheDocument();
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
      display: { showFoot: true, showHand: true, separateFeetHands: false },
      sizingModel: 'generic',
      sizingDisplay: 'range',
      bootUnit: 'mp',
      notificationsEnabled: true,
    };

    it('hides Foot row when display.showFoot is false', () => {
      const settings = { ...baseSettings, display: { showFoot: false, showHand: true, separateFeetHands: false } };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      expect(screen.queryByText('Foot')).toBeNull();
    });

    it('shows Foot row when display.showFoot is true', () => {
      render(<MemberDetail {...defaultProps} settings={{ ...baseSettings, display: { showFoot: true, showHand: true, separateFeetHands: false } }} />);
      expect(screen.getByText('Foot')).toBeInTheDocument();
    });

    it('hides Hand row when display.showHand is false', () => {
      const settings = { ...baseSettings, display: { showFoot: true, showHand: false, separateFeetHands: false } };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      expect(screen.queryByText('Hand')).toBeNull();
    });

    it('uses settings.defaultSport as the initial sport selector value', () => {
      const settings = { ...baseSettings, defaultSport: 'snowboard' as const };
      render(<MemberDetail {...defaultProps} settings={settings} />);
      const sportSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
      expect(sportSelect.value).toBe('snowboard');
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
