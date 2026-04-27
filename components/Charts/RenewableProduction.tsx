"use client";

import { exportRenewablesProductionMix, useRenewablesProductionMix } from "@/lib/api";
import api from '@/public/images/API.png';
import download from '@/public/images/download_2.png';
import { format, subDays } from "date-fns";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import TooltipInfo from "../TooltipInfo";
import DateRangePicker from "../ui/DateRangePicker";

type DataPoint = {
    period: string;
    label?: string;
    total: number;
    other: number;
    solar: number;
    wind: number;
    otherMW: number;
    solarMW: number;
    windMW: number;
};

const series = [
    { key: "other", label: "אחר", color: "#2F6497" },
    { key: "solar", label: "סולארי", color: "#F1C40F" },
    { key: "wind", label: "רוח", color: "#7BC94A" },
];

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const payloadPoint = payload[0]?.payload;
    const totalMW =
        (payloadPoint.windMW || 0) + (payloadPoint.solarMW || 0) + (payloadPoint.otherMW || 0);

    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-4 min-w-[140px] text-sm">
            <div className="text-xs text-gray-500 mb-2">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">{totalMW ? `${totalMW.toLocaleString()} MW` : `סה״כ ${payloadPoint.total}`}</div>

            {[...series].reverse().map((s) => {
                const mwKey = `${s.key}MW` as keyof typeof payloadPoint;
                return (
                    <div key={s.key} className="flex items-center gap-3 mb-1">
                        <span style={{ background: s.color }} className="w-2 h-2 rounded-full block" />
                        <div className="flex-1">
                            <div className="text-xs text-gray-600">{s.label}</div>
                            <div className="text-sm font-medium">
                                {payloadPoint[mwKey] ? `${payloadPoint[mwKey].toLocaleString()} MW` : ""}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function RenewableProduction() {
    const [activeSeries, setActiveSeries] = useState<string | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [startDate, setStartDate] = useState<string>(() => {
        return format(subDays(new Date(), 6), 'yyyy-MM-dd');
    });
    const [endDate, setEndDate] = useState<string>(() => {
        return format(new Date(), 'yyyy-MM-dd');
    });

    const { data: apiData, isLoading, error } = useRenewablesProductionMix(startDate, endDate);

    const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const handleExport = async () => {
        try {
            await exportRenewablesProductionMix(startDate, endDate);
        } catch (error) {
            console.error('Failed to export renewables production mix data:', error);
        }
    };

    // Transform API data to chart format
    const chartData = useMemo<DataPoint[]>(() => {
        if (!apiData?.series) {
            return [];
        }

        // For year filter (this year / last 12 months / multi-year ranges), use the
        // monthly_series breakdown so each month appears as its own bar.
        const sourceSeries =
            apiData.filter === 'year' && apiData.monthly_series && apiData.monthly_series.length > 0
                ? apiData.monthly_series
                : apiData.series;

        const monthLabels = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];

        const formatLabel = (period: string, fallback?: string) => {
            // YYYY-MM → localized short month (with year suffix when multi-year range)
            const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
            if (monthMatch) {
                const monthIdx = parseInt(monthMatch[2], 10) - 1;
                const year = monthMatch[1];
                const monthName = monthLabels[monthIdx] ?? monthMatch[2];
                const spansMultipleYears = (apiData.monthly_series ?? []).some(
                    (m) => /^(\d{4})-/.exec(m.period)?.[1] !== year
                );
                return spansMultipleYears ? `${monthName} ${year.slice(2)}'` : monthName;
            }
            return fallback || period;
        };

        return sourceSeries.map((item) => {
            const totalMW =
                item.total_mwh ??
                ((item.solar_mwh || 0) + (item.wind_mwh || 0) + (item.other_mwh || 0));
            // Calculate percentage shares for stacked bar heights
            const solarPercent = totalMW > 0 ? ((item.solar_mwh || 0) / totalMW) * 100 : 0;
            const windPercent = totalMW > 0 ? ((item.wind_mwh || 0) / totalMW) * 100 : 0;
            const otherPercent = totalMW > 0 ? ((item.other_mwh || 0) / totalMW) * 100 : 0;

            return {
                period: item.period,
                label: formatLabel(item.period, item.label),
                total: Math.round(totalMW),
                solar: Math.round(solarPercent),
                wind: Math.round(windPercent),
                other: Math.round(otherPercent),
                solarMW: item.solar_mwh || 0,
                windMW: item.wind_mwh || 0,
                otherMW: item.other_mwh || 0,
            };
        });
    }, [apiData]);


    const opacityForKey = (key: string) => (activeSeries && activeSeries !== key ? 0.18 : 1);

    const CustomRightLegend = () => (
        <div className="flex md:flex-col gap-4 items-start p-4">
            {[...series].reverse().map((s) => (
                <div
                    key={s.key}
                    onMouseEnter={() => setActiveSeries(s.key)}
                    onMouseLeave={() => setActiveSeries(null)}
                    className="flex items-center gap-3 cursor-pointer select-none"
                >
                    <span
                        style={{
                            background: s.color,
                            opacity: activeSeries && activeSeries !== s.key ? 0.3 : 1,
                        }}
                        className="w-3 h-3 rounded-full inline-block"
                    />
                    <div className="text-sm">{s.label}</div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            <div className="flex flex-col md:flex-row items-start justify-between">
                <div className="flex flex-col gap-2 mb-3">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        תחמ״ל ייצור אנרגיות מתחדשות
                        <div
                            className="relative"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <svg
                                width="21"
                                height="21"
                                viewBox="0 0 21 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="cursor-help"
                            >
                                <g opacity="0.5">
                                    <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                    <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                </g>
                            </svg>

                            {/* Tooltip that appears on hover */}
                            {showTooltip && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                                    <TooltipInfo
                                        content="
                                        הגרף מציג את כמות החשמל שיוצר מאנרגיות מתחדשות (שמש, רוח ואחרים) לאורך שנה נבחרת, לפי חודשים.
ניתן ללמוד ממנו איך משתנה ייצור החשמל מאנרגיות מתחדשות לאורך השנה, ימים, או חודשים,, ומה התרומה של כל סוג טכנולוגיה (רוח, סולארי, אחר) בכל חודש.
הנתונים נאספים ממערכת נוגה ומתעדכנים מעת לעת. ניתן לסנן לפי סוג טכנולוגיה ושנה, יום או חודש,, ולהוריד את המידע לקובץ אקסל או לגשת אליו דרך API.
                                        "
                                    />
                                </div>
                            )}
                        </div>
                    </h2>
                    <p className="mr-14">פרק זמן:</p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">סינון לפי:</span>
                        <DateRangePicker
                            onDateRangeChange={handleDateRangeChange}
                            defaultPreset="last7Days"
                        />
                    </div>
                </div>

                <div className="flex items-start md:gap-4 gap-2">
                    <a
                        href="/api#renewables-production-mix"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        aria-label="View API Documentation"
                    >
                        <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='API' />
                    </a>
                    <button
                        onClick={handleExport}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        aria-label="Export to Excel"
                    >
                        <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='Download' />
                    </button>
                </div>
            </div>

            <div className="md:flex gap-4">
                {/* legend at the right side */}
                <div className="w-40 flex-shrink-0">
                    <CustomRightLegend />
                </div>
                {/* chart area */}
                <div className="flex-1 md:h-[420px] h-[320px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-slate-600">טוען נתונים...</p>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-red-600">שגיאה בטעינת הנתונים</p>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-slate-600">אין נתונים זמינים</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                                <CartesianGrid vertical={false} strokeDasharray="6 6" />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} label={{
                                    value: "[MW]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                                }} />
                                <Tooltip content={<CustomTooltip />} />
                                {/* Bars (stacked): order matters for stack visual */}
                                <Bar
                                    dataKey="otherMW"
                                    stackId="a"
                                    fill={series[0].color}
                                    radius={[0, 0, 0, 0]}
                                    barSize={28}
                                    opacity={opacityForKey("other")}
                                />
                                <Bar
                                    dataKey="solarMW"
                                    stackId="a"
                                    fill={series[1].color}
                                    radius={[0, 0, 0, 0]}
                                    barSize={28}
                                    opacity={opacityForKey("solar")}
                                />
                                <Bar
                                    dataKey="windMW"
                                    stackId="a"
                                    fill={series[2].color}
                                    radius={[4, 4, 0, 0]}
                                    barSize={28}
                                    opacity={opacityForKey("wind")}
                                >
                                    <LabelList
                                        dataKey="total"
                                        position="top"
                                        style={{ fill: "#707585", fontWeight: 500 }}
                                        formatter={(value: number) => value.toLocaleString()}
                                    />
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}