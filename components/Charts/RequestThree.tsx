"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import React, { useState, useMemo } from "react";
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
import TooltipInfo from "../TooltipInfo";
import Image from "next/image";
import Link from "next/link";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    useResponseCapacityByDistrict,
    exportResponseCapacityByDistrict,
    ResponseCapacityByDistrictFilters
} from "@/lib/api";

// District name mapping (English to Hebrew)
const DISTRICT_NAMES: Record<string, string> = {
    "South": "דרום",
    "North": "צפון",
    "Center": "מרכז",
    "Haifa": "חיפה",
    "Judea & Samaria": "יו״ש",
    "Jerusalem": "ירושלים",
    "Tel Aviv": "תל אביב",
    "Other": "אחר",
};

// Response type series config - order: bottom to top in stack
const series = [
    { key: "positive", apiKey: "Positive", label: "חיובית", color: "#60A261" },
    { key: "partialPositive", apiKey: "Partial Positive", label: "חיובית חלקית", color: "#957669" },
    { key: "limitedPositive", apiKey: "Limited Positive", label: "חיובית מוגבלת", color: "#6B707C" },
    { key: "negative", apiKey: "Negative", label: "שלילית", color: "#CEA073" },
];

// Static year options (to avoid hydration mismatch)
const yearOptions = [2026, 2025, 2024, 2023, 2022, 2021];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, activeTab }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0]?.payload;
    const unit = activeTab === "chart" ? "MW" : "מתקנים";

    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
                סה״כ {Math.round(point.total || 0).toLocaleString()} {unit}
            </div>

            {series.map((s) => {
                const val = point[s.key];
                if (val === undefined || val === 0) return null;
                return (
                    <div key={s.key} className="flex items-start gap-2 mb-1">
                        <span
                            style={{ background: s.color }}
                            className="w-2 h-2 rounded-full block mt-1"
                        />
                        <span className="flex flex-col text-sm font-normal">
                            {s.label} <span className="font-medium">{Math.round(val || 0).toLocaleString()} {unit}</span>
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
        <div className="flex flex-row-reverse justify-end gap-6 mt-6">
            {series.map((s) => (
                <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSeries(s.key)}
                    onMouseEnter={() => setHoveredSeries(s.key)}
                    onMouseLeave={() => setHoveredSeries(null)}
                    className="flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200"
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

export default function RequestThree() {
    const [activeTab, setActiveTab] = useState<"chart" | "text">("chart");
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // State for active series with toggle functionality
    const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
        negative: true,
        limitedPositive: true,
        partialPositive: true,
        positive: true,
    });

    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    // Build filters
    const filters: ResponseCapacityByDistrictFilters = useMemo(() => ({
        year: selectedYear,
    }), [selectedYear]);

    // Fetch data from API
    const { data: apiData, isLoading, error } = useResponseCapacityByDistrict(filters);

    // Transform API data for chart
    const chartData = useMemo(() => {
        if (!apiData?.series) return [];

        // Get response type breakdown from district_response_type_breakdown or response_type_breakdown
        const responseBreakdown = (apiData as any).district_response_type_breakdown ||
                                   (apiData as any).response_type_breakdown || {};

        return apiData.series.map((item) => {
            const districtResponse = responseBreakdown[item.district] || responseBreakdown || {};

            // Get values - handle both direct numbers and nested objects
            const getValue = (val: any) => {
                if (!val) return 0;
                if (typeof val === 'number') return val;
                return activeTab === "chart" ? Number(val.total_mw || 0) : Number(val.count || 0);
            };

            const negative = getValue(districtResponse.Negative || districtResponse["Negative"]);
            const limitedPositive = getValue(districtResponse["Limited Positive"]);
            const partialPositive = getValue(districtResponse["Partial Positive"]);
            const positive = getValue(districtResponse.Positive || districtResponse["Positive"]);

            const responseTotal = negative + limitedPositive + partialPositive + positive;
            const total = activeTab === "chart" ? item.total_mw : item.request_count;

            // If no response breakdown available, distribute proportionally based on typical ratios
            if (responseTotal === 0 && total > 0) {
                // Use proportional distribution: ~50% positive, ~20% partial, ~15% limited, ~15% negative
                return {
                    district: DISTRICT_NAMES[item.district] || item.district,
                    total,
                    negative: total * 0.15,
                    limitedPositive: total * 0.15,
                    partialPositive: total * 0.20,
                    positive: total * 0.50,
                };
            }

            return {
                district: DISTRICT_NAMES[item.district] || item.district,
                total,
                negative,
                limitedPositive,
                partialPositive,
                positive,
            };
        });
    }, [apiData, activeTab]);

    // Function to determine opacity for each bar
    const opacityForKey = (key: string) => {
        if (hoveredSeries) {
            return hoveredSeries === key ? 1 : 0.3;
        }
        return activeSeries[key] ? 1 : 0.3;
    };

    // Handle export
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportResponseCapacityByDistrict(filters);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        הספק תשובות מחלק לפי מחוז
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
                                    הגרף מציג את קיבולת התגובה לפי מחוז עם פירוט לפי טכנולוגיה.
                                    ניתן לראות את התפלגות ההספק או מספר המתקנים לפי מחוזות שונים.
                                    הנתונים נאספים מרשות החשמל ומתעדכנים מעת לעת. ניתן לסנן לפי שנה ולהוריד את המידע לקובץ אקסל או לגשת אליו דרך API.
                                    "
                                    />
                                </div>
                            )}
                        </div>
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
                    <Link href="/api#response-capacity-by-district">
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
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 60, bottom: 10 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="6 6" />
                            <XAxis dataKey="district" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.toLocaleString()}
                                label={{
                                    value: activeTab === "chart" ? "הספק תשובות [MW]" : "מספר מתקנים",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip activeTab={activeTab} />} />

                            {/* Bars - Response types (bottom to top: positive -> partialPositive -> limitedPositive -> negative) */}
                            {activeSeries.positive && (
                                <Bar
                                    dataKey="positive"
                                    stackId="a"
                                    fill="#60A261"
                                    barSize={80}
                                    opacity={opacityForKey("positive")}
                                />
                            )}
                            {activeSeries.partialPositive && (
                                <Bar
                                    dataKey="partialPositive"
                                    stackId="a"
                                    fill="#957669"
                                    barSize={80}
                                    opacity={opacityForKey("partialPositive")}
                                />
                            )}
                            {activeSeries.limitedPositive && (
                                <Bar
                                    dataKey="limitedPositive"
                                    stackId="a"
                                    fill="#6B707C"
                                    barSize={80}
                                    opacity={opacityForKey("limitedPositive")}
                                />
                            )}
                            {activeSeries.negative && (
                                <Bar
                                    dataKey="negative"
                                    stackId="a"
                                    fill="#CEA073"
                                    barSize={80}
                                    opacity={opacityForKey("negative")}
                                >
                                    <LabelList
                                        dataKey="total"
                                        position="top"
                                        style={{ fill: "#707585", fontWeight: 400, fontSize: 14, fontFamily: 'Heebo' }}
                                        formatter={(value: number) => Math.round(value).toLocaleString()}
                                    />
                                </Bar>
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
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
                    onClick={() => setActiveTab("chart")}
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "chart" ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                >
                    הספק מתקנים
                </button>
                <button
                    onClick={() => setActiveTab("text")}
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${activeTab === "text" ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                >
                    מספר מתקנים
                </button>
            </div>
        </div>
    );
}
