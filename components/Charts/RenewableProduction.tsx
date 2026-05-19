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
  other: number;
  solar: number;
  wind: number;
  otherMW: number;
  solarMW: number;
  windMW: number;
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

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const payloadPoint = payload[0]?.payload;
  const totalMW =
    (payloadPoint.windMW || 0) +
    (payloadPoint.solarMW || 0) +
    (payloadPoint.otherMW || 0);

  return (
    <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[140px] text-sm">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
        {totalMW
          ? `${totalMW.toLocaleString()} MWh`
          : `סה״כ ${payloadPoint.total}`}
      </div>

      {[...series].reverse().map((s) => {
        const mwKey = `${s.key}MW` as keyof typeof payloadPoint;
        return (
          <div key={s.key} className="flex items-center gap-3 mb-1">
            <span
              style={{ background: s.color }}
              className="w-2 h-2 rounded-full block"
            />
            <div className="flex-1">
              <div className="text-xs text-gray-600">{s.label}</div>
              <div className="text-sm font-medium">
                {payloadPoint[mwKey]
                  ? `${payloadPoint[mwKey].toLocaleString()} MWh`
                  : ""}
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
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(currentMonth),
  );
  const [startDate, setStartDate] = useState<string>(() => {
    return format(startOfMonth(new Date()), "yyyy-MM-dd");
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return format(endOfMonth(new Date()), "yyyy-MM-dd");
  });
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const {
    data: apiData,
    isLoading,
    error,
  } = useRenewablesProductionMix(startDate, endDate);

  useEffect(() => {
    const monthDate = new Date(
      Number(selectedYear),
      Number(selectedMonth) - 1,
      1,
    );
    setStartDate(format(startOfMonth(monthDate), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(monthDate), "yyyy-MM-dd"));
  }, [selectedYear, selectedMonth]);

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

    // For year filter (this year / last 12 months / multi-year ranges), use the
    // monthly_series breakdown so each month appears as its own bar.
    const sourceSeries =
      apiData.filter === "year" &&
        apiData.monthly_series &&
        apiData.monthly_series.length > 0
        ? apiData.monthly_series
        : apiData.series;

    const monthLabels = [
      "ינו׳",
      "פבר׳",
      "מרץ",
      "אפר׳",
      "מאי",
      "יוני",
      "יולי",
      "אוג׳",
      "ספט׳",
      "אוק׳",
      "נוב׳",
      "דצמ׳",
    ];

    const formatLabel = (period: string, fallback?: string) => {
      // YYYY-MM → localized short month (with year suffix when multi-year range)
      const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
      if (monthMatch) {
        const monthIdx = parseInt(monthMatch[2], 10) - 1;
        const year = monthMatch[1];
        const monthName = monthLabels[monthIdx] ?? monthMatch[2];
        const spansMultipleYears = (apiData.monthly_series ?? []).some(
          (m) => /^(\d{4})-/.exec(m.period)?.[1] !== year,
        );
        return spansMultipleYears
          ? `${monthName} ${year.slice(2)}'`
          : monthName;
      }
      return fallback || period;
    };

    return sourceSeries.map((item) => {
      const totalMW =
        item.total_mwh ??
        (item.solar_mwh || 0) + (item.wind_mwh || 0) + (item.other_mwh || 0);
      // Calculate percentage shares for stacked bar heights
      const solarPercent =
        totalMW > 0 ? ((item.solar_mwh || 0) / totalMW) * 100 : 0;
      const windPercent =
        totalMW > 0 ? ((item.wind_mwh || 0) / totalMW) * 100 : 0;
      const otherPercent =
        totalMW > 0 ? ((item.other_mwh || 0) / totalMW) * 100 : 0;

      return {
        period: item.period,
        label: formatLabel(item.period, item.label),
        total: Math.round(totalMW),
        solar: Math.round(solarPercent),
        wind: Math.round(windPercent),
        other: Math.round(otherPercent),
        solarMW: item.solar_mwh || 0,
        windMW: item.wind_mwh || 0,
        otherMW: item.other_mwh || 0,
      };
    });
  }, [apiData]);

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
                            className="whitespace-nowrap"
                          >
                            noga-iso.co.il
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
            <div className="relative w-[140px]">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">חודש</span>
                <FilterDropdown
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  options={[...MONTH_OPTIONS]}
                  placeholder="חודש"
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
              data={chartData}
              xAxisDataKey="label"
              yAxisLabel="[MW]"
              tooltipContent={<CustomTooltip />}
              sizeBrackets={[...MW_STACK_KEYS]}
              activeSeries={stackedActiveSeries}
              barSize={28}
              opacityForKey={opacityForKey}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              lastBarRadius={[4, 4, 0, 0]}
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
