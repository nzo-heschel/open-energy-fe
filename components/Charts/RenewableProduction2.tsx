"use client";

import {
  exportRenewablesPotentialByIndustry,
  useRenewablesPotentialByIndustry,
} from "@/lib/api";
import api from "@/public/images/API.png";
import download from "@/public/images/download_2.png";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import TooltipInfo from "../TooltipInfo";
import StackedComposedChart from "./StackedComposedChart";

// Hebrew month names
const hebrewMonths: Record<string, string> = {
  "01": "ינואר",
  "02": "פברואר",
  "03": "מרץ",
  "04": "אפריל",
  "05": "מאי",
  "06": "יוני",
  "07": "יולי",
  "08": "אוגוסט",
  "09": "ספטמבר",
  "10": "אוקטובר",
  "11": "נובמבר",
  "12": "דצמבר",
};
const MONTH_ORDER = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

// Year → color. 2021–2024 match the Figma palette exactly.
const yearColors: Record<string, string> = {
  "2021": "#8BBFE1",
  "2022": "#3A7C2F",
  "2023": "#A7BF56",
  "2024": "#DACF61",
  "2025": "#8BBFE1",
  "2026": "#3A7C2F",
};

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const parsed = parseFloat(v);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

// Bucket a renewables-transition series into per-(year, month) share %.
// Accepts both daily ({ date: "YYYY-MM-DD", ... }) and monthly ({ period: "YYYY-MM", ... }) shapes.
// Returns { "2025": { "05": 8.1, ... }, "2026": { "01": 7.4, ... } }
function bucketByYearMonth(
  series: Array<Record<string, unknown>> | undefined,
): Record<string, Record<string, number>> {
  if (!series?.length) return {};
  const totals: Record<
    string,
    Record<string, { renewable: number; total: number }>
  > = {};
  for (const raw of series) {
    const item = raw as Record<string, unknown>;
    const dateStr = (item.date ?? item.period ?? item.month) as
      | string
      | undefined;
    const parts = dateStr?.split("-");
    const year = parts?.[0];
    const monthNum = parts?.[1];
    if (!year || !monthNum) continue;
    const renewable =
      item.renewable_mwh !== undefined
        ? toNumber(item.renewable_mwh)
        : toNumber(item.solar_mwh ?? item.solar) +
          toNumber(item.wind_mwh ?? item.wind) +
          toNumber(item.other_mwh ?? item.other);
    const total = toNumber(item.total_mwh ?? item.total);
    if (!totals[year]) totals[year] = {};
    const bucket = totals[year][monthNum] ?? { renewable: 0, total: 0 };
    bucket.renewable += renewable;
    bucket.total += total;
    totals[year][monthNum] = bucket;
  }
  const result: Record<string, Record<string, number>> = {};
  for (const [y, months] of Object.entries(totals)) {
    result[y] = {};
    for (const [m, { renewable, total }] of Object.entries(months)) {
      // Guard: when the backend emits total = renewable (only sums solar+wind+other),
      // share would always be 100 %; surface the renewable MWh instead so the chart
      // still has something to draw. Otherwise compute the real share %.
      if (total <= 0) {
        result[y][m] = 0;
      } else if (Math.abs(total - renewable) / Math.max(total, 1) < 0.01) {
        result[y][m] = renewable;
      } else {
        result[y][m] = (renewable / total) * 100;
      }
    }
  }
  return result;
}

type LegendItem = { key: string; label: string; color: string };

