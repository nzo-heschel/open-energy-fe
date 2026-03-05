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
} from "recharts";
import type { PrivateSupplierConnectedConsumersResponse } from "@/types/dto";

interface PrivateConsumersChartProps {
    data: PrivateSupplierConnectedConsumersResponse | null | undefined;
    segmentType?: 'regulation_type' | 'sector' | 'meter_type' | 'status' | 'rejection_reason';
    selectedSegment?: string;
}

// Hebrew labels mapping
const segmentLabels: Record<string, Record<string, string>> = {
    regulation_type: {
        competitive_supply: 'אספקה תחרותית',
        existing_regulation: 'רגולציה קיימת',
    },
    sector: {
        residential: 'ביתי',
        non_residential: 'לא ביתי',
    },
    meter_type: {
        basic: 'בסיסי',
        smart: 'חכם',
    },
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((acc: number, cur: any) => acc + cur.value, 0);
        return (
            <div className="bg-white p-2 rounded-[10px] shadow-md border-none" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="font-normal text-[#59687D] text-sm">{label}</p>
                <p className="text-[#59687D] font-medium text-base border-b border-[#59687D]">סה"כ {total.toLocaleString()}</p>
                {payload.map((entry: any, index: number) => (
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
                            <span className="font-semibold">{entry.value.toLocaleString()}</span>
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
    segmentType = 'regulation_type',
    selectedSegment
}) => {
    const [hiddenBars, setHiddenBars] = useState<string[]>([]);
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    // Transform data for chart
    const chartData = useMemo(() => {
        if (!data) return [];

        if (segmentType && selectedSegment) {
            // Show filtered segment data - just show total_consumers for selected segment
            const segmentData = data.segments[segmentType] || [];
            const filtered = segmentData.filter(item => {
                const key = segmentType === 'regulation_type' ? 'regulation_type' :
                    segmentType === 'sector' ? 'sector' :
                        segmentType === 'meter_type' ? 'meter_type' :
                            segmentType === 'status' ? 'status' : 'rejection_reason';
                return item[key as keyof typeof item] === selectedSegment;
            });

            // Group by month
            const grouped = filtered.reduce((acc, item) => {
                const monthKey = item.month;
                if (!acc[monthKey]) {
                    acc[monthKey] = { month: monthKey, [selectedSegment]: 0 };
                }
                acc[monthKey][selectedSegment] += item.total_consumers;
                return acc;
            }, {} as Record<string, any>);

            return Object.values(grouped).map(item => ({
                month: item.month.split('-').reverse().join('/').slice(0, 5), // Format: MM/YY
                [selectedSegment]: item[selectedSegment],
            }));
        } else if (segmentType) {
            // Show all segments of this type grouped by month
            const segmentData = data.segments[segmentType] || [];
            const grouped = segmentData.reduce((acc, item) => {
                const monthKey = item.month;
                const segmentKey = segmentType === 'regulation_type' ? (item as any).regulation_type :
                    segmentType === 'sector' ? (item as any).sector :
                        segmentType === 'meter_type' ? (item as any).meter_type :
                            segmentType === 'status' ? (item as any).status : (item as any).rejection_reason;

                if (!acc[monthKey]) {
                    acc[monthKey] = { month: monthKey };
                }
                if (!acc[monthKey][segmentKey]) {
                    acc[monthKey][segmentKey] = 0;
                }
                acc[monthKey][segmentKey] += item.total_consumers;
                return acc;
            }, {} as Record<string, any>);

            return Object.values(grouped).map(item => {
                const formatted: any = {
                    month: item.month.split('-').reverse().join('/').slice(0, 5),
                };
                Object.keys(item).forEach(key => {
                    if (key !== 'month') {
                        formatted[key] = item[key];
                    }
                });
                return formatted;
            });
        } else {
            // Show main data
            return data.data.map(item => ({
                month: item.month.split('-').reverse().join('/').slice(0, 5),
                total_consumers: item.total_consumers,
                new_additions: item.new_additions,
            }));
        }
    }, [data, segmentType, selectedSegment]);

    // Get unique segment values for legend from chart data
    const segmentKeys = useMemo(() => {
        if (chartData.length === 0) return [];

        // Extract all keys except 'month' from chart data
        const keys = new Set<string>();
        chartData.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'month') {
                    keys.add(key);
                }
            });
        });

        return Array.from(keys);
    }, [chartData]);

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
        if (!hoveredBar) return 1; // No hover, full opacity
        if (hoveredBar === dataKey) return 1; // Hovered bar, full opacity
        return 0.3; // Other bars, faded
    };

    // Color mapping for segments
    const getSegmentColor = (key: string, index: number): string => {
        const colors = ['#F4D150', '#3A7C2F', '#648AA3', '#957669', '#CEA073', '#6B707C'];
        return colors[index % colors.length];
    };

    // Custom Legend component
    const CustomLegend = ({ payload, onClick, onMouseEnter, onMouseLeave }: any) => {
        if (!payload || payload.length === 0) return null;

        return (
            <div className="flex gap-3 flex-wrap">
                {payload.map((entry: any, index: number) => {
                    const isHidden = hiddenBars.includes(entry.dataKey);
                    const isHovered = hoveredBar === entry.dataKey;
                    const label = segmentLabels[segmentType]?.[entry.dataKey] || entry.dataKey;

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
                                {label}
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

    // Get max value for Y-axis domain
    const maxValue = Math.max(
        ...chartData.flatMap(item =>
            Object.keys(item)
                .filter(key => key !== 'month')
                .map(key => item[key as keyof typeof item] as number)
        )
    );

    return (
        <div className="w-full md:h-[500px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 50, right: 10, left: 20, bottom: 20 }}
                    barCategoryGap="25%"
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis
                        label={({ viewBox }: any) => (
                            <g>
                                <text
                                    x={viewBox.x + viewBox.width / 2}
                                    y={viewBox.y - 25}
                                    textAnchor="middle"
                                    style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, fill: '#707585' }}
                                >
                                    צרכנים המחוברים
                                </text>
                                <text
                                    x={viewBox.x + viewBox.width / 2}
                                    y={viewBox.y - 10}
                                    textAnchor="middle"
                                    style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, fill: '#707585' }}
                                >
                                    לספקי חשמל פרטיים
                                </text>
                            </g>
                        )}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        content={
                            <CustomLegend
                                onClick={handleLegendClick}
                                onMouseEnter={handleLegendMouseEnter}
                                onMouseLeave={handleLegendMouseLeave}
                            />
                        }
                    />
                    {segmentKeys.map((key, index) => {
                        const label = segmentLabels[segmentType]?.[key] || key;
                        return (
                            <Bar
                                key={key}
                                dataKey={key}
                                name={label}
                                stackId="a"
                                fill={getSegmentColor(key, index)}
                                barSize={28}
                                radius={index === segmentKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                hide={hiddenBars.includes(key)}
                                opacity={getBarOpacity(key)}
                            />
                        );
                    })}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PrivateConsumersChart;