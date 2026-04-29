"use client";

import React, { useState, useMemo } from "react";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LabelList,
} from "recharts";
import { useSwitchingRequests } from "@/lib/api";
import type { SwitchingRequestsResponse } from '@/types/dto';

interface DashboardChartsProps {
    customerType?: 'residential' | 'non_residential';
    data?: SwitchingRequestsResponse | null;
    regulationType?: string;
}

// Color mapping for status labels
const statusColorMap: Record<string, string> = {
    "approved": "#648AA3",
    "rejected": "#DACF61",
    "pending": "#957669",
    "הושלמו": "#648AA3",
    "נדחו": "#DACF61",
    "ממתין": "#957669",
};

// Custom tooltip for pie chart with percentage
const PieChartTooltip = ({ active, payload, totalValue }: any) => {
    if (active && payload && payload.length) {
        const entry = payload[0];
        const percentage = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : 0;
        return (
            <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-gray-200" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.payload.color }}
                    ></div>
                    <span className="text-[#59687D] font-medium text-sm">{entry.name}</span>
                </div>
                <div className="text-[#59687D] mt-1">
                    <span className="font-semibold text-base">{entry.value.toLocaleString()}</span>
                    <span className="text-sm ml-1">בקשות</span>
                    <span className="text-sm font-semibold mr-2">{percentage}%</span>
                </div>
            </div>
        );
    }
    return null;
};

