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
import { useState } from "react";

const data = [
    { time: "00:00", withExc: 7000, withoutExc: 5200 },
    { time: "02:00", withExc: 6500, withoutExc: 4700 },
    { time: "04:00", withExc: 6300, withoutExc: 4800 },
    { time: "06:00", withExc: 7200, withoutExc: 5100 },
    { time: "07:00", withExc: 3200, withoutExc: 6000 },
    { time: "08:00", withExc: 6800, withoutExc: 5100 },
    { time: "10:00", withExc: 6400, withoutExc: 4800 },
    { time: "12:00", withExc: 6100, withoutExc: 4300 },
    { time: "14:00", withExc: 5700, withoutExc: 3900 },
    { time: "16:00", withExc: 5900, withoutExc: 4200 },
    { time: "18:00", withExc: 5700, withoutExc: 4000 },
    { time: "20:00", withExc: 5400, withoutExc: 3700 },
    { time: "22:00", withExc: 5600, withoutExc: 3900 },
    { time: "24:00", withExc: 5800, withoutExc: 4100 },
];

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
    return (
        <text
            x={viewBox.x}
            y={viewBox.y}
            dy={-20}
            dx={20}
            textAnchor="middle"
            className="text-sm font-normal text-[#707585]"
            transform={`rotate(0 ${viewBox.x} ${viewBox.y})`}
        >
            <tspan x={viewBox.x} dy="-2.4rem">מחיר שולי</tspan>
            <tspan x={viewBox.x} dy="1.2em" dx="1.3rem">[MWh/₪]</tspan>
        </text>
    );
};


export default function SMPGraph() {
    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    const handleLegendMouseEnter = (dataKey: string) => {
        setHoveredSeries(dataKey);
    };

    const handleLegendMouseLeave = () => {
        setHoveredSeries(null);
    };

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
                    data={data}
                    margin={{ top: 50, right: 10, left: 30, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                    />
                    <YAxis
                        domain={[0, 10000]}
                        ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]}
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