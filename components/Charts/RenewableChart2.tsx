"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Spin } from "antd";
import download from "@/public/images/download_2.png";
import api from "@/public/images/API.png";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  LabelList,
  Tooltip,
} from "recharts";
import TooltipInfo from "../TooltipInfo";
import {
  exportRenewablesDelivery4InternationalComparison,
  useRenewablesDelivery4InternationalComparison,
} from "@/lib/api";
import type { RenewablesDelivery4InternationalRegion } from "@/types/dto";

/** API sends either unitless fractions (legacy) or `value_unit: "percent"` scale */
function toChartPercent(
  value: number | null | undefined,
  valueUnit: string | undefined,
): number {
  if (value == null || Number.isNaN(value)) return 0;
  if (valueUnit === "percent" || valueUnit === "%") return value;
  return value * 100;
}

/** One decimal when needed; whole numbers without trailing ".0" (Figma labels). */
function formatPctLabel(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? `${rounded}%`
    : `${rounded.toFixed(1)}%`;
}

function formatPctTooltip(value: number): string {
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`;
}

function cumulativePctForSegment(
  row: ChartRow,
  dataKey: keyof ChartRow,
): number | null {
  switch (dataKey) {
    case "solarPct":
      return row.labelCumSolar;
    case "renewableRemainderPct":
      return row.labelCumAfterRemainder;
    case "target2030Pct":
      return row.labelCum2030;
    case "target2050Pct":
      return row.labelCum2050;
    default:
      return null;
  }
}

/** Stacked bar palette (design reference) */
const colors = {
  solarPct: "#f6cf65",
  renewableRemainderPct: "#92c854",
  target2030Pct: "#bdcb5d",
  target2050Pct: "#8abce4",
} as const;

const labelInsideStyle: React.CSSProperties = {
  fill: "#ffffff",
  fontSize: 13,
  fontWeight: 600,
  textShadow: "0 1px 2px rgba(0,0,0,0.55)",
};

/** Stronger shadow on yellow so white % stays readable */
const solarPctLabelStyle: React.CSSProperties = {
  fill: "#ffffff",
  fontSize: 13,
  fontWeight: 600,
  textShadow: "0 1px 3px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.4)",
};

type ChartRow = {
  country: string;
  region_key: string;
  /** Stacked segment widths (sum to 2030% or 2050% cumulative target) */
  solarPct: number | null;
  renewableRemainderPct: number | null;
  /** Width from cumulative baseline up to 2030 target (0 when 2030 layer is off) */
  target2030Pct: number;
  /** Width from 2030 target to 2050 target */
  target2050Pct: number | null;
  /** Labels inside bars = cumulative % at end of each segment (Figma) */
  labelCumSolar: number | null;
  labelCumAfterRemainder: number | null;
  /** null when 2030 target layer is hidden */
  labelCum2030: number | null;
  labelCum2050: number | null;
};

const STACK_TOOLTIP_ORDER: (keyof ChartRow)[] = [
  "solarPct",
  "renewableRemainderPct",
  "target2030Pct",
  "target2050Pct",
];

type ComparisonChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: keyof ChartRow | string;
    name?: string;
    value?: number;
    color?: string;
    payload?: ChartRow;
  }>;
  include2050: boolean;
};

function ComparisonChartTooltip({
  active,
  payload,
  include2050,
}: ComparisonChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const byKey = new Map(payload.map((p) => [String(p.dataKey), p] as const));

  const ordered = STACK_TOOLTIP_ORDER.flatMap((key) => {
    const p = byKey.get(key);
    if (!p || typeof p.value !== "number" || p.value <= 0) return [];
    return [p];
  });

  if (!ordered.length) return null;

  return (
    <div
      className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 text-sm max-w-[min(90vw,280px)]"
      dir="rtl"
    >
      <p className="font-semibold text-[#484C56] mb-2 border-b border-gray-100 pb-1.5">
        {row.country}
      </p>
      <ul className="space-y-1.5 list-none m-0 p-0">
        {ordered.map((p) => {
          const key = String(p.dataKey) as keyof typeof colors;
          const dot =
            p.color ??
            (key in colors ? colors[key as keyof typeof colors] : "#59687D");
          const dataKey = p.dataKey as keyof ChartRow;
          const cum =
            dataKey != null
              ? cumulativePctForSegment(row, dataKey)
              : null;
          const display =
            cum != null
              ? cum
              : typeof p.value === "number"
                ? p.value
                : 0;
          return (
            <li
              key={String(p.dataKey)}
              className="flex justify-between items-center gap-3 w-full"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: dot }}
                />
                <span className="text-[#59687D] truncate">{p.name}</span>
              </span>
              <span className="font-medium text-[#484C56] tabular-nums shrink-0">
                {formatPctTooltip(display)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 pt-2 border-t border-gray-100 text-xs text-[#59687D] leading-snug">
        {[
          row.labelCum2030 != null
            ? `מצטבר עד יעד 2030: ${formatPctLabel(row.labelCum2030)}`
            : null,
          include2050 && row.labelCum2050 != null
            ? `מצטבר עד יעד 2050: ${formatPctLabel(row.labelCum2050)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </div>
  );
}

