export const dexNumber = (id: number) => `#${String(id).padStart(3, '0')}`;

/** "mr-mime" -> "Mr Mime", "special-attack" -> "Special Attack" */
export const titleCase = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** PokeAPI height is in decimetres. */
export function formatHeight(dm: number): string {
  const metres = dm / 10;
  const totalInches = Math.round(metres * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${metres.toFixed(1)} m (${feet}′${String(inches).padStart(2, '0')}″)`;
}

/** PokeAPI weight is in hectograms. */
export function formatWeight(hg: number): string {
  const kg = hg / 10;
  return `${kg.toFixed(1)} kg (${(kg * 2.20462).toFixed(1)} lb)`;
}

export const formatHeightShort = (dm: number) => `${(dm / 10).toFixed(1)} m`;
export const formatWeightShort = (hg: number) => `${(hg / 10).toFixed(1)} kg`;

/** "generation-i" -> "Generation I" */
export const formatGeneration = (slug: string) => {
  const [, roman] = slug.split('-');
  return roman ? `Generation ${roman.toUpperCase()}` : titleCase(slug);
};

/** gender_rate is the chance of being female, in eighths; -1 means genderless. */
export function formatGender(rate: number): string {
  if (rate < 0) return 'Genderless';
  const female = (rate / 8) * 100;
  return `${100 - female}% ♂ · ${female}% ♀`;
}