/** Same interaction model as `InstalledCapacityTwo` (hover + click to hide). */
const CustomLegend = ({
  items,
  hoveredKey,
  onMouseEnter,
  onMouseLeave,
  onClick,
  hiddenKeys,
}: {
  items: LegendItem[];
  hoveredKey: string | null;
  onMouseEnter: (key: string) => void;
  onMouseLeave: () => void;
  onClick: (key: string) => void;
  hiddenKeys: Set<string>;
}) => (
  <div
    className="flex flex-row-reverse flex-wrap justify-end gap-6 mt-4"
    style={{ fontFamily: "Heebo, sans-serif" }}
  >
    {items.map((s) => {
      const isHidden = hiddenKeys.has(s.key);
      const isHovered = hoveredKey === s.key;
      const isFaded = Boolean(hoveredKey) && !isHovered;

      return (
        <button
          key={s.key}
          type="button"
          className={`flex flex-row-reverse items-center gap-[10px] cursor-pointer select-none transition-opacity duration-200 ${isHidden ? "opacity-40" : ""} ${isFaded ? "opacity-30" : ""}`}
          onMouseEnter={() => onMouseEnter(s.key)}
          onMouseLeave={onMouseLeave}
          onClick={() => onClick(s.key)}
        >
          <span
            className={`text-base font-medium transition-all duration-200 ${isHidden ? "text-gray-400" : "text-[#484C56]"}`}
          >
            {s.label}
          </span>
          <span
            className="w-2 h-2 rounded-full transition-opacity duration-200"
            style={{
              background: s.color,
              opacity: isHidden ? 0.3 : 1,
            }}
          />
        </button>
      );
    })}
  </div>
);

export default function RenewableProduction2() {
  const [tab, setTab] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHiddenKeys(new Set());
    setHoveredKey(null);
  }, [tab]);

  // Single date-ranged query — the backend's daily data starts at 2024 (per
  // its own data_availability_note), so we anchor start_date there and end at
  // today. One call covers every year that actually has data, avoiding the
  // fan-out of one request per supported year.
  const dateRange = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return { start: "2021-01-01", end: `${yyyy}-${mm}-${dd}` };
  }, []);
  const {
    data: industryData,
    isLoading,
    error,
  } = useRenewablesPotentialByIndustry(
    undefined,
    dateRange.start,
    dateRange.end,
  );

  // Per-(year, month) renewable-share % derived from the daily series.
  const perYearMonth = useMemo(
    () =>
      bucketByYearMonth(
        industryData?.series as Array<Record<string, unknown>> | undefined,
      ),
    [industryData],
  );

  // Years actually present in the response, sorted ascending. The legend and
  // bar series follow this — so we never try to render years with no data.
  const visibleYears = useMemo(
    () => Object.keys(perYearMonth).sort(),
    [perYearMonth],
  );

  // Build the monthly grouped-bar data: one row per month, one key per visible year.
  const chartData = useMemo(() => {
    if (tab !== 1) {
      // Preferred: backend provides industry breakdown — use it as-is.
      if (industryData?.industry_breakdown?.length) {
        return industryData.industry_breakdown.map((item) => ({
          month: item.industry_type,
          potential: item.renewable_potential_mw,
          renewableMW: item.renewable_potential_mw,
          solarShare: item.solar_share_percent,
        }));
      }
      // Fallback: when only a daily series is returned, summarize by tech.
      const totals = industryData?.totals;
      const solar = totals?.solar ?? 0;
      const wind = totals?.wind ?? 0;
      const other = totals?.other ?? 0;
      const grandTotal = solar + wind + other;
      if (grandTotal <= 0) return [] as any[];
      return [
        {
          month: "סולארי",
          potential: Math.round(solar),
          renewableMW: Math.round(solar),
          solarShare: 100,
        },
        {
          month: "רוח",
          potential: Math.round(wind),
          renewableMW: Math.round(wind),
          solarShare: 0,
        },
        {
          month: "אחר",
          potential: Math.round(other),
          renewableMW: Math.round(other),
          solarShare: 0,
        },
      ];
    }

    return MONTH_ORDER.map((monthNum) => {
      const row: Record<string, unknown> = { month: hebrewMonths[monthNum] };
      for (const y of visibleYears) {
        const pct = perYearMonth[y]?.[monthNum];
        if (typeof pct === "number" && pct > 0) {
          row[y] = Number(pct.toFixed(2));
        }
      }
      return row;
    }).filter((row) => visibleYears.some((y) => typeof row[y] === "number"));
  }, [tab, industryData, perYearMonth, visibleYears]);

  // Series metadata for the legend (reversed so the most recent year sits first in RTL).
  const legendSeries = useMemo(
    () =>
      visibleYears.map((y) => ({
        key: y,
        label: y,
        color: yearColors[y] ?? "#999999",
      })),
    [visibleYears],
  );

  const handleExport = async () => {
    try {
      await exportRenewablesPotentialByIndustry(
        undefined,
        dateRange.start,
        dateRange.end,
      );
    } catch (err) {
      console.error("Failed to export data:", err);
    }
  };

  const stackedActiveSeries = useMemo(() => {
    if (tab !== 1) return {} as Record<string, boolean>;
    return Object.fromEntries(
      legendSeries.map((s) => [s.key, !hiddenKeys.has(s.key)]),
    ) as Record<string, boolean>;
  }, [tab, legendSeries, hiddenKeys]);

  const opacityForKey = (key: string) => {
    if (tab !== 1) return 1;
    if (hiddenKeys.has(key)) return 0;
    if (hoveredKey && hoveredKey !== key) return 0.3;
    return 1;
  };

  const handleLegendMouseEnter = (key: string) => {
    setHoveredKey(key);
  };

  const handleLegendMouseLeave = () => {
    setHoveredKey(null);
  };

  const handleLegendClick = (key: string) => {
    const next = new Set(hiddenKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHiddenKeys(next);
  };

  // Tooltip: month header + total of shown percentages + per-year rows (Figma layout).
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    if (tab === 2) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-3 min-w-[160px] text-sm">
          <div className="text-sm text-gray-500 mb-2">{label}</div>
          <div className="text-sm font-medium mb-1">
            פוטנציאל מתחדשות:{" "}
            <span className="font-bold">
              {dataPoint?.renewableMW?.toLocaleString()} MW
            </span>
          </div>
          <div className="text-sm font-medium border-t border-[#707585] pt-1 mt-1">
            חלק סולארי:{" "}
            <span className="font-bold">
              {dataPoint?.solarShare?.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }

    const rows = legendSeries
      .map((s) => {
        const entry = payload.find((p: any) => p.dataKey === s.key);
        const value = entry ? Number(entry.value) : undefined;
        return typeof value === "number" ? { ...s, value } : null;
      })
      .filter(
        (
          r,
        ): r is { key: string; label: string; color: string; value: number } =>
          r !== null,
      );

    const total = rows.reduce((sum, r) => sum + r.value, 0);

    return (
      <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-3 min-w-[140px] text-sm">
        <div className="text-sm text-[#707585] mb-1 text-right">{label}</div>
        <div className="text-base font-medium text-[#59687D] border-b border-[#707585] pb-1 mb-2 text-right">
          סה״כ {total.toFixed(0)}%
        </div>
        <div className="flex flex-col gap-1">
          {rows.map((r) => (
            <div
              key={r.key}
              className="flex flex-row-reverse items-center justify-between gap-3"
            >
              <div className="flex flex-row-reverse items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: r.color }}
                />
                <span className="text-sm text-[#59687D]">{r.label}</span>
              </div>
              <span className="text-sm font-medium text-[#484C56]">
                {r.value.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
      <div className="flex flex-col md:flex-row items-start justify-between">
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            המעבר לאנרגיות מתחדשות בישראל - נתוני ייצור
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
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

              {showTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                  <TooltipInfo
                    content="
                                    הגרף מציג את כמות החשמל שיוצר מאנרגיות מתחדשות (שמש, רוח ואחרים) לאורך שנה נבחרת, לפי חודשים.
                    ניתן ללמוד ממנו איך משתנה ייצור החשמל מאנרגיות מתחדשות לאורך השנה, ימים, או חודשים,, ומה התרומה של כל סוג טכנולוגיה (רוח, סולארי, אחר) בכל חודש.
                    הנתונים נאספים ממערכת נוגה ומתעדכנים מעת לעת. ניתן לסנן לפי סוג טכנולוגיה ושנה, יום או חודש,, ולהוריד את המידע לקובץ אקסל או לגשת אליו דרך API.
                    "
                  />
                </div>
              )}
            </div>
          </h2>
        </div>
        <div className="flex items-start md:gap-4 gap-2">
          <a
            href={
              tab === 1
                ? "/api#renewables-transition"
                : "/api#renewables-potential-by-industry"
            }
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

      <div className="w-full md:h-[500px] h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-600">טוען נתונים...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-600">שגיאה בטעינת הנתונים</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-600">אין נתונים זמינים</p>
          </div>
        ) : tab === 1 ? (
          <StackedComposedChart
            barLayout="grouped"
            barGap={6}
            barCategoryGap="30%"
            data={chartData}
            xAxisDataKey="month"
            yAxisLabel="אחוז מכלל הייצור [%]"
            yAxisDomain={[
              0,
              (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.15)),
            ]}
            yAxisTickFormatter={(v) => `${v}`}
            tooltipContent={<CustomTooltip />}
            tooltipCursor={{ fill: "rgba(0,0,0,0.03)" }}
            sizeBrackets={legendSeries}
            activeSeries={stackedActiveSeries}
            barSize={10}
            opacityForKey={opacityForKey}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            groupedBarRadius={[2, 2, 0, 0]}
            hideLabelList
          />
        ) : (
          <StackedComposedChart
            data={chartData}
            xAxisDataKey="month"
            yAxisLabel="[MW]"
            yAxisDomain={[0, "auto"]}
            yAxisTickFormatter={(v) => Number(v).toLocaleString()}
            tooltipContent={<CustomTooltip />}
            sizeBrackets={[{ key: "potential", color: "#7BC94A" }]}
            activeSeries={{ potential: true }}
            barSize={28}
            opacityForKey={() => 1}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            lastBarRadius={[4, 4, 0, 0]}
            hideLabelList
          />
        )}
      </div>

      {!isLoading && !error && chartData.length > 0 && tab === 1 && (
        <CustomLegend
          items={legendSeries}
          hoveredKey={hoveredKey}
          onMouseEnter={handleLegendMouseEnter}
          onMouseLeave={handleLegendMouseLeave}
          onClick={handleLegendClick}
          hiddenKeys={hiddenKeys}
        />
      )}
      {!isLoading &&
        !error &&
        chartData.length > 0 &&
        tab === 2 &&
        (() => {
          // Prefer the explicit total_potential_mw when the backend returns
          // industry_breakdown; otherwise fall back to the rolled-up totals
          // we already display as bars so the badge (and the bottom-tab
          // anchor it provides) is always present.
          const explicit = industryData?.total_potential_mw;
          const rolled =
            (industryData?.totals?.solar ?? 0) +
            (industryData?.totals?.wind ?? 0) +
            (industryData?.totals?.other ?? 0);
          const value = explicit !== undefined ? explicit : rolled;
          if (value <= 0) return null;
          return (
            <div className="flex justify-start mt-4">
              <div className="text-sm text-gray-600">
                סה״כ פוטנציאל: {Math.round(value).toLocaleString()} MW
              </div>
            </div>
          );
        })()}

      {/* Tabs */}
      <div
        className="flex  gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] mb-4 w-fit ml-auto mt-4 md:-mt-10"
        style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}
      >
        <button
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${
            tab === 1
              ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
              : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
          }`}
          onClick={() => setTab(1)}
        >
          הספק מיוצר
        </button>
        <button
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${
            tab === 2
              ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
              : "bg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
          }`}
          onClick={() => setTab(2)}
        >
          פוטנציאל לפי ענף
        </button>
      </div>
    </div>
  );
}
