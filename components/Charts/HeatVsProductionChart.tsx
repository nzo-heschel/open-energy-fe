"use client";

import { exportHeatLoadVsGeneration, useHeatLoadVsGeneration } from "@/lib/api";
import apiIcon from "@/public/images/API.png";
import downloadIcon from "@/public/images/download_2.png";
import { format, subDays } from "date-fns";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TooltipInfo from "../TooltipInfo";
import DateRangePicker from "../ui/DateRangePicker";

type DataPoint = {
  date: string;
  heatLoad: number; // THI (left axis)
  production: number; // MWh (right axis)
};

const HeatVsProductionChart: React.FC = () => {
  const [active, setActive] = useState({ heatLoad: true, production: true });
  const [hovered, setHovered] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 365); // Default to last year
    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    };
  });

  // Determine view based on date range
  const view = useMemo<"month" | "year" | "custom">(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysDiff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff <= 62) {
      return "month";
    } else if (daysDiff <= 730) {
      return "year";
    }
    return "custom";
  }, [dateRange]);

  // Fetch data from API
  const { data, isLoading, isFetching } = useHeatLoadVsGeneration(
    dateRange.startDate,
    dateRange.endDate,
    view,
  );

  // Transform API data to chart format
  const currentData = useMemo<DataPoint[]>(() => {
    if (!data?.series) {
      return [];
    }

    return data.series.map((item) => ({
      date: item.label,
      heatLoad: item.heat_load,
      production: item.electricity_generation_mw,
    }));
  }, [data]);

  // Show loading when initially loading or when fetching new data
  // isFetching will be true when the query key changes and new data is being fetched
  const showLoading = isLoading || isFetching;
  const xTickInterval = useMemo(
    () => Math.max(0, Math.ceil(currentData.length / 8) - 1),
    [currentData.length],
  );

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const handleExport = async () => {
    try {
      await exportHeatLoadVsGeneration(
        dateRange.startDate,
        dateRange.endDate,
        view,
      );
    } catch (error) {
      console.error("Failed to export heat load vs generation data:", error);
    }
  };

  const toggle = (key: keyof typeof active) =>
    setActive((p) => ({ ...p, [key]: !p[key] }));

  const opacity = (key: string) => {
    if (!hovered) return 1;
    return hovered === key ? 1 : 0.25;
  };

  const legendOpacity = (key: string) => {
    if (!hovered) return 1;
    return hovered === key ? 1 : 0.6;
  };

  console.log(currentData);

  // custom tooltip
  const CustomTooltip = ({ active: isActive, payload, label }: any) => {
    if (!isActive || !payload || payload.length === 0) return null;

    // find series items
    const heat = payload.find((p: any) => p.dataKey === "heatLoad");
    const prod = payload.find((p: any) => p.dataKey === "production");

    return (
      <div
        className="bg-white shadow-lg rounded-lg p-3 text-right w-56 border border-gray-200"
        style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}
      >
        <div className="text-xs text-gray-500 mb-2 border-b-2">{label}</div>
        {heat && (
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#1E8025" }}
            />
            <div className="text-sm">
              <div className="text-xs text-gray-500">עומס חום</div>
              <div className="font-medium text-sm">
                {Number(heat.value).toFixed(2)} [C°]
              </div>
            </div>
          </div>
        )}
        {prod && (
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#F4D150" }}
            />
            <div className="text-sm">
              <div className="text-xs text-gray-500">ייצור חשמל</div>
              <div className="font-medium text-sm">
                {Number(prod.value).toLocaleString()} [MWh]
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[18px] p-6">
      <div className="flex flex-col md:flex-row items-start justify-between mb-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-3">
            ייצור חשמל אל מול עומס החום
            <button
              type="button"
              className="relative bg-transparent border-none p-0 cursor-help"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              onFocus={() => setShowInfo(true)}
              onBlur={() => setShowInfo(false)}
              aria-label="מידע נוסף"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-help"
              >
                <g opacity="0.6">
                  <path
                    d="M10.5 0.5459C4.98 0.5459 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.5459 10.5 0.5459ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z"
                    fill="#A1A1A1"
                  />
                  <path
                    d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z"
                    fill="#A1A1A1"
                  />
                </g>
              </svg>

              {showInfo && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                  <TooltipInfo
                    content={
                      <>
                        <p>
                          הנתונים נלקחים מאתר חברת ניהול מערכת החשמל- נגה, ומהשירות
                          המטאורולוגי.
                        </p>
                        <p>
                          עומס חום מחושב בעזרת נתוני טמפרטורה ולחות בתל-אביב
                          ובירושלים.
                        </p>
                        <p>
                          הנתונים הומרו ליחידות MWh, והם מתעדכנים מעת לעת.
                        </p>
                        <p>
                          צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO.
                          ייצור החשמל אל מול עומס החום.
                        </p>
                      </>
                    }
                  />
                </div>
              )}
            </button>
          </h2>

          {/* <p className="text-sm text-gray-600 mb-2">פרק זמן:</p> */}

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">סינון לפי:</span>
            <DateRangePicker
              onDateRangeChange={handleDateRangeChange}
              defaultPreset="lastYear"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api#heat-load-vs-generation"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="View API Documentation"
          >
            <Image
              src={apiIcon}
              alt="API"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </a>
          <button
            onClick={handleExport}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Export to Excel"
          >
            <Image
              src={downloadIcon}
              alt="Download"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </button>
        </div>
      </div>

      <div className="md:h-[480px] h-[320px]">
        {showLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-600">טוען נתונים...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-600">אין נתונים זמינים</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E6E7EA"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  interval={xTickInterval}
                  minTickGap={32}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />

                <YAxis
                  yAxisId="left"
                  orientation="left"
                  domain={[
                    (dataMin: number) => Math.round(dataMin - 5),
                    (dataMax: number) => Math.round(dataMax + 5),
                  ]}
                  tickLine={false}
                  axisLine={true}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  label={{
                    value: "עומס חום [THI]",
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
                  domain={[
                    0,
                    (dataMax: number) =>
                      Math.ceil(dataMax / 1000) * 1000 + 1000,
                  ]}
                  width={80}
                  label={{
                    value: "ייצור חשמל [MWh]",
                    angle: -90,
                    position: "insideRight",
                    style: {
                      textAnchor: "middle",
                      fontFamily: "Heebo, sans-serif",
                    },
                  }}
                />

                {/* Vertical mid-line near 6/24 - use x value that exists in dataset */}
                {/* <ReferenceLine x="6/24" stroke="#d1d5db" strokeWidth={1} strokeOpacity={0.9} /> */}

                {/* custom tooltip */}
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                />

                {/* Lines */}
                {active.production && (
                  <Line
                    yAxisId="right"
                    dataKey="production"
                    name="ייצור חשמל"
                    stroke="#F4D150"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    opacity={opacity("production")}
                    isAnimationActive={false}
                  />
                )}

                {active.heatLoad && (
                  <Line
                    yAxisId="left"
                    dataKey="heatLoad"
                    name="עומס חום"
                    stroke="#1E8025"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    opacity={opacity("heatLoad")}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-start gap-6 mt-4 pr-4">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-150 bg-transparent border-none p-0"
          onClick={() => toggle("production")}
          onMouseEnter={() => setHovered("production")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: legendOpacity("production") }}
          aria-label="Toggle ייצור חשמל"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#F4D150",
              opacity: active.production ? 1 : 0.3,
            }}
          />
          <span
            className={`md:text-sm text-xs ${active.production ? "text-gray-800" : "text-gray-400"}`}
          >
            ייצור חשמל
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-150 bg-transparent border-none p-0"
          onClick={() => toggle("heatLoad")}
          onMouseEnter={() => setHovered("heatLoad")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: legendOpacity("heatLoad") }}
          aria-label="Toggle עומס חום"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#1E8025",
              opacity: active.heatLoad ? 1 : 0.3,
            }}
          />
          <span
            className={`md:text-sm text-xs ${active.heatLoad ? "text-gray-800" : "text-gray-400"}`}
          >
            עומס חום
          </span>
        </button>
      </div>
    </div>
  );
};

export default HeatVsProductionChart;
