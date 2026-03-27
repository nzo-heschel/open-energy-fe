"use client";

import React, { useState, useMemo } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Bar,
    LabelList,
} from "recharts";
import { ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    useResponseCapacityByPeriod,
    exportResponseCapacityByPeriod,
    ResponseCapacityByPeriodFilters
} from "@/lib/api";

type TabKey = "1" | "2";

type ResponseTypeKey = "Positive" | "Negative" | "Partial Positive" | "Limited Positive";

type BreakdownValue = number | { total_mw?: number; count?: number } | undefined;

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
const series = [
    { key: "negative", apiKey: "Negative" as const, label: "שלילית", color: "#CEA073" },
    { key: "limitedPositive", apiKey: "Limited Positive" as const, label: "חיובית מוגבלת", color: "#6B707C" },
    { key: "partialPositive", apiKey: "Partial Positive" as const, label: "חיובית חלקית", color: "#957669" },
    { key: "positive", apiKey: "Positive" as const, label: "חיובית", color: "#60A261" },
];

// Static year options (to avoid hydration mismatch)
const yearOptions = [2026, 2025, 2024, 2023, 2022, 2021];

const readBreakdownNumber = (value: BreakdownValue, mode: "mw" | "count"): number => {
    if (value === undefined) return 0;
    if (typeof value === "number") return value;
    return mode === "mw" ? (value.total_mw ?? 0) : (value.count ?? 0);
};

const computeShares = (breakdown: Partial<Record<ResponseTypeKey, BreakdownValue>>, mode: "mw" | "count"): number[] => {
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

    const order = exact.map((n, idx) => ({ idx, frac: n - floors[idx] })).sort((a, b) => b.frac - a.frac);
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
}): { negative: number; limitedPositive: number; partialPositive: number; positive: number; total: number } => {
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
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [isExporting, setIsExporting] = useState(false);

    const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>({
        negative: true,
        limitedPositive: true,
        partialPositive: true,
        positive: true,
    });

    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    // Build filters
    const filters: ResponseCapacityByPeriodFilters = useMemo(() => ({
        year: selectedYear,
    }), [selectedYear]);

    // Fetch data from API
    const { data: apiData, isLoading, error } = useResponseCapacityByPeriod(filters);

    // Transform API data for chart - aggregate by year when no specific year is selected
    const chartData = useMemo(() => {
        if (!apiData?.series) return [];

        // If a specific year is selected, show monthly data
        if (selectedYear) {
            return apiData.series.map((item) => {
                const split = splitPeriodMetric({
                    tab,
                    totalMw: item.total_mw,
                    requestCount: item.request_count,
                    itemBreakdown: item.response_type_breakdown,
                    globalBreakdown: apiData.response_type_breakdown,
                });

                // Extract month from period (e.g., "2024-05" -> "05")
                const month = item.period.split('-')[1] || item.period;

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

        // When "all" is selected, aggregate by year
        const yearMap = new Map<string, {
            totalMw: number;
            requestCount: number;
            breakdowns: Partial<Record<ResponseTypeKey, BreakdownValue>>[];
        }>();

        apiData.series.forEach((item) => {
            const year = item.period.split('-')[0];
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
    }, [apiData, tab, selectedYear]);

    const opacityForKey = (key: string) => {
        if (hoveredSeries) {
            return hoveredSeries === key ? 1 : 0.3;
        }
        return activeSeries[key] ? 1 : 0.3;
    };

    const yAxisLabel = tab === "1" ? "הספק תשובות [MW]" : "מספר מתקנים";

    // Wider bars when showing yearly data (fewer bars)
    const barSize = selectedYear ? 36 : 80;

    // Handle export
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportResponseCapacityByPeriod(filters);
        } catch (err) {
            console.error('Export failed:', err);
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
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="6 6" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value: number) => value.toLocaleString()}
                        label={{
                            value: yAxisLabel,
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                        }}
                    />
                    <Tooltip content={<CustomTooltip tab={tab} />} />
                    <Bar
                        dataKey="negative"
                        stackId="a"
                        fill={series[0].color}
                        barSize={barSize}
                        opacity={activeSeries.negative ? opacityForKey("negative") : 0}
                    />
                    <Bar
                        dataKey="limitedPositive"
                        stackId="a"
                        fill={series[1].color}
                        barSize={barSize}
                        opacity={activeSeries.limitedPositive ? opacityForKey("limitedPositive") : 0}
                    />
                    <Bar
                        dataKey="partialPositive"
                        stackId="a"
                        fill={series[2].color}
                        barSize={barSize}
                        opacity={activeSeries.partialPositive ? opacityForKey("partialPositive") : 0}
                    />
                    <Bar
                        dataKey="positive"
                        stackId="a"
                        fill={series[3].color}
                        barSize={barSize}
                        radius={[4, 4, 0, 0]}
                        opacity={activeSeries.positive ? opacityForKey("positive") : 0}
                    >
                        <LabelList
                            dataKey="total"
                            position="top"
                            formatter={(value: number) => Math.round(value).toLocaleString()}
                            style={{ fill: "#707585", fontWeight: 400, fontSize: 14, fontFamily: 'Heebo' }}
                        />
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        נתוני תשובות מחלק על ציר הזמן
                    </h2>

                    <div className="flex flex-wrap items-center gap-5">
                        <span className="text-sm text-slate-600 mt-6">מיון לפי:</span>
                        <div className="relative w-[113px]">
                            <label htmlFor="" className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-600'>שנה:</span>
                                <select
                                    value={selectedYear || ""}
                                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                    style={{ fontFamily: 'Heebo, sans-serif' }}
                                >
                                    <option value="">הכל</option>
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {/* Custom dropdown arrow */}
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex items-start md:gap-4 gap-2">
                    <Link href="/api#response-capacity-by-period">
                        <Image src={api} width={32} height={32} className='w-[32px] h-[32px] cursor-pointer' alt='API documentation' />
                    </Link>
                    <button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <Loader2 className="w-[32px] h-[32px] animate-spin text-gray-500" />
                        ) : (
                            <Image src={download} width={32} height={32} className='w-[32px] h-[32px] cursor-pointer' alt='Download Excel' />
                        )}
                    </button>
                </div>
            </div>

            {/* Tab content */}
            <div className="w-full h-[420px]">
                {renderChartBody()}
            </div>

            <CustomLegend
                activeSeries={activeSeries}
                setActiveSeries={setActiveSeries}
                hoveredSeries={hoveredSeries}
                setHoveredSeries={setHoveredSeries}
            />

            {/* Tabs */}
            <div className="flex gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] mb-4 w-fit ml-auto -mt-10" style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}>
                <button
                    onClick={() => setTab("1")}
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${tab === "1" ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                >
                    הספק מתקנים
                </button>
                <button
                    onClick={() => setTab("2")}
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${tab === "2" ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                >
                    מספר מתקנים
                </button>
            </div>
        </div>
    );
}
