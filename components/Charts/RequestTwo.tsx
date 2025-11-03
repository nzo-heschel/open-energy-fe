"use client";

import React, { useState } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    ComposedChart,
} from "recharts";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import TooltipInfo from "../TooltipInfo";

type DataPoint = {
    date: string;
    small: number;
    medium: number;
    large: number;
    veryLarge: number;
};

// ✅ Original monthly data
const monthlySupplyData: DataPoint[] = [
    { date: "1/24", small: 500, medium: 100, large: 300, veryLarge: 1700 },
    { date: "2/24", small: 600, medium: 200, large: 400, veryLarge: 2100 },
    { date: "3/24", small: 700, medium: 200, large: 500, veryLarge: 2500 },
    { date: "4/24", small: 500, medium: 100, large: 300, veryLarge: 1900 },
    { date: "5/24", small: 700, medium: 300, large: 500, veryLarge: 1700 },
    { date: "6/24", small: 800, medium: 300, large: 600, veryLarge: 1700 },
    { date: "7/24", small: 900, medium: 400, large: 700, veryLarge: 1900 },
    { date: "8/24", small: 1000, medium: 500, large: 800, veryLarge: 2800 },
    { date: "9/24", small: 1100, medium: 600, large: 1000, veryLarge: 3400 },
    { date: "10/24", small: 1200, medium: 700, large: 1100, veryLarge: 3700 },
    { date: "11/24", small: 1200, medium: 650, large: 1100, veryLarge: 3750 },
    { date: "12/24", small: 1300, medium: 700, large: 1200, veryLarge: 4000 },
    { date: "1/25", small: 1400, medium: 800, large: 1200, veryLarge: 5055 },
];

const monthlyFacilitiesData: DataPoint[] = [
    { date: "1/24", small: 20, medium: 10, large: 5, veryLarge: 2 },
    { date: "2/24", small: 25, medium: 12, large: 6, veryLarge: 3 },
    { date: "3/24", small: 28, medium: 13, large: 7, veryLarge: 4 },
    { date: "4/24", small: 22, medium: 11, large: 6, veryLarge: 3 },
    { date: "5/24", small: 30, medium: 14, large: 8, veryLarge: 5 },
    { date: "6/24", small: 32, medium: 16, large: 9, veryLarge: 6 },
    { date: "7/24", small: 35, medium: 18, large: 10, veryLarge: 6 },
    { date: "8/24", small: 36, medium: 20, large: 11, veryLarge: 7 },
    { date: "9/24", small: 40, medium: 22, large: 12, veryLarge: 8 },
    { date: "10/24", small: 42, medium: 23, large: 13, veryLarge: 9 },
    { date: "11/24", small: 44, medium: 25, large: 14, veryLarge: 9 },
    { date: "12/24", small: 46, medium: 26, large: 15, veryLarge: 10 },
    { date: "1/25", small: 50, medium: 28, large: 16, veryLarge: 11 },
];

// ✅ Weekly data (aggregated from monthly for demonstration)
const weeklySupplyData: DataPoint[] = [
    { date: "W1", small: 150, medium: 30, large: 90, veryLarge: 510 },
    { date: "W2", small: 180, medium: 60, large: 120, veryLarge: 630 },
    { date: "W3", small: 210, medium: 60, large: 150, veryLarge: 750 },
    { date: "W4", small: 150, medium: 30, large: 90, veryLarge: 570 },
];

const weeklyFacilitiesData: DataPoint[] = [
    { date: "W1", small: 6, medium: 3, large: 1.5, veryLarge: 0.6 },
    { date: "W2", small: 7.5, medium: 3.6, large: 1.8, veryLarge: 0.9 },
    { date: "W3", small: 8.4, medium: 3.9, large: 2.1, veryLarge: 1.2 },
    { date: "W4", small: 6.6, medium: 3.3, large: 1.8, veryLarge: 0.9 },
];

// ✅ Daily data (further aggregated)
const dailySupplyData: DataPoint[] = [
    { date: "Mon", small: 50, medium: 10, large: 30, veryLarge: 170 },
    { date: "Tue", small: 60, medium: 20, large: 40, veryLarge: 210 },
    { date: "Wed", small: 70, medium: 20, large: 50, veryLarge: 250 },
    { date: "Thu", small: 50, medium: 10, large: 30, veryLarge: 190 },
    { date: "Fri", small: 40, medium: 15, large: 25, veryLarge: 160 },
];

const dailyFacilitiesData: DataPoint[] = [
    { date: "Mon", small: 2, medium: 1, large: 0.5, veryLarge: 0.2 },
    { date: "Tue", small: 2.5, medium: 1.2, large: 0.6, veryLarge: 0.3 },
    { date: "Wed", small: 2.8, medium: 1.3, large: 0.7, veryLarge: 0.4 },
    { date: "Thu", small: 2.2, medium: 1.1, large: 0.6, veryLarge: 0.3 },
    { date: "Fri", small: 2.0, medium: 0.9, large: 0.5, veryLarge: 0.2 },
];

