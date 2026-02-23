import type { Sport, GearType } from '../types';

export const SPORT_LABELS: Record<Sport, string> = {
  alpine:           'Alpine / Downhill',
  'nordic-classic': 'XC Classic',
  'nordic-skate':   'XC Skate',
  'nordic-combi':   'XC Combi',
  snowboard:        'Snowboard',
  hockey:           'Hockey',
};

export const GEAR_TYPE_LABELS: Record<GearType, string> = {
  ski:       'Skis',
  pole:      'Poles',
  boot:      'Boots',
  binding:   'Bindings',
  snowboard: 'Snowboard',
  skate:     'Skates',
  helmet:    'Helmet',
  other:     'Other',
};
