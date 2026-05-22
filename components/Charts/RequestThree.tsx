"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import React, { useState, useMemo } from "react";
import TooltipInfo from "../TooltipInfo";
import Image from "next/image";
import Link from "next/link";
import StackedComposedChart from "./StackedComposedChart";
import download from "@/public/images/download_2.png";
import api from "@/public/images/API.png";
import {
  useResponseCapacityByDistrict,
  buildExportDateRangeSuffix,
  exportResponseCapacityByDistrict,
  ResponseCapacityByDistrictFilters,
} from "@/lib/api";
import type { ResponseCapacityDistrictBreakdownValue } from "@/types/dto";

// District name mapping (English to Hebrew)
const DISTRICT_NAMES: Record<string, string> = {
  South: "דרום",
  North: "צפון",
  Center: "מרכז",
  Haifa: "חיפה",
  "Judea & Samaria": "יו״ש",
  Jerusalem: "ירושלים",
  "Tel Aviv": "תל אביב",
  Other: "אחר",
};

// Response type series config - order: bottom to top in stack
const series = [
  { key: "positive", apiKey: "Positive", label: "חיובית", color: "#60A261" },
  {
    key: "partialPositive",
    apiKey: "Partial Positive",
    label: "חיובית חלקית",
    color: "#957669",
  },
  {
    key: "limitedPositive",
    apiKey: "Limited Positive",
    label: "חיובית מוגבלת",
    color: "#6B707C",
  },
  { key: "negative", apiKey: "Negative", label: "שלילית", color: "#A66565" },
];

const pickBreakdownStat = (
  val: ResponseCapacityDistrictBreakdownValue | undefined,
  mode: "chart" | "text",
) => {
  if (val == null) return 0;
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (mode === "chart") {
    const mw = Number(val.total_mw);
    return Number.isFinite(mw) ? mw : 0;
  }
  const count = Number(val.count);
  return Number.isFinite(count) ? count : 0;
};

const sumVisibleTotal = (
  point: Record<string, number | string>,
  activeSeries: Record<string, boolean>,
) => {
  let total = 0;
  for (const s of series) {
    if (activeSeries[s.key]) total += Number(point[s.key]) || 0;
  }
  return Math.round(total);
};

// Static year options (to avoid hydration mismatch)
const yearOptions = [2026, 2025, 2024, 2023, 2022, 2021];

