// Longest text people can type in their own forms. The database enforces
// the same numbers (migration 20261013130000_text_length_limits).
export const TEXT_LIMITS = {
  name: 100,
  company: 150,
  phone: 30,
  nif: 20,
  address: 300,
  city: 100,
  postalCode: 20,
  province: 100,
  country: 100,
  incidentDescription: 2000,
  packageNote: 500,
} as const;
