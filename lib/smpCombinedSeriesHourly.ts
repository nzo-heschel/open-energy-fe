import type { SMPProductionVsMarginalPriceResponse } from "@/types/dto";
import { format, parseISO, startOfHour } from "date-fns";

export type SmpHourlyChartRow = {
  time: string;
  timestamp: string;
  price_with_constraints: number;
  price_without_constraints: number;
  net_demand: number;
  smp: number;
};

const average = (values: number[]) =>
  values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

/** Downsample 30-minute `combined_series` points to one row per hour (mean). */
export const mapCombinedSeriesToHourlyChartRows = (
  series: SMPProductionVsMarginalPriceResponse["combined_series"] | undefined,
): SmpHourlyChartRow[] => {
  if (!series?.length) return [];

  const buckets = new Map<
    number,
    {
      hourStart: Date;
      price_with_constraints: number[];
      price_without_constraints: number[];
      net_demand: number[];
      smp: number[];
    }
  >();

  for (const item of series) {
    if (!item.timestamp) continue;

    try {
      const date = parseISO(item.timestamp);
      if (isNaN(date.getTime())) continue;

      const hourStart = startOfHour(date);
      const key = hourStart.getTime();
      const bucket = buckets.get(key) ?? {
        hourStart,
        price_with_constraints: [],
        price_without_constraints: [],
        net_demand: [],
        smp: [],
      };

      bucket.price_with_constraints.push(
        item.price_with_constraints ?? item.smp ?? 0,
      );
      bucket.price_without_constraints.push(item.price_without_constraints ?? 0);
      bucket.net_demand.push(item.net_demand ?? 0);
      bucket.smp.push(item.smp ?? 0);
      buckets.set(key, bucket);
    } catch (e) {
      console.error("Error parsing timestamp:", item.timestamp, e);
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.hourStart.getTime() - b.hourStart.getTime())
    .map((bucket) => ({
      time: format(bucket.hourStart, "HH:mm"),
      timestamp: bucket.hourStart.toISOString(),
      price_with_constraints: average(bucket.price_with_constraints),
      price_without_constraints: average(bucket.price_without_constraints),
      net_demand: average(bucket.net_demand),
      smp: average(bucket.smp),
    }));
};
