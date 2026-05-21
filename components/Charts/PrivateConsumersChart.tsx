"use client";

import React, { useState, useMemo } from "react";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
    LabelList,
} from "recharts";
import type { PrivateSupplierConnectedConsumersResponse } from "@/types/dto";

interface PrivateConsumersChartProps {
    data: PrivateSupplierConnectedConsumersResponse | null | undefined;
    selectedSector?: string;
}

// Hebrew labels mapping
const meterTypeLabels: Record<string, string> = {
    basic: 'מונה בסיסי',
    smart: 'מונה חכם',
};

// Colors for meter types - green for smart, yellow for basic
const meterTypeColors: Record<string, string> = {
    basic: '#F4D150', // Yellow
    smart: '#3A7C2F', // Green
};

const STACK_KEYS = ['basic', 'smart'] as const;

const sumVisibleTotal = (
    point: { basic: number; smart: number },
    hiddenBars: string[],
) => {
    let total = 0;
    if (!hiddenBars.includes('basic')) total += point.basic || 0;
    if (!hiddenBars.includes('smart')) total += point.smart || 0;
    return total;
};

const getTopVisibleStackKey = (hiddenBars: string[]) =>
    [...STACK_KEYS].reverse().find((key) => !hiddenBars.includes(key));

// Custom Tooltip
const CustomTooltip = ({
    active,
    payload,
    label,
    hiddenBars = [],
}: {
    active?: boolean;
    payload?: Array<{ dataKey?: string; value?: number; name?: string; color?: string }>;
    label?: string;
    hiddenBars?: string[];
}) => {
    if (active && payload && payload.length) {
        const visiblePayload = payload.filter(
            (entry) => entry.dataKey && !hiddenBars.includes(String(entry.dataKey)),
        );
        const total = visiblePayload.reduce(
            (acc, cur) => acc + (cur.value || 0),
            0,
        );
        return (
            <div className="bg-white p-2 rounded-[10px] shadow-md border-none" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="font-normal text-[#59687D] text-sm">{label}</p>
                <p className="text-[#59687D] font-medium text-base border-b border-[#59687D]">סה"כ {total.toLocaleString()}</p>
                {visiblePayload.map((entry, index: number) => (
                    <div
                        key={index}
                        className="flex gap-1 items-start pt-1"
                        style={{ color: entry.color }}
                    >
                        <div
                            className="w-2 h-2 rounded-full ml-2 mt-1"
                            style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="flex flex-col text-[#59687D] text-sm leading-4">
                            <span className="font-normal">{entry.name}</span>
                            <span className="font-semibold">{(entry.value || 0).toLocaleString()}</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const PrivateConsumersChart: React.FC<PrivateConsumersChartProps> = ({
    data,
    selectedSector
}) => {
    const [hiddenBars, setHiddenBars] = useState<string[]>([]);
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    // Transform data for chart - districts on X-axis, meter types as stacked bars
    const chartData = useMemo(() => {
        if (!data?.segments?.district) return [];

        const districtData = data.segments.district;

        // Get meter type proportions from the overall data
        const meterTypeData = data.segments.meter_type || [];
        const totalMeterConsumers = meterTypeData.reduce((acc, item) => acc + item.total_consumers, 0);

        // Calculate proportions for each meter type
        const meterProportions: Record<string, number> = {};
        meterTypeData.forEach(item => {
            meterProportions[item.meter_type] = totalMeterConsumers > 0
                ? item.total_consumers / totalMeterConsumers
                : 0;
        });

        // If sector filter is applied, adjust the totals based on sector proportions
        let sectorMultiplier = 1;
        if (selectedSector && data.segments.sector) {
            const sectorData = data.segments.sector;
            const totalSectorConsumers = sectorData.reduce((acc, item) => acc + item.total_consumers, 0);
            const selectedSectorData = sectorData.find(item => item.sector === selectedSector);
            if (selectedSectorData && totalSectorConsumers > 0) {
                sectorMultiplier = selectedSectorData.total_consumers / totalSectorConsumers;
            }
        }

        // Create chart data with districts on X-axis
        return districtData.map(item => {
            const adjustedTotal = item.total_consumers * sectorMultiplier;
            const smart = Math.round(adjustedTotal * (meterProportions['smart'] || 0));
            const basic = Math.round(adjustedTotal * (meterProportions['basic'] || 0));

            return {
                district: item.district.replaceAll('_', ' '), // Replace underscores with spaces for display
                smart,
                basic,
                total: smart + basic,
            };
        }).sort((a, b) => b.total - a.total); // Sort by total consumers descending
    }, [data, selectedSector]);

    const chartDisplayData = useMemo(
        () =>
            chartData.map((point) => ({
                ...point,
                visibleTotal: sumVisibleTotal(point, hiddenBars),
            })),
        [chartData, hiddenBars],
    );

    const topVisibleStackKey = getTopVisibleStackKey(hiddenBars);

    const handleLegendClick = (payload: any) => {
        const { dataKey } = payload;
        if (hiddenBars.includes(dataKey)) {
            setHiddenBars(hiddenBars.filter(key => key !== dataKey));
        } else {
            setHiddenBars([...hiddenBars, dataKey]);
        }
    };

    const handleLegendMouseEnter = (dataKey: string) => {
        setHoveredBar(dataKey);
    };

    const handleLegendMouseLeave = () => {
        setHoveredBar(null);
    };

    // Determine if a bar should be faded
    const getBarOpacity = (dataKey: string) => {
        if (!hoveredBar) return 1;
        if (hoveredBar === dataKey) return 1;
        return 0.3;
    };

    // Custom Legend component
    const CustomLegend = ({ payload, onClick, onMouseEnter, onMouseLeave }: any) => {
        if (!payload || payload.length === 0) return null;

        return (
            <div className="flex gap-3 flex-wrap justify-start">
                {payload.map((entry: any, index: number) => {
                    const isHidden = hiddenBars.includes(entry.dataKey);
                    const isHovered = hoveredBar === entry.dataKey;

                    return (
                        <div
                            key={`legend-${index}`}
                            className={`flex items-center cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${isHidden ? 'opacity-50' : ''
                                } ${isHovered ? 'bg-gray-100' : ''}`}
                            onClick={() => onClick(entry)}
                            onMouseEnter={() => onMouseEnter(entry.dataKey)}
                            onMouseLeave={onMouseLeave}
                        >
                            <div
                                className="w-2 h-2 rounded-full ml-2"
                                style={{
                                    backgroundColor: entry.color,
                                    opacity: isHovered ? 1 : getBarOpacity(entry.dataKey)
                                }}
                            ></div>
                            <span
                                className="md:text-sm text-[10px]"
                                style={{ opacity: isHovered ? 1 : getBarOpacity(entry.dataKey) }}
                            >
                                {entry.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!data || chartData.length === 0) {
        return (
            <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
                <p className="text-slate-600">אין נתונים להצגה</p>
            </div>
        );
    }

    return (
        <div className="w-full md:h-[500px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartDisplayData}
                    margin={{ top: 30, right: 10, left: 20, bottom: 20 }}
                    barCategoryGap="25%"
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="district"
                        interval={0}
                        tick={{ fontSize: 11, fontFamily: 'Heebo, sans-serif' }}
                    />
                    <YAxis
                        tickFormatter={(value) => value.toLocaleString()}
                        label={{
                            value: "[מספר צרכנים]",
                            angle: -90,
                            position: "insideLeft",
                            dx: -15,
                            style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                        }}
                    />
                    <Tooltip content={<CustomTooltip hiddenBars={hiddenBars} />} />
                    <Legend
                        content={
                            <CustomLegend
                                onClick={handleLegendClick}
                                onMouseEnter={handleLegendMouseEnter}
                                onMouseLeave={handleLegendMouseLeave}
                            />
                        }
                    />
                    <Bar
                        dataKey="basic"
                        name={meterTypeLabels.basic}
                        stackId="a"
                        fill={meterTypeColors.basic}
                        barSize={40}
                        radius={
                            topVisibleStackKey === 'basic' ? [4, 4, 0, 0] : [0, 0, 0, 0]
                        }
                        hide={hiddenBars.includes('basic')}
                        opacity={getBarOpacity('basic')}
                    >
                        {topVisibleStackKey === 'basic' && (
                            <LabelList
                                dataKey="visibleTotal"
                                position="top"
                                formatter={(value: number) => {
                                    if (value == null || value === 0) return '';
                                    return value.toLocaleString();
                                }}
                                style={{ fill: '#59687D', fontSize: '10px', fontWeight: 500 }}
                            />
                        )}
                    </Bar>
                    <Bar
                        dataKey="smart"
                        name={meterTypeLabels.smart}
                        stackId="a"
                        fill={meterTypeColors.smart}
                        barSize={40}
                        radius={[4, 4, 0, 0]}
                        hide={hiddenBars.includes('smart')}
                        opacity={getBarOpacity('smart')}
                    >
                        {topVisibleStackKey === 'smart' && (
                            <LabelList
                                dataKey="visibleTotal"
                                position="top"
                                formatter={(value: number) => {
                                    if (value == null || value === 0) return '';
                                    return value.toLocaleString();
                                }}
                                style={{ fill: '#59687D', fontSize: '10px', fontWeight: 500 }}
                            />
                        )}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PrivateConsumersChart;
