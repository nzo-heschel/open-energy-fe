"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Button } from "../ui/button";
import { ElectricityScatterGraph } from "./ElectricityScatterGraph";

// Data for the line chart
const lineData = [
    { time: "00:00", withExc: 110, withoutExc: 130, demandWith: 2800, demandWithout: 6300 },
    { time: "01:00", withExc: 135, withoutExc: 155, demandWith: 2600, demandWithout: 6100 },
    { time: "02:00", withExc: 75, withoutExc: 95, demandWith: 2500, demandWithout: 6000 },
    { time: "03:00", withExc: 74, withoutExc: 94, demandWith: 2700, demandWithout: 6200 },
    { time: "04:00", withExc: 73, withoutExc: 93, demandWith: 2800, demandWithout: 6300 },
    { time: "05:00", withExc: 100, withoutExc: 120, demandWith: 2600, demandWithout: 6000 },
    { time: "06:00", withExc: 120, withoutExc: 140, demandWith: 2500, demandWithout: 5900 },
    { time: "07:00", withExc: 100, withoutExc: 120, demandWith: 2650, demandWithout: 6050 },
    { time: "08:00", withExc: 75, withoutExc: 95, demandWith: 2700, demandWithout: 6100 },
    { time: "09:00", withExc: 75, withoutExc: 95, demandWith: 2800, demandWithout: 6300 },
    { time: "10:00", withExc: 45, withoutExc: 65, demandWith: 2600, demandWithout: 6100 },
    { time: "11:00", withExc: 45, withoutExc: 65, demandWith: 2500, demandWithout: 6000 },
    { time: "12:00", withExc: 40, withoutExc: 60, demandWith: 2700, demandWithout: 6200 },
    { time: "13:00", withExc: 61, withoutExc: 81, demandWith: 2800, demandWithout: 6300 },
    { time: "14:00", withExc: 57, withoutExc: 77, demandWith: 2600, demandWithout: 6000 },
    { time: "15:00", withExc: 59, withoutExc: 79, demandWith: 2500, demandWithout: 5900 },
    { time: "16:00", withExc: 49, withoutExc: 69, demandWith: 2650, demandWithout: 6050 },
    { time: "17:00", withExc: 89, withoutExc: 109, demandWith: 2700, demandWithout: 6100 },
    { time: "18:00", withExc: 56, withoutExc: 76, demandWith: 2800, demandWithout: 6300 },
    { time: "19:00", withExc: 23, withoutExc: 33, demandWith: 2600, demandWithout: 6100 },
    { time: "20:00", withExc: 56, withoutExc: 76, demandWith: 2500, demandWithout: 6000 },
    { time: "21:00", withExc: 20, withoutExc: 40, demandWith: 2700, demandWithout: 6200 },
    { time: "22:00", withExc: 50, withoutExc: 70, demandWith: 2800, demandWithout: 6300 },
    { time: "23:00", withExc: 80, withoutExc: 100, demandWith: 2600, demandWithout: 6000 },
    { time: "24:00", withExc: 56, withoutExc: 76, demandWith: 2500, demandWithout: 5900 },
];

