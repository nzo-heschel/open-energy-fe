"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type DataPoint = {
    date: string;
    co2: number;
    saved: number;
};

// Sample data for different time periods
const dataByPeriod = {
    yearly: [
        { date: "2021", co2: 8500, saved: 5800 },
        { date: "2022", co2: 7200, saved: 5200 },
        { date: "2023", co2: 6500, saved: 4500 },
        { date: "2024", co2: 5800, saved: 3800 },
    ],
    monthly: [
        { date: "1/24", co2: 9000, saved: 6200 },
        { date: "2/24", co2: 7000, saved: 5000 },
        { date: "3/24", co2: 8000, saved: 5600 },
        { date: "4/24", co2: 6800, saved: 4900 },
        { date: "5/24", co2: 7200, saved: 5100 },
        { date: "6/24", co2: 7000, saved: 5000 },
        { date: "7/24", co2: 5500, saved: 3200 },
        { date: "8/24", co2: 5800, saved: 3500 },
        { date: "9/24", co2: 5200, saved: 3000 },
        { date: "10/24", co2: 5000, saved: 2800 },
        { date: "11/24", co2: 5300, saved: 3100 },
        { date: "12/24", co2: 5400, saved: 3400 },
    ],
    quarterly: [
        { date: "Q1/24", co2: 8000, saved: 5600 },
        { date: "Q2/24", co2: 7000, saved: 5000 },
        { date: "Q3/24", co2: 5500, saved: 3233 },
        { date: "Q4/24", co2: 5233, saved: 3100 },
    ]
};

type TimePeriod = keyof typeof dataByPeriod;

const CO2LineChart = () => {
    const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
    const [activeLines, setActiveLines] = useState({
        co2: true,
        saved: true,
    });
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("yearly");

    const toggleLine = (key: keyof typeof activeLines) => {
        setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPeriod(event.target.value as TimePeriod);
    };

    const getOpacity = (key: string) => {
        if (!hoveredLegend) return 1;
        return hoveredLegend === key ? 1 : 0.3;
    };

    const getLegendOpacity = (key: string) => {
        if (!hoveredLegend) return 1;
        return hoveredLegend === key ? 1 : 0.5;
    };

    // Get current data based on selected period
    const currentData = dataByPeriod[selectedPeriod];

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[16px] p-6">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2 mb-3">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        פליטות CO₂ על פני זמן
                        <TooltipProvider>
                            <UITooltip>
                                <TooltipTrigger asChild>
                                    <button type="button" className="inline-flex items-center">
                                        <svg
                                            width="21"
                                            height="21"
                                            viewBox="0 0 21 21"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="cursor-pointer"
                                        >
                                            <g opacity="0.5">
                                                <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                                <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                            </g>
                                        </svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                    <p>נתונים על פליטות CO₂ לאורך זמן</p>
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </h2>
                    <p className="mr-14">פרק זמן:</p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">סינון לפי:</span>
                        <div className="relative w-[202px]">
                            <select
                                value={selectedPeriod}
                                onChange={handlePeriodChange}
                                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                            >
                                <option value="yearly">השנה</option>
                                <option value="monthly">חודש</option>
                                <option value="quarterly">רבעון</option>
                            </select>

                            {/* Custom dropdown arrow */}
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">
                                <ChevronDown size={14} />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-start md:gap-4 gap-2">
                    <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='API' />
                    <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='Download' />
                </div>
            </div>
            <div className="h-[300px]">
                {/* <p className="text-right text-xs text-gray-500 ">[mTCO₂/h]</p> */}
                <ResponsiveContainer width="100%" height="95%">
                    <LineChart data={currentData} margin={{ top: 20, right: 0, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <YAxis tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} label={{
                            value: "[mTCO₂/h]",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: 'middle' }
                        }}
                        />
                        {/* <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                            }}
                        /> */}
                        {activeLines.co2 && (
                            <Line
                                type="linear"
                                dataKey="co2"
                                stroke="#5D6FFF"
                                strokeWidth={1.5}
                                dot={false}
                                opacity={getOpacity("co2")}
                            />
                        )}
                        {activeLines.saved && (
                            <Line
                                type="linear"
                                dataKey="saved"
                                stroke="#1E8025"
                                strokeWidth={1.5}
                                dot={false}
                                opacity={getOpacity("saved")}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-start gap-6 mt-4">
                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                    onClick={() => toggleLine("co2")}
                    onMouseEnter={() => setHoveredLegend("co2")}
                    onMouseLeave={() => setHoveredLegend(null)}
                    style={{ opacity: getLegendOpacity("co2") }}
                >
                    <span
                        className="w-2 h-2 rounded-full transition-opacity duration-200"
                        style={{
                            backgroundColor: "#5D6FFF",
                            opacity: activeLines.co2 ? 1 : 0.3,
                        }}
                    ></span>
                    <span
                        className={`text-xs transition-all duration-200 ${activeLines.co2 ? "text-gray-800" : "text-gray-400"
                            }`}
                    >
                        פליטות CO₂
                    </span>
                </div>

                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                    onClick={() => toggleLine("saved")}
                    onMouseEnter={() => setHoveredLegend("saved")}
                    onMouseLeave={() => setHoveredLegend(null)}
                    style={{ opacity: getLegendOpacity("saved") }}
                >
                    <span
                        className="w-2 h-2 rounded-full transition-opacity duration-200"
                        style={{
                            backgroundColor: "#1E8025",
                            opacity: activeLines.saved ? 1 : 0.3,
                        }}
                    ></span>
                    <span
                        className={`text-xs transition-all duration-200 ${activeLines.saved ? "text-gray-800" : "text-gray-400"
                            }`}
                    >
                        חיסכון בפליטות על ידי ייצור מאנרגיות מתחדשות
                    </span>
                </div>
            </div>
        </div >
    );
};

export default CO2LineChart;