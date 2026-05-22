export type FossilCategory = {
  category_name: string;
  sub_categories?: Array<{ sub_category_name: string; value: number }>;
};

/**
 * Chart2 / overview: level2 uses `solar`.
 * Production-mix time series: level2 uses `solar_thermal` (no `solar` key).
 */
export const getDieselFromNonRenewablesLevel2 = (
  nonRenewables?: Record<string, number> | null
): number => {
  if (!nonRenewables) return 0;
  if ('solar' in nonRenewables) {
    return nonRenewables.solar ?? 0;
  }
  return nonRenewables.solar_thermal ?? 0;
};

export const getDieselFromCategories = (
  categories?: FossilCategory[]
): number =>
  categories
    ?.find((c) => c.category_name === 'non_renewables')
    ?.sub_categories?.find((s) => s.sub_category_name === 'solar_thermal')?.value ?? 0;

/** Diesel (סולר): map solar / solar_thermal → diesel; server diesel is ignored */
export const normalizeFossilLevel2Source = (
  source: Record<string, number> | undefined,
  categories?: FossilCategory[]
): Record<string, number> | undefined => {
  if (!source) return undefined;
  const { solar, solar_thermal, diesel, ...rest } = source;
  const dieselValue =
    getDieselFromNonRenewablesLevel2(source) || getDieselFromCategories(categories);
  return { ...rest, diesel: dieselValue };
};