// Series config with colors and labels
const series = [
    { key: "small", label: "גדול מאוד | +5001 KW", color: "#648AA3" },
    { key: "medium", label: "גדול | 631-5000 KW", color: "#60A261" },
    { key: "large", label: "בינוני | 201-630 KW", color: "#957669" },
    { key: "veryLarge", label: "קטן | 0-200 KW", color: "#CEA073" },
];

type TimePeriod = "daily" | "weekly" | "monthly";

// Data structure by time period and type
const dataByPeriod = {
    monthly: {
        supply: monthlySupplyData,
        facilities: monthlyFacilitiesData,
    },
    weekly: {
        supply: weeklySupplyData,
        facilities: weeklyFacilitiesData,
    },
    daily: {
        supply: dailySupplyData,
        facilities: dailyFacilitiesData,
    },
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);

    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
                סה״כ {total.toLocaleString()} KW
            </div>

            {series.map((s) => {
                const entry = payload.find((p: any) => p.dataKey === s.key);
                if (!entry) return null;

                return (
                    <div key={s.key} className="flex items-center gap-3 mb-1">
                        <span
                            style={{ background: s.color }}
                            className="w-2 h-2 rounded-full block"
                        />
                        <div className="flex flex-col text-sm text-gray-600">
                            <span>{s.label.split(' | ')[0]}</span>
                            <span className="font-medium flex items-center gap-1">
                                <span>KW</span>{entry.value.toLocaleString()}
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
                <div
                    key={s.key}
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
                </div>
            ))}
        </div>
    );
};

export default function RequestTwo() {
    const [activeTab, setActiveTab] = useState<"supply" | "facilities">("supply");
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
    const [showTooltip, setShowTooltip] = useState(false);

    // New state for active series with toggle functionality
    const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
        small: true,
        medium: true,
        large: true,
        veryLarge: true
    });

    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    // Get chart data based on active tab and time period
    const chartData = dataByPeriod[timePeriod][activeTab];

    // Function to determine opacity for each bar
    const opacityForKey = (key: string) => {
        // If a series is hovered, highlight only that series
        if (hoveredSeries) {
            return hoveredSeries === key ? 1 : 0.3;
        }
        // If no series is hovered, show based on active state
        return activeSeries[key] ? 1 : 0.3;
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
                                    הגרף מציג את כמות החשמל שיוצר מאנרגיות מתחדשות (שמש, רוח ואחרים) לאורך שנה נבחרת, לפי חודשים.
                                    ניתן ללמוד ממנו איך משתנה ייצור החשמל מאנרגיות מתחדשות לאורך השנה, ימים, או חודשים, ומה התרומה של כל סוג טכנולוגיה (רוח, סולארי, אחר) בכל חודש.
                                    הנתונים נאספים ממערכת נוגה ומתעדכנים מעת לעת. ניתן לסנן לפי סוג טכנולוגיה ושנה, יום או חודש, ולהוריד את המידע לקובץ אקסל או לגשת אליו דרך API.
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
                                <span className='text-sm text-slate-600'>תקופה:</span>
                                <select
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                                    className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                >
                                    <option value="daily">יומי</option>
                                    <option value="weekly">שבועי</option>
                                    <option value="monthly">חודשי</option>
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
                    <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                    <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
                        <CartesianGrid vertical={false} strokeDasharray="6 6" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} label={{
                            value: "הספק תשובות [KW]",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: 'middle' }
                        }} />
                        <Tooltip content={<CustomTooltip />} />
                        {activeSeries.small && (
                            <Bar
                                dataKey="small"
                                stackId="a"
                                fill={series[0].color}
                                barSize={28}
                                opacity={opacityForKey("small")}
                            />
                        )}
                        {activeSeries.medium && (
                            <Bar
                                dataKey="medium"
                                stackId="a"
                                fill={series[1].color}
                                barSize={28}
                                opacity={opacityForKey("medium")}
                            />
                        )}
                        {activeSeries.large && (
                            <Bar
                                dataKey="large"
                                stackId="a"
                                fill={series[2].color}
                                barSize={28}
                                opacity={opacityForKey("large")}
                            />
                        )}
                        {activeSeries.veryLarge && (
                            <Bar
                                dataKey="veryLarge"
                                stackId="a"
                                fill={series[3].color}
                                barSize={28}
                                opacity={opacityForKey("veryLarge")}
                            >
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    style={{ fill: "#707585", fontWeight: 500 }}
                                />
                            </Bar>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
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