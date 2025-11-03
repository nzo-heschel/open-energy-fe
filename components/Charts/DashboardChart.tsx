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

interface DataItem {
    month: string;
    approved: number;
    rejected: number;
}

const barData: DataItem[] = [
    { month: "01/24", approved: 15, rejected: 10 },
    { month: "02/24", approved: 12, rejected: 13 },
    { month: "03/24", approved: 10, rejected: 15 },
    { month: "04/24", approved: 37, rejected: 20 },
    { month: "05/24", approved: 15, rejected: 10 },
    { month: "06/24", approved: 12, rejected: 13 },
    { month: "07/24", approved: 15, rejected: 10 },
    { month: "08/24", approved: 12, rejected: 13 },
    { month: "09/24", approved: 15, rejected: 10 },
    { month: "10/24", approved: 12, rejected: 13 },
    { month: "11/24", approved: 15, rejected: 10 },
    { month: "12/24", approved: 12, rejected: 13 },
];

const pieData = [
    { name: "אושרו", value: 214897, color: "#648AA3" },
    { name: "נדחו", value: 214897, color: "#DACF61" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((acc: number, cur: any) => acc + cur.value, 0);
        return (
            <div className="bg-white shadow-lg rounded-lg px-2 py-1 border border-gray-200 md:w-[150px] w-max" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="font-semibold text-gray-800">{label}</p>
                {label ? (
                    <p className="text-[#59687D] font-medium text-base border-b border-[#59687D]">סה"כ {total.toLocaleString()}</p>
                ) : (
                    ""
                )
                }
                {payload.map((entry: any, index: number) => (
                    <div
                        key={`item-${index}`}
                        className="text-base font-medium flex space-y-2"
                        style={{ color: entry.color }}
                    >
                        <div
                            className="w-2 h-2 rounded-full ml-2 mt-3"
                            style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="flex flex-col text-[#59687D] text-sm leading-4 font-normal">
                            {entry.name} <span className="font-semibold text-sm">{entry.value}</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardCharts: React.FC = () => {
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

    // Custom Legend component with hover effects
    const CustomLegend = ({ payload, onClick, hiddenKeys, onMouseEnter, onMouseLeave }: any) => {
        return (
            <div className="flex gap-4 justify-start mt-2">
                {payload.map((entry: any, index: number) => {
                    const isHidden = hiddenKeys.includes(entry.value);
                    const isHovered = hoveredItem === entry.value;

                    return (
                        <button
                            key={`legend-${index}`}
                            onClick={() => onClick(entry.value)}
                            onMouseEnter={() => onMouseEnter(entry.value)}
                            onMouseLeave={onMouseLeave}
                            className={`flex items-center gap-1 cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${isHovered ? 'bg-gray-100' : ''
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
                                className={`text-sm ${isHidden ? "opacity-50" : ""}`}
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
            <div className="relative md:h-[500px] h-[300px] md:w-[400px] w-[100%]">
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
                <div className="absolute text-sm flex flex-col items-center top-1/2  right-1/2 -translate-y-[60%] translate-x-1/2 pb-4">
                    <b className="text-xl">314,932</b>
                    <span className="text-gray-500 text-sm font-normal">בקשות</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="w-full md:h-[500px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={barData} barCategoryGap="100%" margin={{ top: 20, right: 10, left: 20, bottom: 20 }}>
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
                        {!hiddenKeys.includes("אושרו") && (
                            <Bar
                                barSize={28}
                                radius={[0, 0, 0, 0]}
                                dataKey="approved"
                                name="אושרו"
                                fill="#648AA3"
                                stackId="a"
                                opacity={getOpacity("אושרו")}
                            />
                        )}
                        {!hiddenKeys.includes("נדחו") && (
                            <Bar
                                barSize={28}
                                radius={[4, 4, 0, 0]}
                                dataKey="rejected"
                                name="נדחו"
                                fill="#DACF61"
                                stackId="a"
                                opacity={getOpacity("נדחו")}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardCharts;