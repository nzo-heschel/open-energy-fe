"use client";

import { useSwitchingRequests } from "@/lib/api";
import type { SwitchingRequestsResponse } from "@/types/dto";
import React, { useMemo, useState } from "react";
import {
    Bar,
    Cell,
    ComposedChart,
    LabelList,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// -------------------------
// Data Interfaces
// -------------------------
interface DataItem {
    month: string;
    missingDocs: number;
    photoIssues: number;
    formErrors: number;
    other: number;
    total: number;
}

interface PieDataItem {
    name: string;
    value: number;
    color: string;
}

interface RejectionReasonsChartsProps {
    data?: SwitchingRequestsResponse | null;
    customerType?: 'residential' | 'non_residential';
    years?: string | string[];
    regulationType?: string;
    rejectionReasons?: string[];
}

// Label mapping from API to Hebrew
const rejectionReasonLabelMap: Record<string, string> = {
    "missing_power_of_attorney": "ייפוי כח חסר",
    "meter_issues": "בעיות במונה",
    "request_form_issues": "בעיות במילוי הבקשה",
    "other": "אחר",
};

// Color mapping for rejection reasons
const rejectionReasonColorMap: Record<string, string> = {
    "missing_power_of_attorney": "#8B0000",
    "meter_issues": "#DC143C",
    "request_form_issues": "#FF6347",
    "other": "#FFB6C1",
};

// -------------------------
// Custom Tooltip for Bar Chart
// -------------------------
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Calculate total from displayed values (which are now original values)
        const total = payload.reduce((acc: number, cur: any) => acc + cur.value, 0);

        return (
            <div className="bg-white z-100 shadow-lg rounded-lg px-3 py-2 border border-gray-200 text-sm" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="mr-3 font-normal text-gray-800">{label}</p>
                {label ? (
                    <p className="mr-3 text-[#59687D] font-semibold text-base border-b border-[#59687D]">סה&quot;כ {Math.round(total).toLocaleString()} דחיות</p>
                ) : (
                    ""
                )
                }
                {payload.map((entry: any, index: number) => {
                    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                    return (
                        <div key={index} className="flex items-start gap-2 text-gray-700">
                            <span
                                className="w-2 h-2 rounded-full mr-3 mt-2"
                                style={{ backgroundColor: entry.color }}
                            ></span>
                            <div className="flex flex-col space-y-2">
                                {entry.name} <span className="ml-1 font-semibold">{Math.round(entry.value).toLocaleString()} דחיות {percentage}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

// -------------------------
// Custom Tooltip for Pie Chart with percentage
// -------------------------
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
                    <span className="text-sm ml-1">דחיות</span>
                    <span className="text-sm font-semibold mr-2">{percentage}%</span>
                </div>
            </div>
        );
    }
    return null;
};

// -------------------------
// Main Component
// -------------------------
const RejectionReasonsCharts: React.FC<RejectionReasonsChartsProps> = ({
    data: propData,
    customerType,
    years,
    regulationType,
    rejectionReasons = ['missing_power_of_attorney', 'meter_issues', 'request_form_issues', 'other']
}) => {
    const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Fetch data if not provided as prop
    const { data: queryData } = useSwitchingRequests(customerType, years);
    const switchingData = propData || queryData;

    // Transform pie chart data from API response with filtering
    const pieData = useMemo<PieDataItem[]>(() => {
        if (!switchingData?.charts?.requests_by_rejection_reason?.data) {
            return [
                { name: "ייפוי כח חסר", value: 0, color: "#8B0000" },
                { name: "בעיות במונה", value: 0, color: "#DC143C" },
                { name: "בעיות במילוי הבקשה", value: 0, color: "#FF6347" },
                { name: "אחר", value: 0, color: "#FFB6C1" },
            ];
        }

        let data = switchingData.charts.requests_by_rejection_reason.data;

        // Filter by selected rejection reasons
        if (rejectionReasons && rejectionReasons.length > 0 && rejectionReasons.length < 4) {
            data = data.filter(item => rejectionReasons.includes(item.label));
        }

        return data.map((item) => {
            const hebrewLabel = rejectionReasonLabelMap[item.label] || item.label;
            const color = rejectionReasonColorMap[item.label] || "#7DB2CE";

            return {
                name: hebrewLabel,
                value: item.count,
                color: color,
            };
        });
    }, [switchingData, rejectionReasons]);

    // Transform bar chart data from monthly_rejections_by_reason with filtering and thousands formatting
    const barData = useMemo<DataItem[]>(() => {
        if (!switchingData?.monthly_rejections_by_reason) {
            return [];
        }

        // Calculate regulation type ratio for filtering (client-side)
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

        return switchingData.monthly_rejections_by_reason.map((item) => {
            // Format month from "2021-09" to "09/21"
            const [year, month] = item.month.split('-');
            const formattedMonth = `${month}/${year.slice(-2)}`;

            // Apply regulation type filter by scaling proportionally
            let missingDocs = (item.missing_power_of_attorney || 0) * regulationTypeRatio;
            let photoIssues = (item.meter_issues || 0) * regulationTypeRatio;
            let formErrors = (item.request_form_issues || 0) * regulationTypeRatio;
            let other = (item.other || 0) * regulationTypeRatio;

            // Filter by selected rejection reasons
            if (rejectionReasons && rejectionReasons.length > 0 && rejectionReasons.length < 4) {
                if (!rejectionReasons.includes('missing_power_of_attorney')) {
                    missingDocs = 0;
                }
                if (!rejectionReasons.includes('meter_issues')) {
                    photoIssues = 0;
                }
                if (!rejectionReasons.includes('request_form_issues')) {
                    formErrors = 0;
                }
                if (!rejectionReasons.includes('other')) {
                    other = 0;
                }
            }

            // Keep original values (no rounding, no conversion to thousands)
            const total = missingDocs + photoIssues + formErrors + other;
            return {
                month: formattedMonth,
                missingDocs: missingDocs,
                photoIssues: photoIssues,
                formErrors: formErrors,
                other: other,
                total: total,
            };
        });
    }, [switchingData, regulationType, rejectionReasons]);

    // Get total rejections for center display
    const totalRejections = switchingData?.total_rejections || 0;

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

    // -------------------------
    // Custom Legend with Hover Effects
    // -------------------------
    const CustomLegend = ({ payload, onClick, hiddenKeys, onMouseEnter, onMouseLeave }: any) => {
        return (
            <div className="flex flex-wrap gap-4 justify-start md:mt-2 mt-0">
                {payload.map((entry: any, index: number) => {
                    const isHidden = hiddenKeys.includes(entry.value);
                    const isHovered = hoveredItem === entry.value;

                    return (
                        <button
                            key={index}
                            onClick={() => onClick(entry.value)}
                            onMouseEnter={() => onMouseEnter(entry.value)}
                            onMouseLeave={onMouseLeave}
                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${isHovered ? 'bg-gray-100' : ''
                                }`}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: isHidden ? "#ccc" : entry.color,
                                    opacity: isHovered ? 1 : getOpacity(entry.value)
                                }}
                            />
                            <span
                                className={`md:text-sm text-xs ${isHidden ? "opacity-50" : ""}`}
                                style={{ opacity: isHovered ? 1 : getOpacity(entry.value) }}
                            >
                                {entry.value}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex md:flex-row flex-col gap-12">
            {/* Pie Chart */}
            <div className="relative h-[500px] md:w-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            content={<PieChartTooltip totalValue={pieData.reduce((sum, entry) => sum + entry.value, 0)} />}
                            // Offset tooltip away from center to avoid overlapping with the total rejections label
                            offset={20}
                            wrapperStyle={{ zIndex: 50 }}
                        />
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
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={120}
                            paddingAngle={0}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {pieData.map((entry, index) =>
                                hiddenKeys.includes(entry.name) ? null : (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={getOpacity(entry.name)}
                                        style={{
                                            transition: 'opacity 0.2s ease-in-out'
                                        }}
                                    />
                                )
                            )}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-sm flex flex-col items-center top-1/2 right-1/2 -translate-y-[60%] translate-x-1/2 pb-14 pointer-events-none">
                    <b className="text-xl">{totalRejections.toLocaleString()}</b>
                    <span className="text-gray-500 text-sm font-normal">סה״כ דחיות</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="md:h-[500px] h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={barData}
                        barCategoryGap="30%"
                        margin={{ top: 30, right: 10, left: 20, bottom: 0 }}
                    >
                        <XAxis dataKey="month" />
                        <YAxis
                            label={{
                                value: "מספר דחיות\n[באלפים]",
                                angle: -90,
                                position: "insideLeft",
                                dx: -15,
                                style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                            }}
                            tickFormatter={(value) => Math.round(value / 1000).toString()}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {!hiddenKeys.includes("ייפוי כח חסר") &&
                            (!rejectionReasons || rejectionReasons.length === 4 || rejectionReasons.includes('missing_power_of_attorney')) && (
                                <Bar
                                    barSize={28}
                                    dataKey="missingDocs"
                                    name="ייפוי כח חסר"
                                    fill="#8B0000"
                                    stackId="a"
                                    opacity={getOpacity("ייפוי כח חסר")}
                                />
                            )}
                        {!hiddenKeys.includes("בעיות במונה") &&
                            (!rejectionReasons || rejectionReasons.length === 4 || rejectionReasons.includes('meter_issues')) && (
                                <Bar
                                    barSize={28}
                                    dataKey="photoIssues"
                                    name="בעיות במונה"
                                    fill="#DC143C"
                                    stackId="a"
                                    opacity={getOpacity("בעיות במונה")}
                                />
                            )}
                        {!hiddenKeys.includes("בעיות במילוי הבקשה") &&
                            (!rejectionReasons || rejectionReasons.length === 4 || rejectionReasons.includes('request_form_issues')) && (
                                <Bar
                                    barSize={28}
                                    dataKey="formErrors"
                                    name="בעיות במילוי הבקשה"
                                    fill="#FF6347"
                                    stackId="a"
                                    opacity={getOpacity("בעיות במילוי הבקשה")}
                                />
                            )}
                        {!hiddenKeys.includes("אחר") &&
                            (!rejectionReasons || rejectionReasons.length === 4 || rejectionReasons.includes('other')) && (
                                <Bar
                                    barSize={28}
                                    radius={[4, 4, 0, 0]}
                                    dataKey="other"
                                    name="אחר"
                                    fill="#FFB6C1"
                                    stackId="a"
                                    opacity={getOpacity("אחר")}
                                >
                                    <LabelList
                                        dataKey="total"
                                        position="top"
                                        formatter={(value: number | undefined) => {
                                            if (value == null || value === 0) return '';
                                            const rounded = Math.round(value / 1000);
                                            return rounded > 0 ? rounded : '';
                                        }}
                                        style={{ fill: '#59687D', fontSize: '11px', fontWeight: 500 }}
                                    />
                                </Bar>
                            )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RejectionReasonsCharts;