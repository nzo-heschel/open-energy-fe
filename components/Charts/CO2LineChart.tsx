"use client";

import DateRangePicker from "@/components/ui/DateRangePicker";
import { Button } from "@/components/ui/button";
import { exportCO2EmissionsOverTime, useCO2EmissionsOverTime } from "@/lib/api";
import { ENERGY_COLORS, LEVEL2_HEBREW_COLORS } from "@/lib/colors";
import type { CO2EmissionsOverTimeResponse } from "@/types/dto";
import api from "@/public/images/API.png";
import download from "@/public/images/download_2.png";
import { format, subDays } from "date-fns";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
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

type CO2ChartRow = CO2EmissionsOverTimeResponse["chart_data"][number];

type LineDef = {
  key: string;
  label: string;
  color: string;
};

type ChartRow = Record<string, string | number>;

const CO2_LEVEL2_EXTRA: Record<string, string> = {
  fuel_oil: "#9A7B4F",
  methanol: "#6B8E7D",
};

const FOSSIL_KEYS = [
  "coal",
  "natural_gas",
  "diesel",
  "fuel_oil",
  "methanol",
] as const;

type FossilKey = (typeof FOSSIL_KEYS)[number];

const getFossilEmission = (item: CO2ChartRow, key: FossilKey): number => {
  const fromL2 = item.level2?.fossil_emissions?.[key];
  if (typeof fromL2 === "number") {
    return fromL2;
  }
  const direct = item[key];
  return typeof direct === "number" ? direct : 0;
};

const getRenewableSavings = (item: CO2ChartRow): number => {
  const fromL2 = item.level2?.renewable_emissions_savings?.renewables;
  if (typeof fromL2 === "number") {
    return fromL2;
  }
  if (typeof item.emissions_savings === "number") {
    return item.emissions_savings;
  }
  return 0;
};

const getLevel1FossilEmissions = (item: CO2ChartRow): number => {
  const fromL1 = item.level1?.fossil_emissions;
  if (typeof fromL1 === "number") {
    return fromL1;
  }
  if (typeof item.total_emissions === "number") {
    return item.total_emissions;
  }
  return FOSSIL_KEYS.reduce(
    (sum, key) => sum + getFossilEmission(item, key),
    0,
  );
};

const getLevel1RenewableSavings = (item: CO2ChartRow): number => {
  const fromL1 = item.level1?.renewable_emissions_savings;
  if (typeof fromL1 === "number") {
    return fromL1;
  }
  return getRenewableSavings(item);
};

const RENEWABLE_SAVINGS_LABEL = " שנחסכו עקב השימוש באנרגיה CO2 מתחדשת ";

const CO2_LEVEL2_LEGEND_GROUPS: Record<
  string,
  { category: string; categoryColor: string }
> = {
  פחם: { category: "פליטות CO₂", categoryColor: ENERGY_COLORS.FOSSIL },
  "גז טבעי": { category: "פליטות CO₂", categoryColor: ENERGY_COLORS.FOSSIL },
  סולר: { category: "פליטות CO₂", categoryColor: ENERGY_COLORS.FOSSIL },
  "שמן הסקה": { category: "פליטות CO₂", categoryColor: ENERGY_COLORS.FOSSIL },
  מתנול: { category: "פליטות CO₂", categoryColor: ENERGY_COLORS.FOSSIL },
  [RENEWABLE_SAVINGS_LABEL]: {
    category: "חיסכון בפליטות",
    categoryColor: ENERGY_COLORS.RENEWABLE,
  },
};

const formatTooltipNumber = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const monthToHebrew: Record<string, string> = {
  jan: "ינו",
  january: "ינואר",
  feb: "פבר",
  february: "פברואר",
  mar: "מרץ",
  march: "מרץ",
  apr: "אפר",
  april: "אפריל",
  may: "מאי",
  jun: "יונ",
  june: "יוני",
  jul: "יול",
  july: "יולי",
  aug: "אוג",
  august: "אוגוסט",
  sep: "ספט",
  sept: "ספט",
  september: "ספטמבר",
  oct: "אוק",
  october: "אוקטובר",
  nov: "נוב",
  november: "נובמבר",
  dec: "דצמ",
  december: "דצמבר",
};

const formatTooltipDateLabel = (label: string | number) =>
  String(label).replace(/[A-Za-z]+/g, (monthText) => {
    const translatedMonth = monthToHebrew[monthText.toLowerCase()];
    return translatedMonth ?? monthText;
  });

