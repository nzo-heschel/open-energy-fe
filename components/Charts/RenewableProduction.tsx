"use client";

import {
  exportRenewablesProductionMix,
  useRenewablesProductionMix,
} from "@/lib/api";
import api from "@/public/images/API.png";
import download from "@/public/images/download_2.png";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import TooltipInfo from "../TooltipInfo";
import StackedComposedChart from "./StackedComposedChart";

type DataPoint = {
  period: string;
  label?: string;
  total: number;
  visibleTotalMW: number;
  other: number;
  solar: number;
  wind: number;
  otherMW: number;
  solarMW: number;
  windMW: number;
};

const sumVisibleMW = (
  point: Pick<DataPoint, "otherMW" | "solarMW" | "windMW">,
  hiddenKeys: Set<string>,
) => {
  let total = 0;
  if (!hiddenKeys.has("other")) total += point.otherMW || 0;
  if (!hiddenKeys.has("solar")) total += point.solarMW || 0;
  if (!hiddenKeys.has("wind")) total += point.windMW || 0;
  return total;
};

const series = [
  { key: "other", label: "אחר", color: "#2F6497" },
  { key: "solar", label: "סולארי", color: "#F1C40F" },
  { key: "wind", label: "רוח", color: "#7BC94A" },
];

/** Bar `dataKey`s (MW); legend hover uses `series[].key`. */
const MW_STACK_KEYS = [
  { key: "otherMW", color: series[0].color },
  { key: "solarMW", color: series[1].color },
  { key: "windMW", color: series[2].color },
] as const;

const MONTH_OPTIONS = [
  { value: "1", label: "ינואר" },
  { value: "2", label: "פברואר" },
  { value: "3", label: "מרץ" },
  { value: "4", label: "אפריל" },
  { value: "5", label: "מאי" },
  { value: "6", label: "יוני" },
  { value: "7", label: "יולי" },
  { value: "8", label: "אוגוסט" },
  { value: "9", label: "ספטמבר" },
  { value: "10", label: "אוקטובר" },
  { value: "11", label: "נובמבר" },
  { value: "12", label: "דצמבר" },
] as const;

const FIRST_DATA_YEAR = 2021;

