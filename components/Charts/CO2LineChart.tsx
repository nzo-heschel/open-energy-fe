"use client";

import DateRangePicker from '@/components/ui/DateRangePicker';
import { useCO2EmissionsOverTime, exportCO2EmissionsOverTime } from '@/lib/api';
import api from '@/public/images/API.png';
import download from '@/public/images/download_2.png';
import { format, subDays } from 'date-fns';
import Image from "next/image";
import { useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip as UITooltip } from "../ui/tooltip";

type DataPoint = {
    date: string;
    co2: number;
    saved: number;
};

const CO2LineChart = () => {
    const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
    const [activeLines, setActiveLines] = useState({
        co2: true,
        saved: true,
    });
    const [startDate, setStartDate] = useState<string>(() => {
        return format(subDays(new Date(), 6), 'yyyy-MM-dd');
    });
    const [endDate, setEndDate] = useState<string>(() => {
        return format(new Date(), 'yyyy-MM-dd');
    });

    const { data, isLoading, error } = useCO2EmissionsOverTime(startDate, endDate);

    const toggleLine = (key: keyof typeof activeLines) => {
        setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    // Handle export to Excel
    const handleExport = async () => {
        try {
            await exportCO2EmissionsOverTime(startDate, endDate);
        } catch (error) {
            console.error('Failed to export CO2 emissions over time data:', error);
        }
    };

    // Transform API data to chart format
    const currentData = useMemo<DataPoint[]>(() => {
        if (!data?.chart_data) {
            return [];
        }

        const chartData = data.chart_data;
        const totalEmissionsAvoided = data.infographics?.emissions_avoided_through_renewables?.value || 0;
        const totalEmissions = chartData.reduce((sum, item) => sum + item.total_emissions, 0);

        return chartData.map((item) => {
            // Calculate saved proportionally based on this period's share of total emissions
            const emissionsShare = totalEmissions > 0 ? item.total_emissions / totalEmissions : 0;
            const saved = totalEmissionsAvoided * emissionsShare;

            return {
                date: item.label || item.period,
                co2: item.total_emissions,
                saved: saved,
            };
        });
    }, [data]);

    const getOpacity = (key: string) => {
        if (!hoveredLegend) return 1;
        return hoveredLegend === key ? 1 : 0.3;
    };

    const getLegendOpacity = (key: string) => {
        if (!hoveredLegend) return 1;
        return hoveredLegend === key ? 1 : 0.5;
    };

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[16px] p-4 md:p-6 overflow-hidden">
            <div className="flex flex-col gap-2">
                {/* Header row with title and buttons */}
                <div className="flex flex-row items-start justify-between gap-2">
                    {/* Buttons */}
                    <div className="flex flex-row items-center gap-2 shrink-0">
                        <a
                            href="/api#co2-emissions-over-time"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            aria-label="View API Documentation"
                        >
                            <Image src={api} width={32} height={32} className='w-7 h-7 md:w-8 md:h-8' alt='API' />
                        </a>
                        <button
                            onClick={handleExport}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            aria-label="Export to Excel"
                        >
                            <Image src={download} width={32} height={32} className='w-7 h-7 md:w-8 md:h-8' alt='Download' />
                        </button>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col text-right flex-1 min-w-0">
                        <h2 className="text-base md:text-lg font-bold text-gray-700 flex items-center justify-end gap-2">
                            <TooltipProvider>
                                <UITooltip>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="inline-flex items-center shrink-0">
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 21 21"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="cursor-pointer md:w-[21px] md:h-[21px]"
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
                            <span className="truncate">פליטות CO₂ על פני זמן</span>
                        </h2>
                    </div>
                </div>

                {/* Date controls row */}
                <div className="flex flex-col items-end gap-1">
                    <p className="text-xs md:text-sm text-slate-600">פרק זמן:</p>
                    <div className="flex items-center gap-2 flex-wrap justify-end w-full">
                        <DateRangePicker
                            onDateRangeChange={handleDateRangeChange}
                            defaultPreset="last7Days"
                        />
                        <span className="text-xs md:text-sm text-slate-600 whitespace-nowrap">:מיון לפי</span>
                    </div>
                </div>
            </div>
            <div className="h-[300px]">
                {(() => {
                    if (isLoading) {
                        return (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-slate-600">טוען נתונים...</p>
                            </div>
                        );
                    }
                    if (error) {
                        return (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-red-600">שגיאה בטעינת הנתונים</p>
                            </div>
                        );
                    }
                    if (currentData.length === 0) {
                        return (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-slate-600">אין נתונים זמינים</p>
                            </div>
                        );
                    }
                    return (
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
                    );
                })()}
            </div>

            {/* Legend */}
            <div className="flex flex-col md:flex-row justify-start gap-6 mt-4">
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