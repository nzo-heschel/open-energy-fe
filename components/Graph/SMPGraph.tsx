"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Text
} from "recharts";
import { useState, useMemo } from "react";
import { differenceInDays, differenceInMonths, differenceInYears, format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { SMPResponse } from "@/types/dto";

interface SMPGraphProps {
    data: SMPResponse;
    startDate: string;
    endDate: string;
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Get the full timestamp from the payload data
        const dataPoint = payload[0]?.payload;
        const fullDate = dataPoint?.timestamp
            ? new Date(dataPoint.timestamp).toLocaleString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
            : label;

        return (
            <div className="bg-white p-2 rounded-[10px] shadow-md border-none" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="text-gray-700 font-medium mb-2 border-b border-[#59687D]">{fullDate}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center">
                            <div
                                className="w-2 h-2 rounded-full ml-2"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm text-[#484C56]">{entry.name}</span>
                            <span className="text-gray-600 mx-1">|</span>
                            <span className="text-sm text-[#484C56] ml-1">
                                {entry.value.toLocaleString()} ₪
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// Custom YAxis Label component
const CustomYAxisLabel = (props: any) => {
    const { viewBox } = props;
    const centerY = (viewBox.y + viewBox.height) / 2;
    return (
        <text
            x={viewBox.x}
            y={centerY}
            textAnchor="middle"
            className="text-sm font-normal text-[#707585]"
            transform={`rotate(-90 ${viewBox.x} ${centerY})`}
        >
            מחיר שולי [MWh/₪]
        </text>
    );
};


export default function SMPGraph({ data, startDate, endDate }: SMPGraphProps) {
    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    const handleLegendMouseEnter = (dataKey: string) => {
        setHoveredSeries(dataKey);
    };

    const handleLegendMouseLeave = () => {
        setHoveredSeries(null);
    };

    // Calculate date range to determine X-axis format
    const dateRangeInfo = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = differenceInDays(end, start);
        const months = differenceInMonths(end, start);
        const years = differenceInYears(end, start);

        if (years >= 1) {
            return { type: 'year' as const, days, months, years };
        } else if (months >= 1) {
            return { type: 'month' as const, days, months, years };
        } else if (days <= 1) {
            return { type: 'time' as const, days, months, years };
        } else {
            return { type: 'day' as const, days, months, years };
        }
    }, [startDate, endDate]);

    // Transform API data into chart format
    const chartData = useMemo(() => {
        // Create a map to merge data from both arrays using timestamp as key
        const dataMap = new Map<string, { time: string; timestamp: string; withExc: number; withoutExc: number }>();

        // Add data from chart_with_constraints
        data.chart_with_constraints.forEach((item) => {
            dataMap.set(item.timestamp, {
                time: '',
                timestamp: item.timestamp,
                withExc: item.price,
                withoutExc: 0
            });
        });

        // Add/update data from chart_without_constraints
        data.chart_without_constraints.forEach((item) => {
            const existing = dataMap.get(item.timestamp);
            if (existing) {
                existing.withoutExc = item.price;
            } else {
                dataMap.set(item.timestamp, {
                    time: '',
                    timestamp: item.timestamp,
                    withExc: 0,
                    withoutExc: item.price
                });
            }
        });

        // Convert map to array and sort by timestamp
        const sortedData = Array.from(dataMap.values()).sort((a, b) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        // For year and month views, aggregate data by period
        if (dateRangeInfo.type === 'year' || dateRangeInfo.type === 'month') {
            const aggregatedMap = new Map<string, { time: string; periodKey: string; withExc: number[]; withoutExc: number[] }>();

            sortedData.forEach((item) => {
                const date = new Date(item.timestamp);
                let periodKey = '';

                if (dateRangeInfo.type === 'year') {
                    periodKey = format(date, 'yyyy');
                } else {
                    periodKey = format(date, 'yyyy-MM');
                }

                const existing = aggregatedMap.get(periodKey);
                if (existing) {
                    existing.withExc.push(item.withExc);
                    existing.withoutExc.push(item.withoutExc);
                } else {
                    aggregatedMap.set(periodKey, {
                        time: dateRangeInfo.type === 'year' ? format(date, 'yyyy') : format(date, 'MM/yy'),
                        periodKey: periodKey,
                        withExc: [item.withExc],
                        withoutExc: [item.withoutExc]
                    });
                }
            });

            // Calculate averages and format
            return Array.from(aggregatedMap.values())
                .map(item => ({
                    time: item.time,
                    timestamp: item.periodKey, // Use period key for consistent sorting
                    withExc: item.withExc.length > 0
                        ? item.withExc.reduce((sum, val) => sum + val, 0) / item.withExc.length
                        : 0,
                    withoutExc: item.withoutExc.length > 0
                        ? item.withoutExc.reduce((sum, val) => sum + val, 0) / item.withoutExc.length
                        : 0
                }))
                .sort((a, b) => {
                    // Sort by period key (year or year-month)
                    return a.timestamp.localeCompare(b.timestamp);
                });
        }

        // For day and time views, format timestamps appropriately
        return sortedData.map(item => {
            const date = new Date(item.timestamp);
            let timeStr = '';

            if (dateRangeInfo.type === 'time') {
                // 1 day: show time only (HH:mm)
                timeStr = format(date, 'HH:mm');
            } else {
                // Multiple days but less than month: show days (DD/MM)
                timeStr = format(date, 'dd/MM');
            }

            return {
                ...item,
                time: timeStr
            };
        });
    }, [data, dateRangeInfo]);

    // Calculate domain for Y-axis based on min/max prices from chart data (aggregated values)
    const yAxisDomain = useMemo(() => {
        // Use chartData values instead of raw data to account for aggregation
        const allPrices = chartData.flatMap(item => [
            item.withExc || 0,
            item.withoutExc || 0
        ]).filter(price => price > 0);

        if (allPrices.length === 0) {
            return [0, 100]; // Default range if no data
        }

        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);

        if (minPrice === maxPrice) {
            // If all prices are the same, add some padding
            return [Math.max(0, Math.floor(minPrice - 10)), Math.ceil(maxPrice + 10)];
        }

        const padding = (maxPrice - minPrice) * 0.1; // 10% padding
        return [Math.max(0, Math.floor(minPrice - padding)), Math.ceil(maxPrice + padding)];
    }, [chartData]);

    // Custom XAxis tick formatter - labels are already formatted correctly in chartData
    const formatXAxisTick = (tickItem: string) => {
        return tickItem;
    };

    // Determine if labels should be rotated
    const shouldRotateLabels = useMemo(() => {
        // No rotation - show all labels horizontally
        return false;
    }, []);

    // Calculate X-axis interval to prevent label overlap
    const xAxisInterval = useMemo(() => {
        const dataLength = chartData.length;

        if (dateRangeInfo.type === 'year') {
            // For year view, show every label (monthly data - usually 12 months or less)
            return 0;
        } else if (dateRangeInfo.type === 'month') {
            // For month view with rotated labels, show all labels
            // Rotated labels can fit more, so show all data points
            return 0;
        } else {
            // For day/time views, calculate interval based on data length
            if (dataLength > 30) {
                return Math.floor(dataLength / 15); // Show ~15 labels max
            } else if (dataLength > 15) {
                return Math.floor(dataLength / 10); // Show ~10 labels max
            } else {
                return 0; // Show all labels if 15 or fewer
            }
        }
    }, [chartData.length, dateRangeInfo.type]);

    // Custom legend component that communicates with parent
    const CustomLegend = (props: any) => {
        const { payload } = props;

        return (
            <div className="flex flex-row-reverse justify-end mt-4">
                {payload.map((entry: any, index: number) => {
                    const isHovered = hoveredSeries === entry.dataKey;
                    const isOtherHovered = hoveredSeries && hoveredSeries !== entry.dataKey;

                    return (
                        <div
                            key={`legend-${index}`}
                            onMouseEnter={() => handleLegendMouseEnter(entry.dataKey)}
                            onMouseLeave={handleLegendMouseLeave}
                            className={`flex items-center cursor-pointer md:px-3 px-2 py-1 rounded-lg transition-all duration-200 ${isOtherHovered ? 'opacity-30' : ''
                                }`}
                        >
                            <div
                                className="w-2 h-2 rounded-full ml-2"
                                style={{
                                    backgroundColor: entry.color,
                                    transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                                    transition: 'transform 0.2s'
                                }}
                            ></div>
                            <span className="md:text-sm text-[10px] font-medium">{entry.value}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full md:h-[500px] h-[300px]">
            <ResponsiveContainer width="100%" height="95%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 50,
                        right: 20,
                        left: 30,
                        bottom: shouldRotateLabels ? 80 : 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11 }}
                        axisLine={true}
                        tickFormatter={formatXAxisTick}
                        interval={xAxisInterval}
                        angle={shouldRotateLabels ? -45 : 0}
                        textAnchor={shouldRotateLabels ? 'end' : 'middle'}
                        height={shouldRotateLabels ? 70 : 40}
                        tickMargin={shouldRotateLabels ? 20 : 5}
                        minTickGap={shouldRotateLabels ? 20 : 0}
                        dy={shouldRotateLabels ? 10 : 0}
                    />
                    <YAxis
                        domain={yAxisDomain}
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                        tickMargin={10}
                        label={<CustomYAxisLabel />}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={CustomLegend} />
                    <Line
                        type="linear"
                        dataKey="withoutExc"
                        stroke="#166534"
                        strokeWidth={2}
                        strokeOpacity={hoveredSeries ? (hoveredSeries === "withoutExc" ? 1 : 0.3) : 1}
                        dot={false}
                        name="מחיר שוליי ללא אילוצים"
                    />
                    <Line
                        type="linear"
                        dataKey="withExc"
                        stroke="#eab308"
                        strokeWidth={2}
                        strokeOpacity={hoveredSeries ? (hoveredSeries === "withExc" ? 1 : 0.3) : 1}
                        dot={false}
                        name="מחיר שוליי כולל אילוצים"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}