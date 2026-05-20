"use client";

import React, { useState, useMemo } from "react";
import download from "@/public/images/download_2.png";
import api from "@/public/images/API.png";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TooltipInfo from "../TooltipInfo";
import YearMultiSelectDropdown from "../ui/YearMultiSelectDropdown";
import StackedComposedChart from "./StackedComposedChart";
import {
  useResponseCapacityBySize,
  exportResponseCapacityBySize,
  ResponseCapacityBySizeFilters,
  useResponseCapacityByPeriod,
} from "@/lib/api";
import { accumulateFourSegments } from "@/lib/chartSizeBracketMapping";

// Size bracket configuration with colors and Hebrew labels (matching Figma - 4 categories)
const SIZE_BRACKETS = [
  { key: "xlarge", label: "גדול מאוד | +5001 KW", color: "#648AA3" },
  { key: "large", label: "גדול | 631-5000 KW", color: "#60A261" },
  { key: "medium", label: "בינוני | 201-630 KW", color: "#957669" },
  { key: "small", label: "קטן | 0-200 KW", color: "#A66565" },
];

const sumVisibleTotal = (
  point: Record<string, number>,
  activeSeries: Record<string, boolean>,
) => {
  let total = 0;
  for (const b of SIZE_BRACKETS) {
    if (activeSeries[b.key]) total += point[b.key] || 0;
  }
  return Math.round(total);
};

// Custom Tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
  activeTab,
  activeSeries,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number; color?: string }>;
  label?: string;
  activeTab: "supply" | "facilities";
  activeSeries: Record<string, boolean>;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const visiblePayload = payload.filter(
    (entry) => entry.dataKey && activeSeries[String(entry.dataKey)],
  );
  const total = visiblePayload.reduce(
    (sum, entry) => sum + (Number(entry.value) || 0),
    0,
  );
  const unit = activeTab === "supply" ? "KW" : "מתקנים";

  return (
    <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
        סה״כ {Math.round(total).toLocaleString()} {unit}
      </div>

      {SIZE_BRACKETS.filter((bracket) => activeSeries[bracket.key]).map(
        (bracket) => {
          const entry = visiblePayload.find((p) => p.dataKey === bracket.key);
          if (!entry) return null;
          const val = Number(entry.value) || 0;

          return (
            <div key={bracket.key} className="flex items-start gap-2 mb-1">
              <span
                style={{ background: bracket.color }}
                className="w-2 h-2 rounded-full block mt-1"
              />
              <span className="flex flex-col text-sm font-normal">
                {bracket.label.split(" | ")[0]}{" "}
                <span className="font-medium">
                  {Math.round(val).toLocaleString()} {unit}
                </span>
              </span>
            </div>
          );
        },
      )}
    </div>
  );
};

// Custom Legend Component with toggle functionality
const CustomLegend = ({
  activeSeries,
  setActiveSeries,
  hoveredSeries,
  setHoveredSeries,
}: {
  activeSeries: { [key: string]: boolean };
  setActiveSeries: (series: { [key: string]: boolean }) => void;
  hoveredSeries: string | null;
  setHoveredSeries: (series: string | null) => void;
}) => {
  const toggleSeries = (key: string) => {
    setActiveSeries({
      ...activeSeries,
      [key]: !activeSeries[key],
    });
  };

  const getLegendOpacity = (key: string) => {
    if (!hoveredSeries) return 1;
    return hoveredSeries === key ? 1 : 0.5;
  };

  return (
    <div className="flex flex-row-reverse flex-wrap justify-end gap-4 mt-6">
      {SIZE_BRACKETS.map((bracket) => (
        <button
          key={bracket.key}
          type="button"
          onClick={() => toggleSeries(bracket.key)}
          onMouseEnter={() => setHoveredSeries(bracket.key)}
          onMouseLeave={() => setHoveredSeries(null)}
          className="flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200"
          style={{ opacity: getLegendOpacity(bracket.key) }}
        >
          <span
            style={{
              background: bracket.color,
              opacity: activeSeries[bracket.key] ? 1 : 0.3,
            }}
            className="w-2 h-2 rounded-full block transition-opacity duration-200"
          />
          <span
            className={`transition-all duration-200 ${activeSeries[bracket.key] ? "text-gray-800" : "text-gray-400"
              }`}
          >
            {bracket.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function RequestTwo() {
  const [activeTab, setActiveTab] = useState<"supply" | "facilities">("supply");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [showLatestMonth, setShowLatestMonth] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New state for active series with toggle functionality
  const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
    xlarge: true,
    large: true,
    medium: true,
    small: true,
  });

  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const singleSelectedYear =
    selectedYears.length === 1 ? Number(selectedYears[0]) : undefined;

  // Build filters
  // API currently supports a single year filter. We fetch all and filter client-side for multi-select.
  const filters: ResponseCapacityBySizeFilters = useMemo(() => ({}), []);

  // Fetch data from API
  const {
    data: apiData,
    isLoading,
    error,
  } = useResponseCapacityBySize(filters);

  // Current year/month for "last month" view (by-size does not support month grouping)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const periodQueryYear = showLatestMonth
    ? currentYear
    : (singleSelectedYear ?? currentYear);

  // Fetch monthly data from by-period
  const { data: periodData } = useResponseCapacityByPeriod({
    year: periodQueryYear,
  });

  // Transform API data for chart — yearly_series uses kW-range labels + total_mw / count
  const allYearData = useMemo(() => {
    if (!apiData?.yearly_series?.length) return [];

    const pick = (
      entry: { total_mw?: number; count?: number } | undefined,
    ) => {
      if (!entry) return 0;
      const raw =
        activeTab === "supply"
          ? Number(entry.total_mw ?? 0)
          : Number(entry.count ?? 0);
      return Number.isFinite(raw) ? raw : 0;
    };

    const mapLegacyInstalledStyleBrackets = (
      brackets: Record<string, { total_mw?: number; count?: number }>,
    ) => {
      const getValue = (b: { total_mw?: number; count?: number } | undefined) =>
        pick(b);

      const small =
        getValue(brackets["Up to 16 kW"]) +
        getValue(brackets["16–50 kW"]) +
        getValue(brackets["50–200 kW"]);
      const medium = getValue(brackets["200 kW–1 MW"]);
      const large = getValue(brackets["1–5 MW"]);
      const xlarge =
        getValue(brackets["5–50 MW"]) + getValue(brackets["50+ MW"]);
      return { small, medium, large, xlarge };
    };

    const firstBrackets = apiData.yearly_series[0]?.size_brackets ?? {};
    const usesLegacyMwBands = "Up to 16 kW" in firstBrackets;

    return apiData.yearly_series
      .map((yearData) => {
        const brackets = yearData.size_brackets || {};
        const { small, medium, large, xlarge } = usesLegacyMwBands
          ? mapLegacyInstalledStyleBrackets(brackets)
          : accumulateFourSegments(brackets as Record<string, unknown>, (raw) =>
            pick(
              raw as { total_mw?: number; count?: number } | undefined,
            ),
          );

        const total = small + medium + large + xlarge;

        return {
          year: yearData.year,
          small,
          medium,
          large,
          xlarge,
          total,
        };
      })
      .sort((a, b) => a.year - b.year);
  }, [apiData, activeTab]);

  const availableYearOptions = useMemo(
    () =>
      allYearData
        .map((item: any) => String(item.year))
        .sort((a, b) => Number(b) - Number(a)),
    [allYearData],
  );

  const chartData = useMemo(() => {
    if (showLatestMonth) {
      const match = periodData?.series?.find(
        (item: any) => item.period === currentMonthKey,
      );
      if (!match) return [];
      const value =
        activeTab === "supply"
          ? Number(match.total_mw || 0)
          : Number(match.request_count || 0);
      // by-period has no size breakdown — put the month total into a single bracket
      return [
        {
          year: match.period,
          small: 0,
          medium: 0,
          large: 0,
          xlarge: isNaN(value) ? 0 : value,
          total: isNaN(value) ? 0 : value,
        },
      ];
    }

    if (singleSelectedYear) {
      return (periodData?.series || [])
        .filter((item: any) => item.period.startsWith(`${singleSelectedYear}-`))
        .sort((a: any, b: any) => a.period.localeCompare(b.period))
        .map((item: any) => {
          const value =
            activeTab === "supply"
              ? Number(item.total_mw || 0)
              : Number(item.request_count || 0);
          const month = item.period.split("-")[1] || item.period;

          return {
            year: month,
            small: 0,
            medium: 0,
            large: 0,
            xlarge: isNaN(value) ? 0 : value,
            total: isNaN(value) ? 0 : value,
          };
        });
    }

    if (allYearData.length === 0) return [];

    if (selectedYears.length === 0) {
      return allYearData;
    }

    const yearSet = new Set(selectedYears.map((year) => Number(year)));
    return allYearData.filter((item: any) => yearSet.has(item.year));
  }, [
    allYearData,
    selectedYears,
    singleSelectedYear,
    showLatestMonth,
    periodData,
    activeTab,
    currentMonthKey,
  ]);

  const chartDisplayData = useMemo(
    () =>
      chartData.map((point) => ({
        ...point,
        visibleTotal: sumVisibleTotal(point, activeSeries),
      })),
    [chartData, activeSeries],
  );

  // Match RequestOne behavior for monthly (single-year) view
  const barSize = singleSelectedYear
    ? 36
    : chartData.length <= 1
      ? 120
      : chartData.length <= 3
        ? 80
        : 60;

  // Function to determine opacity for each bar
  const opacityForKey = (key: string) => {
    // If a series is hovered, highlight only that series
    if (hoveredSeries) {
      return hoveredSeries === key ? 1 : 0.3;
    }
    // If no series is hovered, show based on active state
    return activeSeries[key] ? 1 : 0.3;
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportResponseCapacityBySize(filters);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            תשובות חיוביות לפי גודל
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              role="tooltip"
              tabIndex={0}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <path
                    d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z"
                    fill="#59687D"
                  />
                  <path
                    d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z"
                    fill="#59687D"
                  />
                </g>
              </svg>
              {showTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                  <TooltipInfo
                    content={
                      <>
                        <p>
                          הנתונים נלקחים מאתר רשות החשמל.{" "}
                          <a
                            href="https://www.gov.il/he/pages/bipua2024"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap"
                          >
                            gov.il
                          </a>
                        </p>
                        <p>הנתונים מתעדכנים מעת לעת.</p>
                        <p>
                          צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. תשובות חיוביות לפי גודל.
                        </p>
                        <p className="font-semibold text-[#484C56] pt-1">
                          הערות כלליות:
                        </p>
                        <p>
                          מידע זה הינו אינפורמטיבי בלבד ואין להסיק ממנו לגבי תשובה פרטנית. המידע המחייב הוא המידע המתקבל מהמחלק באופן פרטני אצל כל מבקש חיבור.
                        </p>
                        <p>
                          נתוני הספק המתקנים המחוברים והמבוקשים הם ביחידות של MW ומוצגים במונחי DC (מחושב).
                        </p>
                        <p>
                          ככל שדווחו על ידי המחלק נתוני הספק פאנלים בפועל (הספק DC), הם מוצגים בדו&quot;ח. במידה שלא קיימים נתונים אלו ועבור נתונים חריגים על מנת להמיר את ההספק מ-AC ל-DC, נעשה שימוש בטבלת המרה הבאה: טבלת המרת DC/AC (PV) – יש להכפיל ב:
                        </p>
                        <ul className="list-disc list-inside space-y-1 pr-1">
                          <li>דו שימוש: 1.2</li>
                          <li>קרקעי: 1.3</li>
                          <li>משולב אגירה: 2.3</li>
                        </ul>
                        <p>
                          הנתונים מבוססים על מידע שמועבר מחברת החשמל ונוגה לרשות החשמל.
                        </p>
                      </>
                    }
                  />
                </div>
              )}
            </div>
          </h2>

          <div className="flex flex-wrap items-center gap-5">
            <span className="text-sm text-slate-600 mt-6">סינון לפי:</span>
            <div className="relative w-[113px]">
              <label htmlFor="" className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">
                  שנה:
                </span>
                <YearMultiSelectDropdown
                  selectedYears={selectedYears}
                  onChange={(years) => {
                    setSelectedYears(years);
                    if (years.length > 0 && showLatestMonth) {
                      setShowLatestMonth(false);
                    }
                  }}
                  options={availableYearOptions}
                  showLatestMonth={showLatestMonth}
                  onToggleLatestMonth={() => {
                    setShowLatestMonth((prev) => !prev);
                    setSelectedYears([]);
                  }}
                  isOpen={isYearDropdownOpen}
                  setIsOpen={setIsYearDropdownOpen}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-start md:gap-4 gap-2">
          <Link href="/api#response-capacity-by-size">
            <Image
              src={api}
              width={32}
              height={32}
              className="w-[32px] h-[32px] cursor-pointer"
              alt="API documentation"
            />
          </Link>
          <button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="w-[32px] h-[32px] animate-spin text-gray-500" />
            ) : (
              <Image
                src={download}
                width={32}
                height={32}
                className="w-[32px] h-[32px] cursor-pointer"
                alt="Download Excel"
              />
            )}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[420px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            שגיאה בטעינת הנתונים
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            אין נתונים להצגה
          </div>
        ) : (
          <StackedComposedChart
            data={chartDisplayData}
            xAxisDataKey="year"
            yAxisLabel={
              activeTab === "supply" ? "הספק [KW]" : "מספר מתקנים"
            }
            tooltipContent={
              <CustomTooltip
                activeTab={activeTab}
                activeSeries={activeSeries}
              />
            }
            sizeBrackets={SIZE_BRACKETS}
            activeSeries={activeSeries}
            barSize={barSize}
            opacityForKey={opacityForKey}
            labelListDataKey="visibleTotal"
          />
        )}
      </div>

      {/* Legend */}
      <CustomLegend
        activeSeries={activeSeries}
        setActiveSeries={setActiveSeries}
        hoveredSeries={hoveredSeries}
        setHoveredSeries={setHoveredSeries}
      />

      {/* Tabs */}
      <div
        className="flex gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] mb-4 w-fit ml-auto -mt-10"
        style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}
      >
        <button
          onClick={() => setActiveTab("supply")}
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "supply"
            ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
            : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
            }`}
        >
          הספק מתקנים
        </button>
        <button
          onClick={() => setActiveTab("facilities")}
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "facilities"
            ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
            : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
            }`}
        >
          מספר מתקנים
        </button>
      </div>
    </div>
  );
}
