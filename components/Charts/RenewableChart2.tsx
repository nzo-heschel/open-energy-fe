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
} from "recharts";
import TooltipInfo from "../TooltipInfo";
import {
    exportRenewablesDelivery4InternationalComparison,
    useRenewablesDelivery4InternationalComparison,
} from "@/lib/api";
import type { RenewablesDelivery4InternationalRegion } from "@/types/dto";

const pct = (fraction: number) => fraction * 100;

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
    /** Width from cumulative baseline up to 2030 target (not full 2030 %) */
    target2030Pct: number;
    /** Width from 2030 target to 2050 target */
    target2050Pct: number | null;
    /** Labels inside bars = cumulative % at end of each segment (Figma) */
    labelCumSolar: number | null;
    labelCumAfterRemainder: number | null;
    labelCum2030: number;
    labelCum2050: number | null;
};

function buildRows(
    regions: RenewablesDelivery4InternationalRegion[],
    include2050: boolean,
    includeSolar: boolean
): ChartRow[] {
    return regions.map((r) => {
        const t30 = pct(r.renewable_target_2030);
        const t50 =
            include2050 && r.renewable_target_2050 != null && r.renewable_target_2050 > 0
                ? pct(r.renewable_target_2050)
                : null;

        const solarW =
            includeSolar && r.solar_share_2024 != null && r.solar_share_2024 > 0
                ? pct(r.solar_share_2024)
                : null;

        let renewableRemainderPct: number | null = null;
        if (r.renewable_share_2024 != null && r.renewable_share_2024 > 0) {
            const total = pct(r.renewable_share_2024);
            renewableRemainderPct =
                solarW != null ? Math.max(0, total - solarW) : total;
        }

        const afterSolar = (solarW ?? 0) + (renewableRemainderPct ?? 0);
        const segTo2030 = Math.max(0, t30 - afterSolar);
        const segTo2050 = t50 != null ? Math.max(0, t50 - t30) : null;

        const labelCumSolar = solarW != null ? Math.round(solarW) : null;
        const labelCumAfterRemainder =
            renewableRemainderPct != null ? Math.round(afterSolar) : null;
        const labelCum2030 = Math.round(t30);
        const labelCum2050 = t50 != null ? Math.round(t50) : null;

        return {
            country: r.region_he || r.region,
            region_key: r.region_key,
            solarPct: solarW,
            renewableRemainderPct,
            target2030Pct: segTo2030,
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

/** Country name above the outer end of the stacked bar (Figma) */
type RechartsLabelProps = {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    value?: number | string;
    payload?: ChartRow;
};

function makeCumulativeSegmentLabel(dataKey: keyof ChartRow, chartData: ChartRow[]) {
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
        const width = typeof p.width === "number" ? p.width : Number(p.width ?? vb?.width) || 0;
        const height = typeof p.height === "number" ? p.height : Number(p.height ?? vb?.height) || 0;
        const value = typeof p.value === "number" ? p.value : Number(p.value);
        const row = typeof p.index === "number" ? chartData[p.index] : undefined;
        if (!row || !value || Number.isNaN(value) || value < 1) return null;
        if (width < 16) return null;

        let text: string | null = null;
        if (dataKey === "solarPct" && row.labelCumSolar != null) {
            text = `${row.labelCumSolar}%`;
        } else if (dataKey === "renewableRemainderPct" && row.labelCumAfterRemainder != null) {
            text = `${row.labelCumAfterRemainder}%`;
        } else if (dataKey === "target2030Pct") {
            text = `${row.labelCum2030}%`;
        } else if (dataKey === "target2050Pct" && row.labelCum2050 != null) {
            text = `${row.labelCum2050}%`;
        }
        if (!text) return null;

        const style = dataKey === "solarPct" ? solarPctLabelStyle : labelInsideStyle;
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
    const wNum = typeof props.width === "number" ? props.width : Number(props.width) || 0;
    const label = props.value ?? props.payload?.country;
    if (!label) return null;
    const barRight = xNum + wNum;
    const ty = yNum - 14;
    return (
        <text
            x={barRight}
            y={ty}
            dominantBaseline="hanging"
            textAnchor="end"
            style={{ direction: "rtl" }}
            fill="#484C56"
            fontSize={13}
            fontWeight={700}
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
    const [exporting, setExporting] = useState(false);

    const { data, isLoading, error } = useRenewablesDelivery4InternationalComparison(
        include2050,
        includeSolar
    );

    const chartData = useMemo(
        () => buildRows(data?.regions ?? [], include2050, includeSolar),
        [data?.regions, include2050, includeSolar]
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
        () => (data?.regions ?? []).some((r) => r.renewable_share_2024 != null && r.renewable_share_2024 > 0),
        [data?.regions]
    );

    /** Figma: סולארי → (כיום) → 2030 → 2050 */
    const legendRows: LegendRow[] = useMemo(() => {
        const labels = data?.column_labels;
        const rows: LegendRow[] = [];
        rows.push({
            dataKey: "solarPct",
            color: colors.solarPct,
            label: labels?.solar_share_2024?.he ?? "אנרגיה סולארית",
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
            label: labels?.renewable_target_2030?.he ?? "יעדים ל-2030",
            toggleable: false,
            enabled: true,
        });
        rows.push({
            dataKey: "target2050Pct",
            color: colors.target2050Pct,
            label: labels?.renewable_target_2050?.he ?? "יעדים ל-2050",
            toggleable: true,
            enabled: include2050,
        });
        return rows;
    }, [data?.column_labels, include2050, includeSolar, hasRenewableShare]);

    const barKeys = useMemo(() => {
        const keys: (keyof ChartRow)[] = [];
        if (includeSolar) keys.push("solarPct");
        if (hasRenewableShare) keys.push("renewableRemainderPct");
        keys.push("target2030Pct");
        if (include2050) keys.push("target2050Pct");
        return keys;
    }, [include2050, includeSolar, hasRenewableShare]);

    const barOpacity = (key: keyof ChartRow) => {
        if (!hoveredLegendKey || !barKeys.includes(hoveredLegendKey as keyof ChartRow)) {
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
    };

    const title =
        data?.title_he ?? data?.title ?? "אנרגיות מתחדשות - יעדים מול ייצור בפועל";

    const infoContent = useMemo(() => {
        const parts: string[] = [];
        if (data?.value_unit_description) parts.push(data.value_unit_description);
        parts.push(
            "הגרף משווה בין יעדי אנרגיה מתחדשת לשנים 2030 ו-2050 לבין שיעור סולארי ב-2024. יעד 2030 תמיד מוצג. לחיצה על פריט במקרא מפעילה או מכבה את יעד 2050 ואת שכבת הסולאר."
        );
        if (data?.source?.source_notes?.length) {
            parts.push(`מקורות: ${data.source.source_notes.join(" · ")}`);
        }
        return parts.join("\n\n");
    }, [data?.source?.source_notes, data?.value_unit_description]);

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportRenewablesDelivery4InternationalComparison(include2050, includeSolar);
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
                        <p className="font-normal text-[#484C56] text-sm leading-snug">
                            אחוז אנרגיות מתחדשות מתוך תמהיל הייצור
                        </p>
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
                        <Image src={download} width={28} height={28} className="w-7 h-7" alt="" />
                    </button>
                    <Link
                        href="/api#renewables-delivery-4-international-renewable-comparison"
                        className="leading-none"
                    >
                        <Image src={api} width={28} height={28} className="w-7 h-7" alt="API" />
                    </Link>
                </div>
            </div>

            {/* dir=ltr: chart on the left, legend column on the physical right */}
            <div
                className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8"
                dir="ltr"
            >
                <div className="w-full min-w-0 flex-1 h-[320px] md:h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
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
                            {barKeys.map((key, barIndex) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
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
                                                    {...(p as React.ComponentProps<typeof CountryNameLabel>)}
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

                <div className="flex flex-col gap-5 shrink-0 w-full md:w-[220px] md:pt-1" dir="rtl">
                    <nav className="flex flex-col gap-2.5 items-stretch text-right" aria-label="מקרא">
                        {legendRows.map((row) => (
                            <button
                                key={row.dataKey}
                                type="button"
                                disabled={!row.toggleable}
                                className={`flex items-center justify-end gap-2.5 transition-opacity duration-200 border-0 bg-transparent p-0 w-full ${row.toggleable ? "cursor-pointer" : "cursor-default"
                                    }`}
                                style={{ opacity: legendRowOpacity(row) }}
                                onClick={() => handleLegendRowClick(row)}
                                onMouseEnter={() => handleLegendMouseEnter(row)}
                                onMouseLeave={handleLegendMouseLeave}
                            >
                                <span
                                    className={`text-sm leading-tight ${row.toggleable && row.enabled
                                        ? "font-medium text-[#484C56]"
                                        : row.toggleable
                                            ? "font-medium text-gray-400"
                                            : "font-medium text-[#484C56]"
                                        }`}
                                >
                                    {row.label}
                                </span>
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                                    style={{ backgroundColor: row.color }}
                                />
                            </button>
                        ))}
                    </nav>

                    {missingSolarSide ? (
                        <aside className="w-full">
                            <div className="w-full bg-[#F8F8F8] text-[#484C56] text-sm border border-dashed border-[#BDBDBD] rounded-[10px] p-3 relative text-right">
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
                        </aside>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
