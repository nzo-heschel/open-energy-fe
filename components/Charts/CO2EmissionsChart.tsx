"use client";

import DateRangePicker from "@/components/ui/DateRangePicker";
import { exportCO2TotalVsRatio, useCO2TotalVsRatio } from "@/lib/api";
import api from "@/public/images/API.png";
import download from "@/public/images/download_2.png";
import { format, parseISO, subDays } from "date-fns";
import { he } from "date-fns/locale";
import Image from "next/image";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from "../ui/tooltip";

type ChartDataPoint = {
  period: string;
  total_emissions: number;
  emissions_ratio: number;
};

const formatTooltipNumber = (value: number, decimals: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const CO2EmissionsChart = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState({ co2: true, savings: true });
  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 7);
    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    };
  });

  // Fetch data from API
  const { data: totalVsRatioData, isLoading } = useCO2TotalVsRatio(
    dateRange.startDate,
    dateRange.endDate,
  );

  const toggle = (key: keyof typeof active) =>
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const handleExport = async () => {
    try {
      await exportCO2TotalVsRatio(dateRange.startDate, dateRange.endDate);
    } catch (error) {
      console.error("Failed to export CO2 total vs ratio data:", error);
    }
  };

  const opacity = (key: string) => {
    if (!hovered) return 1;
    return hovered === key ? 1 : 0.3;
  };

  const getLegendOpacity = (key: string) => {
    if (!hovered) return 1;
    return hovered === key ? 1 : 0.5;
  };

  // Transform API data to chart format
  const chartData: ChartDataPoint[] =
    totalVsRatioData?.chart_data?.map((item) => ({
      period: item.period,
      total_emissions: item.total_emissions,
      emissions_ratio: item.emissions_ratio,
    })) || [];

  // Format X-axis tick as dd/M (e.g. 30/4)
  const formatXAxisTick = (period: string) => {
    if (!period) return period;
    try {
      const str = String(period);
      if (/^\d{4}-\d{2}$/.test(str)) {
        return format(parseISO(str + "-01"), "dd/M");
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return format(parseISO(str), "dd/M");
      }
      const d = new Date(str);
      if (!isNaN(d.getTime())) return format(d, "dd/M");
    } catch {
      // ignore
    }
    return period;
  };

  const formatTooltipPeriod = (period: string | number) => {
    const value = String(period);
    try {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return format(parseISO(value), "dd MMM", { locale: he });
      }
      if (/^\d{4}-\d{2}$/.test(value)) {
        return format(parseISO(`${value}-01`), "MMM yyyy", { locale: he });
      }
    } catch {
      // ignore invalid date strings
    }
    return value;
  };

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col gap-1">
        {/* Header row with title and buttons - same structure as SMP */}
        <div className="flex items-center gap-2 justify-between">
          {/* Title FIRST - goes to RIGHT in RTL */}
          <h2 className="md:text-lg text-base md:text-right text-left flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold">
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center shrink-0"
                  >
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cursor-help"
                    >
                      <g opacity="0.5">
                        <path
                          d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z"
                          fill="#A1A1A1"
                        />
                        <path
                          d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z"
                          fill="#A1A1A1"
                        />
                      </g>
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>נתונים על פליטות CO₂ ויחס הפליטות ביחס לייצור חשמל</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            סך פליטות CO₂ מול יחס פליטות CO₂
          </h2>
          {/* Buttons SECOND - goes to LEFT in RTL */}
          <div className="flex items-start md:gap-4 gap-2">
            <a
              href="/api#co2-total-vs-ratio"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="View API Documentation"
            >
              <Image
                src={api}
                width={32}
                height={32}
                className="w-[32px] h-[32px]"
                alt="API"
              />
            </a>
            <button
              onClick={handleExport}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Export to Excel"
            >
              <Image
                src={download}
                width={32}
                height={32}
                className="w-[32px] h-[32px]"
                alt="Download"
              />
            </button>
          </div>
        </div>
        {/* Time period label */}
        <div className="md:text-sm text-xs text-slate-600 w-full mr-14">
          פרק זמן:
        </div>

        {/* Date controls row - same as SMP */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600"> סינון לפי:</span>
          <DateRangePicker
            onDateRangeChange={handleDateRangeChange}
            defaultPreset="last7Days"
          />
        </div>
      </div>

      <div className="md:h-[500px] h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-500">Loading...</div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={formatXAxisTick}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  label={{
                    value: "סך פליטות [mTCO₂/h]",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fontFamily: "Heebo, sans-serif",
                    },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  label={{
                    value: "קצב פליטות [mTCO₂/MWh]",
                    angle: -90,
                    position: "insideRight",
                    style: {
                      textAnchor: "middle",
                      fontFamily: "Heebo, sans-serif",
                    },
                  }}
                />
                <RechartsTooltip
                  separator=": "
                  formatter={(value: number, name: string) => {
                    if (name === "total_emissions") {
                      return [formatTooltipNumber(value, 2), "סך פליטות"];
                    }
                    return [formatTooltipNumber(value, 4), "יחס פליטות"];
                  }}
                  labelFormatter={(label) =>
                    `תאריך: ${formatTooltipPeriod(label)}`
                  }
                  contentStyle={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                {active.co2 && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="total_emissions"
                    stroke="#1E8025"
                    strokeWidth={2}
                    dot={false}
                    opacity={opacity("co2")}
                  />
                )}
                {active.savings && (
                  <Line
                    yAxisId="right"
                    type="linear"
                    dataKey="emissions_ratio"
                    stroke="#F4D150"
                    strokeWidth={2}
                    dot={false}
                    opacity={opacity("savings")}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Custom Legend */}
      <div className="flex justify-start gap-6 mt-4 md:pr-10">
        <div
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
          onClick={() => toggle("co2")}
          onMouseEnter={() => setHovered("co2")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: getLegendOpacity("co2") }}
        >
          <span
            className="w-2 h-2 rounded-full transition-opacity duration-200"
            style={{
              backgroundColor: "#1E8025",
              opacity: active.co2 ? 1 : 0.3,
            }}
          ></span>
          <span
            className={`md:text-sm text-xs transition-all duration-200 ${
              active.co2 ? "text-gray-800" : "text-gray-400"
            }`}
          >
            סך פליטות
          </span>
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
          onClick={() => toggle("savings")}
          onMouseEnter={() => setHovered("savings")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: getLegendOpacity("savings") }}
        >
          <span
            className="w-2 h-2 rounded-full transition-opacity duration-200"
            style={{
              backgroundColor: "#F4D150",
              opacity: active.savings ? 1 : 0.3,
            }}
          ></span>
          <span
            className={`md:text-sm text-xs transition-all duration-200 ${
              active.savings ? "text-gray-800" : "text-gray-400"
            }`}
          >
            יחס פליטות
          </span>
        </div>
      </div>
    </div>
  );
};

export default CO2EmissionsChart;