// Custom tooltip for bar chart with stacked breakdown
const BarChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Calculate total from all stacked values
        const approved = payload.find((p: any) => p.dataKey === 'approved')?.value || 0;
        const rejected = payload.find((p: any) => p.dataKey === 'rejected')?.value || 0;
        const total = approved + rejected;

        return (
            <div className="bg-white shadow-lg rounded-lg px-4 py-3 border border-gray-200" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="font-semibold text-gray-800 text-sm mb-2">{label}</p>
                <p className="text-[#59687D] font-bold text-lg mb-2">סה"כ {total.toLocaleString()}</p>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#648AA3" }}></div>
                        <span className="text-[#59687D] text-sm"
                        >
                            הושלמו
                        </span>
                        <span className="text-[#59687D] font-semibold text-sm mr-auto">{approved.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#DACF61" }}></div>
                        <span className="text-[#59687D] text-sm">נדחו</span>
                        <span className="text-[#59687D] font-semibold text-sm mr-auto">{rejected.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ customerType, data: propData, regulationType }) => {
    const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Use provided data or fetch switching requests data
    const { data: fetchedData, isLoading, error } = useSwitchingRequests(customerType);
    const switchingData = propData || fetchedData;

    // Transform pie chart data from API response - always show status breakdown (approved/rejected)
    const pieData = useMemo(() => {
        if (!switchingData?.charts?.requests_by_status?.data) {
            return [
                { name: "הושלמו", value: 0, color: "#648AA3" },
                { name: "נדחו", value: 0, color: "#DACF61" },
            ];
        }

        // Calculate regulation type ratio for filtering pie data
        let regulationTypeRatio = 1;
        if (regulationType && regulationType !== 'all' && switchingData?.charts?.requests_by_regulation_type?.data) {
            const selectedRegulation = switchingData.charts.requests_by_regulation_type.data.find(
                item => item.label === regulationType
            );
            const totalRegulation = switchingData.charts.requests_by_regulation_type.data.reduce(
                (sum, item) => sum + item.count, 0
            );

            if (selectedRegulation && totalRegulation > 0) {
                regulationTypeRatio = selectedRegulation.count / totalRegulation;
            }
        }

        return switchingData.charts.requests_by_status.data.map((item) => {
            // Map English labels to Hebrew
            const labelMap: Record<string, string> = {
                "approved": "הושלמו",
                "rejected": "נדחו",
                "pending": "ממתין",
            };

            const hebrewLabel = labelMap[item.label] || item.label;
            // Apply regulation type filter by scaling proportionally
            const filteredCount = Math.round(item.count * regulationTypeRatio);

            return {
                name: hebrewLabel,
                value: filteredCount,
                color: statusColorMap[item.label] || statusColorMap[hebrewLabel] || "#648AA3",
            };
        });
    }, [switchingData, regulationType]);

    // Calculate approved/rejected ratio from status data
    const statusRatios = useMemo(() => {
        if (!switchingData?.charts?.requests_by_status?.data) {
            return { approvedRatio: 0.5, rejectedRatio: 0.5 };
        }

        const statusData = switchingData.charts.requests_by_status.data;
        const approved = statusData.find(item => item.label === 'approved')?.count || 0;
        const rejected = statusData.find(item => item.label === 'rejected')?.count || 0;
        const total = approved + rejected;

        if (total === 0) {
            return { approvedRatio: 0.5, rejectedRatio: 0.5 };
        }

        return {
            approvedRatio: approved / total,
            rejectedRatio: rejected / total,
        };
    }, [switchingData]);

    // Transform bar chart data from monthly_requests with client-side filtering
    const barData = useMemo(() => {
        if (!switchingData?.monthly_requests) {
            return [];
        }

        // Calculate regulation type percentage for filtering
        let regulationTypeRatio = 1; // Default: show 100% of data
        if (regulationType && regulationType !== 'all' && switchingData?.charts?.requests_by_regulation_type?.data) {
            const selectedRegulation = switchingData.charts.requests_by_regulation_type.data.find(
                item => item.label === regulationType
            );
            const totalRegulation = switchingData.charts.requests_by_regulation_type.data.reduce(
                (sum, item) => sum + item.count, 0
            );

            if (selectedRegulation && totalRegulation > 0) {
                // Calculate the ratio of selected regulation type to total
                regulationTypeRatio = selectedRegulation.count / totalRegulation;
            }
        }

        // Format monthly requests data and apply regulation type filter
        return switchingData.monthly_requests.map((item) => {
            // Format month from "2021-09" to "09/21"
            const [year, month] = item.month.split('-');
            const formattedMonth = `${month}/${year.slice(-2)}`;

            // Apply regulation type filter by scaling the requests proportionally
            const filteredRequests = Math.round(item.requests * regulationTypeRatio);

            // Calculate approved and rejected based on overall ratio
            const approved = Math.round(filteredRequests * statusRatios.approvedRatio);
            const rejected = filteredRequests - approved; // Use remainder to ensure total matches

            return {
                month: formattedMonth,
                requests: filteredRequests,
                approved,
                rejected,
            };
        });
    }, [switchingData, regulationType, statusRatios]);

    // Filter pie data to exclude hidden segments
    const visiblePieData = useMemo(() => {
        return pieData.filter(entry => !hiddenKeys.includes(entry.name));
    }, [pieData, hiddenKeys]);

    // Calculate visible total based on hidden segments
    const visibleTotal = useMemo(() => {
        return visiblePieData.reduce((sum, entry) => sum + entry.value, 0);
    }, [visiblePieData]);

    // Calculate total requests for bar chart percentage
    const totalBarRequests = useMemo(() => {
        return barData.reduce((sum, item) => sum + item.requests, 0);
    }, [barData]);

    const handleLegendClick = (key: string) => {
        setHiddenKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const handleLegendMouseEnter = (key: string) => {
        setHoveredItem(key);
    };

    const handleLegendMouseLeave = () => {
        setHoveredItem(null);
    };

    // Get opacity for bars and pie segments based on hover state
    const getOpacity = (dataKey: string) => {
        if (!hoveredItem) return 1; // No hover, full opacity
        if (hoveredItem === dataKey) return 1; // Hovered item, full opacity
        return 0.3; // Other items, faded
    };

    // Custom Legend component with hover effects
    const CustomLegend = ({ onClick, hiddenKeys, onMouseEnter, onMouseLeave }: any) => {
        return (
            <div className="flex gap-4 justify-start mt-2">
                {pieData.map((entry, index: number) => {
                    const isHidden = hiddenKeys.includes(entry.name);
                    const isHovered = hoveredItem === entry.name;

                    return (
                        <button
                            key={`legend-${index}`}
                            onClick={() => onClick(entry.name)}
                            onMouseEnter={() => onMouseEnter(entry.name)}
                            onMouseLeave={onMouseLeave}
                            className={`flex items-center gap-1 cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${isHovered ? 'bg-gray-100' : ''
                                }`}
                            style={{
                                opacity: isHidden ? 0.4 : 1,
                                transition: 'opacity 0.2s ease'
                            }}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: entry.color,
                                    opacity: isHovered ? 1 : getOpacity(entry.name)
                                }}
                            />
                            <span
                                className="text-sm"
                                style={{ opacity: isHovered ? 1 : getOpacity(entry.name) }}
                            >
                                {entry.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <p className="text-slate-600">טוען נתונים...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <p className="text-red-600">שגיאה בטעינת הנתונים</p>
            </div>
        );
    }

    return (
        <div className="flex md:flex-row flex-col gap-12">
            {/* Pie Chart */}
            <div className="relative md:h-[500px] h-[300px] md:w-[400px] w-[100%]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip content={<PieChartTooltip totalValue={pieData.reduce((sum, entry) => sum + entry.value, 0)} />} />
                        <Legend
                            content={
                                <CustomLegend
                                    onClick={handleLegendClick}
                                    hiddenKeys={hiddenKeys}
                                    onMouseEnter={handleLegendMouseEnter}
                                    onMouseLeave={handleLegendMouseLeave}
                                />
                            }
                        />
                        <Pie
                            data={visiblePieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={120}
                            paddingAngle={0}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {visiblePieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    opacity={getOpacity(entry.name)}
                                    style={{
                                        transition: 'opacity 0.2s ease-in-out'
                                    }}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-sm flex flex-col items-center top-1/2  right-1/2 -translate-y-[60%] translate-x-1/2 pb-4">
                    <b className="text-xl">{visibleTotal.toLocaleString()}</b>
                    <span className="text-gray-500 text-sm font-normal">בקשות</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="w-full md:h-[500px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={barData} barCategoryGap="20%" margin={{ top: 30, right: 10, left: 20, bottom: 20 }}>
                        <XAxis dataKey="month" />
                        <YAxis
                            tickFormatter={(value) => Math.round(value / 1000).toString()}
                            label={{
                                value: "מספר בקשות\n[באלפים]",
                                angle: -90,
                                position: "insideLeft",
                                dx: -15,
                                style: { textAnchor: 'middle', whiteSpace: 'pre-line', fontFamily: 'Heebo, sans-serif' }
                            }}
                        />
                        <Tooltip content={<BarChartTooltip />} cursor={{ fill: 'transparent' }} />
                        {/* Approved bar (bottom of stack) */}
                        <Bar
                            barSize={28}
                            dataKey="approved"
                            name="הושלמו"
                            fill="#648AA3"
                            stackId="status"
                            opacity={getOpacity("הושלמו")}
                        />
                        {/* Rejected bar (top of stack) */}
                        <Bar
                            barSize={28}
                            radius={[4, 4, 0, 0]}
                            dataKey="rejected"
                            name="נדחו"
                            fill="#DACF61"
                            stackId="status"
                            opacity={getOpacity("נדחו")}
                        >
                            <LabelList
                                dataKey="requests"
                                position="top"
                                formatter={(value: number | undefined) => {
                                    if (value == null || value === 0) return '';
                                    const rounded = Math.round(value / 1000);
                                    return rounded > 0 ? rounded : '';
                                }}
                                style={{ fill: '#59687D', fontSize: '11px', fontWeight: 500 }}
                            />
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardCharts;