"use client";

import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
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

// Data from the uploaded district chart
type DataPoint = {
    district: string;
    total: number;
    positive: number;
    partialPositive: number;
    limitedPositive: number;
    negative: number;
};

// Data for different years
const dataByYear = {
    "2025": [
        { district: "דרום", total: 6441, positive: 1800, partialPositive: 1600, limitedPositive: 1000, negative: 2041 },
        { district: "צפון", total: 5864, positive: 1750, partialPositive: 1500, limitedPositive: 950, negative: 1664 },
        { district: "מרכז", total: 1660, positive: 600, partialPositive: 450, limitedPositive: 200, negative: 410 },
        { district: "חיפה", total: 684, positive: 320, partialPositive: 147, limitedPositive: 80, negative: 87 },
        { district: "יו״ש", total: 623, positive: 300, partialPositive: 140, limitedPositive: 70, negative: 113 },
        { district: "ירושלים", total: 298, positive: 150, partialPositive: 80, limitedPositive: 30, negative: 38 },
        { district: "תל אביב", total: 125, positive: 60, partialPositive: 30, limitedPositive: 15, negative: 20 },
    ],
    "2024": [
        { district: "דרום", total: 5800, positive: 1600, partialPositive: 1400, limitedPositive: 900, negative: 1900 },
        { district: "צפון", total: 5200, positive: 1500, partialPositive: 1300, limitedPositive: 800, negative: 1600 },
        { district: "מרכז", total: 1500, positive: 500, partialPositive: 400, limitedPositive: 180, negative: 420 },
        { district: "חיפה", total: 600, positive: 280, partialPositive: 130, limitedPositive: 70, negative: 120 },
        { district: "יו״ש", total: 550, positive: 250, partialPositive: 120, limitedPositive: 60, negative: 120 },
        { district: "ירושלים", total: 250, positive: 120, partialPositive: 70, limitedPositive: 25, negative: 35 },
        { district: "תל אביב", total: 100, positive: 45, partialPositive: 25, limitedPositive: 12, negative: 18 },
    ],
    "2023": [
        { district: "דרום", total: 5000, positive: 1400, partialPositive: 1200, limitedPositive: 800, negative: 1600 },
        { district: "צפון", total: 4500, positive: 1300, partialPositive: 1100, limitedPositive: 700, negative: 1400 },
        { district: "מרכז", total: 1300, positive: 450, partialPositive: 350, limitedPositive: 150, negative: 350 },
        { district: "חיפה", total: 500, positive: 230, partialPositive: 110, limitedPositive: 60, negative: 100 },
        { district: "יו״ש", total: 480, positive: 220, partialPositive: 100, limitedPositive: 50, negative: 110 },
        { district: "ירושלים", total: 200, positive: 100, partialPositive: 50, limitedPositive: 20, negative: 30 },
        { district: "תל אביב", total: 80, positive: 35, partialPositive: 20, limitedPositive: 10, negative: 15 },
    ]
};

