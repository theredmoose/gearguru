export interface SizingCard {
  label: string;
  type: 'ski' | 'boot' | 'pole' | 'helmet' | 'snowboard' | 'skate';
  toggleKind?: 'length' | 'boot';
  items: { label: string; value: string }[];
}