const YearMultiSelectDropdown = ({
  selectedYears,
  onChange,
  options,
  isOpen,
  setIsOpen,
}: {
  selectedYears: string[];
  onChange: (years: string[]) => void;
  options: string[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const allSelected =
    selectedYears.length === 0 || selectedYears.length === options.length;
  const hasCustomSelection =
    selectedYears.length > 0 && selectedYears.length < options.length;

  const CustomCheckbox = ({
    checked,
    indeterminate = false,
  }: {
    checked: boolean;
    indeterminate?: boolean;
  }) => (
    <span
      className="relative inline-block w-[19px] h-[19px] shrink-0"
      aria-hidden="true"
    >
      <span className="absolute inset-0 box-border bg-[#DEDEDE] border-[1.5px] border-[#484C56] rounded-[2px]" />
      {indeterminate ? (
        <span className="absolute left-[36.84%] right-[36.84%] top-[36.84%] bottom-[36.84%] bg-[#484C56]" />
      ) : checked ? (
        <svg
          viewBox="0 0 20 20"
          className="absolute left-[17%] right-[17%] top-[22%] bottom-[22%] w-auto h-auto"
          fill="none"
        >
          <path
            d="M3 10.2L7.4 14.4L16.8 4.8"
            stroke="#484C56"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );

  const toggleYear = (year: string) => {
    setIsOpen(true);
    if (selectedYears.includes(year)) {
      onChange(selectedYears.filter((y) => y !== year));
      return;
    }
    onChange([...selectedYears, year]);
  };

  const toggleAll = () => {
    setIsOpen(true);
    if (allSelected) {
      onChange([]);
      return;
    }
    onChange([...options]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6 text-right flex items-center justify-between"
        style={{ fontFamily: "Heebo, sans-serif" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {allSelected ? "בחירה מרובה" : `${selectedYears.length} שנים`}
        </span>
        <ChevronDown
          size={14}
          className={`transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full min-w-[179px] h-[258px] bg-[#FAFAFC] border border-[#A1A1A1] rounded-2xl shadow-[0px_3px_30px_rgba(153,191,65,0.16)] p-[15px_10px]"
          style={{ fontFamily: "Heebo, sans-serif" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-[10px]">
            <div className="w-1 h-10 bg-[#C3C3C3] rounded-[100px] mt-1" />
            <div className="flex flex-col gap-[10px] flex-1 h-[228px] overflow-y-auto pr-1">
              <button
                type="button"
                className="w-full flex flex-row-reverse justify-end items-center gap-[10px] text-right text-base font-medium text-[#59687D]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAll();
                }}
              >
                <span>הכל</span>
                <CustomCheckbox
                  checked={allSelected}
                  indeterminate={hasCustomSelection}
                />
              </button>

              {options.map((year) => {
                const checked = allSelected || selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    type="button"
                    className="w-full flex-row-reverse flex justify-end items-center gap-[10px] text-right text-base font-medium text-[#59687D]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleYear(year);
                    }}
                  >
                    <span>{year}</span>
                    <CustomCheckbox checked={checked} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  payload?: Array<{ payload?: Record<string, number | string> }>;
  label?: string;
  activeTab: "chart" | "text";
  activeSeries: Record<string, boolean>;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const unit = activeTab === "chart" ? "MW" : "מתקנים";
  const visibleSeries = series.filter((s) => activeSeries[s.key]);
  const visibleTotal = sumVisibleTotal(point, activeSeries);

  return (
    <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
        סה״כ {visibleTotal.toLocaleString()} {unit}
      </div>

      {visibleSeries.map((s) => {
        const val = Number(point[s.key]) || 0;
        if (val === 0) return null;
        return (
          <div key={s.key} className="flex items-start gap-2 mb-1">
            <span
              style={{ background: s.color }}
              className="w-2 h-2 rounded-full block mt-1"
            />
            <span className="flex flex-col text-sm font-normal">
              {s.label}{" "}
              <span className="font-medium">
                {Math.round(val).toLocaleString()} {unit}
              </span>
            </span>
          </div>
        );
      })}
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
    <div className="flex flex-row-reverse justify-end gap-6 mt-6">
      {series.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => toggleSeries(s.key)}
          onMouseEnter={() => setHoveredSeries(s.key)}
          onMouseLeave={() => setHoveredSeries(null)}
          className="flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200"
          style={{ opacity: getLegendOpacity(s.key) }}
        >
          <span
            style={{
              background: s.color,
              opacity: activeSeries[s.key] ? 1 : 0.3,
            }}
            className="w-2 h-2 rounded-full block transition-opacity duration-200"
          />
          <span
            className={`transition-all duration-200 ${activeSeries[s.key] ? "text-gray-800" : "text-gray-400"
              }`}
          >
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function RequestThree() {
  const [activeTab, setActiveTab] = useState<"chart" | "text">("chart");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State for active series with toggle functionality
  const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
    negative: true,
    limitedPositive: true,
    partialPositive: true,
    positive: true,
  });

  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const singleSelectedYear =
    selectedYears.length === 1 ? Number(selectedYears[0]) : undefined;

  // Build filters
  const filters: ResponseCapacityByDistrictFilters = useMemo(
    () => ({
      year: singleSelectedYear,
    }),
    [singleSelectedYear],
  );

  // Fetch data from API
  const {
    data: apiData,
    isLoading,
    error,
  } = useResponseCapacityByDistrict(filters);

  // Transform API data for chart
  const chartData = useMemo(() => {
    if (!apiData?.series) return [];

    const mode = activeTab === "chart" ? "chart" : "text";
    const districtBreakdowns = apiData.district_response_breakdown ?? {};

    return apiData.series.map((item) => {
      const districtResponse =
        item.response_breakdown ??
        districtBreakdowns[item.district] ??
        {};

      const negative = pickBreakdownStat(districtResponse.Negative, mode);
      const limitedPositive = pickBreakdownStat(
        districtResponse["Limited Positive"],
        mode,
      );
      const partialPositive = pickBreakdownStat(
        districtResponse["Partial Positive"],
        mode,
      );
      const positive = pickBreakdownStat(districtResponse.Positive, mode);

      const total = activeTab === "chart" ? item.total_mw : item.request_count;

      return {
        district: DISTRICT_NAMES[item.district] || item.district,
        total,
        negative,
        limitedPositive,
        partialPositive,
        positive,
      };
    });
  }, [apiData, activeTab]);

  const chartDisplayData = useMemo(
    () =>
      chartData.map((point) => ({
        ...point,
        visibleTotal: sumVisibleTotal(point, activeSeries),
      })),
    [chartData, activeSeries],
  );

  // Function to determine opacity for each bar
  const opacityForKey = (key: string) => {
    if (hoveredSeries) {
      return hoveredSeries === key ? 1 : 0.3;
    }
    return activeSeries[key] ? 1 : 0.3;
  };

  const exportDateRange = useMemo(
    () =>
      buildExportDateRangeSuffix({
        year: singleSelectedYear,
        years: selectedYears.length > 0 ? selectedYears : undefined,
      }),
    [singleSelectedYear, selectedYears],
  );

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportResponseCapacityByDistrict(filters, exportDateRange);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            תשובות מחלק לפי מחוז
            <div
              className="relative cursor-help"
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
                            https://www.gov.il/he/pages/bipua2024
                          </a>
                        </p>
                        <p>הנתונים מתעדכנים מעת לעת.</p>
                        <p>
                          צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. תשובות מחלק לפי מחוז.
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
                        <p>
                          נתונים שאינם מעודכנים במערכות חברת החשמל לפי מחוז מופיעים תחת קטגוריית &quot;אחר&quot;.
                        </p>
                      </>
                    }
                  />
                </div>
              )}
            </div>
          </h2>
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-sm text-slate-600 mt-6">מיון לפי:</span>

            <div className="relative w-[113px]">
              <label htmlFor="" className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">שנה:</span>
                <YearMultiSelectDropdown
                  selectedYears={selectedYears}
                  onChange={setSelectedYears}
                  options={yearOptions.map(String)}
                  isOpen={isYearDropdownOpen}
                  setIsOpen={setIsYearDropdownOpen}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-start md:gap-4 gap-2">
          <Link href="/api#response-capacity-by-district">
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

      <div className="w-full md:h-[500px] h-[300px]">
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
            xAxisDataKey="district"
            yAxisLabel={
              activeTab === "chart" ? " הספק [MW]" : "מספר מתקנים"
            }
            tooltipContent={
              <CustomTooltip
                activeTab={activeTab}
                activeSeries={activeSeries}
              />
            }
            sizeBrackets={series}
            activeSeries={activeSeries}
            barSize={80}
            opacityForKey={opacityForKey}
            labelListDataKey="visibleTotal"
          />
        )}
      </div>

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
          onClick={() => setActiveTab("chart")}
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "chart"
            ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
            : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
            }`}
        >
          הספק מתקנים
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "text"
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