function seriesLegendLabel(
  seriesLabels:
    | Record<string, string | { en?: string; he?: string }>
    | undefined,
  key: string,
  fallbackHe: string,
): string {
  const raw = seriesLabels?.[key];
  if (raw == null) return fallbackHe;
  if (typeof raw === "string") return raw;
  return raw.he ?? raw.en ?? fallbackHe;
}

function buildRows(
  regions: RenewablesDelivery4InternationalRegion[],
  include2050: boolean,
  includeSolar: boolean,
  include2030: boolean,
  valueUnit: string | undefined,
): ChartRow[] {
  return regions.map((r) => {
    const t30FromData =
      r.renewable_target_percent_2030 != null &&
      r.renewable_target_percent_2030 > 0
        ? toChartPercent(r.renewable_target_percent_2030, valueUnit)
        : null;
    const t50 =
      include2050 &&
      r.renewable_target_percent_2050 != null &&
      r.renewable_target_percent_2050 > 0
        ? toChartPercent(r.renewable_target_percent_2050, valueUnit)
        : null;

    const solarW =
      includeSolar &&
      r.solar_share_percent_2024 != null &&
      r.solar_share_percent_2024 > 0
        ? toChartPercent(r.solar_share_percent_2024, valueUnit)
        : null;

    let renewableRemainderPct: number | null = null;
    if (
      r.renewable_share_percent_2024 != null &&
      r.renewable_share_percent_2024 > 0
    ) {
      const total = toChartPercent(r.renewable_share_percent_2024, valueUnit);
      renewableRemainderPct =
        solarW != null ? Math.max(0, total - solarW) : total;
    }

    const afterSolar = (solarW ?? 0) + (renewableRemainderPct ?? 0);
    const segTo2030 =
      include2030 && t30FromData != null
        ? Math.max(0, t30FromData - afterSolar)
        : null;
    const segTo2050 =
      t50 != null && t30FromData != null
        ? Math.max(0, t50 - t30FromData)
        : null;

    const labelCumSolar = solarW;
    const labelCumAfterRemainder =
      renewableRemainderPct != null ? afterSolar : null;
    const labelCum2030 =
      include2030 && t30FromData != null ? t30FromData : null;
    const labelCum2050 = t50;

    return {
      country: r.region_he || r.region,
      region_key: r.region_key,
      solarPct: solarW,
      renewableRemainderPct,
      target2030Pct: segTo2030 ?? 0,
      target2050Pct: segTo2050,
      labelCumSolar,
      labelCumAfterRemainder,
      labelCum2030,
      labelCum2050,
    };
  });
}

function rowStackSum(r: ChartRow): number {
  return [r.solarPct, r.renewableRemainderPct, r.target2030Pct, r.target2050Pct]
    .filter((v): v is number => v != null && !Number.isNaN(v))
    .reduce((a, b) => a + b, 0);
}

