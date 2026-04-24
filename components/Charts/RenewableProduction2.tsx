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
import YearMultiSelectDropdown from "../ui/YearMultiSelectDropdown";
import { exportRenewablesTransition, useRenewablesTransition, exportRenewablesPotentialByIndustry, useRenewablesPotentialByIndustry } from "@/lib/api";

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
const MONTH_ORDER = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

// Year → color. 2021–2024 match the Figma palette exactly.
const yearColors: Record<string, string> = {
    "2021": "#8BBFE1",
    "2022": "#3A7C2F",
    "2023": "#A7BF56",
    "2024": "#DACF61",
    "2025": "#E57373",
    "2026": "#64B5F6",
};

// Fixed set of years we support. Hooks must be called in a stable order, so we
// fetch this list unconditionally and let the dropdown filter which to render.
const SUPPORTED_YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"];

const toNumber = (v: unknown): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
        const parsed = parseFloat(v);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

// Aggregate a daily renewables-transition series into a per-month share %.
// Returns { "01": 12.3, "02": 14.1, ... } — keys are two-digit months.
function aggregateMonthlyShare(series: Array<Record<string, unknown>> | undefined): Record<string, number> {
    if (!series?.length) return {};
    const monthly: Record<string, { renewable: number; total: number }> = {};
    for (const raw of series) {
        const item = raw as Record<string, unknown>;
        const dateStr = (item.date ?? item.period ?? item.month) as string | undefined;
        const monthNum = dateStr?.split('-')[1];
        if (!monthNum) continue;
        const renewable =
            item.renewable_mwh !== undefined
                ? toNumber(item.renewable_mwh)
                : toNumber(item.solar_mwh ?? item.solar) +
                  toNumber(item.wind_mwh ?? item.wind) +
                  toNumber(item.other_mwh ?? item.other);
        const total = toNumber(item.total_mwh ?? item.total);
        const bucket = monthly[monthNum] ?? { renewable: 0, total: 0 };
        bucket.renewable += renewable;
        bucket.total += total;
        monthly[monthNum] = bucket;
    }
    const result: Record<string, number> = {};
    for (const [m, { renewable, total }] of Object.entries(monthly)) {
        result[m] = total > 0 ? (renewable / total) * 100 : 0;
    }
    return result;
}

