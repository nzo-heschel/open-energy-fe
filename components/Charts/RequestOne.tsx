"use client";

import React, { useState, useMemo } from "react";
import download from "@/public/images/download_2.png";
import api from "@/public/images/API.png";
import { ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StackedComposedChart from "./StackedComposedChart";
import TooltipInfo from "../TooltipInfo";
import {
  useResponseCapacityByPeriod,
  exportResponseCapacityByPeriod,
  ResponseCapacityByPeriodFilters,
} from "@/lib/api";

type TabKey = "1" | "2";

type ResponseTypeKey =
  | "Positive"
  | "Negative"
  | "Partial Positive"
  | "Limited Positive";

type BreakdownValue =
  | number
  | { total_mw?: number; count?: number }
  | undefined;

type ChartDataPoint = {
  period: string;
  totalMw: number;
  requestCount: number;
  total: number;
  negative: number;
  limitedPositive: number;
  partialPositive: number;
  positive: number;
};

// Legend series config (stack order matches bar render order)
const SIZE_BRACKETS = [
  {
    key: "negative",
    apiKey: "Negative" as const,
    label: "שלילית",
    color: "#A66565",
  },
  {
    key: "limitedPositive",
    apiKey: "Limited Positive" as const,
    label: "חיובית מוגבלת",
    color: "#6B707C",
  },
  {
    key: "partialPositive",
    apiKey: "Partial Positive" as const,
    label: "חיובית חלקית",
    color: "#957669",
  },
  {
    key: "positive",
    apiKey: "Positive" as const,
    label: "חיובית",
    color: "#60A261",
  },
];

const series = [
  {
    key: "negative",
    apiKey: "Negative" as const,
    label: "שלילית",
    color: "#A66565",
  },
  {
    key: "limitedPositive",
    apiKey: "Limited Positive" as const,
    label: "חיובית מוגבלת",
    color: "#6B707C",
  },
  {
    key: "partialPositive",
    apiKey: "Partial Positive" as const,
    label: "חיובית חלקית",
    color: "#957669",
  },
  {
    key: "positive",
    apiKey: "Positive" as const,
    label: "חיובית",
    color: "#60A261",
  },
];

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

const readBreakdownNumber = (
  value: BreakdownValue,
  mode: "mw" | "count",
): number => {
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  return mode === "mw" ? (value.total_mw ?? 0) : (value.count ?? 0);
};

const computeShares = (
  breakdown: Partial<Record<ResponseTypeKey, BreakdownValue>>,
  mode: "mw" | "count",
): number[] => {
  const raw = series.map((s) => readBreakdownNumber(breakdown[s.apiKey], mode));
  const sum = raw.reduce((acc, n) => acc + n, 0);
  if (sum <= 0) {
    return series.map(() => 1 / series.length);
  }
  return raw.map((n) => n / sum);
};

const allocateIntegerShares = (total: number, weights: number[]): number[] => {
  if (total <= 0) return weights.map(() => 0);

  const safeWeights = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const weightSum = safeWeights.reduce((acc, w) => acc + w, 0);
  if (weightSum <= 0) {
    const base = Math.floor(total / safeWeights.length);
    let remainder = total - base * safeWeights.length;
    return safeWeights.map(() => {
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      return base + extra;
    });
  }

  const exact = safeWeights.map((w) => (total * w) / weightSum);
  const floors = exact.map((n) => Math.floor(n));
  let remainder = total - floors.reduce((acc, n) => acc + n, 0);

  const order = exact
    .map((n, idx) => ({ idx, frac: n - floors[idx] }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let i = 0; i < order.length && remainder > 0; i += 1) {
    out[order[i].idx] += 1;
    remainder -= 1;
  }

  return out;
};

const splitPeriodMetric = (params: {
  tab: TabKey;
  totalMw: number;
  requestCount: number;
  itemBreakdown?: Partial<Record<ResponseTypeKey, BreakdownValue>>;
  globalBreakdown: Partial<Record<ResponseTypeKey, BreakdownValue>>;
}): {
  negative: number;
  limitedPositive: number;
  partialPositive: number;
  positive: number;
  total: number;
} => {
  const mode = params.tab === "1" ? "mw" : "count";
  const total = params.tab === "1" ? params.totalMw : params.requestCount;

  const sharesSource = params.itemBreakdown ?? params.globalBreakdown;
  const shares = computeShares(sharesSource, mode);

  if (params.tab === "1") {
    const negative = params.totalMw * (shares[0] ?? 0);
    const limitedPositive = params.totalMw * (shares[1] ?? 0);
    const partialPositive = params.totalMw * (shares[2] ?? 0);
    const positive = params.totalMw * (shares[3] ?? 0);
    return { negative, limitedPositive, partialPositive, positive, total };
  }

  const allocated = allocateIntegerShares(params.requestCount, shares);
  return {
    negative: allocated[0] ?? 0,
    limitedPositive: allocated[1] ?? 0,
    partialPositive: allocated[2] ?? 0,
    positive: allocated[3] ?? 0,
    total,
  };
};

// Custom Tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
  tab,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  label?: string;
  tab: TabKey;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
        סה״כ {point.total.toLocaleString()}
      </div>

      {series.map((s) => {
        const val = point[s.key as keyof ChartDataPoint] as number;
        return (
          <div key={s.key} className="flex items-center gap-3 mb-1">
            <span
              style={{ background: s.color }}
              className="w-2 h-2 rounded-full block"
            />
            <div className="flex flex-col text-sm text-gray-600">
              <span>{s.label}</span>
              <span className="font-medium flex items-center gap-1">
                {tab === "1" && <span>MW</span>}
                {val.toLocaleString()}
              </span>
            </div>
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
  activeSeries: Record<string, boolean>;
  setActiveSeries: (seriesState: Record<string, boolean>) => void;
  hoveredSeries: string | null;
  setHoveredSeries: (seriesKey: string | null) => void;
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
    <div className="flex justify-start gap-6 mt-6">
      {series.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => toggleSeries(s.key)}
          onMouseEnter={() => setHoveredSeries(s.key)}
          onMouseLeave={() => setHoveredSeries(null)}
          className="flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200 bg-transparent border-0 p-0"
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

export default function RequestOne() {
  const [tab, setTab] = useState<TabKey>("1");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>({
    negative: true,
    limitedPositive: true,
    partialPositive: true,
    positive: true,
  });

  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  // Build filters
  // API supports only a single year filter. For multi-select, we fetch all years and filter client-side.
  const filters: ResponseCapacityByPeriodFilters = useMemo(() => ({}), []);

  // Fetch data from API
  const {
    data: apiData,
    isLoading,
    error,
  } = useResponseCapacityByPeriod(filters);

  const availableYearOptions = useMemo(() => {
    if (!apiData?.series) return [];
    const years = apiData.series
      .map((item) => item.period.split("-")[0])
      .filter(Boolean);
    return Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a));
  }, [apiData]);

  console.log(apiData);

  const singleSelectedYear =
    selectedYears.length === 1 ? Number(selectedYears[0]) : undefined;

  // Transform API data for chart
  const chartData = useMemo(() => {
    if (!apiData?.series) return [];

    // If exactly one year is selected, show monthly data for that year
    if (singleSelectedYear) {
      const yearString = String(singleSelectedYear);
      return apiData.series
        .filter(
          (item) =>
            item.period.startsWith(`${yearString}-`) ||
            item.period === yearString,
        )
        .map((item) => {
          const split = splitPeriodMetric({
            tab,
            totalMw: item.total_mw,
            requestCount: item.request_count,
            itemBreakdown: item.response_type_breakdown,
            globalBreakdown: apiData.response_type_breakdown,
          });

          // Extract month from period (e.g., "2024-05" -> "05")
          const month = item.period.split("-")[1] || item.period;

          return {
            period: month,
            totalMw: item.total_mw,
            requestCount: item.request_count,
            total: split.total,
            negative: split.negative,
            limitedPositive: split.limitedPositive,
            partialPositive: split.partialPositive,
            positive: split.positive,
          };
        });
    }

    const selectedYearSet =
      selectedYears.length > 0 ? new Set(selectedYears) : null;

    // Otherwise, aggregate by year (and filter to selected years when provided)
    const yearMap = new Map<
      string,
      {
        totalMw: number;
        requestCount: number;
        breakdowns: Partial<Record<ResponseTypeKey, BreakdownValue>>[];
      }
    >();

    apiData.series.forEach((item) => {
      const year = item.period.split("-")[0];
      if (selectedYearSet && !selectedYearSet.has(year)) return;
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          totalMw: 0,
          requestCount: 0,
          breakdowns: [],
        });
      }
      const entry = yearMap.get(year)!;
      entry.totalMw += item.total_mw;
      entry.requestCount += item.request_count;
      if (item.response_type_breakdown) {
        entry.breakdowns.push(item.response_type_breakdown);
      }
    });

    // Convert to array and sort by year
    return Array.from(yearMap.entries())
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([year, data]) => {
        const split = splitPeriodMetric({
          tab,
          totalMw: data.totalMw,
          requestCount: data.requestCount,
          itemBreakdown: undefined,
          globalBreakdown: apiData.response_type_breakdown,
        });

        return {
          period: year,
          totalMw: data.totalMw,
          requestCount: data.requestCount,
          total: split.total,
          negative: split.negative,
          limitedPositive: split.limitedPositive,
          partialPositive: split.partialPositive,
          positive: split.positive,
        };
      });
  }, [apiData, tab, selectedYears, singleSelectedYear]);

  const opacityForKey = (key: string) => {
    if (hoveredSeries) {
      return hoveredSeries === key ? 1 : 0.3;
    }
    return activeSeries[key] ? 1 : 0.3;
  };

  const yAxisLabel = tab === "1" ? "הספק תשובות [MW]" : "מספר מתקנים";

  // Wider bars when showing yearly data (fewer bars)
  const barSize = singleSelectedYear ? 36 : 80;

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportResponseCapacityByPeriod(filters);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderChartBody = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          שגיאה בטעינת הנתונים
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          אין נתונים להצגה
        </div>
      );
    }

    return (
      <StackedComposedChart
        data={chartData}
        xAxisDataKey="period"
        yAxisLabel={yAxisLabel}
        tooltipContent={<CustomTooltip tab={tab} />}
        sizeBrackets={SIZE_BRACKETS}
        activeSeries={activeSeries}
        barSize={barSize}
        opacityForKey={opacityForKey}
      />
    );
  };

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            תשובות מחלק לבקשות חיבור מתקנים לרשת
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
                        <p>
                          בקשות שבוטלו לא מופיעות בנתונים. הנתונים מתעדכנים מעת לעת.
                        </p>
                        <p>
                          צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. תשובות מחלק לבקשות חיבור מתקנים לרשת.
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
            <span className="text-sm text-slate-600 mt-6">מיון לפי:</span>
            <div className="relative w-[113px]">
              <label htmlFor="" className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">שנה:</span>
                <YearMultiSelectDropdown
                  selectedYears={selectedYears}
                  onChange={setSelectedYears}
                  options={availableYearOptions}
                  isOpen={isYearDropdownOpen}
                  setIsOpen={setIsYearDropdownOpen}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-start md:gap-4 gap-2">
          <Link href="/api#response-capacity-by-period">
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

      {/* Tab content */}
      <div className="w-full h-[420px]">{renderChartBody()}</div>

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
          onClick={() => setTab("1")}
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${tab === "1"
            ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
            : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
            }`}
        >
          הספק מתקנים
        </button>
        <button
          onClick={() => setTab("2")}
          className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${tab === "2"
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
