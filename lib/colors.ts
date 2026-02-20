/**
 * Energy Source Colors
 * These colors are fixed and used across the entire application
 * Colors are defined in styles/theme.css as CSS variables
 */

// Main Category Colors - matching Figma design
export const ENERGY_COLORS = {
  // Main Categories (Level 1 - Inner ring)
  OTHER_PRIMARY: '#1665B3', // Blue
  RENEWABLE: '#2F7A4F', // Green
  FOSSIL: '#CEA073', // Golden/tan brown
  CO2_EMISSIONS: '#5D6FFF',

  // Other Category Sub-items
  PUMPED_STORAGE: '#1665B3', // Blue
  OTHER: '#A4DBE4', // Light blue

  // Renewable Energy Sub-items (Level 2 - greens and teals)
  PHOTOVOLTAIC: '#E8D84C', // Yellow/lime
  BIOGAS: '#A8C256', // Light green
  WIND: '#6B9B4D', // Green
  SOLAR_THERMAL: '#4A8B8C', // Teal
  PV_STORAGE: '#2D6A6A', // Dark teal

  // Fossil Energy Sub-items (Level 2 - browns and blacks)
  COAL: '#3D3D3D', // Dark gray/charcoal
  DIESEL: '#1C1A17', // Black
  NATURAL_GAS: '#8B7355', // Brown/tan
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

  // Renewable Energy
  'photoVoltaic': ENERGY_COLORS.PHOTOVOLTAIC,
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
  'פוטו וולטאי': ENERGY_COLORS.PHOTOVOLTAIC,
  'ביו גז': ENERGY_COLORS.BIOGAS,
  'רוח': ENERGY_COLORS.WIND,
  'תרמו סולרי': ENERGY_COLORS.SOLAR_THERMAL,
  'פוטו וולטאי משולב אגירה': ENERGY_COLORS.PV_STORAGE,
  'אחר': ENERGY_COLORS.OTHER,
  'אגירה שאובה': ENERGY_COLORS.PUMPED_STORAGE,
};

