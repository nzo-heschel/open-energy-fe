"use client";

import {
  exportInstalledCapacityCumulative,
  exportInstalledCapacityGrowth,
  InstalledCapacityFilters,
  useInstalledCapacityCumulative,
  useInstalledCapacityGrowth,
} from "@/lib/api";
import api from "@/public/images/API.png";
import download from "@/public/images/download_2.png";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import TooltipInfo from "../TooltipInfo";
import StackedComposedChart from "./StackedComposedChart";

// Energy categories (with Hebrew labels + colors) - REVERSED ORDER
const categories = [
  { key: "אחר", label: "אחר", color: "#2A6D94", apiKey: "Other" },
  {
    key: "תרמו",
    label: "תרמו סולארי",
    color: "#60A261",
    apiKey: "Solar Thermal",
  },
  {
    key: "פוטו",
    label: "פוטו וולטאי",
    color: "#C4C95C",
    apiKey: "Photovoltaic",
  },
  { key: "רוח", label: "רוח", color: "#98C74E", apiKey: "Wind" },
];

// District options
const districtOptions = [
  { value: "", label: "הכל" },
  { value: "Jerusalem", label: "ירושלים" },
  { value: "North", label: "צפון" },
  { value: "South", label: "דרום" },
  { value: "Haifa", label: "חיפה" },
  { value: "Center", label: "מרכז" },
  { value: "Tel Aviv", label: "תל אביב" },
  { value: "Judea & Samaria", label: "יהודה ושומרון" },
  { value: "Other", label: "אחר" },
];

// Technology options
const technologyOptions = [
  { value: "", label: "הכל" },
  { value: "Photovoltaic", label: "פוטו וולטאי" },
  { value: "Wind", label: "רוח" },
  { value: "Solar Thermal", label: "תרמו סולארי" },
  { value: "Other", label: "אחר" },
];

// Generic Dropdown Component
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

