"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { useState, useMemo } from "react";
import { mapCombinedSeriesToHourlyChartRows } from "@/lib/smpCombinedSeriesHourly";
import type { SMPProductionVsMarginalPriceResponse } from "@/types/dto";
import { differenceInDays } from "date-fns";

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white p-2 rounded-[10px] shadow-md border-none"
        style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}
      >
        {/* <p className="text-gray-700 font-medium mb-2 border-b border-[#59687D]">{label}</p> */}
        <div className="space-y-1">
          {payload.slice(0, 1).map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex flex-col">
              <div className="flex items-center">
                {/* <div
                  className="w-2 h-2 rounded-full ml-2"
                  style={{ backgroundColor: entry.color }}
                ></div> */}
                <span className="text-sm text-[#484C56]">{entry.name}</span>
                <span className="text-gray-600 mx-1">|</span>
                <span className="text-sm text-[#484C56] ml-1">
                  {entry.value.toLocaleString()} ₪
                </span>
              </div>
              <span className="text-sm text-[#484C56] leading-3">
                ביקוש משקי | {entry.value.toLocaleString()} MWh
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Custom Legend Component ---
const CustomLegend = (props: any) => {
  const { payload } = props;
  const [activeSeries, setActiveSeries] = useState<string[]>([]);

  const handleClick = (dataKey: string) => {
    if (activeSeries.includes(dataKey)) {
      setActiveSeries(activeSeries.filter((key) => key !== dataKey));
    } else {
      setActiveSeries([...activeSeries, dataKey]);
    }
  };
  console.log(payload);

  return (
    <div className="flex items-center justify-between md:ml-10 ml-0 mt-6 md:pr-10 pr-5">
      <div className="flex flex-row-reverse justify-end">
        {payload.map((entry: any, index: number) => {
          const isActive = !activeSeries.includes(entry.dataKey);

          return (
            <div
              key={`legend-${index}`}
              onClick={() => handleClick(entry.dataKey)}
              className={`flex items-center cursor-pointer px-3 py-1 rounded-lg ${isActive ? "bg-transparent" : "opacity-50"
                }`}
            >
              <div
                className="w-2 h-2 rounded-full ml-2"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="md:text-sm text-[10px]">{entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ElectricityScatterGraphProps {
  data?: SMPProductionVsMarginalPriceResponse;
  isLoading?: boolean;
  error?: Error | null;
  startDate?: string;
  endDate?: string;
  selectedPreset?: string;
}

const CustomYAxisLabel = (props: any) => {
  const { viewBox } = props;
  const centerY = (viewBox.y + viewBox.height) / 2;
  return (
    <text
      x={viewBox.x}
      y={centerY}
      textAnchor="middle"
      fill="#707585"
      className="text-sm font-normal"
      style={{ fontFamily: "Heebo, sans-serif", color: "#707585" }}
      transform={`rotate(-90 ${viewBox.x} ${centerY})`}
    >
      [MWh]
    </text>
  );
};
const CustomXAxisLabel = (props: any) => {
  const { viewBox } = props;
  const centerX = (viewBox.x + viewBox.width) / 2;
  return (
    <text
      x={centerX}
      y={viewBox.y + viewBox.height}
      textAnchor="end"
      fill="#707585"
      className="text-sm font-normal"
      style={{ fontFamily: "Heebo, sans-serif", color: "#707585" }}
    >
      [₪]
    </text>
  );
};

export function ElectricityScatterGraph({
  data,
  isLoading,
  error,
  startDate,
  endDate,
  selectedPreset,
}: ElectricityScatterGraphProps) {
  // Determine date range type based on actual date range duration
  const dateRangeType = useMemo(() => {
    // Always calculate from actual date range, regardless of preset
    if (!startDate || !endDate) return "day";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start);
    const twoYearsInDays = 730; // 2 years = 730 days

    // Determine range type based on actual duration:
    // - Single day: hourly correlation (raw correlation / combined points)
    // - 1–61 days: daily correlation data
    // - 62 days to less than 2 years (730 days): monthly correlation data
    // - 2 years (730 days) or more: use yearly correlation data
    if (days < 1) {
      return "hour";
    } else if (days < 62) {
      return "day"; // Use correlation_by_view.day for ranges less than 62 days
    } else if (days < twoYearsInDays) {
      return "month"; // Use correlation_by_view.month for ranges 62 days to less than 2 years
    } else {
      return "year"; // Use correlation_by_view.year for ranges 2 years or more
    }
  }, [startDate, endDate]);

  // Transform correlation data for scatter chart - format as original UI expected
  // Use correlation_by_view based on date range type
  const scatterData1 = useMemo(() => {
    if (!data?.correlation_by_view) {
      // Fallback to old correlation if correlation_by_view doesn't exist
      if (data?.correlation && data.correlation.length > 0) {
        return data.correlation.map((item, i) => ({
          price: item.smp || 0,
          demand: item.net_demand || 0,
          type: i % 2 === 0 ? "ביקוש משקי" : "מחיר שולי כולל אילוצים",
        }));
      }
      return [];
    }

    // Get the appropriate correlation data based on date range type
    let correlationData: Array<{
      timestamp: string;
      net_demand: number;
      price_with_constraints: number;
      price_without_constraints: number;
    }> = [];

    if (dateRangeType === "hour" && data.combined_series?.length) {
      return mapCombinedSeriesToHourlyChartRows(data.combined_series).map(
        (item, i) => ({
          price: item.price_with_constraints || item.smp || 0,
          demand: item.net_demand || 0,
          type: i % 2 === 0 ? "ביקוש משקי" : "מחיר שולי כולל אילוצים",
        }),
      );
    } else if (dateRangeType === "day" && data.correlation_by_view.day) {
      correlationData = data.correlation_by_view.day;
    } else if (dateRangeType === "month" && data.correlation_by_view.month) {
      correlationData = data.correlation_by_view.month;
    } else if (dateRangeType === "year" && data.correlation_by_view.year) {
      correlationData = data.correlation_by_view.year;
    }

    if (correlationData.length === 0) {
      return [];
    }

    // Transform to the format expected by the UI
    return correlationData.map((item, i) => ({
      price: item.price_with_constraints || 0,
      demand: item.net_demand || 0,
      type: i % 2 === 0 ? "דוֹר" : "מחיר שולי כולל אילוצים",
    }));
  }, [data, dateRangeType]);

  // Calculate X-axis domain based on actual data
  const priceDomain = useMemo(() => {
    if (!scatterData1 || scatterData1.length === 0) return [0, 220];
    const prices = scatterData1.map((item) => item.price).filter((p) => p > 0);
    if (prices.length === 0) return [0, 220];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = Math.max((maxPrice - minPrice) * 0.1, maxPrice * 0.05);
    return [
      Math.max(0, Math.floor(minPrice - padding)),
      Math.ceil(maxPrice + padding),
    ];
  }, [scatterData1]);

  // Calculate Y-axis domain based on actual data
  const demandDomain = useMemo(() => {
    if (!scatterData1 || scatterData1.length === 0) return [0, 12000];
    const demands = scatterData1
      .map((item) => item.demand)
      .filter((d) => d > 0);
    if (demands.length === 0) return [0, 12000];
    const minDemand = Math.min(...demands);
    const maxDemand = Math.max(...demands);
    const padding = Math.max((maxDemand - minDemand) * 0.1, maxDemand * 0.05);
    return [
      Math.max(0, Math.floor(minDemand - padding)),
      Math.ceil(maxDemand + padding),
    ];
  }, [scatterData1]);

  if (isLoading) {
    return (
      <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
        <p className="text-slate-600">טוען נתונים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
        <p className="text-red-600">שגיאה בטעינת הנתונים</p>
      </div>
    );
  }

  if (!data || scatterData1.length === 0) {
    return (
      <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
        <p className="text-slate-600">אין נתונים להצגה</p>
      </div>
    );
  }

  return (
    <div className="w-full md:h-[500px] h-[300px] md:mt-0 -mt-10">
      {/* <h2 className="text-xl font-bold text-gray-800 mb-4 text-right">
        ייצור חשמל אל מול המחיר השוליי
      </h2> */}
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 50, right: 20, left: 30, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="price"
            name="מחיר שולי"
            domain={priceDomain}
            tick={{ fontSize: 12 }}
            allowDecimals={false}
            label={<CustomXAxisLabel />}
          />
          <YAxis
            type="number"
            dataKey="demand"
            name="MWh"
            domain={demandDomain}
            tick={{ fontSize: 12 }}
            label={<CustomYAxisLabel />}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Scatter
            name="מחיר שולי כולל אילוצים"
            data={scatterData1.filter((d) => d.type !== "דוֹר")}
            fill="#166534"
          />
          <Scatter
            name="ביקוש משקי"
            data={scatterData1.filter((d) => d.type === "דוֹר")}
            fill="#eab308"
          />

        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
