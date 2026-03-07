import type { Sport, GearType } from '../types';

/** Sections shown by default when a user first views a sport. */
export const DEFAULT_SPORT_SECTIONS: Record<Sport, GearType[]> = {
  alpine:           ['ski', 'boot', 'pole', 'helmet'],
  'nordic-classic': ['ski', 'boot', 'pole', 'helmet'],
  'nordic-skate':   ['ski', 'boot', 'pole', 'helmet'],
  'nordic-combi':   ['ski', 'boot', 'pole', 'helmet'],
  snowboard:        ['snowboard', 'boot', 'helmet'],
  hockey:           ['skate', 'helmet'],
};

/** Additional sections the user can add per sport. */
export const OPTIONAL_SPORT_SECTIONS: Record<Sport, GearType[]> = {
  alpine:           ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'goggle', 'bag'],
  'nordic-classic': ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  'nordic-skate':   ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  'nordic-combi':   ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  snowboard:        ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'goggle', 'bag'],
  hockey:           ['gloves', 'bag'],
};
