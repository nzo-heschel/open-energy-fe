"use client";

import Image from "next/image";
import React, { useState } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import TooltipInfo from "../TooltipInfo";

interface DataItem {
    year: number;
    small: number;      // קטן
    medium: number;     // בינוני
    large: number;      // גדול
    veryLarge: number;  // גדול מאוד
}

const data: DataItem[] = [
    { year: 2009, small: 300, medium: 200, large: 500, veryLarge: 500 },
    { year: 2010, small: 400, medium: 300, large: 600, veryLarge: 600 },
    { year: 2011, small: 500, medium: 400, large: 700, veryLarge: 600 },
    { year: 2012, small: 550, medium: 420, large: 750, veryLarge: 680 },
    { year: 2013, small: 769, medium: 537, large: 637, veryLarge: 1037 },
    { year: 2014, small: 800, medium: 600, large: 800, veryLarge: 800 },
    { year: 2015, small: 820, medium: 650, large: 900, veryLarge: 930 },
    { year: 2016, small: 900, medium: 700, large: 950, veryLarge: 950 },
    { year: 2017, small: 1100, medium: 800, large: 1000, veryLarge: 1000 },
    { year: 2018, small: 1400, medium: 1200, large: 1200, veryLarge: 1300 },
    { year: 2019, small: 1600, medium: 1400, large: 1500, veryLarge: 1600 },
    { year: 2020, small: 1700, medium: 1500, large: 1600, veryLarge: 1800 },
    { year: 2021, small: 1800, medium: 1600, large: 1700, veryLarge: 1900 },
    { year: 2022, small: 2000, medium: 1800, large: 1700, veryLarge: 2200 },
    { year: 2023, small: 2100, medium: 1900, large: 1800, veryLarge: 2300 },
    { year: 2024, small: 2200, medium: 2000, large: 1900, veryLarge: 2400 },
];

const COLORS: Record<string, string> = {
    small: "#648AA3",     // קטן
    medium: "#60A261",    // בינוני
    large: "#C4C95C",     // גדול
    veryLarge: "#98C74E", // גדול מאוד
};

const LABELS: Record<string, string> = {
    small: "קטן",
    medium: "בינוני",
    large: "גדול",
    veryLarge: "גדול מאוד"
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
        return (
            <div className="bg-white min-w-[140px] shadow-lg rounded-lg p-3 text-sm border border-gray-200">
                <p className="font-normal text-sm text-[#59687D]">{label}</p>
                <p className="text-[#59687D] text-base font-medium mb-1">סה״כ {total.toLocaleString()}</p>
                <div className="my-1 h-[1px] bg-[#707585]" />
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-start gap-2 mt-1">
                        <span
                            className="inline-block w-2 h-2 rounded-full mt-1"
                            style={{ backgroundColor: entry.color }}
                        />
                        <div className="flex flex-col">
                            <span className="text-[#484C56] font-normal text-sm">
                                {entry.name}
                            </span>
                            <span className="text-[#484C56] font-medium flex items-center text-base gap-1">
                                <span>KW</span>{entry.value.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Custom Legend Component
const CustomLegend = ({ payload, hoveredKey, onMouseEnter, onMouseLeave, onClick }: any) => {
    if (!payload) return null;

    return (
        <div className="flex flex-row-reverse justify-end flex-wrap gap-2 mt-4 px-4">
            {payload.map((entry: any, index: number) => {
                const isActive = hoveredKey === null || hoveredKey === entry.dataKey;
                const isHovered = hoveredKey === entry.dataKey;

                return (
                    <div
                        key={`legend-${index}`}
                        className={`flex items-center gap-2 rounded-lg cursor-pointer transition-all duration-200 ${isHovered ? 'bg-transparent' : ''
                            } ${!isActive ? 'opacity-30' : ''}`}
                        onMouseEnter={() => onMouseEnter(entry.dataKey)}
                        onMouseLeave={onMouseLeave}
                        onClick={() => onClick(entry.dataKey)}
                    >
                        <div
                            className="w-2 h-2 rounded"
                            style={{
                                backgroundColor: entry.color,
                            }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                            {entry.value}
                        </span>
                        {/* Optional: Show total for this category across all years */}
                        <span className="md:text-sm text-xs text-gray-500 ml-1">
                            ({data.reduce((sum, item) => sum + (item as any)[entry.dataKey], 0).toLocaleString()} KW)
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const InstalledCapacityTwo: React.FC = () => {
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
    const [showTooltip, setShowTooltip] = useState(false);


    const handleLegendMouseEnter = (dataKey: string) => {
        setHoveredKey(dataKey);
    };

    const handleLegendMouseLeave = () => {
        setHoveredKey(null);
    };

    const handleLegendClick = (dataKey: string) => {
        const newHiddenKeys = new Set(hiddenKeys);
        if (newHiddenKeys.has(dataKey)) {
            newHiddenKeys.delete(dataKey);
        } else {
            newHiddenKeys.add(dataKey);
        }
        setHiddenKeys(newHiddenKeys);
    };

    const getBarOpacity = (dataKey: string) => {
        if (hiddenKeys.has(dataKey)) return 0;
        if (hoveredKey && hoveredKey !== dataKey) return 0.3;
        return 1;
    };

    // Filter data keys based on hidden state for legend
    const renderLegend = (props: any) => (
        <CustomLegend
            {...props}
            hoveredKey={hoveredKey}
            onMouseEnter={handleLegendMouseEnter}
            onMouseLeave={handleLegendMouseLeave}
            onClick={handleLegendClick}
        />
    );

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    הספק מתקנים שחוברו על ציר הזמן, לפי גודל מתקן
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
                <div className="flex items-start md:gap-4 gap-2">
                    <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                    <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                </div>
            </div>

            <div className="w-full md:h-[500px] h-[300px]">
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                        barGap={0}
                        barCategoryGap={0}
                    >
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#ddd' }}
                            tickLine={{ stroke: '#ddd' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#ddd' }}
                            tickLine={{ stroke: '#ddd' }}
                            tickFormatter={(value) => value.toLocaleString()}
                            label={{
                                value: "הספק מותקן [KW]",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: 'middle' }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />

                        {/* Bars with dynamic opacity based on hover and hidden state */}
                        {!hiddenKeys.has('small') && (
                            <Bar
                                dataKey="small"
                                stackId="a"
                                fill={COLORS.small}
                                barSize={28}
                                opacity={getBarOpacity('small')}
                                name={LABELS.small}
                            />
                        )}
                        {!hiddenKeys.has('medium') && (
                            <Bar
                                dataKey="medium"
                                stackId="a"
                                fill={COLORS.medium}
                                barSize={28}
                                opacity={getBarOpacity('medium')}
                                name={LABELS.medium}
                            />
                        )}
                        {!hiddenKeys.has('large') && (
                            <Bar
                                dataKey="large"
                                stackId="a"
                                fill={COLORS.large}
                                barSize={28}
                                opacity={getBarOpacity('large')}
                                name={LABELS.large}
                            />
                        )}
                        {!hiddenKeys.has('veryLarge') && (
                            <Bar
                                dataKey="veryLarge"
                                stackId="a"
                                fill={COLORS.veryLarge}
                                barSize={28}
                                opacity={getBarOpacity('veryLarge')}
                                name={LABELS.veryLarge}
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default InstalledCapacityTwo;