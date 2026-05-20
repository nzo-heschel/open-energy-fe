"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import download from "@/public/images/download_2.png";
import api from "@/public/images/API.png";
import TooltipInfo from "../TooltipInfo";
import StackedComposedChart from "./StackedComposedChart";
import { ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useInstalledCapacityByFacilitySize,
  exportInstalledCapacityByFacilitySize,
  InstalledCapacityByFacilitySizeFilters,
} from "@/lib/api";
import { accumulateFourSegments } from "@/lib/chartSizeBracketMapping";

// Size bracket configuration with colors and Hebrew labels (matching Figma)
// Order: bottom to top in stack (first item is at bottom)
const SIZE_BRACKETS = [
  { key: "xlarge", label: "גדול מאוד | +5001 KW", color: "#648AA3" },
  { key: "large", label: "גדול | 631-5000 KW", color: "#60A261" },
  { key: "medium", label: "בינוני | 201-630 KW", color: "#C4C95C" },
  { key: "small", label: "קטן | 0-200 KW", color: "#D8EB4D" },
];

const sumVisibleTotal = (
  point: Record<string, number>,
  hiddenKeys: Set<string>,
) => {
  let total = 0;
  for (const b of SIZE_BRACKETS) {
    if (!hiddenKeys.has(b.key)) total += point[b.key] || 0;
  }
  return Math.round(total);
};

// Display mode options (הספק/מספר מתקנים)
const displayModeOptions = [
  { value: "capacity", label: "הספק מותקן" },
  { value: "count", label: "מספר מתקנים" },
];

function pickBracketStat(bracket: unknown, mode: "capacity" | "count"): number {
  if (bracket == null) return 0;
  if (typeof bracket === "number") {
    return mode === "capacity" && Number.isFinite(bracket) ? bracket : 0;
  }
  if (typeof bracket === "object") {
    const o = bracket as Record<string, unknown>;
    if (mode === "count") {
      const c = o.count ?? o.facility_count;
      const n = Number(c);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(o.total_mw);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

// Filter Dropdown Component
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
    options.find((opt) => opt.value === value)?.label || placeholder;

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

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
    if (selectedYears.includes(year)) {
      onChange(selectedYears.filter((y) => y !== year));
      return;
    }
    onChange([...selectedYears, year]);
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
      return;
    }
    onChange([...options]);
  };

  return (
    <div className="relative" ref={containerRef}>
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
            <div className="flex flex-col  gap-[10px] flex-1 h-[228px] overflow-y-auto pr-1">
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

// Custom Tooltip Component - matching InstalledCapacityOne style
const CustomTooltip = ({
  active,
  payload,
  label,
  displayMode,
  hiddenKeys = new Set<string>(),
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: string;
  displayMode?: string;
  hiddenKeys?: Set<string>;
}) => {
  if (!active || !payload || !payload.length) return null;

  const visiblePayload = payload.filter(
    (entry) => entry.dataKey && !hiddenKeys.has(String(entry.dataKey)),
  );
  const total = visiblePayload.reduce(
    (sum, entry) => sum + (Number(entry.value) || 0),
    0,
  );
  const unit = displayMode === "count" ? "מתקנים" : "MW";

  return (
    <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
        סה״כ {Math.round(total).toLocaleString()} {unit}
      </div>
      {SIZE_BRACKETS.filter((bracket) => !hiddenKeys.has(bracket.key)).map(
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
                  {val.toLocaleString()} {unit}
                </span>
              </span>
            </div>
          );
        },
      )}
    </div>
  );
};

