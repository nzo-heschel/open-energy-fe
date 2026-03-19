"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    CartesianGrid,
    LabelList,
} from "recharts";
import TooltipInfo from "../TooltipInfo";
import { ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import {
    useInstalledCapacityByFacilitySize,
    exportInstalledCapacityByFacilitySize,
    InstalledCapacityByFacilitySizeFilters
} from "@/lib/api";

// Size bracket configuration with colors and Hebrew labels (matching Figma)
// Order: bottom to top in stack (first item is at bottom)
const SIZE_BRACKETS = [
    { key: "xlarge", label: "גדול מאוד | +5001 KW", color: "#648AA3" },
    { key: "large", label: "גדול | 631-5000 KW", color: "#60A261" },
    { key: "medium", label: "בינוני | 201-630 KW", color: "#C4C95C" },
    { key: "small", label: "קטן | 0-200 KW", color: "#D8EB4D" },
];

// Year options
const yearOptions = [
    { value: "", label: "הכל" },
    { value: "2025", label: "2025" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
    { value: "2020", label: "2020" },
];

// Display mode options (הספק/מספר מתקנים)
const displayModeOptions = [
    { value: "capacity", label: "הספק מותקן" },
    { value: "count", label: "מספר מתקנים" },
];


// Filter Dropdown Component
const FilterDropdown = ({
    value,
    onChange,
    options,
    placeholder
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const displayText = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className="relative">
            <button
                type="button"
                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6 text-right flex items-center justify-between"
                style={{ fontFamily: 'Heebo, sans-serif' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{displayText}</span>
                <ChevronDown size={14} className={`transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-[#A1A1A1] rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ fontFamily: 'Heebo, sans-serif' }}>
                    <div className="p-2">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`w-full text-right p-2 text-sm hover:bg-gray-100 rounded ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom Tooltip Component - matching InstalledCapacityOne style
const CustomTooltip = ({ active, payload, label, displayMode }: any) => {
    if (!active || !payload || !payload.length) return null;

    const total = payload.reduce((sum: number, entry: any) => {
        const val = Number(entry.value) || 0;
        return sum + val;
    }, 0);
    const unit = displayMode === "count" ? "מתקנים" : "MW";

    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[160px] text-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">
                סה״כ {Math.round(total).toLocaleString()} {unit}
            </div>
            {payload.map((entry: any) => {
                const bracket = SIZE_BRACKETS.find(b => b.key === entry.dataKey);
                if (!bracket) return null;
                const val = Number(entry.value) || 0;
                return (
                    <div key={entry.dataKey} className="flex items-start gap-2 mb-1">
                        <span
                            style={{ background: entry.color }}
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

// Custom Legend Component
const CustomLegend = ({
    hoveredKey,
    onMouseEnter,
    onMouseLeave,
    onClick,
    hiddenKeys
}: {
    hoveredKey: string | null;
    onMouseEnter: (dataKey: string) => void;
    onMouseLeave: () => void;
    onClick: (dataKey: string) => void;
    hiddenKeys: Set<string>;
}) => {
    return (
        <div className="flex flex-row-reverse flex-wrap justify-end gap-4 mt-4" style={{ fontFamily: 'Heebo, sans-serif' }}>
            {SIZE_BRACKETS.map((bracket) => {
                const isHidden = hiddenKeys.has(bracket.key);
                const isHovered = hoveredKey === bracket.key;
                const isFaded = hoveredKey && !isHovered;

                return (
                    <button
                        key={bracket.key}
                        type="button"
                        className={`flex items-center gap-2 text-sm cursor-pointer select-none transition-opacity duration-200 ${isHidden ? 'opacity-40' : ''} ${isFaded ? 'opacity-30' : ''}`}
                        onMouseEnter={() => onMouseEnter(bracket.key)}
                        onMouseLeave={onMouseLeave}
                        onClick={() => onClick(bracket.key)}
                    >
                        <span
                            style={{
                                background: bracket.color,
                                opacity: isHidden ? 0.3 : 1,
                            }}
                            className="w-2 h-2 rounded-full block transition-opacity duration-200"
                        />
                        <span className={`transition-all duration-200 ${isHidden ? "text-gray-400" : "text-gray-800"}`}>
                            {bracket.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

const InstalledCapacityTwo: React.FC = () => {
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
    const [showTooltip, setShowTooltip] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [displayMode, setDisplayMode] = useState<string>("capacity");
    const [isExporting, setIsExporting] = useState(false);

    // Build filters
    const filters: InstalledCapacityByFacilitySizeFilters = useMemo(() => ({
        year: selectedYear ? parseInt(selectedYear) : undefined,
    }), [selectedYear]);

    // Fetch data from API
    const { data: apiData, isLoading, error } = useInstalledCapacityByFacilitySize(filters);

    // Transform API data for chart
    const chartData = useMemo(() => {
        if (!apiData?.series) return [];

        return apiData.series.map((item) => {
            const brackets = item.size_brackets || {};

            // Helper to get value based on display mode
            const getValue = (bracket: any) => {
                if (!bracket) return 0;
                return displayMode === "count"
                    ? Number(bracket.facility_count || 0)
                    : Number(bracket.total_mw || 0);
            };

            // Map API size brackets to our simplified categories based on Figma
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
                year: item.year,
                small: isNaN(small) ? 0 : small,
                medium: isNaN(medium) ? 0 : medium,
                large: isNaN(large) ? 0 : large,
                xlarge: isNaN(xlarge) ? 0 : xlarge,
                total: isNaN(total) ? 0 : total,
            };
        });
    }, [apiData, displayMode]);

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

    // Handle export
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportInstalledCapacityByFacilitySize(filters);
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
                        הספק מתקנים שחוברו על ציר הזמן, לפי גודל מתקן
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
                                        הגרף מציג את ההספק המותקן של מתקנים שחוברו לרשת החשמל לאורך השנים, מחולק לפי גודל מתקן.
                                        ניתן לראות את התפלגות ההספק לפי טווחי גודל שונים (מקטנים ביותר ועד גדולים ביותר).
                                        הנתונים נאספים מרשות החשמל ומתעדכנים מעת לעת. ניתן לסנן לפי מחוז ולהוריד את המידע לקובץ אקסל או לגשת אליו דרך API.
                                        "
                                    />
                                </div>
                            )}
                        </div>
                    </h2>
                    <div className="flex flex-wrap items-center gap-5">
                        <span className="text-sm text-slate-600 mt-6">סינון לפי:</span>

                        <div className="relative w-[150px]">
                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-600'>שנה</span>
                                <FilterDropdown
                                    value={selectedYear}
                                    onChange={setSelectedYear}
                                    options={yearOptions}
                                    placeholder="הכל"
                                />
                            </label>
                        </div>
                        <div className="relative w-[180px]">
                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-600'>הספק/מספר מתקנים</span>
                                <FilterDropdown
                                    value={displayMode}
                                    onChange={setDisplayMode}
                                    options={displayModeOptions}
                                    placeholder="הספק מותקן"
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex items-start md:gap-4 gap-2">
                    <Link href="/api#installed-capacity-by-facility-size">
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
                            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="6 6" />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.toLocaleString()}
                                label={{
                                    value: displayMode === "count" ? "מספר מתקנים" : "הספק מותקן [MW]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip displayMode={displayMode} />} />

                            {/* Bars with dynamic opacity based on hover and hidden state */}
                            {SIZE_BRACKETS.map((bracket, index) => (
                                !hiddenKeys.has(bracket.key) && (
                                    <Bar
                                        key={bracket.key}
                                        dataKey={bracket.key}
                                        stackId="a"
                                        fill={bracket.color}
                                        barSize={28}
                                        opacity={getBarOpacity(bracket.key)}
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
            {!isLoading && !error && chartData.length > 0 && (
                <CustomLegend
                    hoveredKey={hoveredKey}
                    onMouseEnter={handleLegendMouseEnter}
                    onMouseLeave={handleLegendMouseLeave}
                    onClick={handleLegendClick}
                    hiddenKeys={hiddenKeys}
                />
            )}
        </div>
    );
};

export default InstalledCapacityTwo;
