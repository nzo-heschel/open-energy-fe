"use client";

import React, { useState, useMemo } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    ComposedChart,
} from "recharts";
import { ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TooltipInfo from "../TooltipInfo";
import {
    useResponseCapacityBySize,
    exportResponseCapacityBySize,
    ResponseCapacityBySizeFilters
} from "@/lib/api";

// Size bracket configuration with colors and Hebrew labels (matching Figma - 4 categories)
const SIZE_BRACKETS = [
    { key: "xlarge", label: "גדול מאוד | +5001 KW", color: "#648AA3" },
    { key: "large", label: "גדול | 631-5000 KW", color: "#60A261" },
    { key: "medium", label: "בינוני | 201-630 KW", color: "#957669" },
    { key: "small", label: "קטן | 0-200 KW", color: "#C4C95C" },
];

// Static year options (to avoid hydration mismatch)
const yearOptions = [2026, 2025, 2024, 2023, 2022, 2021];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, activeTab }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const total = payload.reduce((sum: number, entry: any) => {
        const val = Number(entry.value) || 0;
        return sum + val;
    }, 0);
    const unit = activeTab === "supply" ? "KW" : "מתקנים";

    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
                סה״כ {Math.round(total).toLocaleString()} {unit}
            </div>

            {SIZE_BRACKETS.map((bracket) => {
                const entry = payload.find((p: any) => p.dataKey === bracket.key);
                if (!entry) return null;
                const val = Number(entry.value) || 0;

                return (
                    <div key={bracket.key} className="flex items-start gap-2 mb-1">
                        <span
                            style={{ background: bracket.color }}
                            className="w-2 h-2 rounded-full block mt-1"
                        />
                        <span className="flex flex-col text-sm font-normal">
                            {bracket.label.split(' | ')[0]} <span className="font-medium">{Math.round(val).toLocaleString()} {unit}</span>
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
            [key]: !activeSeries[key]
        });
    };

    const getLegendOpacity = (key: string) => {
        if (!hoveredSeries) return 1;
        return hoveredSeries === key ? 1 : 0.5;
    };

    return (
        <div className="flex flex-row-reverse flex-wrap justify-end gap-4 mt-6">
            {SIZE_BRACKETS.map((bracket) => (
                <button
                    key={bracket.key}
                    type="button"
                    onClick={() => toggleSeries(bracket.key)}
                    onMouseEnter={() => setHoveredSeries(bracket.key)}
                    onMouseLeave={() => setHoveredSeries(null)}
                    className="flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200"
                    style={{ opacity: getLegendOpacity(bracket.key) }}
                >
                    <span
                        style={{
                            background: bracket.color,
                            opacity: activeSeries[bracket.key] ? 1 : 0.3,
                        }}
                        className="w-2 h-2 rounded-full block transition-opacity duration-200"
                    />
                    <span
                        className={`transition-all duration-200 ${activeSeries[bracket.key] ? "text-gray-800" : "text-gray-400"
                            }`}
                    >
                        {bracket.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default function RequestTwo() {
    const [activeTab, setActiveTab] = useState<"supply" | "facilities">("supply");
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // New state for active series with toggle functionality
    const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
        xlarge: true,
        large: true,
        medium: true,
        small: true,
    });

    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    // Build filters
    const filters: ResponseCapacityBySizeFilters = useMemo(() => ({
        year: selectedYear,
    }), [selectedYear]);

    // Fetch data from API
    const { data: apiData, isLoading, error } = useResponseCapacityBySize(filters);

    // Transform API data for chart - use yearly_series and map to 4 categories
    const chartData = useMemo(() => {
        if (!apiData?.yearly_series) return [];

        // If only one year in data (specific year selected), show quarterly/monthly breakdown
        // For now, just show the yearly data
        return apiData.yearly_series.map((yearData: any) => {
            const brackets = yearData.size_brackets || {};

            // Helper to get value based on active tab
            const getValue = (bracket: any) => {
                if (!bracket) return 0;
                return activeTab === "supply"
                    ? Number(bracket.total_mw || 0)
                    : Number(bracket.count || 0);
            };

            // Map API size brackets to our 4 simplified categories
            // Small (0-200 kW): Up to 16 kW + 16-50 kW + 50-200 kW
            const small = getValue(brackets["Up to 16 kW"]) +
                          getValue(brackets["16–50 kW"]) +
                          getValue(brackets["50–200 kW"]);
            // Medium (201-630 kW): 200 kW-1 MW
            const medium = getValue(brackets["200 kW–1 MW"]);
            // Large (631-5000 kW): 1-5 MW
            const large = getValue(brackets["1–5 MW"]);
            // XLarge (5001+ kW): 5-50 MW + 50+ MW
            const xlarge = getValue(brackets["5–50 MW"]) +
                           getValue(brackets["50+ MW"]);

            const total = small + medium + large + xlarge;

            return {
                year: yearData.year,
                small: isNaN(small) ? 0 : small,
                medium: isNaN(medium) ? 0 : medium,
                large: isNaN(large) ? 0 : large,
                xlarge: isNaN(xlarge) ? 0 : xlarge,
                total: isNaN(total) ? 0 : total,
            };
        }).sort((a: any, b: any) => a.year - b.year);
    }, [apiData, activeTab]);

    // Dynamic bar size based on number of data points
    const barSize = chartData.length <= 1 ? 120 : (chartData.length <= 3 ? 80 : 60);

    // Function to determine opacity for each bar
    const opacityForKey = (key: string) => {
        // If a series is hovered, highlight only that series
        if (hoveredSeries) {
            return hoveredSeries === key ? 1 : 0.3;
        }
        // If no series is hovered, show based on active state
        return activeSeries[key] ? 1 : 0.3;
    };

    // Handle export
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportResponseCapacityBySize(filters);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        הספק תשובות חיוביות
                        <div
                            className="relative"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            role="tooltip"
                            tabIndex={0}
                            onFocus={() => setShowTooltip(true)}
                            onBlur={() => setShowTooltip(false)}
                        >
                            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.5">
                                    <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#59687D" />
                                    <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#59687D" />
                                </g>
                            </svg>
                            {showTooltip && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                                    <TooltipInfo
                                        content="
                                    הגרף מציג את קיבולת התגובה החיובית לפי גודל מתקן לאורך השנים.
                                    ניתן לראות את התפלגות ההספק או מספר המתקנים לפי טווחי גודל שונים.
                                    הנתונים נאספים מרשות החשמל ומתעדכנים מעת לעת. ניתן לסנן לפי שנה ולהוריד את המידע לקובץ אקסל או לגשת אליו דרך API.
                                    "
                                    />
                                </div>
                            )}
                        </div>
                    </h2>

                    <div className="flex flex-wrap items-center gap-5">
                        <span className="text-sm text-slate-600 mt-6">סינון לפי:</span>
                        <div className="relative w-[113px]">
                            <label htmlFor="" className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-600'>פרק זמן:</span>
                                <select
                                    value={selectedYear || ""}
                                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                    style={{ fontFamily: 'Heebo, sans-serif' }}
                                >
                                    <option value="">חודש</option>
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
                    <Link href="/api#response-capacity-by-size">
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

            {/* Chart */}
            <div className="w-full h-[420px]">
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
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
                            <CartesianGrid vertical={false} strokeDasharray="6 6" />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.toLocaleString()}
                                label={{
                                    value: activeTab === "supply" ? "הספק תשובות [KW]" : "מספר מתקנים",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip activeTab={activeTab} />} />
                            {SIZE_BRACKETS.map((bracket, index) => (
                                activeSeries[bracket.key] && (
                                    <Bar
                                        key={bracket.key}
                                        dataKey={bracket.key}
                                        stackId="a"
                                        fill={bracket.color}
                                        barSize={barSize}
                                        opacity={opacityForKey(bracket.key)}
                                    >
                                        {index === SIZE_BRACKETS.length - 1 && (
                                            <LabelList
                                                dataKey="total"
                                                position="top"
                                                formatter={(value: number) => {
                                                    if (value === undefined || value === null || isNaN(value)) return '';
                                                    return Math.round(value).toLocaleString();
                                                }}
                                                style={{ fill: "#707585", fontWeight: 400, fontSize: 14, fontFamily: 'Heebo' }}
                                            />
                                        )}
                                    </Bar>
                                )
                            ))}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend */}
            <CustomLegend
                activeSeries={activeSeries}
                setActiveSeries={setActiveSeries}
                hoveredSeries={hoveredSeries}
                setHoveredSeries={setHoveredSeries}
            />

            {/* Tabs */}
            <div className="flex gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] mb-4 w-fit ml-auto -mt-10" style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}>
                <button
                    onClick={() => setActiveTab("supply")}
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "supply" ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                >
                    הספק מתקנים
                </button>
                <button
                    onClick={() => setActiveTab("facilities")}
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "facilities" ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                >
                    מספר מתקנים
                </button>
            </div>
        </div>
    );
}
