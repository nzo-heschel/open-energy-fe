"use client";

import React, { useState } from "react";
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
import { ChevronDown } from "lucide-react";
import Image from "next/image";

// Data extracted from your uploaded image - REORDERED to match legend from top to bottom
type DataPoint = {
    year: string;
    total: number;
    negative: number;
    limitedPositive: number;
    partialPositive: number;
    positive: number;
};

const yearlyData: DataPoint[] = [
    { year: "2021", total: 2881, negative: 375, limitedPositive: 537, partialPositive: 505, positive: 1464 },
    { year: "2022", total: 2571, negative: 271, limitedPositive: 600, partialPositive: 800, positive: 900 },
    { year: "2023", total: 2047, negative: 197, limitedPositive: 400, partialPositive: 750, positive: 700 },
    { year: "2024", total: 5423, negative: 923, limitedPositive: 1200, partialPositive: 1500, positive: 1800 },
    { year: "2025", total: 2364, negative: 314, limitedPositive: 500, partialPositive: 700, positive: 850 },
];

const quarterlyData: DataPoint[] = [
    { year: "Q1 2023", total: 1800, negative: 150, limitedPositive: 350, partialPositive: 600, positive: 700 },
    { year: "Q2 2023", total: 2200, negative: 200, limitedPositive: 450, partialPositive: 700, positive: 850 },
    { year: "Q3 2023", total: 2400, negative: 220, limitedPositive: 500, partialPositive: 750, positive: 930 },
    { year: "Q4 2023", total: 2047, negative: 197, limitedPositive: 400, partialPositive: 750, positive: 700 },
    { year: "Q1 2024", total: 2800, negative: 300, limitedPositive: 600, partialPositive: 800, positive: 1100 },
    { year: "Q2 2024", total: 3200, negative: 350, limitedPositive: 700, partialPositive: 900, positive: 1250 },
    { year: "Q3 2024", total: 3800, negative: 420, limitedPositive: 800, partialPositive: 1000, positive: 1580 },
    { year: "Q4 2024", total: 5423, negative: 923, limitedPositive: 1200, partialPositive: 1500, positive: 1800 },
];

// Legend series config - REVERSED ORDER to match bar stacking
const series = [
    { key: "negative", label: "שלילית", color: "#CEA073" },
    { key: "limitedPositive", label: "חיובית מוגבלת", color: "#6B707C" },
    { key: "partialPositive", label: "חיובית חלקית", color: "#957669" },
    { key: "positive", label: "חיובית", color: "#60A261" },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0]?.payload;

    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
                סה״כ {point.total.toLocaleString()}
            </div>

            {series.map((s) => {
                const val = point[s.key as keyof DataPoint];
                return (
                    <div key={s.key} className="flex items-center gap-3 mb-1">
                        <span
                            style={{ background: s.color }}
                            className="w-2 h-2 rounded-full block"
                        />
                        <div className="flex flex-col text-sm text-gray-600">
                            <span>{s.label}</span>
                            <span className="font-medium flex items-center gap-1"> <span>MW</span>{val}</span>
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
        <div className="flex justify-start gap-6 mt-6">
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

export default function RequestOne() {
    const [tab, setTab] = useState<"1" | "2">("1");
    const [timeView, setTimeView] = useState<"yearly" | "quarterly">("yearly");

    // New state for active series with toggle functionality
    const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
        negative: true,
        limitedPositive: true,
        partialPositive: true,
        positive: true
    });

    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    // Function to determine opacity for each bar
    const opacityForKey = (key: string) => {
        // If a series is hovered, highlight only that series
        if (hoveredSeries) {
            return hoveredSeries === key ? 1 : 0.3;
        }
        // If no series is hovered, show based on active state
        return activeSeries[key] ? 1 : 0.3;
    };

    // Get current data based on time view
    const currentData = timeView === "yearly" ? yearlyData : quarterlyData;

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        נתוני תשובות מחלק על ציר הזמן
                        {/* <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.5">
                                <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                            </g>
                        </svg> */}
                    </h2>

                    <div className="flex flex-wrap items-center gap-5">
                        <span className="text-sm text-slate-600 mt-6">מיון לפי:</span>
                        <div className="relative w-[113px]">
                            <label htmlFor="" className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-600'>פרק זמן:</span>
                                <select
                                    value={timeView}
                                    onChange={(e) => setTimeView(e.target.value as "yearly" | "quarterly")}
                                    className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                >
                                    <option value="yearly">שנתי</option>
                                    <option value="quarterly">רבעוני</option>
                                </select>
                                {/* Custom dropdown arrow */}
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                {/* <div className="flex items-start md:gap-4 gap-2">
                    <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                    <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                </div> */}
            </div>

            {/* Tab content */}
            {tab === "1" ? (
                <>
                    {/* Chart */}
                    <div className="w-full h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={currentData} margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
                                <CartesianGrid vertical={false} strokeDasharray="6 6" />
                                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} label={{
                                    value: "הספק תשובות [MW]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle' }
                                }} />
                                <Tooltip content={<CustomTooltip />} />
                                {activeSeries.negative && (
                                    <Bar
                                        dataKey="negative"
                                        stackId="a"
                                        fill={series[0].color}
                                        barSize={104}
                                        opacity={opacityForKey("negative")}
                                    />
                                )}
                                {activeSeries.limitedPositive && (
                                    <Bar
                                        dataKey="limitedPositive"
                                        stackId="a"
                                        fill={series[1].color}
                                        barSize={104}
                                        opacity={opacityForKey("limitedPositive")}
                                    />
                                )}
                                {activeSeries.partialPositive && (
                                    <Bar
                                        dataKey="partialPositive"
                                        stackId="a"
                                        fill={series[2].color}
                                        barSize={104}
                                        opacity={opacityForKey("partialPositive")}
                                    />
                                )}
                                {activeSeries.positive && (
                                    <Bar
                                        dataKey="positive"
                                        stackId="a"
                                        fill={series[3].color}
                                        barSize={104}
                                        opacity={opacityForKey("positive")}
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
                </>
            ) : (
                <>
                    {/* Chart */}
                    <div className="w-full h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={currentData} margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
                                <CartesianGrid vertical={false} strokeDasharray="6 6" />
                                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} label={{
                                    value: "הספק תשובות [MW]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle' }
                                }} />
                                <Tooltip content={<CustomTooltip />} />
                                {activeSeries.negative && (
                                    <Bar
                                        dataKey="negative"
                                        stackId="a"
                                        fill={series[0].color}
                                        barSize={104}
                                        opacity={opacityForKey("negative")}
                                    />
                                )}
                                {activeSeries.limitedPositive && (
                                    <Bar
                                        dataKey="limitedPositive"
                                        stackId="a"
                                        fill={series[1].color}
                                        barSize={104}
                                        opacity={opacityForKey("limitedPositive")}
                                    />
                                )}
                                {activeSeries.partialPositive && (
                                    <Bar
                                        dataKey="partialPositive"
                                        stackId="a"
                                        fill={series[2].color}
                                        barSize={104}
                                        opacity={opacityForKey("partialPositive")}
                                    />
                                )}
                                {activeSeries.positive && (
                                    <Bar
                                        dataKey="positive"
                                        stackId="a"
                                        fill={series[3].color}
                                        barSize={104}
                                        opacity={opacityForKey("positive")}
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
                </>
            )}

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