const CO2LineChart = () => {
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
  const [showLevel2, setShowLevel2] = useState(false);
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({});
  const [startDate, setStartDate] = useState<string>(() => {
    return format(subDays(new Date(), 6), "yyyy-MM-dd");
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return format(new Date(), "yyyy-MM-dd");
  });

  const { data, isLoading, error } = useCO2EmissionsOverTime(
    startDate,
    endDate,
  );

  const toggleLine = (key: string) => {
    setActiveLines((prev) => {
      const currentlyVisible = prev[key] !== false;
      return { ...prev, [key]: !currentlyVisible };
    });
  };

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      await exportCO2EmissionsOverTime(startDate, endDate);
    } catch (error) {
      console.error("Failed to export CO2 emissions over time data:", error);
    }
  };

  const { chartRows, lineDefs } = useMemo(() => {
    if (!data?.chart_data?.length) {
      return { chartRows: [] as ChartRow[], lineDefs: [] as LineDef[] };
    }

    const chartData = data.chart_data;

    if (!showLevel2) {
      const rows: ChartRow[] = chartData.map((item) => ({
        date: item.label || item.period,
        fossil_emissions: getLevel1FossilEmissions(item),
        renewable_savings: getLevel1RenewableSavings(item),
      }));

      const defs: LineDef[] = [
        {
          key: "fossil_emissions",
          label: "פליטות CO₂",
          color: ENERGY_COLORS.FOSSIL,
        },
      ];

      if (chartData.some((item) => getLevel1RenewableSavings(item) > 0)) {
        defs.push({
          key: "renewable_savings",
          label: RENEWABLE_SAVINGS_LABEL,
          color: ENERGY_COLORS.RENEWABLE,
        });
      }

      return { chartRows: rows, lineDefs: defs };
    }

    const fossilMeta: { key: FossilKey; label: string; color: string }[] = [
      { key: "coal", label: "פחם", color: LEVEL2_HEBREW_COLORS["פחם"] },
      {
        key: "natural_gas",
        label: "גז טבעי",
        color: LEVEL2_HEBREW_COLORS["גז טבעי"],
      },
      { key: "diesel", label: "סולר", color: LEVEL2_HEBREW_COLORS["סולר"] },
      {
        key: "fuel_oil",
        label: "שמן הסקה",
        color: CO2_LEVEL2_EXTRA.fuel_oil,
      },
      {
        key: "methanol",
        label: "מתנול",
        color: CO2_LEVEL2_EXTRA.methanol,
      },
    ];

    const defs: LineDef[] = [];

    for (const meta of fossilMeta) {
      if (chartData.some((item) => getFossilEmission(item, meta.key) > 0)) {
        defs.push({ key: meta.key, label: meta.label, color: meta.color });
      }
    }

    if (chartData.some((item) => getRenewableSavings(item) > 0)) {
      defs.push({
        key: "renewable_savings",
        label: RENEWABLE_SAVINGS_LABEL,
        color: ENERGY_COLORS.RENEWABLE,
      });
    }

    const rows: ChartRow[] = chartData.map((item) => {
      const row: ChartRow = {
        date: item.label || item.period,
      };
      for (const d of defs) {
        if (d.key === "renewable_savings") {
          row[d.key] = getRenewableSavings(item);
        } else {
          row[d.key] = getFossilEmission(item, d.key as FossilKey);
        }
      }
      return row;
    });

    return { chartRows: rows, lineDefs: defs };
  }, [data, showLevel2]);

  const isLineVisible = (key: string) => activeLines[key] !== false;

  const getOpacity = (key: string) => {
    if (!hoveredLegend) return 1;
    return hoveredLegend === key ? 1 : 0.3;
  };

  const getLegendOpacity = (key: string) => {
    if (!hoveredLegend) return 1;
    return hoveredLegend === key ? 1 : 0.5;
  };

  const groupedLevel2Legend = useMemo(() => {
    if (!showLevel2 || lineDefs.length === 0) return null;

    const grouped = new Map<string, LineDef[]>();
    for (const def of lineDefs) {
      const meta = CO2_LEVEL2_LEGEND_GROUPS[def.label] ?? {
        category: "פליטות CO₂",
        categoryColor: ENERGY_COLORS.FOSSIL,
      };
      const items = grouped.get(meta.category) ?? [];
      items.push(def);
      grouped.set(meta.category, items);
    }

    const categoryOrder = ["פליטות CO₂", "חיסכון בפליטות"];
    return categoryOrder
      .filter((cat) => grouped.has(cat))
      .map((cat) => ({
        category: cat,
        categoryColor:
          CO2_LEVEL2_LEGEND_GROUPS[grouped.get(cat)![0].label]?.categoryColor ??
          ENERGY_COLORS.FOSSIL,
        items: grouped.get(cat)!,
      }));
  }, [lineDefs, showLevel2]);

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[16px] p-4 md:p-6 pb-4 overflow-hidden h-full flex flex-col">
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
                  <p>
                    הנתונים נלקחים מאתר חברת ניהול מערכת החשמל- נגה. פליטות CO2
                    שנחסכו עקב השימוש באנרגיה מתחדשת הוא נתון שנלקח מנגה. הנתונים
                    מתעדכנים מעת לעת.
                  </p>
                  <p>
                    צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO. פליטות
                    CO2 מייצור חשמל.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            פליטות CO2 מייצור חשמל
          </h2>
          {/* Buttons SECOND - goes to LEFT in RTL */}
          <div className="flex items-start md:gap-4 gap-2">
            <a
              href="/api#co2-emissions-over-time"
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

        {/* Date controls row - same as SMP */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600"> סינון לפי:</span>
          <DateRangePicker
            onDateRangeChange={handleDateRangeChange}
            defaultPreset="last7Days"
          />
        </div>
      </div>
      <div className="flex-grow min-h-[350px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-600">טוען נתונים...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-600">שגיאה בטעינת הנתונים</p>
          </div>
        ) : chartRows.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-600">אין נתונים זמינים</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                key={`co2-line-${showLevel2}-${startDate}-${endDate}`}
                data={chartRows}
                margin={{ top: 10, right: 0, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  label={{
                    value: "[mTCO₂/h]",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fontFamily: "Heebo, sans-serif",
                    },
                  }}
                />
                <RechartsTooltip
                  separator=": "
                  formatter={(value: number, name: string) => [
                    formatTooltipNumber(value),
                    name,
                  ]}
                  labelFormatter={(label) =>
                    `תאריך: ${formatTooltipDateLabel(label)}`
                  }
                  contentStyle={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                {lineDefs.map((def) =>
                  isLineVisible(def.key) ? (
                    <Line
                      key={def.key}
                      type="linear"
                      name={def.label}
                      dataKey={def.key}
                      stroke={def.color}
                      strokeWidth={1.5}
                      dot={false}
                      opacity={getOpacity(def.key)}
                    />
                  ) : null,
                )}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Legend */}
      {groupedLevel2Legend ? (
        <div className="mt-1 space-y-4">
          {groupedLevel2Legend.map((group) => (
            <div key={group.category} className="space-y-1.5">
              <div
                className="flex items-center gap-2 pr-2 border-r-2"
                style={{ borderRightColor: group.categoryColor }}
              >
                {group.category !== "חיסכון בפליטות" && (
                  <span className="text-xs font-medium text-gray-800">
                    {group.category}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-start gap-x-6 gap-y-2 mr-2">
                {group.items.map((def) => (
                  <div
                    key={def.key}
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                    onClick={() => toggleLine(def.key)}
                    onMouseEnter={() => setHoveredLegend(def.key)}
                    onMouseLeave={() => setHoveredLegend(null)}
                    style={{ opacity: getLegendOpacity(def.key) }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 transition-opacity duration-200"
                      style={{
                        backgroundColor: def.color,
                        opacity: isLineVisible(def.key) ? 1 : 0.3,
                      }}
                    />
                    <span
                      className={`text-xs transition-all duration-200 ${isLineVisible(def.key)
                        ? "text-gray-800"
                        : "text-gray-400"
                        }`}
                    >
                      {def.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-wrap justify-start gap-x-6 gap-y-2 mt-1">
          {lineDefs.map((def) => (
            <div
              key={def.key}
              className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
              onClick={() => toggleLine(def.key)}
              onMouseEnter={() => setHoveredLegend(def.key)}
              onMouseLeave={() => setHoveredLegend(null)}
              style={{ opacity: getLegendOpacity(def.key) }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-opacity duration-200"
                style={{
                  backgroundColor: def.color,
                  opacity: isLineVisible(def.key) ? 1 : 0.3,
                }}
              />
              <span
                className={`text-xs transition-all duration-200 ${isLineVisible(def.key) ? "text-gray-800" : "text-gray-400"
                  }`}
              >
                {def.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-start mt-3">
        <Button
          variant="link"
          className="text-blue-600 text-sm h-auto p-0 inline-flex items-center gap-1"
          type="button"
          onClick={() => setShowLevel2(!showLevel2)}
        >
          {showLevel2 ? "הסתר פירוט" : "הצג נתונים"}
          <ChevronLeft className="w-4 h-4 shrink-0" />
        </Button>
      </div>
    </div>
  );
};

export default CO2LineChart;
