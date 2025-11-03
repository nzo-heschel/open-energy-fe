"use client";

import React, { useState } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Bar,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Image from "next/image";
import TooltipInfo from "../TooltipInfo";

// Data extracted from the image (approximate values of % renewable per year/month)
const data = [
    { month: "ינואר", "2021": 43, "2022": 33, "2023": 25, "2024": 20 },
    { month: "פברואר", "2021": 46, "2022": 40, "2023": 35, "2024": 21 },
    { month: "מרץ", "2021": 43, "2022": 40, "2023": 35, "2024": 20 },
    { month: "אפריל", "2021": 30, "2022": 33, "2023": 25, "2024": 21 },
    { month: "מאי", "2021": 28, "2022": 33, "2023": 25, "2024": 21 },
    { month: "יוני", "2021": 24, "2022": 22, "2023": 25, "2024": 20 },
    { month: "יולי", "2021": 26, "2022": 33, "2023": 25, "2024": 20 },
    { month: "אוגוסט", "2021": 42, "2022": 28, "2023": 25, "2024": 20 },
    { month: "ספטמבר", "2021": 20, "2022": 33, "2023": 25, "2024": 20 },
    { month: "אוקטובר", "2021": 30, "2022": 33, "2023": 25, "2024": 20 },
    { month: "נובמבר", "2021": 33, "2022": 35, "2023": 25, "2024": 20 },
    { month: "דצמבר", "2021": 34, "2022": 35, "2023": 30, "2024": 20 },
];

const series = [
    { key: "2021", label: "2021", color: "#8BBFE1" },
    { key: "2022", label: "2022", color: "#3A7C2F" },
    { key: "2023", label: "2023", color: "#A7BF56" },
    { key: "2024", label: "2024", color: "#DACF61" },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className="rounded-lg shadow-xl border border-[#DEDEDE] bg-white p-2 min-w-[140px] text-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="md:text-base text-sm font-medium mb-3 border-b border-[#707585]">סה״כ 138% </div>
            {payload.map((entry: any) => (
                <div key={entry.dataKey} className="flex items-start gap-2 mb-1">
                    <span
                        style={{ background: entry.color }}
                        className="w-2 h-2 rounded-full block mt-1"
                    />
                    <div className="flex flex-col text-sm font-normal">
                        {entry.dataKey} <span className="font-medium">{entry.value}%</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Custom legend under the chart
const CustomLegend = ({
    activeSeries,
    setActiveSeries,
}: {
    activeSeries: string | null;
    setActiveSeries: (s: string | null) => void;
}) => (
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
    </div>
);

export default function RenewableProduction2() {
    const [activeSeries, setActiveSeries] = useState<string | null>(null);
    const [tab, setTab] = useState(1);
    const [showTooltip, setShowTooltip] = useState(false);

    const opacityForKey = (key: string) =>
        activeSeries && activeSeries !== key ? 0.18 : 1;

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
            <div className="flex items-start justify-between">
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
                <div className="flex items-start md:gap-4 gap-2">
                    <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                    <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                </div>
            </div>

            {tab === 1 ? (
                <>
                    <div className="w-full md:h-[500px] h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="6 6" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} label={{
                                    value: "אחוז מכלל הייצור [%]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle' }
                                }} />
                                <Tooltip content={<CustomTooltip />} />
                                {/* <div className="mx-1"> */}
                                {series.map((s, idx) => (
                                    <Bar
                                        key={s.key}
                                        dataKey={s.key}
                                        fill={s.color}
                                        barSize={13}
                                        radius={idx === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                        opacity={opacityForKey(s.key)}
                                    />
                                ))}
                                {/* </div> */}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <CustomLegend
                        activeSeries={activeSeries}
                        setActiveSeries={setActiveSeries}
                    />
                </>
            ) : (
                <>
                    <div className="w-full md:h-[500px] h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="6 6" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} label={{
                                    value: "אחוז מכלל הייצור [%]",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: 'middle' }
                                }} />
                                <Tooltip content={<CustomTooltip />} />
                                {/* <div className="mx-1"> */}
                                {series.map((s, idx) => (
                                    <Bar
                                        key={s.key}
                                        dataKey={s.key}
                                        fill={s.color}
                                        barSize={13}
                                        radius={idx === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                        opacity={opacityForKey(s.key)}
                                    />
                                ))}
                                {/* </div> */}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <CustomLegend
                        activeSeries={activeSeries}
                        setActiveSeries={setActiveSeries}
                    />
                </>
            )}



            {/* Tabs */}
            <div className="flex gap-1 md:p-[6px] p-1 rounded-full bg-[#F8F8F8] mb-4 w-fit ml-auto -mt-10" style={{ boxShadow: "inset 0px 4px 10px 0px #0000001A" }}>
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
                    אחוז מכלל הייצור
                </button>
            </div>
        </div>
    );
}