function makeCumulativeSegmentLabel(
  dataKey: keyof ChartRow,
  chartData: ChartRow[],
) {
  /** Recharts strips non-SVG fields from `content` props — use `index` + `chartData` for row labels */
  function CumulativeSegmentLabel(props: any) {
    const p = props as {
      x?: number | string;
      y?: number | string;
      width?: number | string;
      height?: number | string;
      value?: number | string;
      index?: number;
      viewBox?: { x?: number; y?: number; width?: number; height?: number };
    };
    const vb = p.viewBox;
    const x = typeof p.x === "number" ? p.x : Number(p.x ?? vb?.x) || 0;
    const y = typeof p.y === "number" ? p.y : Number(p.y ?? vb?.y) || 0;
    const width =
      typeof p.width === "number" ? p.width : Number(p.width ?? vb?.width) || 0;
    const height =
      typeof p.height === "number"
        ? p.height
        : Number(p.height ?? vb?.height) || 0;
    const value = typeof p.value === "number" ? p.value : Number(p.value);
    const row = typeof p.index === "number" ? chartData[p.index] : undefined;
    if (!row || !value || Number.isNaN(value) || value < 1) return null;
    if (width < 16) return null;

    let text: string | null = null;
    if (dataKey === "solarPct" && row.labelCumSolar != null) {
      text = formatPctLabel(row.labelCumSolar);
    } else if (
      dataKey === "renewableRemainderPct" &&
      row.labelCumAfterRemainder != null
    ) {
      text = formatPctLabel(row.labelCumAfterRemainder);
    } else if (dataKey === "target2030Pct" && row.labelCum2030 != null) {
      text = formatPctLabel(row.labelCum2030);
    } else if (dataKey === "target2050Pct" && row.labelCum2050 != null) {
      text = formatPctLabel(row.labelCum2050);
    }
    if (!text) return null;

    const style =
      dataKey === "solarPct" ? solarPctLabelStyle : labelInsideStyle;
    const pad = 6;
    const tx = x + width - pad;
    const ty = y + height / 2;
    return (
      <text
        x={tx}
        y={ty}
        dominantBaseline="middle"
        textAnchor="end"
        style={style}
      >
        {text}
      </text>
    );
  }
  CumulativeSegmentLabel.displayName = `CumulativeSegmentLabel(${String(dataKey)})`;
  return CumulativeSegmentLabel;
}

function CountryNameLabel(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: string;
  payload?: ChartRow;
}) {
  const xNum = typeof props.x === "number" ? props.x : Number(props.x) || 0;
  const yNum = typeof props.y === "number" ? props.y : Number(props.y) || 0;
  const wNum =
    typeof props.width === "number" ? props.width : Number(props.width) || 0;
  const label = props.value ?? props.payload?.country;
  if (!label) return null;
  const barEnd = xNum + wNum;
  const ty = yNum - 14;
  return (
    <text
      x={barEnd}
      y={ty}
      dominantBaseline="hanging"
      textAnchor="end"
      style={{ direction: "ltr" }}
      fill="#484C56"
      fontSize={14}
      fontWeight={400}
    >
      {label}
    </text>
  );
}

type LegendRow = {
  dataKey: keyof typeof colors;
  color: string;
  label: string;
  toggleable: boolean;
  enabled: boolean;
};

