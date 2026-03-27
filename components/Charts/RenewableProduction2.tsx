"use client";

import api from '@/public/images/API.png';
import download from '@/public/images/download_2.png';
import Image from "next/image";
import { useMemo, useState } from "react";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import TooltipInfo from "../TooltipInfo";
import { exportRenewablesTransition, useRenewablesTransition, exportRenewablesPotentialByIndustry, useRenewablesPotentialByIndustry } from "@/lib/api";
import { ChevronDown } from "lucide-react";

// Hebrew month names
const hebrewMonths: Record<string, string> = {
    "01": "ינואר",
    "02": "פברואר",
    "03": "מרץ",
    "04": "אפריל",
    "05": "מאי",
    "06": "יוני",
    "07": "יולי",
    "08": "אוגוסט",
    "09": "ספטמבר",
    "10": "אוקטובר",
    "11": "נובמבר",
    "12": "דצמבר",
};

// Colors for different years
const yearColors: Record<string, string> = {
    "2021": "#8BBFE1",
    "2022": "#3A7C2F",
    "2023": "#A7BF56",
    "2024": "#DACF61",
    "2025": "#E57373",
    "2026": "#64B5F6",
};


export default function RenewableProduction2() {
    const [activeSeries, setActiveSeries] = useState<string | null>(null);
    const [tab, setTab] = useState(1);
    const [showTooltip, setShowTooltip] = useState(false);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

    // Generate available years (last 5 years)
    const availableYears = useMemo(() => {
        const years: string[] = [];
        for (let i = 0; i < 5; i++) {
            years.push((currentYear - i).toString());
        }
        return years;
    }, [currentYear]);

    // Tab 1: Transition data (monthly)
    const { data: transitionData, isLoading: transitionLoading, error: transitionError } = useRenewablesTransition(selectedYear);

    // Tab 2: Potential by industry data
    const { data: industryData, isLoading: industryLoading, error: industryError } = useRenewablesPotentialByIndustry(selectedYear);

    // Determine loading/error based on current tab
    const isLoading = tab === 1 ? transitionLoading : industryLoading;
    const error = tab === 1 ? transitionError : industryError;

    const handleExport = async () => {
        try {
            if (tab === 1) {
                await exportRenewablesTransition(selectedYear);
            } else {
                await exportRenewablesPotentialByIndustry(selectedYear);
            }
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    };

    // Transform API data to chart format based on tab
    const { chartData, series } = useMemo(() => {
        if (tab === 1) {
            // Tab 1: Monthly transition data
            if (!transitionData?.monthly_totals) {
                return { chartData: [], series: [] };
            }

            const yearSeries = [{
                key: selectedYear,
                label: selectedYear,
                color: yearColors[selectedYear] || "#8BBFE1"
            }];

            const data = transitionData.monthly_totals.map((item) => {
                const monthNum = item.month.split('-')[1];
                const monthName = hebrewMonths[monthNum] || item.month;

                return {
                    month: monthName,
                    [selectedYear]: item.renewable_mw,
                    renewableMW: item.renewable_mw,
                    totalMW: item.total_mw,
                    sharePercent: item.renewable_share_percent,
                };
            });

            return { chartData: data, series: yearSeries };
        } else {
            // Tab 2: Industry potential data
            if (!industryData?.industry_breakdown) {
                return { chartData: [], series: [] };
            }

            const industrySeries = [{
                key: 'potential',
                label: 'פוטנציאל מתחדשות',
                color: "#7BC94A"
            }];

            const data = industryData.industry_breakdown.map((item) => ({
                month: item.industry_type,
                potential: item.renewable_potential_mw,
                renewableMW: item.renewable_potential_mw,
                solarShare: item.solar_share_percent,
            }));

            return { chartData: data, series: industrySeries };
        }
    }, [transitionData, industryData, selectedYear, tab]);

    const opacityForKey = (key: string) =>
        activeSeries && activeSeries !== key ? 0.18 : 1;

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        const dataPoint = payload[0]?.payload;

        return (
            <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-3 min-w-[160px] text-sm">
                <div className="text-sm text-gray-500 mb-2">{label}</div>
                {tab === 1 ? (
                    <>
                        <div className="text-sm font-medium mb-1">
                            אנרגיה מתחדשת: <span className="font-bold">{dataPoint?.renewableMW?.toLocaleString()} MW</span>
                        </div>
                        <div className="text-sm font-medium mb-1">
                            סה״כ ייצור: <span className="font-bold">{dataPoint?.totalMW?.toLocaleString()} MW</span>
                        </div>
                        <div className="text-sm font-medium border-t border-[#707585] pt-1 mt-1">
                            אחוז מתחדשות: <span className="font-bold">{dataPoint?.sharePercent?.toFixed(1)}%</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-sm font-medium mb-1">
                            פוטנציאל מתחדשות: <span className="font-bold">{dataPoint?.renewableMW?.toLocaleString()} MW</span>
                        </div>
                        <div className="text-sm font-medium border-t border-[#707585] pt-1 mt-1">
                            חלק סולארי: <span className="font-bold">{dataPoint?.solarShare?.toFixed(1)}%</span>
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Custom legend under the chart
    const CustomLegend = () => (
        <div className="flex justify-start gap-6 mt-4">
            {series.map((s) => (
                <div
                    key={s.key}
                    onMouseEnter={() => setActiveSeries(s.key)}
                    onMouseLeave={() => setActiveSeries(null)}
                    className="flex items-center gap-2 cursor-pointer select-none"
                >
                    <span
                        style={{
                            background: s.color,
                            opacity: activeSeries && activeSeries !== s.key ? 0.3 : 1,
                        }}
                        className="w-2 h-2 rounded-full inline-block"
                    />
                    <span className="md:text-sm text-xs">{s.label}</span>
                </div>
            ))}
            {tab === 1 && transitionData?.renewable_share_percent !== undefined && (
                <div className="text-sm text-gray-600 mr-auto">
                    ממוצע שנתי: {transitionData.renewable_share_percent.toFixed(1)}%
                </div>
            )}
            {tab === 2 && industryData?.total_potential_mw !== undefined && (
                <div className="text-sm text-gray-600 mr-auto">
                    סה״כ פוטנציאל: {industryData.total_potential_mw.toLocaleString()} MW
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            <div className="flex flex-col md:flex-row items-start justify-between">
                <div className="flex flex-col gap-2 mb-3">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        המעבר לאנרגיות מתחדשות בישראל - נתוני ייצור
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
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">בחר שנה:</span>
                        <div className="relative w-[120px]">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                style={{ fontFamily: 'Heebo, sans-serif' }}
                            >
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">
                                <ChevronDown size={14} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-start md:gap-4 gap-2">
                    <a
                        href={tab === 1 ? "/api#renewables-transition" : "/api#renewables-potential-by-industry"}
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

            <div className="w-full md:h-[500px] h-[300px]">
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
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="6 6" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: "[MW]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {series.map((s) => (
                                <Bar
                                    key={s.key}
                                    dataKey={s.key}
                                    fill={s.color}
                                    barSize={28}
                                    radius={[4, 4, 0, 0]}
                                    opacity={opacityForKey(s.key)}
                                />
                            ))}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
            {!isLoading && !error && chartData.length > 0 && <CustomLegend />}



            {/* Tabs */}
            <div className="flex  gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] mb-4 w-fit ml-auto mt-4 md:-mt-10" style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}>
                <button
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${tab === 1 ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bbg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                    onClick={() => setTab(1)}
                >
                    הספק מיוצר
                </button>
                <button
                    className={`rounded-full md:px-5 px-2 md:py-[6px] py-[2px] font-black md:text-base text-xs ${tab === 2 ? "bg-[#59687D] text-white hover:bg-[#59687D] hover:text-white" : "bg-transparent text-[#59687D] hover:bg-[#59687D] hover:text-white"
                        }`}
                    onClick={() => setTab(2)}
                >
                    פוטנציאל לפי ענף
                </button>
            </div>
        </div>
    );
}