const FilterDropdown = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayText =
    options.find((option) => option.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6 text-right flex items-center justify-between"
        style={{ fontFamily: "Heebo, sans-serif" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayText}</span>
        <ChevronDown
          size={14}
          className={`transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border border-[#A1A1A1] rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{ fontFamily: "Heebo, sans-serif" }}
        >
          <div className="p-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full text-right p-2 text-sm hover:bg-gray-100 rounded ${value === option.value ? "bg-blue-50 text-blue-600" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const monthsInRange = (
  start: number,
  end: number,
  optionValues: string[],
) => {
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  return optionValues.filter((value) => {
    const month = Number(value);
    return month >= lo && month <= hi;
  });
};

const MonthMultiSelectDropdown = ({
  selectedMonths,
  onChange,
  options,
  isOpen,
  setIsOpen,
}: {
  selectedMonths: string[];
  onChange: (months: string[]) => void;
  options: { value: string; label: string }[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const optionValues = options.map((o) => o.value);
  const allSelected =
    selectedMonths.length === 0 ||
    selectedMonths.length === optionValues.length;

  const currentMonths =
    selectedMonths.length === 0 ? optionValues : selectedMonths;

  const toggleMonth = (month: string) => {
    const clicked = Number(month);
    const currentNums = currentMonths.map(Number);
    const minMonth = Math.min(...currentNums);
    const maxMonth = Math.max(...currentNums);
    const inRange = clicked >= minMonth && clicked <= maxMonth;

    if (!inRange) {
      const lo = Math.min(minMonth, clicked);
      const hi = Math.max(maxMonth, clicked);
      onChange(monthsInRange(lo, hi, optionValues));
      return;
    }

    if (minMonth === maxMonth) {
      onChange([month]);
      return;
    }

    if (clicked === minMonth) {
      onChange(monthsInRange(minMonth + 1, maxMonth, optionValues));
      return;
    }

    if (clicked === maxMonth) {
      onChange(monthsInRange(minMonth, maxMonth - 1, optionValues));
      return;
    }

    onChange([month]);
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([optionValues[optionValues.length - 1]]);
      return;
    }
    onChange([]);
  };

  const displayText = allSelected
    ? "כל החודשים"
    : selectedMonths.length === 1
      ? (options.find((o) => o.value === selectedMonths[0])?.label ?? "חודש")
      : `${selectedMonths.length} חודשים`;

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6 text-right flex items-center justify-between min-w-[140px]"
        style={{ fontFamily: "Heebo, sans-serif" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayText}</span>
        <ChevronDown
          size={14}
          className={`transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full min-w-[179px] max-h-[258px] bg-[#FAFAFC] border border-[#A1A1A1] rounded-2xl shadow-[0px_3px_30px_rgba(153,191,65,0.16)] p-[15px_10px]"
          style={{ fontFamily: "Heebo, sans-serif" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-[10px]">
            {/* <div className="w-1 h-10 bg-[#C3C3C3] rounded-[100px] mt-1" /> */}
            <div className="flex flex-col gap-[10px] flex-1 max-h-[228px] overflow-y-auto pr-1">
              <label className="w-full flex flex-row-reverse justify-end items-center gap-[10px] text-right text-base font-medium text-[#59687D] cursor-pointer">
                <span>הכל</span>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
              {options.map((option) => {
                const checked =
                  allSelected || currentMonths.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="w-full flex flex-row-reverse justify-end items-center gap-[10px] text-right text-base font-medium text-[#59687D] cursor-pointer"
                  >
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMonth(option.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const padMonth = (month: string) => month.padStart(2, "0");

const toPeriodKey = (year: string, month: string) =>
  `${year}-${padMonth(month)}`;

type SeriesItem = {
  period: string;
  label?: string;
  solar_mwh: number;
  wind_mwh: number;
  other_mwh: number;
  total_mwh: number;
};

const monthFromPeriod = (period: string) => {
  const match = /^(\d{4})-(\d{2})/.exec(period);
  return match ? `${match[1]}-${match[2]}` : null;
};

const buildDataPoint = (
  period: string,
  label: string,
  solar_mwh: number,
  wind_mwh: number,
  other_mwh: number,
): DataPoint => {
  const totalMW = solar_mwh + wind_mwh + other_mwh;
  const solarPercent = totalMW > 0 ? (solar_mwh / totalMW) * 100 : 0;
  const windPercent = totalMW > 0 ? (wind_mwh / totalMW) * 100 : 0;
  const otherPercent = totalMW > 0 ? (other_mwh / totalMW) * 100 : 0;

  return {
    period,
    label,
    total: Math.round(totalMW),
    visibleTotalMW: Math.round(totalMW),
    solar: Math.round(solarPercent),
    wind: Math.round(windPercent),
    other: Math.round(otherPercent),
    solarMW: solar_mwh,
    windMW: wind_mwh,
    otherMW: other_mwh,
  };
};

const aggregateSeriesByMonth = (
  items: SeriesItem[],
  allowedPeriods: Set<string>,
  monthLabels: string[],
): DataPoint[] => {
  const buckets = new Map<
    string,
    { solar: number; wind: number; other: number }
  >();

  for (const item of items) {
    const monthKey = monthFromPeriod(item.period);
    if (!monthKey || !allowedPeriods.has(monthKey)) continue;

    const bucket = buckets.get(monthKey) ?? { solar: 0, wind: 0, other: 0 };
    bucket.solar += item.solar_mwh || 0;
    bucket.wind += item.wind_mwh || 0;
    bucket.other += item.other_mwh || 0;
    buckets.set(monthKey, bucket);
  }

  return Array.from(allowedPeriods)
    .sort()
    .filter((key) => buckets.has(key))
    .map((monthKey) => {
      const bucket = buckets.get(monthKey)!;
      const monthIdx = parseInt(monthKey.split("-")[1], 10) - 1;
      const label = monthLabels[monthIdx] ?? monthKey;
      return buildDataPoint(
        monthKey,
        label,
        bucket.solar,
        bucket.wind,
        bucket.other,
      );
    });
};

// Custom tooltip for the chart
const CustomTooltip = ({
  active,
  payload,
  label,
  hiddenKeys = new Set<string>(),
}: {
  active?: boolean;
  payload?: Array<{ payload?: DataPoint }>;
  label?: string;
  hiddenKeys?: Set<string>;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const payloadPoint = payload[0]?.payload;
  if (!payloadPoint) return null;

  const visibleSeries = series.filter((s) => !hiddenKeys.has(s.key));
  const totalMW = sumVisibleMW(payloadPoint, hiddenKeys);

  return (
    <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[140px] text-sm">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
        {`${totalMW.toLocaleString()} MWh`}
      </div>

      {[...visibleSeries].reverse().map((s) => {
        const mwKey = `${s.key}MW` as keyof DataPoint;
        const value = payloadPoint[mwKey] as number;
        return (
          <div key={s.key} className="flex items-center gap-3 mb-1">
            <span
              style={{ background: s.color }}
              className="w-2 h-2 rounded-full block"
            />
            <div className="flex-1">
              <div className="text-xs text-gray-600">{s.label}</div>
              <div className="text-sm font-medium">
                {value ? `${value.toLocaleString()} MWh` : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Legend on the right — same interaction model as `InstalledCapacityTwo` (hover highlight + click to hide). */
const CustomRightLegend = ({
  hoveredKey,
  onMouseEnter,
  onMouseLeave,
  onClick,
  hiddenKeys,
}: {
  hoveredKey: string | null;
  onMouseEnter: (legendKey: string) => void;
  onMouseLeave: () => void;
  onClick: (legendKey: string) => void;
  hiddenKeys: Set<string>;
}) => {
  return (
    <div
      className="flex gap-4 items-start p-4 flex-row"
      style={{ fontFamily: "Heebo, sans-serif" }}
    >
      {[...series].reverse().map((s) => {
        const isHidden = hiddenKeys.has(s.key);
        const isHovered = hoveredKey === s.key;
        const isFaded = Boolean(hoveredKey) && !isHovered;

        return (
          <button
            key={s.key}
            type="button"
            className={`flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200 ${isHidden ? "opacity-40" : ""} ${isFaded ? "opacity-30" : ""}`}
            onMouseEnter={() => onMouseEnter(s.key)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(s.key)}
          >
            <span
              style={{
                background: s.color,
                opacity: isHidden ? 0.3 : 1,
              }}
              className="w-2 h-2 rounded-full block transition-opacity duration-200"
            />
            <span
              className={`transition-all duration-200 ${isHidden ? "text-gray-400" : "text-gray-800"}`}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default function RenewableProduction() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() =>
    monthsInRange(
      1,
      currentMonth,
      MONTH_OPTIONS.map((m) => m.value),
    ),
  );
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => {
    return format(startOfMonth(new Date()), "yyyy-MM-dd");
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return format(endOfMonth(new Date()), "yyyy-MM-dd");
  });
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const availableMonths = useMemo(() => {
    const yearNum = Number(selectedYear);
    const maxMonth = yearNum === currentYear ? currentMonth : 12;
    return MONTH_OPTIONS.filter((m) => Number(m.value) <= maxMonth);
  }, [selectedYear, currentYear, currentMonth]);

  const effectiveMonths = useMemo(() => {
    if (selectedMonths.length === 0) {
      return availableMonths.map((m) => m.value);
    }
    return selectedMonths.filter((m) =>
      availableMonths.some((opt) => opt.value === m),
    );
  }, [selectedMonths, availableMonths]);

  const allowedPeriodKeys = useMemo(
    () =>
      new Set(
        effectiveMonths.map((month) => toPeriodKey(selectedYear, month)),
      ),
    [effectiveMonths, selectedYear],
  );

  const isSingleMonthView = effectiveMonths.length === 1;

  useEffect(() => {
    setSelectedMonths((prev) => {
      const optionValues = availableMonths.map((m) => m.value);
      const valid = prev.filter((m) => optionValues.some((v) => v === m));
      if (valid.length === 0) {
        const fallback = optionValues[optionValues.length - 1];
        return fallback ? [fallback] : prev;
      }
      const nums = valid.map(Number);
      return monthsInRange(Math.min(...nums), Math.max(...nums), optionValues);
    });
  }, [selectedYear, availableMonths]);

  useEffect(() => {
    if (effectiveMonths.length === 0) return;

    const sorted = [...effectiveMonths].sort((a, b) => Number(a) - Number(b));
    const firstMonth = Number(sorted[0]);
    const lastMonth = Number(sorted[sorted.length - 1]);
    const rangeStart = new Date(Number(selectedYear), firstMonth - 1, 1);
    const rangeEnd = endOfMonth(
      new Date(Number(selectedYear), lastMonth - 1, 1),
    );
    setStartDate(format(rangeStart, "yyyy-MM-dd"));
    setEndDate(format(rangeEnd, "yyyy-MM-dd"));
  }, [selectedYear, effectiveMonths]);

  const {
    data: apiData,
    isLoading,
    error,
  } = useRenewablesProductionMix(startDate, endDate);

  const availableYears = useMemo(() => {
    const years: { value: string; label: string }[] = [];
    for (let year = currentYear; year >= FIRST_DATA_YEAR; year -= 1) {
      years.push({ value: String(year), label: String(year) });
    }
    return years;
  }, [currentYear]);

  const handleExport = async () => {
    try {
      await exportRenewablesProductionMix(startDate, endDate);
    } catch (error) {
      console.error("Failed to export renewables production mix data:", error);
    }
  };

  // Transform API data to chart format
  const chartData = useMemo<DataPoint[]>(() => {
    if (!apiData?.series) {
      return [];
    }

    const allowedPeriods = allowedPeriodKeys;
    const monthPrefix =
      isSingleMonthView && effectiveMonths[0]
        ? toPeriodKey(selectedYear, effectiveMonths[0])
        : null;

    const sourceSeries =
      apiData.filter === "year" &&
        apiData.monthly_series &&
        apiData.monthly_series.length > 0 &&
        !isSingleMonthView
        ? apiData.monthly_series
        : apiData.series;

    const monthLabels = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ];

    const formatLabel = (period: string, fallback?: string) => {
      const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
      if (monthMatch) {
        const monthIdx = parseInt(monthMatch[2], 10) - 1;
        const year = monthMatch[1];
        const monthName = monthLabels[monthIdx] ?? monthMatch[2];
        return monthName;
      }
      return fallback || period;
    };

    const filteredSeries = sourceSeries.filter((item) => {
      const monthKey = monthFromPeriod(item.period);
      if (monthKey && allowedPeriods.has(monthKey)) return true;
      if (monthPrefix && item.period.startsWith(monthPrefix)) return true;
      return false;
    });

    if (!isSingleMonthView) {
      const monthlyItems = filteredSeries.filter((item) =>
        /^(\d{4})-(\d{2})$/.test(item.period),
      );
      if (monthlyItems.length > 0) {
        return monthlyItems.map((item) =>
          buildDataPoint(
            item.period,
            formatLabel(item.period, item.label),
            item.solar_mwh || 0,
            item.wind_mwh || 0,
            item.other_mwh || 0,
          ),
        );
      }
      return aggregateSeriesByMonth(
        filteredSeries as SeriesItem[],
        allowedPeriods,
        monthLabels,
      );
    }

    return filteredSeries.map((item) => {
      const solar_mwh = item.solar_mwh || 0;
      const wind_mwh = item.wind_mwh || 0;
      const other_mwh = item.other_mwh || 0;
      return buildDataPoint(
        item.period,
        formatLabel(item.period, item.label),
        solar_mwh,
        wind_mwh,
        other_mwh,
      );
    });
  }, [apiData, allowedPeriodKeys, isSingleMonthView, selectedYear, effectiveMonths]);

  const chartDisplayData = useMemo(
    () =>
      chartData.map((point) => ({
        ...point,
        visibleTotalMW: Math.round(sumVisibleMW(point, hiddenKeys)),
      })),
    [chartData, hiddenKeys],
  );

  const barKeyToLegendKey = (barKey: string) => {
    if (barKey === "otherMW") return "other";
    if (barKey === "solarMW") return "solar";
    if (barKey === "windMW") return "wind";
    return barKey;
  };

  const opacityForKey = (barKey: string) => {
    const legendKey = barKeyToLegendKey(barKey);
    if (hiddenKeys.has(legendKey)) return 0;
    if (hoveredKey && hoveredKey !== legendKey) return 0.3;
    return 1;
  };

  const stackedActiveSeries = useMemo(
    () =>
      Object.fromEntries(
        MW_STACK_KEYS.map((b) => [
          b.key,
          !hiddenKeys.has(barKeyToLegendKey(b.key)),
        ]),
      ) as Record<string, boolean>,
    [hiddenKeys],
  );

  const handleLegendMouseEnter = (legendKey: string) => {
    setHoveredKey(legendKey);
  };

  const handleLegendMouseLeave = () => {
    setHoveredKey(null);
  };

  const handleLegendClick = (legendKey: string) => {
    const next = new Set(hiddenKeys);
    if (next.has(legendKey)) {
      next.delete(legendKey);
    } else {
      next.add(legendKey);
    }
    setHiddenKeys(next);
  };

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
      <div className="flex flex-col md:flex-row items-start justify-between">
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            תמהיל ייצור אנרגיה מתחדשת
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

              {/* Tooltip that appears on hover */}
              {showTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                  <TooltipInfo
                    content={
                      <>
                        <p>
                          הנתונים נלקחים מאתר חברת ניהול מערכת החשמל – נוגה.{" "}
                          <a
                            href="https://www.noga-iso.co.il/systemoperationunit/piechartspage/"
                            target="_blank"
                            rel="noopener noreferrer"
                            dir="ltr"
                            className="whitespace-nowrap"
                          >
                            https://www.noga-iso.co.il/systemoperationunit/piechartspage/
                          </a>
                        </p>
                        <p>הנתונים מתעדכנים מעת לעת.</p>
                        <p>
                          צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. תמהיל ייצור אנרגיה מתחדשת.
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
            <div className="relative w-[120px]">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">שנה</span>
                <FilterDropdown
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={availableYears}
                  placeholder="שנה"
                />
              </label>
            </div>
            <div className="relative w-[160px]">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">חודש</span>
                <MonthMultiSelectDropdown
                  selectedMonths={selectedMonths}
                  onChange={setSelectedMonths}
                  options={availableMonths}
                  isOpen={isMonthDropdownOpen}
                  setIsOpen={setIsMonthDropdownOpen}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-start md:gap-4 gap-2">
          <a
            href="/api#renewables-production-mix"
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

      <div className="md:flex gap-4 items-start">
        {/* chart area */}
        <div className="flex-1 md:h-[420px] h-[320px] min-w-0">
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
          ) : (
            <StackedComposedChart
              data={chartDisplayData}
              xAxisDataKey="label"
              yAxisLabel="[MWh]"
              tooltipContent={<CustomTooltip hiddenKeys={hiddenKeys} />}
              sizeBrackets={[...MW_STACK_KEYS]}
              activeSeries={stackedActiveSeries}
              barSize={28}
              opacityForKey={opacityForKey}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              lastBarRadius={[4, 4, 0, 0]}
              labelListDataKey="visibleTotalMW"
              labelListFormatter={(value) => value.toLocaleString()}
              labelListStyle={{ fontWeight: 500 }}
            />
          )}
        </div>
      </div>
      {!isLoading && !error && chartData.length > 0 && (
        <div className="w-40 flex-shrink-0">
          <CustomRightLegend
            hoveredKey={hoveredKey}
            onMouseEnter={handleLegendMouseEnter}
            onMouseLeave={handleLegendMouseLeave}
            onClick={handleLegendClick}
            hiddenKeys={hiddenKeys}
          />
        </div>
      )}
    </div>
  );
}