export default function RenewableChart2() {
  const [hoveredLegendKey, setHoveredLegendKey] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [include2050, setInclude2050] = useState(true);
  const [includeSolar, setIncludeSolar] = useState(true);
  const [include2030, setInclude2030] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, error } =
    useRenewablesDelivery4InternationalComparison(include2050, includeSolar);

  const chartData = useMemo(
    () =>
      buildRows(
        data?.regions ?? [],
        include2050,
        includeSolar,
        include2030,
        data?.value_unit,
      ),
    [data?.regions, data?.value_unit, include2030, include2050, includeSolar],
  );

  const chartMax = useMemo(() => {
    if (!chartData.length) return 100;
    const m = Math.max(...chartData.map(rowStackSum), 100);
    return Math.ceil(m / 10) * 10;
  }, [chartData]);

  const xTicks = useMemo(() => {
    const mid = Math.round(chartMax / 2);
    return Array.from(new Set([0, mid, chartMax])).sort((a, b) => a - b);
  }, [chartMax]);

  const hasRenewableShare = useMemo(
    () =>
      (data?.regions ?? []).some((r) => {
        const v = r.renewable_share_percent_2024;
        return v != null && toChartPercent(v, data?.value_unit) > 0;
      }),
    [data?.regions, data?.value_unit],
  );

  /** Figma: סולארי → (כיום) → 2030 → 2050 */
  const legendRows: LegendRow[] = useMemo(() => {
    const labels = data?.series_labels;
    const rows: LegendRow[] = [];
    rows.push({
      dataKey: "solarPct",
      color: colors.solarPct,
      label: "שיעור אנרגיה סולארית בשנת 2024",

      toggleable: true,
      enabled: includeSolar,
    });
    if (hasRenewableShare) {
      rows.push({
        dataKey: "renewableRemainderPct",
        color: colors.renewableRemainderPct,
        label: "כיום",
        toggleable: false,
        enabled: true,
      });
    }
    rows.push({
      dataKey: "target2030Pct",
      color: colors.target2030Pct,
      label: "יעדים ל-2030",
      toggleable: true,
      enabled: include2030,
    });
    rows.push({
      dataKey: "target2050Pct",
      color: colors.target2050Pct,
      label: "יעדים ל-2050",

      toggleable: true,
      enabled: include2050,
    });
    return rows;
  }, [data?.series_labels, include2030, include2050, includeSolar, hasRenewableShare]);

  const barKeys = useMemo(() => {
    const keys: (keyof ChartRow)[] = [];
    if (includeSolar) keys.push("solarPct");
    if (hasRenewableShare) keys.push("renewableRemainderPct");
    if (include2030) keys.push("target2030Pct");
    if (include2050) keys.push("target2050Pct");
    return keys;
  }, [include2030, include2050, includeSolar, hasRenewableShare]);

  const barDisplayNameByKey = useMemo(() => {
    const m: Partial<Record<keyof ChartRow, string>> = {};
    for (const r of legendRows) {
      m[r.dataKey as keyof ChartRow] = r.label;
    }
    return m;
  }, [legendRows]);

  const barOpacity = (key: keyof ChartRow) => {
    if (
      !hoveredLegendKey ||
      !barKeys.includes(hoveredLegendKey as keyof ChartRow)
    ) {
      return 1;
    }
    return hoveredLegendKey === key ? 1 : 0.35;
  };

  const legendRowOpacity = (row: LegendRow) => {
    if (!row.toggleable) return 1;
    return row.enabled ? 1 : 0.45;
  };

  const handleLegendRowClick = (row: LegendRow) => {
    if (!row.toggleable) return;
    if (row.dataKey === "solarPct") setIncludeSolar((v) => !v);
    if (row.dataKey === "target2050Pct") setInclude2050((v) => !v);
    if (row.dataKey === "target2030Pct") setInclude2030((v) => !v);
  };

  const title = "השוואה בין לאומית של יעדי מתחדשות וייצור אנרגיה סולארית";

  const infoContent = useMemo(() => {
    const parts: string[] = [];
    if (data?.value_unit_description) parts.push(data.value_unit_description);
    parts.push(
      "הגרף משווה בין יעדי אנרגיה מתחדשת לשנים 2030 ו-2050 לבין שיעור סולארי ב-2024. לחיצה על פריט במקרא מפעילה או מכבה את שכבות הסולאר, יעד 2030 ויעד 2050.",
    );
    if (data?.source?.source_notes?.length) {
      parts.push(`מקורות: ${data.source.source_notes.join(" · ")}`);
    }
    return parts.join("\n\n");
  }, [data?.source?.source_notes, data?.value_unit_description]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportRenewablesDelivery4InternationalComparison(
        include2050,
        includeSolar,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleLegendMouseEnter = (row: LegendRow) => {
    if (row.toggleable && !row.enabled) {
      setHoveredLegendKey(null);
      return;
    }
    setHoveredLegendKey(row.dataKey);
  };
  const handleLegendMouseLeave = () => setHoveredLegendKey(null);

  const missingSolarSide =
    includeSolar && (data?.regions_without_solar_data?.length ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px] bg-white">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !chartData.length) {
    return (
      <div className="w-full text-center text-red-600 text-sm py-8 bg-white">
        לא ניתן לטעון את נתוני התרשים
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="flex flex-col md:flex-row md:items-start items-stretch justify-between gap-4 mb-4">
        <div className="flex items-start gap-2 min-w-0">
          <div className="flex flex-col gap-1 min-w-0 text-right">
            <h2 className="text-lg md:text-xl font-bold text-[#484C56] leading-snug">
              {title}
            </h2>
            {/* <p className="font-normal text-[#484C56] text-sm leading-snug">
              אחוז אנרגיות מתחדשות מתוך תמהיל הייצור
            </p> */}
          </div>
          <div
            className="relative shrink-0 pt-0.5"
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
              aria-hidden
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
              <div className="absolute top-full end-1/2 translate-x-1/2 md:translate-x-0 md:end-0 mt-2 z-50 min-w-[280px] max-w-[min(90vw,388px)]">
                <TooltipInfo content={infoContent} />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end md:justify-start gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="leading-none disabled:opacity-50"
            aria-label="ייצוא לאקסל"
          >
            <Image
              src={download}
              width={28}
              height={28}
              className="w-7 h-7"
              alt=""
            />
          </button>
          <Link
            href="/api#renewables-delivery-4-international-renewable-comparison"
            className="leading-none"
          >
            <Image
              src={api}
              width={28}
              height={28}
              className="w-7 h-7"
              alt="API"
            />
          </Link>
        </div>
      </div>

      {/* Legend at top */}
      <nav
        className="flex flex-row gap-6 items-center text-right mb-6 justify-start"
        aria-label="מקרא"
        dir="rtl"
      >
        {legendRows.map((row) => (
          <button
            key={row.dataKey}
            type="button"
            disabled={!row.toggleable}
            className={`flex items-center gap-2.5 transition-opacity duration-200 border-0 bg-transparent p-0 ${
              row.toggleable ? "cursor-pointer" : "cursor-default"
            }`}
            style={{ opacity: legendRowOpacity(row) }}
            onClick={() => handleLegendRowClick(row)}
            onMouseEnter={() => handleLegendMouseEnter(row)}
            onMouseLeave={handleLegendMouseLeave}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: row.color }}
            />
            <span
              className={`text-sm leading-tight ${
                row.toggleable && row.enabled
                  ? "font-medium text-[#484C56]"
                  : row.toggleable
                    ? "font-medium text-gray-400"
                    : "font-medium text-[#484C56]"
              }`}
            >
              {row.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Chart area */}
      <div
        className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 relative"
        dir="ltr"
      >
        <div className="w-full min-w-0 flex-1 h-[320px] md:h-[500px]">
          <ResponsiveContainer width="70%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 32, right: 20, left: 8, bottom: 32 }}
            >
              <XAxis
                type="number"
                domain={[0, chartMax]}
                ticks={xTicks}
                axisLine={{ stroke: "#D6D6D6" }}
                tickLine={false}
                tick={{ fill: "#59687D", fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="country"
                width={0}
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <Legend content={() => null} />
              <Tooltip
                cursor={{ fill: "rgba(89, 104, 125, 0.07)" }}
                content={(props) => (
                  <ComparisonChartTooltip
                    active={props.active}
                    payload={
                      props.payload as ComparisonChartTooltipProps["payload"]
                    }
                    include2050={include2050}
                  />
                )}
              />
              {barKeys.map((key, barIndex) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={barDisplayNameByKey[key] ?? String(key)}
                  stackId="a"
                  fill={colors[key as keyof typeof colors]}
                  stroke="#ffffff"
                  strokeWidth={1}
                  barSize={30}
                  radius={0}
                  opacity={barOpacity(key)}
                >
                  {barIndex === barKeys.length - 1 && (
                    <LabelList
                      dataKey="country"
                      content={(p) => (
                        <CountryNameLabel
                          {...(p as React.ComponentProps<
                            typeof CountryNameLabel
                          >)}
                        />
                      )}
                    />
                  )}
                  <LabelList
                    dataKey={key}
                    position="center"
                    content={makeCumulativeSegmentLabel(key, chartData)}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {missingSolarSide ? (
        <div className="absolute bottom-[30px] translate-y-[-100%] start-[100px]  w-[280px]">
          <div className="bg-[#F8F8F8] text-[#484C56] text-sm border border-dashed border-[#BDBDBD] rounded-[10px] p-3 relative text-right">
            <div className="absolute -top-2 end-3 text-xl font-extrabold text-[#59687D]">
              *
            </div>
            <h4 className="font-bold mb-1">נתוני אנרגיה סולארית חסרים עבור:</h4>
            <ul className="list-none font-normal space-y-0.5">
              {data?.regions_without_solar_data?.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
