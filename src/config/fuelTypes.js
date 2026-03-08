/**
 * Fuel type configuration shared across the frontend.
 * Mirrors the backend src/config/fuelTypes.js — keep both in sync.
 *
 * Exactly 6 entries. Display labels are human-readable; values match the backend enum.
 */

export const FUEL_TYPES = [
  { value: 'PETROL',   label: 'Petrol' },
  { value: 'DIESEL',   label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID',   label: 'Hybrid' },
  { value: 'CNG',      label: 'CNG (Compressed Natural Gas)' },
  { value: 'LPG',      label: 'LPG (Liquefied Petroleum Gas)' },
];

/** Values array for quick lookup / validation. */
export const FUEL_TYPE_VALUES = FUEL_TYPES.map(ft => ft.value);