// Data for facilities count (number of facilities instead of capacity)
const facilitiesDataByYear = {
    "2025": [
        { district: "דרום", total: 156, positive: 44, partialPositive: 39, limitedPositive: 24, negative: 49 },
        { district: "צפון", total: 142, positive: 42, partialPositive: 36, limitedPositive: 23, negative: 41 },
        { district: "מרכז", total: 40, positive: 15, partialPositive: 11, limitedPositive: 5, negative: 9 },
        { district: "חיפה", total: 17, positive: 8, partialPositive: 4, limitedPositive: 2, negative: 3 },
        { district: "יו״ש", total: 15, positive: 7, partialPositive: 3, limitedPositive: 2, negative: 3 },
        { district: "ירושלים", total: 7, positive: 4, partialPositive: 2, limitedPositive: 1, negative: 1 },
        { district: "תל אביב", total: 3, positive: 1, partialPositive: 1, limitedPositive: 0, negative: 1 },
    ],
    "2024": [
        { district: "דרום", total: 140, positive: 39, partialPositive: 34, limitedPositive: 22, negative: 45 },
        { district: "צפון", total: 126, positive: 36, partialPositive: 31, limitedPositive: 19, negative: 40 },
        { district: "מרכז", total: 36, positive: 12, partialPositive: 10, limitedPositive: 4, negative: 10 },
        { district: "חיפה", total: 15, positive: 7, partialPositive: 3, limitedPositive: 2, negative: 3 },
        { district: "יו״ש", total: 13, positive: 6, partialPositive: 3, limitedPositive: 1, negative: 3 },
        { district: "ירושלים", total: 6, positive: 3, partialPositive: 2, limitedPositive: 0, negative: 1 },
        { district: "תל אביב", total: 2, positive: 1, partialPositive: 1, limitedPositive: 0, negative: 0 },
    ],
    "2023": [
        { district: "דרום", total: 121, positive: 34, partialPositive: 29, limitedPositive: 19, negative: 39 },
        { district: "צפון", total: 109, positive: 31, partialPositive: 27, limitedPositive: 17, negative: 34 },
        { district: "מרכז", total: 32, positive: 11, partialPositive: 8, limitedPositive: 4, negative: 9 },
        { district: "חיפה", total: 12, positive: 6, partialPositive: 3, limitedPositive: 1, negative: 2 },
        { district: "יו״ש", total: 12, positive: 5, partialPositive: 2, limitedPositive: 1, negative: 4 },
        { district: "ירושלים", total: 5, positive: 2, partialPositive: 1, limitedPositive: 0, negative: 2 },
        { district: "תל אביב", total: 2, positive: 1, partialPositive: 0, limitedPositive: 0, negative: 1 },
    ]
};

// Legend series config
const series = [
    { key: "positive", label: "חיובית", color: "#60A261" },
    { key: "partialPositive", label: "חיובית חלקית", color: "#957669" },
    { key: "limitedPositive", label: "חיובית מוגבלת", color: "#6B707C" },
    { key: "negative", label: "שלילית", color: "#CEA073" },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, activeTab }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0]?.payload;

    const unit = activeTab === "chart" ? "MW" : "מתקנים";

    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
                סה״כ {point.total.toLocaleString()} {activeTab === "chart" ? "MW" : ""}
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
                            <span className="font-medium flex items-center gap-1">
                                {activeTab === "chart" && <span>MW</span>} {val.toLocaleString()}
                                {activeTab === "text" && <span>מתקנים</span>}
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

export default function RequestThree() {
    const [activeTab, setActiveTab] = useState<"chart" | "text">("chart");
    const [selectedYear, setSelectedYear] = useState<string>("2025");
    const [showTooltip, setShowTooltip] = useState(false);

    // New state for active series with toggle functionality
    const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
        positive: true,
        partialPositive: true,
        limitedPositive: true,
        negative: true
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

    // Get data based on selected year and tab
    const chartData = activeTab === "chart"
        ? dataByYear[selectedYear as keyof typeof dataByYear]
        : facilitiesDataByYear[selectedYear as keyof typeof facilitiesDataByYear];

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
                                <span className='text-sm text-slate-600'>שנה:</span>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                >
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                </select>
                                {/* Custom dropdown arrow */}
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full md:h-[500px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 60, bottom: 10 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="6 6" />
                        <XAxis dataKey="district" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} label={{
                            value: "הספק תשובות [MW]",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: 'middle' }
                        }} />
                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} />

                        {/* Bars */}
                        {activeSeries.positive && (
                            <Bar
                                dataKey="positive"
                                stackId="a"
                                fill={series[0].color}
                                barSize={104}
                                opacity={opacityForKey("positive")}
                            />
                        )}
                        {activeSeries.partialPositive && (
                            <Bar
                                dataKey="partialPositive"
                                stackId="a"
                                fill={series[1].color}
                                barSize={104}
                                opacity={opacityForKey("partialPositive")}
                            />
                        )}
                        {activeSeries.limitedPositive && (
                            <Bar
                                dataKey="limitedPositive"
                                stackId="a"
                                fill={series[2].color}
                                barSize={104}
                                opacity={opacityForKey("limitedPositive")}
                            />
                        )}
                        {activeSeries.negative && (
                            <Bar
                                dataKey="negative"
                                stackId="a"
                                fill={series[3].color}
                                barSize={104}
                                opacity={opacityForKey("negative")}
                            >
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    style={{ fill: "#707585", fontWeight: 500 }}
                                    formatter={(value: number) => value.toLocaleString()}
                                />
                            </Bar>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
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