// Custom Legend Component
const CustomLegend = ({
  hoveredKey,
  onMouseEnter,
  onMouseLeave,
  onClick,
  hiddenKeys,
}: {
  hoveredKey: string | null;
  onMouseEnter: (dataKey: string) => void;
  onMouseLeave: () => void;
  onClick: (dataKey: string) => void;
  hiddenKeys: Set<string>;
}) => {
  return (
    <div
      className="flex flex-row-reverse flex-wrap justify-end gap-4 mt-4"
      style={{ fontFamily: "Heebo, sans-serif" }}
    >
      {SIZE_BRACKETS.map((bracket) => {
        const isHidden = hiddenKeys.has(bracket.key);
        const isHovered = hoveredKey === bracket.key;
        const isFaded = hoveredKey && !isHovered;

        return (
          <button
            key={bracket.key}
            type="button"
            className={`flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200 ${isHidden ? "opacity-40" : ""} ${isFaded ? "opacity-30" : ""}`}
            onMouseEnter={() => onMouseEnter(bracket.key)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(bracket.key)}
          >
            <span
              style={{
                background: bracket.color,
                opacity: isHidden ? 0.3 : 1,
              }}
              className="w-2 h-2 rounded-full block transition-opacity duration-200"
            />
            <span
              className={`transition-all duration-200 ${isHidden ? "text-gray-400" : "text-gray-800"}`}
            >
              {bracket.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const InstalledCapacityTwo: React.FC = () => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<string>("capacity");
  const [isExporting, setIsExporting] = useState(false);

  // Build filters
  const filters: InstalledCapacityByFacilitySizeFilters = useMemo(
    () => ({
      year: undefined,
    }),
    [],
  );

  // Fetch data from API
  const {
    data: apiData,
    isLoading,
    error,
  } = useInstalledCapacityByFacilitySize(filters);

  // Transform API data: map each `size_brackets` key by normalized label → segment (never index into sorted definitions).
  const chartData = useMemo(() => {
    if (!apiData?.series) return [];

    const mode = displayMode === "count" ? "count" : "capacity";

    const mappedData = apiData.series.map((item) => {
      const brackets = item.size_brackets || {};
      const { small, medium, large, xlarge } = accumulateFourSegments(
        brackets as Record<string, unknown>,
        (raw) => pickBracketStat(raw, mode),
      );

      const total = small + medium + large + xlarge;

      return {
        year: item.year,
        small: isNaN(small) ? 0 : small,
        medium: isNaN(medium) ? 0 : medium,
        large: isNaN(large) ? 0 : large,
        xlarge: isNaN(xlarge) ? 0 : xlarge,
        total: isNaN(total) ? 0 : total,
      };
    });

    if (selectedYears.length === 0) {
      return mappedData;
    }

    const selectedYearSet = new Set(selectedYears.map((year) => Number(year)));
    return mappedData.filter((item) => selectedYearSet.has(item.year));
  }, [apiData, displayMode, selectedYears]);

  const chartDisplayData = useMemo(
    () =>
      chartData.map((point) => ({
        ...point,
        visibleTotal: sumVisibleTotal(point, hiddenKeys),
      })),
    [chartData, hiddenKeys],
  );

  const availableYearOptions = useMemo(() => {
    if (!apiData?.series) return [];
    const uniqueYears = Array.from(
      new Set(apiData.series.map((item) => String(item.year))),
    );
    return uniqueYears.sort((a, b) => Number(b) - Number(a));
  }, [apiData]);

  const handleLegendMouseEnter = (dataKey: string) => {
    setHoveredKey(dataKey);
  };

  const handleLegendMouseLeave = () => {
    setHoveredKey(null);
  };

  const handleLegendClick = (dataKey: string) => {
    const newHiddenKeys = new Set(hiddenKeys);
    if (newHiddenKeys.has(dataKey)) {
      newHiddenKeys.delete(dataKey);
    } else {
      newHiddenKeys.add(dataKey);
    }
    setHiddenKeys(newHiddenKeys);
  };

  const getBarOpacity = (dataKey: string) => {
    if (hiddenKeys.has(dataKey)) return 0;
    if (hoveredKey && hoveredKey !== dataKey) return 0.3;
    return 1;
  };

  const stackedActiveSeries = useMemo(
    () =>
      Object.fromEntries(
        SIZE_BRACKETS.map((b) => [b.key, !hiddenKeys.has(b.key)]),
      ) as Record<string, boolean>,
    [hiddenKeys],
  );

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportInstalledCapacityByFacilitySize(filters);
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
            מתקני ייצור אנרגיה מתחדשת מחוברים לרשת לפי גודל
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
                          צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. מתקני ייצור אנרגיה מתחדשת מחוברים לרשת לפי גודל.
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

            <div className="relative w-[150px]">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">שנה</span>
                <YearMultiSelectDropdown
                  selectedYears={selectedYears}
                  onChange={setSelectedYears}
                  options={availableYearOptions}
                  isOpen={isYearDropdownOpen}
                  setIsOpen={setIsYearDropdownOpen}
                />
              </label>
            </div>
            <div className="relative w-[180px]">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">הספק/מספר מתקנים</span>
                <FilterDropdown
                  value={displayMode}
                  onChange={setDisplayMode}
                  options={displayModeOptions}
                  placeholder="הספק מותקן"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-start md:gap-4 gap-2">
          <Link href="/api#installed-capacity-by-facility-size">
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
            xAxisDataKey="year"
            yAxisLabel={
              displayMode === "count" ? "מספר מתקנים" : "הספק מותקן [MW]"
            }
            tooltipContent={
              <CustomTooltip
                displayMode={displayMode}
                hiddenKeys={hiddenKeys}
              />
            }
            sizeBrackets={SIZE_BRACKETS}
            activeSeries={stackedActiveSeries}
            barSize={28}
            opacityForKey={getBarOpacity}
            labelListDataKey="visibleTotal"
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          />
        )}
      </div>

      {/* Legend */}
      {!isLoading && !error && chartData.length > 0 && (
        <CustomLegend
          hoveredKey={hoveredKey}
          onMouseEnter={handleLegendMouseEnter}
          onMouseLeave={handleLegendMouseLeave}
          onClick={handleLegendClick}
          hiddenKeys={hiddenKeys}
        />
      )}
    </div>
  );
};

export default InstalledCapacityTwo;
