"use client";

import { mapCombinedSeriesToHourlyChartRows } from "@/lib/smpCombinedSeriesHourly";
import type { SMPProductionVsMarginalPriceResponse } from "@/types/dto";
import { differenceInDays, format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Button } from "../ui/button";
import { ElectricityScatterGraph } from "./ElectricityScatterGraph";

const CustomHourlyXAxisTick = ({
    x,
    y,
    payload,
}: {
    x?: number;
    y?: number;
    payload?: { value?: string };
}) => {
    if (x == null || y == null || !payload?.value) return null;

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#6b7280"
                fontSize={10}
                fontFamily="Heebo, sans-serif"
                transform="rotate(-90)"
            >
                {payload.value}
            </text>
        </g>
    );
};

// Custom Tooltip component for Line Chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0]?.payload;
        // Use label directly (which comes from the period field in the API response)
        const timeLabel = label || dataPoint?.time || dataPoint?.timestamp;

        return (
            <div className="bg-white p-2 rounded-[10px] shadow-md border-none" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
                <p className="text-gray-700 font-medium mb-2 border-b border-[#59687D]">
                    {timeLabel}
                </p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => {
                        const isPrice = entry.dataKey === 'price_with_constraints' || entry.dataKey === 'price_without_constraints';
                        const isDemand = entry.dataKey === 'net_demand';

                        return (
                            <div key={`item-${index}`} className="flex items-center">
                                <div
                                    className="w-2 h-2 rounded-full ml-2"
                                    style={{ backgroundColor: entry.color }}
                                ></div>
                                <span className="text-sm text-[#484C56]">{entry.name}</span>
                                {isPrice && (
                                    <>
                                        <span className="text-gray-600 mx-1">|</span>
                                        <span className="text-sm text-[#484C56] ml-1">
                                            {Math.round(entry.value).toLocaleString()} ₪
                                        </span>
                                    </>
                                )}
                                {isDemand && (
                                    <>
                                        <span className="text-gray-600 mx-1">|</span>
                                        <span className="text-sm text-[#484C56] ml-1">
                                            {Math.round(entry.value).toLocaleString()} MWh
                                        </span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {/* Show net_demand separately if price line is shown */}
                    {dataPoint && dataPoint.net_demand && payload.some((p: any) => p.dataKey === 'price_with_constraints' || p.dataKey === 'price_without_constraints') && !payload.some((p: any) => p.dataKey === 'net_demand') && (
                        <div className="text-xs text-[#484C56] mr-4 mt-1 pt-1 border-t border-gray-200">
                            {Math.round(dataPoint.net_demand).toLocaleString()} MWh
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// Line Chart Component
interface ElectricityLineGraphProps {
    data?: SMPProductionVsMarginalPriceResponse;
    startDate?: string;
    endDate?: string;
    selectedPreset?: string;
}

const ElectricityLineGraph = ({ data, startDate, endDate, selectedPreset }: ElectricityLineGraphProps) => {

    const [activeSeries, setActiveSeries] = useState<string[]>([]);
    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

    // Determine date range type based on actual date range duration
    const dateRangeType = useMemo(() => {
        if (!startDate || !endDate) return 'other';

        // Always calculate from actual date range, regardless of preset
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = differenceInDays(end, start);
        const twoYearsInDays = 730; // 2 years = 730 days

        // Determine range type based on actual duration:
        // - Single day: hourly (combined_series)
        // - 1–61 days: daily data
        // - 62 days to less than 2 years (730 days): monthly data
        // - 2 years (730 days) or more: yearly data
        if (days < 1) {
            return "hour";
        } else if (days < 62) {
            return "day"; // Use daily_average for ranges less than 62 days
        } else if (days < twoYearsInDays) {
            return 'month'; // Use monthly_average for ranges 62 days to less than 2 years
        } else {
            return 'year'; // Use yearly_average for ranges 2 years or more
        }
    }, [startDate, endDate]);

    // Transform API data to chart format
    const chartData = useMemo(() => {
        if (!data) return [];

        if (dateRangeType === "hour") {
            const hourly = mapCombinedSeriesToHourlyChartRows(data.combined_series);
            if (hourly.length > 0) return hourly;
        }

        // Use daily_average for day ranges, monthly_average for month ranges, yearly_average for year ranges
        if (dateRangeType === 'day' && data.daily_average && data.daily_average.length > 0) {
            // For day ranges (0-1 days or up to 2 months), use daily_average
            return data.daily_average.map(item => {
                // Parse and format period based on date range type
                let timeStr = item.period;
                let timestamp = item.period;

                try {
                    // Try to parse period as date (could be ISO format like "2025-12-01")
                    let date: Date | null = null;

                    // Try ISO date first
                    if (item.period.match(/^\d{4}-\d{2}-\d{2}/)) {
                        date = parseISO(item.period);
                    } else if (item.period.match(/^\d{4}-\d{2}/)) {
                        // Year-month format
                        date = parseISO(item.period + '-01');
                    } else {
                        // Try general date parsing
                        date = new Date(item.period);
                    }

                    if (date && !isNaN(date.getTime())) {
                        // For day range (can be up to 2 months), format based on data
                        // If it's a full date (YYYY-MM-DD), format as "dd/MM"
                        // If it's a time, format as "HH:mm"
                        if (item.period.match(/^\d{4}-\d{2}-\d{2}/)) {
                            timeStr = format(date, 'dd/MM');
                        } else {
                            timeStr = format(date, 'HH:mm');
                        }
                        timestamp = item.period;
                    }
                } catch (e) {
                    // If parsing fails, use period as-is
                    timeStr = item.period;
                    timestamp = item.period;
                }

                return {
                    time: timeStr,
                    timestamp: timestamp,
                    price_with_constraints: item.price_with_constraints ?? item.avg_smp ?? 0,
                    price_without_constraints: item.price_without_constraints ?? 0,
                    net_demand: item.net_demand ?? 0,
                    smp: item.avg_smp ?? 0
                };
            }).sort((a, b) => {
                // Sort by timestamp/period
                try {
                    const dateA = new Date(a.timestamp);
                    const dateB = new Date(b.timestamp);
                    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                        return dateA.getTime() - dateB.getTime();
                    }
                } catch (e) {
                    // If sorting fails, keep original order
                }
                return a.timestamp.localeCompare(b.timestamp);
            });
        } else if (dateRangeType === 'month' && data.monthly_average && data.monthly_average.length > 0) {
            // Use monthly_average for month ranges (less than 24 months)
            return data.monthly_average.map(item => {
                // Parse and format period for month view
                let timeStr = item.period;
                let timestamp = item.period;

                try {
                    // Try to parse period as date
                    let date: Date | null = null;

                    // Try year-month format (YYYY-MM)
                    if (item.period.match(/^\d{4}-\d{2}$/)) {
                        date = parseISO(item.period + '-01');
                    } else {
                        // Try general date parsing
                        date = new Date(item.period);
                    }

                    if (date && !isNaN(date.getTime())) {
                        // For month view, format as "MM/yy" (e.g., "12/25")
                        timeStr = format(date, 'MM/yy');
                        timestamp = item.period;
                    }
                } catch (e) {
                    // If parsing fails, use period as-is
                    timeStr = item.period;
                    timestamp = item.period;
                }

                return {
                    time: timeStr,
                    timestamp: timestamp,
                    price_with_constraints: item.price_with_constraints ?? item.avg_smp ?? 0,
                    price_without_constraints: item.price_without_constraints ?? 0,
                    net_demand: item.net_demand ?? 0,
                    smp: item.avg_smp ?? 0
                };
            }).sort((a, b) => {
                // Sort by timestamp/period
                try {
                    const dateA = new Date(a.timestamp);
                    const dateB = new Date(b.timestamp);
                    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                        return dateA.getTime() - dateB.getTime();
                    }
                } catch (e) {
                    // If sorting fails, keep original order
                }
                return a.timestamp.localeCompare(b.timestamp);
            });
        } else if (dateRangeType === 'year') {
            // Use yearly_average for ranges more than 1 year
            // Only fallback to monthly_average if yearly_average is not available
            const yearData = (data.yearly_average && data.yearly_average.length > 0)
                ? data.yearly_average
                : (data.monthly_average && data.monthly_average.length > 0 ? data.monthly_average : []);

            if (yearData.length === 0) return [];

            return yearData.map(item => {
                // Parse and format period for year view
                let timeStr = item.period;
                let timestamp = item.period;

                try {
                    // Try to parse period as date
                    let date: Date | null = null;

                    // Try year-month format (YYYY-MM) or year format (YYYY)
                    if (item.period.match(/^\d{4}-\d{2}$/)) {
                        date = parseISO(item.period + '-01');
                    } else if (item.period.match(/^\d{4}$/)) {
                        // Year only format
                        date = parseISO(item.period + '-01-01');
                    } else {
                        // Try general date parsing
                        date = new Date(item.period);
                    }

                    if (date && !isNaN(date.getTime())) {
                        // For year view, format as "MM/yy" (e.g., "12/25") or "yyyy" for year-only
                        if (item.period.match(/^\d{4}$/)) {
                            timeStr = format(date, 'yyyy');
                        } else {
                            timeStr = format(date, 'MM/yy');
                        }
                        timestamp = item.period;
                    }
                } catch (e) {
                    // If parsing fails, use period as-is
                    timeStr = item.period;
                    timestamp = item.period;
                }

                return {
                    time: timeStr,
                    timestamp: timestamp,
                    price_with_constraints: item.price_with_constraints ?? item.avg_smp ?? 0,
                    price_without_constraints: item.price_without_constraints ?? 0,
                    net_demand: item.net_demand ?? 0,
                    smp: item.avg_smp ?? 0
                };
            }).sort((a, b) => {
                // Sort by timestamp/period
                try {
                    const dateA = new Date(a.timestamp);
                    const dateB = new Date(b.timestamp);
                    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                        return dateA.getTime() - dateB.getTime();
                    }
                } catch (e) {
                    // If sorting fails, keep original order
                }
                return a.timestamp.localeCompare(b.timestamp);
            });
        }

        // Fallback to combined_series if averages are not available
        const fallbackHourly = mapCombinedSeriesToHourlyChartRows(
            data.combined_series,
        );
        if (fallbackHourly.length > 0) return fallbackHourly;

        return [];
    }, [data, dateRangeType]);

    // Calculate Y-axis domains
    const priceDomain = useMemo(() => {
        if (!chartData || chartData.length === 0) return [0, 220];
        const prices = chartData
            .map(item => item.price_with_constraints || item.smp || 0)
            .filter(p => p > 0);
        if (prices.length === 0) return [0, 220];
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const padding = Math.max((maxPrice - minPrice) * 0.1, maxPrice * 0.05);
        return [Math.max(0, Math.floor(minPrice - padding)), Math.ceil(maxPrice + padding)];
    }, [chartData]);

    const demandDomain = useMemo(() => {
        if (!chartData || chartData.length === 0) return [0, 11000];
        const demands = chartData.map(item => item.net_demand || 0).filter(d => d > 0);
        if (demands.length === 0) return [0, 11000];
        const minDemand = Math.min(...demands);
        const maxDemand = Math.max(...demands);
        const padding = Math.max((maxDemand - minDemand) * 0.1, maxDemand * 0.05);
        return [Math.max(0, Math.floor(minDemand - padding)), Math.ceil(maxDemand + padding)];
    }, [chartData]);

    // Show labels for every data point
    const xAxisInterval = 0;

    const shouldRotateLabels = dateRangeType === "hour";

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

    // Custom Y-axis label for left axis (price). SVG text uses fill for color.
    const CustomLeftYAxisLabel = (props: any) => {
        const { viewBox } = props;
        const centerY = (viewBox.y + viewBox.height) / 2;
        return (
            <text
                x={viewBox.x}
                y={centerY}
                textAnchor="middle"
                fill="#707585"
                className="text-sm font-normal"
                style={{ fontFamily: 'Heebo, sans-serif' }}
                transform={`rotate(-90 ${viewBox.x} ${centerY})`}
            >
                מחיר שולי [MWh/₪]
            </text>
        );
    };

    // Custom Y-axis label for right axis (MW). SVG text uses fill for color.
    const CustomRightYAxisLabel = (props: any) => {
        const { viewBox } = props;
        const centerY = (viewBox.y + viewBox.height) / 2;
        const rightX = viewBox.x + viewBox.width;
        return (
            <text
                x={rightX}
                y={centerY}
                textAnchor="middle"
                fill="#707585"
                className="text-sm font-normal"
                style={{ fontFamily: 'Heebo, sans-serif' }}
                transform={`rotate(-90 ${rightX} ${centerY})`}
            >
                [MWh]
            </text>
        );
    };

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

    if (!data) {
        return (
            <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
                <p className="text-slate-600">טוען נתונים...</p>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
                <p className="text-slate-600">אין נתונים להצגה</p>
            </div>
        );
    }

    return (
        <div className="w-full md:h-[500px] h-[300px] md:mt-0 -mt-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 50,
                        right: 50,
                        left: 30,
                        bottom: 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        tick={
                            shouldRotateLabels ? (
                                <CustomHourlyXAxisTick />
                            ) : (
                                { fontSize: 11, fontFamily: "Heebo, sans-serif" }
                            )
                        }
                        axisLine={true}
                        interval={xAxisInterval}
                        height={shouldRotateLabels ? 88 : 30}
                        tickMargin={shouldRotateLabels ? 18 : 5}
                    />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        domain={priceDomain}
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                        tickMargin={10}
                        label={<CustomLeftYAxisLabel />}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={demandDomain}
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                        tickMargin={35}
                        label={<CustomRightYAxisLabel />}
                    />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Legend content={renderLegend} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="price_with_constraints"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeOpacity={getLineOpacity("price_with_constraints")}
                        dot={false}
                        name="מחיר שולי כולל אילוצים"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="net_demand"
                        stroke="#eab308"
                        strokeWidth={2}
                        strokeOpacity={getLineOpacity("net_demand")}
                        dot={false}
                        name="ביקוש משקי"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Main Component with Tab Switching
interface ElectricityGraphWithTabsProps {
    data?: SMPProductionVsMarginalPriceResponse;
    isLoading?: boolean;
    error?: Error | null;
    startDate?: string;
    endDate?: string;
    selectedPreset?: string;
}

const ElectricityGraphWithTabs = ({ data, isLoading, error, startDate, endDate, selectedPreset }: ElectricityGraphWithTabsProps) => {
    const [chartView, setChartView] = useState<'time' | 'scatter'>('time');

    return (
        <div className="h-full w-full p-4">
            <div className="">
                <div className="flex flex-col gap-2  w-full">
                    <div className=" w-full">
                        <div className='flex flex-col gap-6'>
                            <div className="">
                                {isLoading ? (
                                    <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
                                        <p className="text-slate-600">טוען נתונים...</p>
                                    </div>
                                ) : error ? (
                                    <div className="w-full md:h-[500px] h-[300px] flex items-center justify-center">
                                        <p className="text-red-600">שגיאה בטעינת הנתונים</p>
                                    </div>
                                ) : chartView === 'time' ? (
                                    <ElectricityLineGraph data={data} startDate={startDate} endDate={endDate} selectedPreset={selectedPreset} />
                                ) : (
                                    <ElectricityScatterGraph data={data} isLoading={isLoading} error={error} startDate={startDate} endDate={endDate} selectedPreset={selectedPreset} />
                                )}
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
                                        תצוגת מתאם
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