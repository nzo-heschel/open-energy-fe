"use client";

import React, { useState } from "react";
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
} from "recharts";

// -------------------------
// Mock Data
// -------------------------
interface DataItem {
    month: string;
    missingDocs: number;
    photoIssues: number;
    formErrors: number;
    other: number;
}

const barData: DataItem[] = [
    { month: "01/24", missingDocs: 20, photoIssues: 10, formErrors: 15, other: 5 },
    { month: "02/24", missingDocs: 15, photoIssues: 12, formErrors: 10, other: 13 },
    { month: "03/24", missingDocs: 25, photoIssues: 15, formErrors: 20, other: 10 },
    { month: "04/24", missingDocs: 30, photoIssues: 20, formErrors: 15, other: 15 },
    { month: "05/24", missingDocs: 35, photoIssues: 25, formErrors: 20, other: 10 },
    { month: "06/24", missingDocs: 25, photoIssues: 20, formErrors: 15, other: 15 },
    { month: "07/24", missingDocs: 30, photoIssues: 15, formErrors: 10, other: 20 },
    { month: "08/24", missingDocs: 20, photoIssues: 10, formErrors: 15, other: 5 },
    { month: "09/24", missingDocs: 40, photoIssues: 25, formErrors: 15, other: 15 },
    { month: "10/24", missingDocs: 30, photoIssues: 20, formErrors: 15, other: 10 },
    { month: "11/24", missingDocs: 25, photoIssues: 15, formErrors: 10, other: 10 },
    { month: "12/24", missingDocs: 20, photoIssues: 10, formErrors: 15, other: 5 },
];

const pieData = [
    { name: "ייפוי כח חסר", value: 214897, color: "#3D843F" },
    { name: "בעיות בתמונה", value: 113946, color: "#E0B441" },
    { name: "בעיות במילוי הבקשה", value: 214897, color: "#9AC348" },
    { name: "אחר", value: 214897, color: "#7DB2CE" },
];

// -------------------------
// Custom Tooltip
// -------------------------
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((acc: number, cur: any) => acc + cur.value, 0);
        return (
            <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-gray-200 text-sm" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="mr-3 font-normal text-gray-800">{label}</p>
                {label ? (
                    <p className="mr-3 text-[#59687D] font-semibold text-base border-b border-[#59687D]">סה"כ {total.toLocaleString()}</p>
                ) : (
                    ""
                )
                }
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                        <span
                            className="w-2 h-2 rounded-full mr-3 mt-2"
                            style={{ backgroundColor: entry.color }}
                        ></span>
                        <div className="flex flex-col space-y-2">
                            {entry.name} <span className="ml-1 font-semibold">{entry.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// -------------------------
// Main Component
// -------------------------
const RejectionReasonsCharts: React.FC = () => {
    const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
                        <Tooltip content={<CustomTooltip />} />
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
                  <div className="absolute text-sm flex flex-col items-center top-1/2  right-1/2 -translate-y-[60%] translate-x-1/2 pb-14">
                    <b className="text-xl">12,531</b>
                    <span className="text-gray-500 text-sm font-normal">סה״כ פניות</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="md:h-[500px] h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={barData}
                        barCategoryGap="30%"
                        margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                    >
                        <XAxis dataKey="month" />
                        <YAxis 
                            domain={[0, 100]} 
                            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                            label={{
                                value: "מספר מונים [באלפים]",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: 'middle' }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {!hiddenKeys.includes("ייפוי כח חסר") && (
                            <Bar
                                barSize={28}
                                dataKey="missingDocs"
                                name="ייפוי כח חסר"
                                fill="#3D843F"
                                stackId="a"
                                opacity={getOpacity("ייפוי כח חסר")}
                            />
                        )}
                        {!hiddenKeys.includes("בעיות בתמונה") && (
                            <Bar
                                barSize={28}
                                dataKey="photoIssues"
                                name="בעיות בתמונה"
                                fill="#E0B441"
                                stackId="a"
                                opacity={getOpacity("בעיות בתמונה")}
                            />
                        )}
                        {!hiddenKeys.includes("בעיות במילוי הבקשה") && (
                            <Bar
                                barSize={28}
                                dataKey="formErrors"
                                name="בעיות במילוי הבקשה"
                                fill="#9AC348"
                                stackId="a"
                                opacity={getOpacity("בעיות במילוי הבקשה")}
                            />
                        )}
                        {!hiddenKeys.includes("אחר") && (
                            <Bar
                                barSize={28}
                                dataKey="other"
                                name="אחר"
                                fill="#7DB2CE"
                                stackId="a"
                                opacity={getOpacity("אחר")}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RejectionReasonsCharts;