// Custom Tooltip component for Line Chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 rounded-[10px] shadow-md border-none" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="text-gray-700 font-medium mb-2 border-b border-[#59687D]">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex flex-col">
                            <div className="flex items-center">
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
                            <span className="text-sm text-[#484C56] mr-4 leading-3">
                                {entry.value.toLocaleString()} MW
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// Line Chart Component
const ElectricityLineGraph = () => {
    const [activeSeries, setActiveSeries] = useState<string[]>([]);
    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    const handleLegendClick = (dataKey: string) => {
        if (activeSeries.includes(dataKey)) {
            setActiveSeries(activeSeries.filter(key => key !== dataKey));
        } else {
            setActiveSeries([...activeSeries, dataKey]);
        }
    };

    const handleLegendMouseEnter = (dataKey: string) => {
        setHoveredSeries(dataKey);
    };

    const handleLegendMouseLeave = () => {
        setHoveredSeries(null);
    };

    const renderLegend = (props: any) => {
        const { payload } = props;

        return (
            <div className="flex items-center justify-between md:ml-10 ml-0 mt-6 md:pr-10 pr-5">
                <div className="flex flex-row-reverse justify-end">
                    {payload.map((entry: any, index: number) => {
                        const isActive = !activeSeries.includes(entry.dataKey);
                        const isHovered = hoveredSeries === entry.dataKey;
                        const isOtherHovered = hoveredSeries && hoveredSeries !== entry.dataKey;

                        return (
                            <div
                                key={`legend-${index}`}
                                onClick={() => handleLegendClick(entry.dataKey)}
                                onMouseEnter={() => handleLegendMouseEnter(entry.dataKey)}
                                onMouseLeave={handleLegendMouseLeave}
                                className={`flex items-center cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${isActive ? 'bg-transparent' : 'opacity-50'
                                    } ${isOtherHovered ? 'opacity-30' : ''}`}
                            >
                                <div
                                    className="w-2 h-2 rounded-full ml-2"
                                    style={{
                                        backgroundColor: entry.color,
                                        transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                                        transition: 'transform 0.2s'
                                    }}
                                ></div>
                                <span className="md:!text-sm !text-[10px] font-medium">{entry.value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // const CustomYAxisLabel = (props: any) => {
    //     const { viewBox } = props;
    //     return (
    //         <text
    //             x={viewBox.x}
    //             y={viewBox.y}
    //             dy={-10}
    //             dx={20}
    //             textAnchor="middle"
    //             className="text-sm font-normal text-[#707585]"
    //             transform={`rotate(0 ${viewBox.x} ${viewBox.y})`}
    //         >
    //             <tspan x={viewBox.x} dy="-2.4rem">מחיר שולי</tspan>
    //             <tspan x={viewBox.x} dy="1.2em" dx="1.3rem">[MWh/₪]</tspan>
    //         </text>
    //     );
    // };

    const getLineOpacity = (dataKey: string) => {
        // If series is manually hidden by click
        if (activeSeries.includes(dataKey)) {
            return 0;
        }

        // If hovering over a legend item
        if (hoveredSeries) {
            return hoveredSeries === dataKey ? 1 : 0.3;
        }

        // Default state - all visible
        return 1;
    };

    return (
        <div className="w-full md:h-[500px] h-[300px] md:mt-0 -mt-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={lineData}
                    margin={{ top: 50, right: 10, left: 30, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                    />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        domain={[0, 220]}
                        ticks={[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220]}
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                        tickMargin={10}
                        // label={<CustomYAxisLabel />}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 11000]}
                        ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000]}
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                        tickMargin={35}
                    />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Legend content={renderLegend} />
                    <Line
                        yAxisId="left"
                        type="linear"
                        dataKey="withoutExc"
                        stroke="#166534"
                        strokeWidth={2}
                        strokeOpacity={getLineOpacity("withoutExc")}
                        dot={false}
                        name="מחיר שוליי ללא אילוצים"
                    />
                    <Line
                        yAxisId="left"
                        type="linear"
                        dataKey="withExc"
                        stroke="#eab308"
                        strokeWidth={2}
                        strokeOpacity={getLineOpacity("withExc")}
                        dot={false}
                        name="מחיר שוליי כולל אילוצים"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Main Component with Tab Switching
const ElectricityGraphWithTabs = () => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('יומי');
    const [chartView, setChartView] = useState<'time' | 'scatter'>('time');

    return (
        <div className="h-full w-full p-4">
            <div className="">
                <div className="flex flex-col gap-2 my-[30px] w-full">
                    <div className="md:mt-[60px] mt-10 w-full">
                        <div className='flex flex-col gap-6'>
                            <div className="">
                                {chartView === 'time' ? <ElectricityLineGraph /> : <ElectricityScatterGraph />}
                                <div className="flex gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] mb-4 w-fit ml-auto mt-5" style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}>
                                    <Button
                                        onClick={() => setChartView('time')}
                                        className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${chartView === 'time'
                                            ? 'bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white'
                                            : 'bg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white'
                                            }`}
                                    >
                                        על פני זמן
                                    </Button>
                                    <Button
                                        onClick={() => setChartView('scatter')}
                                        className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] md:text-base text-xs ${chartView === 'scatter'
                                            ? 'bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white'
                                            : 'bg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white'
                                            }`}
                                    >
                                        פיזור נתונים
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectricityGraphWithTabs;