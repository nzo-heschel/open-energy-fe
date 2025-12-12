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
import type { SMPResponse } from "@/types/dto";

interface SMPGraphProps {
    data: SMPResponse;
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 rounded-[10px] shadow-md border-none" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="text-gray-700 font-medium mb-2 border-b border-[#59687D]">{label}</p>
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


export default function SMPGraph({ data }: SMPGraphProps) {
    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    const handleLegendMouseEnter = (dataKey: string) => {
        setHoveredSeries(dataKey);
    };

    const handleLegendMouseLeave = () => {
        setHoveredSeries(null);
    };

    // Transform API data into chart format
    const chartData = useMemo(() => {
        // Create a map to merge data from both arrays
        const dataMap = new Map<string, { time: string; withExc: number; withoutExc: number }>();

        // Add data from chart_with_constraints
        data.chart_with_constraints.forEach((item) => {
            dataMap.set(item.hour, {
                time: item.hour,
                withExc: item.price,
                withoutExc: 0
            });
        });

        // Add/update data from chart_without_constraints
        data.chart_without_constraints.forEach((item) => {
            const existing = dataMap.get(item.hour);
            if (existing) {
                existing.withoutExc = item.price;
            } else {
                dataMap.set(item.hour, {
                    time: item.hour,
                    withExc: 0,
                    withoutExc: item.price
                });
            }
        });

        // Convert map to array and sort by hour
        return Array.from(dataMap.values()).sort((a, b) => {
            const hourA = parseInt(a.time.split(':')[0]);
            const hourB = parseInt(b.time.split(':')[0]);
            return hourA - hourB;
        });
    }, [data]);

    // Calculate domain for Y-axis based on min/max prices
    const yAxisDomain = useMemo(() => {
        const minPrice = Math.min(data.min_price, ...chartData.map(d => Math.min(d.withExc || 0, d.withoutExc || 0)));
        const maxPrice = Math.max(data.max_price, ...chartData.map(d => Math.max(d.withExc || 0, d.withoutExc || 0)));
        const padding = (maxPrice - minPrice) * 0.1; // 10% padding
        return [Math.max(0, Math.floor(minPrice - padding)), Math.ceil(maxPrice + padding)];
    }, [data, chartData]);

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
                    margin={{ top: 50, right: 10, left: 30, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        axisLine={true}
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