export default function RenewableProduction2() {
    const [tab, setTab] = useState(1);
    const [showTooltip, setShowTooltip] = useState(false);
    const currentYear = new Date().getFullYear();

    // Multi-year selection — default to the four Figma years plus current year when available.
    const defaultSelection = useMemo(
        () => SUPPORTED_YEARS.filter((y) => ["2021", "2022", "2023", "2024"].includes(y)),
        []
    );
    const [selectedYears, setSelectedYears] = useState<string[]>(defaultSelection);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [hoveredYear, setHoveredYear] = useState<string | null>(null);

    // One query per supported year — stable hook order.
    const q2021 = useRenewablesTransition("2021");
    const q2022 = useRenewablesTransition("2022");
    const q2023 = useRenewablesTransition("2023");
    const q2024 = useRenewablesTransition("2024");
    const q2025 = useRenewablesTransition("2025");
    const q2026 = useRenewablesTransition("2026");
    const yearData: Record<string, any> = {
        "2021": q2021.data,
        "2022": q2022.data,
        "2023": q2023.data,
        "2024": q2024.data,
        "2025": q2025.data,
        "2026": q2026.data,
    };
    const yearLoading: Record<string, boolean> = {
        "2021": q2021.isLoading,
        "2022": q2022.isLoading,
        "2023": q2023.isLoading,
        "2024": q2024.isLoading,
        "2025": q2025.isLoading,
        "2026": q2026.isLoading,
    };
    const yearError: Record<string, unknown> = {
        "2021": q2021.error,
        "2022": q2022.error,
        "2023": q2023.error,
        "2024": q2024.error,
        "2025": q2025.error,
        "2026": q2026.error,
    };

    // Tab 2: Potential by industry — use the newest selected year (or current) to drive it.
    const industryYear = selectedYears.length > 0
        ? selectedYears.slice().sort().slice(-1)[0]
        : currentYear.toString();
    const { data: industryData, isLoading: industryLoading, error: industryError } = useRenewablesPotentialByIndustry(industryYear);

    // Years the user actually wants to see; fall back to "all" when the selection is empty.
    const visibleYears = useMemo(() => {
        const pool = selectedYears.length > 0 ? selectedYears : SUPPORTED_YEARS;
        return pool.filter((y) => SUPPORTED_YEARS.includes(y)).sort();
    }, [selectedYears]);

    // Loading/error for Tab 1 is the union of the visible years' queries.
    const transitionLoading = visibleYears.some((y) => yearLoading[y]);
    const transitionError = visibleYears.some((y) => yearError[y]);

    const isLoading = tab === 1 ? transitionLoading : industryLoading;
    const error = tab === 1 ? transitionError : industryError;

    // Build the monthly grouped-bar data: one row per month, one key per visible year.
    const chartData = useMemo(() => {
        if (tab !== 1) {
            if (!industryData?.industry_breakdown) return [] as any[];
            return industryData.industry_breakdown.map((item) => ({
                month: item.industry_type,
                potential: item.renewable_potential_mw,
                renewableMW: item.renewable_potential_mw,
                solarShare: item.solar_share_percent,
            }));
        }

        const perYear: Record<string, Record<string, number>> = {};
        for (const y of visibleYears) {
            perYear[y] = aggregateMonthlyShare(yearData[y]?.series);
        }

        return MONTH_ORDER.map((monthNum) => {
            const row: Record<string, unknown> = { month: hebrewMonths[monthNum] };
            for (const y of visibleYears) {
                const pct = perYear[y]?.[monthNum];
                if (typeof pct === 'number' && pct > 0) {
                    row[y] = Number(pct.toFixed(2));
                }
            }
            return row;
        }).filter((row) => visibleYears.some((y) => typeof row[y] === 'number'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, industryData, visibleYears, q2021.data, q2022.data, q2023.data, q2024.data, q2025.data, q2026.data]);

    // Series metadata for the legend (reversed so the most recent year sits first in RTL).
    const legendSeries = useMemo(
        () => visibleYears.map((y) => ({
            key: y,
            label: y,
            color: yearColors[y] ?? "#999999",
        })),
        [visibleYears]
    );

    const handleExport = async () => {
        try {
            if (tab === 1) {
                // Export the most recent selected year (server endpoint is single-year).
                await exportRenewablesTransition(visibleYears[visibleYears.length - 1]);
            } else {
                await exportRenewablesPotentialByIndustry(industryYear);
            }
        } catch (err) {
            console.error('Failed to export data:', err);
        }
    };

    const opacityForKey = (key: string) => (hoveredYear && hoveredYear !== key ? 0.25 : 1);

    // Tooltip: month header + total of shown percentages + per-year rows (Figma layout).
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        if (tab === 2) {
            const dataPoint = payload[0]?.payload;
            return (
                <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-3 min-w-[160px] text-sm">
                    <div className="text-sm text-gray-500 mb-2">{label}</div>
                    <div className="text-sm font-medium mb-1">
                        פוטנציאל מתחדשות: <span className="font-bold">{dataPoint?.renewableMW?.toLocaleString()} MW</span>
                    </div>
                    <div className="text-sm font-medium border-t border-[#707585] pt-1 mt-1">
                        חלק סולארי: <span className="font-bold">{dataPoint?.solarShare?.toFixed(1)}%</span>
                    </div>
                </div>
            );
        }

        const rows = legendSeries
            .map((s) => {
                const entry = payload.find((p: any) => p.dataKey === s.key);
                const value = entry ? Number(entry.value) : undefined;
                return typeof value === 'number' ? { ...s, value } : null;
            })
            .filter((r): r is { key: string; label: string; color: string; value: number } => r !== null);

        const total = rows.reduce((sum, r) => sum + r.value, 0);

        return (
            <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-3 min-w-[140px] text-sm">
                <div className="text-sm text-[#707585] mb-1 text-right">{label}</div>
                <div className="text-base font-medium text-[#59687D] border-b border-[#707585] pb-1 mb-2 text-right">
                    סה״כ {total.toFixed(0)}%
                </div>
                <div className="flex flex-col gap-1">
                    {rows.map((r) => (
                        <div key={r.key} className="flex flex-row-reverse items-center justify-between gap-3">
                            <div className="flex flex-row-reverse items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                                <span className="text-sm text-[#59687D]">{r.label}</span>
                            </div>
                            <span className="text-sm font-medium text-[#484C56]">{r.value.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

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
                        <div className="relative w-[140px]">
                            <YearMultiSelectDropdown
                                selectedYears={selectedYears}
                                onChange={setSelectedYears}
                                options={SUPPORTED_YEARS.slice().sort((a, b) => Number(b) - Number(a))}
                                isOpen={isYearDropdownOpen}
                                setIsOpen={setIsYearDropdownOpen}
                            />
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
                            barGap={6}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid vertical={false} strokeDasharray="6 6" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                domain={tab === 1 ? [0, (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.15))] : [0, 'auto' as any]}
                                tickFormatter={(v) => tab === 1 ? `${v}` : Number(v).toLocaleString()}
                                label={{
                                    value: tab === 1 ? "אחוז מכלל הייצור %" : "[MW]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                            {tab === 1
                                ? legendSeries.map((s) => (
                                    <Bar
                                        key={s.key}
                                        dataKey={s.key}
                                        fill={s.color}
                                        barSize={13}
                                        radius={[2, 2, 0, 0]}
                                        opacity={opacityForKey(s.key)}
                                    />
                                ))
                                : (
                                    <Bar
                                        dataKey="potential"
                                        fill="#7BC94A"
                                        barSize={28}
                                        radius={[4, 4, 0, 0]}
                                    />
                                )}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend — matches Figma: year + colored dot, laid out RTL at bottom */}
            {!isLoading && !error && chartData.length > 0 && tab === 1 && (
                <div className="flex flex-row-reverse justify-end flex-wrap gap-6 mt-4">
                    {legendSeries.map((s) => (
                        <button
                            key={s.key}
                            type="button"
                            onMouseEnter={() => setHoveredYear(s.key)}
                            onMouseLeave={() => setHoveredYear(null)}
                            className="flex flex-row-reverse items-center gap-[10px] cursor-pointer select-none transition-opacity"
                            style={{ opacity: hoveredYear && hoveredYear !== s.key ? 0.5 : 1 }}
                        >
                            <span className="text-base font-medium text-[#484C56]">{s.label}</span>
                            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        </button>
                    ))}
                </div>
            )}
            {!isLoading && !error && chartData.length > 0 && tab === 2 && industryData?.total_potential_mw !== undefined && (
                <div className="flex justify-end mt-4">
                    <div className="text-sm text-gray-600">
                        סה״כ פוטנציאל: {industryData.total_potential_mw.toLocaleString()} MW
                    </div>
                </div>
            )}

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
