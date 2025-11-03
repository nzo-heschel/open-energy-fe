"use client";

import Image from "next/image";
import React, { useState } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Legend,
    LabelList,
} from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import TooltipInfo from "../TooltipInfo";

interface DataItem {
    country: string;
    solar?: number;
    today: number;
    target2030?: number;
    target2050?: number;
}

const data: DataItem[] = [
    { country: "ישראל", solar: 13, today: 40, target2030: 62, target2050: 65 },
    { country: "גרמניה", today: 45, target2030: 70 },
    { country: "ספרד", today: 60, target2030: 75 },
    { country: "איטליה", today: 63, target2030: 78 },
    { country: "יוון", today: 65, target2030: 80 },
    { country: "קליפורניה", today: 70, target2030: 85 },
    { country: "טקסס", today: 60, target2030: 90 },
];

const colors: Record<string, string> = {
    solar: "#F4D150", // yellow
    today: "#98C74E", // green
    target2030: "#C4C95C", // light green
    target2050: "#8BBFE1", // blue
};

const legendLabels: Record<string, string> = {
    today: "היום",
    target2030: "יעדים ל-2030",
    target2050: "יעדים ל-2050",
    solar: "אנרגיה סולארית",
};

export default function RenewableChart2() {
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleLegendMouseEnter = (dataKey: string) => {
        setActiveKey(dataKey);
    };

    const handleLegendMouseLeave = () => {
        setActiveKey(null);
    };

    // Create legend items manually since payload might be undefined
    const legendItems = [
        { dataKey: "solar", color: colors.solar, label: legendLabels.solar },
        { dataKey: "today", color: colors.today, label: legendLabels.today },
        { dataKey: "target2030", color: colors.target2030, label: legendLabels.target2030 },
        { dataKey: "target2050", color: colors.target2050, label: legendLabels.target2050 },
    ];

    return (
        <div className="w-full bg-white">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="flex flex-col gap-1">
                        אנרגיות מתחדשות - יעדים מול ייצור בפועל
                        <span className="font-normal text-[#484C56] text-sm">אחוז אנרגיות מתחדשות מתוך תמהיל הייצור</span>
                    </span>
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
                    ניתן ללמוד ממנו איך משתנה ייצור החשמל מאנרגיות מתחדשות לאורך השנה, ימים, או חודשים, ומה התרומה של כל סוג טכנולוגיה (רוח, סולארי, אחר) בכל חודש.
                    הנתונים נאספים ממערכת נוגה ומתעדכנים מעת לעת. ניתן לסנן לפי סוג טכנולוגיה ושנה, יום או חודש, ולהוריד את המידע לקובץ אקסל או לגשת אליו דרך API.
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
            <div className="grid md:grid-cols-3 md:gap-20 gap-10">
                {/* Custom legend without using Legend component */}
                <div className="w-full col-span-1 flex flex-col justify-between">
                    <div className="flex flex-wrap md:gap-x-8 gap-3 items-start pl-6">
                        {legendItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 cursor-pointer"
                                onMouseEnter={() => handleLegendMouseEnter(item.dataKey)}
                                onMouseLeave={handleLegendMouseLeave}
                            >
                                <div
                                    className="w-2 h-2 rounded"
                                    style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm font-medium text-[#484C56]">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="w-max bg-[#F8F8F8] text-[#484C56] text-sm border border-[#C3C3C3] rounded-[10px] p-3 relative">
                        <div className="absolute -top-4 text-4xl font-extrabold">*</div>
                        <h4 className="font-bold">נתוני אנרגיה סולארית חסרים עבור:</h4>
                        <p className="font-normal">טקסס</p>
                        <p className="font-normal">קליפורניה</p>
                    </div>
                </div>
                <div className="w-full md:h-[500px] h-[300px] col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        >
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis
                                type="category"
                                dataKey="country"
                                width={100}
                                tick={{ fontSize: 14 }}
                            />
                            {["solar", "today", "target2030", "target2050"].map((key) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    stackId="a"
                                    fill={colors[key]}
                                    barSize={28}
                                    // radius={[5, 5, 5, 5]}
                                    opacity={activeKey && activeKey !== key ? 0.3 : 1}
                                >
                                    <LabelList
                                        dataKey={key}
                                        position="right"
                                        offset={-15}
                                        formatter={(val: number) => (val ? `${val}%` : "")}
                                        style={{ fill: "#484C56", fontSize: 14, fontWeight: 400, width: 100 }}
                                    />
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>


            </div>
        </div>
    );
}