export default function InstalledCapacityOne() {
  const [tab, setTab] = useState(1);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTechnology, setSelectedTechnology] = useState<string>("");

  // Build filters
  const filters: InstalledCapacityFilters = useMemo(() => {
    const f: InstalledCapacityFilters = {};
    if (selectedDistrict) {
      f.district = selectedDistrict as InstalledCapacityFilters["district"];
    }
    if (selectedTechnology) {
      f.technology =
        selectedTechnology as InstalledCapacityFilters["technology"];
    }
    return f;
  }, [selectedDistrict, selectedTechnology]);

  // Tab 1: Cumulative data
  const {
    data: cumulativeData,
    isLoading: cumulativeLoading,
    error: cumulativeError,
  } = useInstalledCapacityCumulative(filters);

  // Tab 2: Growth data
  const {
    data: growthData,
    isLoading: growthLoading,
    error: growthError,
  } = useInstalledCapacityGrowth(filters);

  // Determine loading/error based on current tab
  const isLoading = tab === 1 ? cumulativeLoading : growthLoading;
  const error = tab === 1 ? cumulativeError : growthError;

  const handleExport = async () => {
    try {
      if (tab === 1) {
        await exportInstalledCapacityCumulative(filters);
      } else {
        await exportInstalledCapacityGrowth(filters);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  // Transform cumulative data for stacked bar chart
  const cumulativeChartData = useMemo(() => {
    if (!cumulativeData?.series) return [];

    // Group by year and aggregate technology breakdown
    const yearMap = new Map<string, any>();

    cumulativeData.series.forEach((item) => {
      const year = item.period.split("-")[0];
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year: parseInt(year),
          cumulative_mw: 0,
          added_mw: 0,
        });
      }
      const entry = yearMap.get(year);
      entry.cumulative_mw = Math.max(entry.cumulative_mw, item.cumulative_mw);
      entry.added_mw += item.added_mw;
    });

    // Get total breakdown values (these represent the final/max cumulative)
    const otherTotal = cumulativeData.technology_breakdown?.Other || 0;
    const solarThermalTotal =
      cumulativeData.technology_breakdown?.["Solar Thermal"] || 0;
    const photovoltaicTotal =
      cumulativeData.technology_breakdown?.Photovoltaic || 0;
    const windTotal = cumulativeData.technology_breakdown?.Wind || 0;
    const totalBreakdown =
      otherTotal + solarThermalTotal + photovoltaicTotal + windTotal;

    // Scale technology breakdown proportionally to each year's cumulative_mw
    const result = Array.from(yearMap.values()).map((item) => {
      const ratio =
        totalBreakdown > 0 ? item.cumulative_mw / totalBreakdown : 0;
      return {
        ...item,
        אחר: otherTotal * ratio,
        תרמו: solarThermalTotal * ratio,
        פוטו: photovoltaicTotal * ratio,
        רוח: windTotal * ratio,
      };
    });

    return result.sort((a, b) => a.year - b.year);
  }, [cumulativeData]);

  // Transform growth data for stacked bar chart (same style as cumulative)
  const growthChartData = useMemo(() => {
    if (!growthData?.series) return [];

    // Get technology breakdown proportions from growth data or cumulative data
    const otherTotal =
      growthData.technology_breakdown?.Other ||
      cumulativeData?.technology_breakdown?.Other ||
      0;
    const solarThermalTotal =
      growthData.technology_breakdown?.["Solar Thermal"] ||
      cumulativeData?.technology_breakdown?.["Solar Thermal"] ||
      0;
    const photovoltaicTotal =
      growthData.technology_breakdown?.Photovoltaic ||
      cumulativeData?.technology_breakdown?.Photovoltaic ||
      0;
    const windTotal =
      growthData.technology_breakdown?.Wind ||
      cumulativeData?.technology_breakdown?.Wind ||
      0;
    const totalBreakdown =
      otherTotal + solarThermalTotal + photovoltaicTotal + windTotal;

    return growthData.series.map((item) => {
      // Scale technology breakdown proportionally to each year's added_mw
      const ratio = totalBreakdown > 0 ? item.added_mw / totalBreakdown : 0;
      return {
        year: item.year,
        added_mw: item.added_mw,
        cumulative_mw: item.cumulative_mw,
        אחר: otherTotal * ratio,
        תרמו: solarThermalTotal * ratio,
        פוטו: photovoltaicTotal * ratio,
        רוח: windTotal * ratio,
      };
    });
  }, [growthData, cumulativeData]);

  // Function to determine opacity for each bar
  const opacityForKey = (key: string) => {
    if (hiddenKeys.has(key)) return 0;
    if (hoveredKey && hoveredKey !== key) return 0.3;
    return 1;
  };

  const stackedActiveSeries = useMemo(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.key, !hiddenKeys.has(c.key)]),
      ) as Record<string, boolean>,
    [hiddenKeys],
  );

  // Custom tooltip for cumulative tab
  const CumulativeTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    const total = payload.reduce(
      (sum: number, entry: any) => sum + (entry.value || 0),
      0,
    );
    return (
      <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
          סה״כ {total.toLocaleString()} MW
        </div>
        {payload
          .slice()
          .reverse()
          .map((entry: any) => (
            <div key={entry.dataKey} className="flex items-start gap-2 mb-1">
              <span
                style={{ background: entry.color }}
                className="w-2 h-2 rounded-full block mt-1"
              />
              <span className="flex flex-col text-sm font-normal">
                {entry.dataKey}{" "}
                <span className="font-medium">
                  {entry.value?.toFixed(2).toLocaleString()} MWh
                </span>
              </span>
            </div>
          ))}
      </div>
    );
  };

  const handleLegendMouseEnter = (key: string) => {
    setHoveredKey(key);
  };

  const handleLegendMouseLeave = () => {
    setHoveredKey(null);
  };

  const handleLegendClick = (key: string) => {
    const next = new Set(hiddenKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setHiddenKeys(next);
  };

  // Custom legend - same for both tabs (technology breakdown)
  const CustomLegend = () => (
    <div
      className="flex flex-row-reverse flex-wrap justify-end gap-4 mt-4"
      style={{ fontFamily: "Heebo, sans-serif" }}
    >
      {categories.map((c) => (
        <button
          key={c.key}
          type="button"
          className={`flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200 ${
            hiddenKeys.has(c.key) ? "opacity-40" : ""
          } ${hoveredKey && hoveredKey !== c.key ? "opacity-30" : ""}`}
          onMouseEnter={() => handleLegendMouseEnter(c.key)}
          onMouseLeave={handleLegendMouseLeave}
          onClick={() => handleLegendClick(c.key)}
        >
          <span
            style={{
              background: c.color,
              opacity: hiddenKeys.has(c.key) ? 0.3 : 1,
            }}
            className="w-2 h-2 rounded-full inline-block transition-opacity duration-200"
          />
          <span
            className={`transition-all duration-200 ${
              hiddenKeys.has(c.key) ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {c.label}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            {tab === 1
              ? "הספק מותקן (מצטבר) של מתקנים לייצור אנרגיות מתחדשות"
              : "הספק מותקן שנתי של מתקנים לייצור אנרגיות מתחדשות"}
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
                          צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. הספק מותקן של מתקנים לייצור אנרגיות מתחדשות.
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
                <span className="text-sm text-slate-600">מחוז</span>
                <FilterDropdown
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                  options={districtOptions}
                  placeholder="הכל"
                />
              </label>
            </div>
            <div className="relative w-[150px]">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">טכנולוגיה</span>
                <FilterDropdown
                  value={selectedTechnology}
                  onChange={setSelectedTechnology}
                  options={technologyOptions}
                  placeholder="הכל"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-start md:gap-4 gap-2">
          <a
            href={
              tab === 1
                ? "/api#installed-capacity-cumulative"
                : "/api#installed-capacity-growth"
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
        ) : tab === 1 ? (
          cumulativeChartData.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-slate-600">אין נתונים זמינים</p>
            </div>
          ) : (
            <StackedComposedChart
              data={cumulativeChartData}
              xAxisDataKey="year"
              yAxisLabel="הספק מותקן [MW]"
              tooltipContent={<CumulativeTooltip />}
              sizeBrackets={categories}
              activeSeries={stackedActiveSeries}
              barSize={28}
              opacityForKey={opacityForKey}
              labelListDataKey="cumulative_mw"
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            />
          )
        ) : growthChartData.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-600">אין נתונים זמינים</p>
          </div>
        ) : (
          <StackedComposedChart
            data={growthChartData}
            xAxisDataKey="year"
            yAxisLabel="הספק מותקן [MW]"
            tooltipContent={<CumulativeTooltip />}
            sizeBrackets={categories}
            activeSeries={stackedActiveSeries}
            barSize={28}
            opacityForKey={opacityForKey}
            labelListDataKey="added_mw"
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          />
        )}
      </div>

      {/* Bottom bar: Tabs + Legend */}
      <div className="flex flex-row justify-between items-center gap-6 mt-4">
        {/* Legend on the right */}
        {!isLoading && !error && <CustomLegend />}

        {/* Tabs on the left */}
        <div
          className="flex gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] w-fit"
          style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}
        >
          <button
            className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${
              tab === 1
                ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
                : "bg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
            }`}
            onClick={() => setTab(1)}
          >
            הספק מצטבר
          </button>
          <button
            className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${
              tab === 2
                ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white"
                : "bg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
            }`}
            onClick={() => setTab(2)}
          >
            הספק מותקן שנתי
          </button>
        </div>
      </div>
    </div>
  );
}
