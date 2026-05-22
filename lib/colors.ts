/**
 * Energy Source Colors - תמהיל ייצור אנרגיה (Energy Mix)
 * Only colors from the Figma "תמהיל ייצור אנרגיה" layer (13 segment colors).
 */

/** Fallback when a segment key is unknown – one of the 13 Figma ellipse colors */
export const ENERGY_MIX_FIGMA_FALLBACK = '#648AA3';

export const ENERGY_COLORS = {
  // Level 1 (inner ring) – from Figma
  OTHER_PRIMARY: '#648AA3',
  RENEWABLE: '#2F7A4F',
  FOSSIL: '#CEA073',

  // Used by other charts (e.g. CO2), not in energy mix Figma layer
  CO2_EMISSIONS: '#5D6FFF',

  // Level 2 – only from the 13 Figma colors
  PUMPED_STORAGE: '#2F73A0',
  OTHER: '#8BBFE1',
  PHOTOVOLTAIC: '#C4C95C',
  BIOGAS: '#8A9A2C',
  WIND: '#98C74E',
  SOLAR_THERMAL: '#60A261',
  PV_STORAGE: '#F4D150',
  COAL: '#6B707C',
  DIESEL: '#1C1A17',
  NATURAL_GAS: '#957669',
  FUEL_OIL: '#4A4F58',
} as const;

/**
 * Get color by CSS variable name
 * Usage: getColor('--energy-renewable')
 */
export const getEnergyColor = (variableName: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim() || '';
  }
  return '';
};

/**
 * Level 1 category colors mapping
 */
export const LEVEL1_COLORS: Record<string, string> = {
  'אנרגיות פוסיליות': ENERGY_COLORS.FOSSIL,
  'אנרגיות מתחדשות': ENERGY_COLORS.RENEWABLE,
  'אחר': ENERGY_COLORS.OTHER_PRIMARY,
  'Non-renewables': ENERGY_COLORS.FOSSIL,
  'Renewables': ENERGY_COLORS.RENEWABLE,
  'Other': ENERGY_COLORS.OTHER_PRIMARY,
};

/**
 * Level 2 sub-category colors mapping
 * Maps English keys to colors
 */
export const LEVEL2_COLORS: Record<string, string> = {
  // Fossil Energy
  'coal': ENERGY_COLORS.COAL,
  'natural_gas': ENERGY_COLORS.NATURAL_GAS,
  'diesel': ENERGY_COLORS.DIESEL,
  'fuel_oil': ENERGY_COLORS.FUEL_OIL,

  // Renewable Energy (keys match normalizeKey output: lowercase, spaces to _)
  'photovoltaic': ENERGY_COLORS.PHOTOVOLTAIC,
  'biogas': ENERGY_COLORS.BIOGAS,
  'wind': ENERGY_COLORS.WIND,
  'solar_thermal': ENERGY_COLORS.SOLAR_THERMAL,
  'pv_storage': ENERGY_COLORS.PV_STORAGE,

  // Other
  'other': ENERGY_COLORS.OTHER,
  'pumped_storage': ENERGY_COLORS.PUMPED_STORAGE,
};

/**
 * Hebrew name to color mapping for level 2 items
 */
export const LEVEL2_HEBREW_COLORS: Record<string, string> = {
  'פחם': ENERGY_COLORS.COAL,
  'גז טבעי': ENERGY_COLORS.NATURAL_GAS,
  'סולר': ENERGY_COLORS.DIESEL,
  'מזוט': ENERGY_COLORS.FUEL_OIL,
  'פוטו וולטאי': ENERGY_COLORS.PHOTOVOLTAIC,
  'ביו גז': ENERGY_COLORS.BIOGAS,
  'רוח': ENERGY_COLORS.WIND,
  'תרמו סולרי': ENERGY_COLORS.SOLAR_THERMAL,
  'פוטו וולטאי משולב אגירה': ENERGY_COLORS.PV_STORAGE,
  'אחר': ENERGY_COLORS.OTHER,
  'אגירה שאובה': ENERGY_COLORS.PUMPED_STORAGE,
};

