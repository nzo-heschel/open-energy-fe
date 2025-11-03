"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import apiIcon from "@/public/images/API.png";
import downloadIcon from "@/public/images/download_2.png";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"; // keep your existing TooltipInfo component
import TooltipInfo from "../TooltipInfo";

type DataPoint = {
    date: string;
    heatLoad: number; // °C (left axis)
    production: number; // MW (right axis)
};

const dataByPeriod = {
    monthly: [
        { date: "1/24", heatLoad: 26, production: 6300 },
        { date: "2/24", heatLoad: 18, production: 4800 },
        { date: "3/24", heatLoad: -8, production: 1200 },
        { date: "4/24", heatLoad: 27, production: 7000 },
        { date: "5/24", heatLoad: 12, production: 6500 },
        { date: "6/24", heatLoad: 10, production: 6300 },
        { date: "7/24", heatLoad: 15, production: 4300 },
        { date: "8/24", heatLoad: 14, production: 4700 },
        { date: "9/24", heatLoad: 16, production: 5200 },
        { date: "10/24", heatLoad: -6, production: 900 },
        { date: "11/24", heatLoad: 10, production: 4200 },
        { date: "12/24", heatLoad: 12, production: 4500 },
    ] as DataPoint[],
    quarterly: [
        { date: "Q1/24", heatLoad: 12, production: 4100 },
        { date: "Q2/24", heatLoad: 16, production: 6600 },
        { date: "Q3/24", heatLoad: 15, production: 4733 },
        { date: "Q4/24", heatLoad: 5, production: 3200 },
    ] as DataPoint[],
    yearly: [
        { date: "2021", heatLoad: 18, production: 5800 },
        { date: "2022", heatLoad: 14, production: 5200 },
        { date: "2023", heatLoad: 12, production: 4500 },
        { date: "2024", heatLoad: 13, production: 4700 },
    ] as DataPoint[],
};

type TimePeriod = keyof typeof dataByPeriod;

const HeatVsProductionChart: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
    const [active, setActive] = useState({ heatLoad: true, production: true });
    const [hovered, setHovered] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const currentData = useMemo(() => dataByPeriod[selectedPeriod], [selectedPeriod]);

    const toggle = (key: keyof typeof active) =>
        setActive((p) => ({ ...p, [key]: !p[key] }));

    const opacity = (key: string) => {
        if (!hovered) return 1;
        return hovered === key ? 1 : 0.25;
    };

    const legendOpacity = (key: string) => {
        if (!hovered) return 1;
        return hovered === key ? 1 : 0.6;
    };

    // custom tooltip
    const CustomTooltip = ({ active: isActive, payload, label }: any) => {
        if (!isActive || !payload || payload.length === 0) return null;

        // find series items
        const heat = payload.find((p: any) => p.dataKey === "heatLoad");
        const prod = payload.find((p: any) => p.dataKey === "production");

        return (
            <div className="bg-white shadow-lg rounded-lg p-3 text-right w-56">
                <div className="text-xs text-gray-500 mb-2 border-b-2">{label}</div>
                {heat && (
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1E8025" }} />
                        <div className="text-sm">
                            <div className="text-xs text-gray-500">מחיר שולי ללא אילוצים </div>
                            <div className="font-medium text-sm">{heat.value} °C</div>
                        </div>
                    </div>
                )}
                {prod && (
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F4D150" }} />
                        <div className="text-sm">
                            <div className="text-sm text-gray-500">מחיר שולי כולל אילוצים</div>
                            <div className="font-medium text-sm">{Number(prod.value).toLocaleString()} MW</div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[18px] p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-3">
                        עומס חום מול ייצור חשמל
                        <div
                            className="relative"
                            onMouseEnter={() => setShowInfo(true)}
                            onMouseLeave={() => setShowInfo(false)}
                        >
                            <svg
                                width="21"
                                height="21"
                                viewBox="0 0 21 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="cursor-help"
                            >
                                <g opacity="0.6">
                                    <path d="M10.5 0.5459C4.98 0.5459 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.5459 10.5 0.5459ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                    <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                </g>
                            </svg>

                            {showInfo && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                                    <TooltipInfo
                                        content={`
                        הגרף מציג את עומס החום (במעלות צלזיוס) לעומת כמות ייצור החשמל (ב-MW) לאורך תקופה נבחרת.
                        הערכים כאן מקורם בהערכה ויזואלית מהתמונה — ניתן להחליף בנתוני אמת דרך ה-API.
                      `}
                                    />
                                </div>
                            )}
                        </div>
                    </h2>

                    <p className="text-sm text-gray-600 mb-2">פרק זמן:</p>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">סינון לפי:</span>
                        <div className="relative w-48">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
                                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-8"
                            >
                                <option value="monthly">חודש</option>
                                <option value="quarterly">רבעון</option>
                                <option value="yearly">שנה</option>
                            </select>
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                <ChevronDown size={14} />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Image src={apiIcon} alt="API" width={32} height={32} className="w-8 h-8" />
                    <Image src={downloadIcon} alt="Download" width={32} height={32} className="w-8 h-8" />
                </div>
            </div>

            <div className="md:h-[480px] h-[320px]">
                {/* small axis labels row */}
                {/* <div className="flex justify-between items-end mb-2 text-right">
                    <p className="text-right text-xs text-[#707585]">ייצור חשמל <br />(MW)</p>
                    <p className="text-right text-xs text-[#707585]">עומס חום <br />[מעלות C]</p>
                </div> */}

                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={currentData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E7EA" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                        />

                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            domain={["dataMin - 5", "dataMax + 5"]}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            label={{
                                value: "עומס חום [מעלות C°]",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: 'middle' }
                            }}
                        />

                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            domain={[0, (dataMax: number) => Math.ceil(dataMax / 1000) * 1000 + 1000]}
                            width={80}
                            label={{
                                value: "מגה-וואט [MW]",
                                angle: 90,
                                position: "insideRight",
                                style: { textAnchor: 'middle' }
                            }}
                        // push a little to the right visually
                        />

                        {/* Vertical mid-line near 6/24 - use x value that exists in dataset */}
                        {/* <ReferenceLine x="6/24" stroke="#d1d5db" strokeWidth={1} strokeOpacity={0.9} /> */}

                        {/* custom tooltip */}
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />

                        {/* Lines */}
                        {active.production && (
                            <Line
                                yAxisId="right"
                                dataKey="production"
                                name="ייצור חשמל"
                                stroke="#F4D150"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                                opacity={opacity("production")}
                                isAnimationActive={false}
                            />
                        )}

                        {active.heatLoad && (
                            <Line
                                yAxisId="left"
                                dataKey="heatLoad"
                                name="עומס חום"
                                stroke="#1E8025"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                                opacity={opacity("heatLoad")}
                                isAnimationActive={false}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-start gap-6 mt-4 pr-4">
                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-150"
                    onClick={() => toggle("production")}
                    onMouseEnter={() => setHovered("production")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ opacity: legendOpacity("production") }}
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#F4D150", opacity: active.production ? 1 : 0.3 }}
                    />
                    <span className={`md:text-sm text-xs ${active.production ? "text-gray-800" : "text-gray-400"}`}>
                        ייצור חשמל
                    </span>
                </div>

                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-150"
                    onClick={() => toggle("heatLoad")}
                    onMouseEnter={() => setHovered("heatLoad")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ opacity: legendOpacity("heatLoad") }}
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#1E8025", opacity: active.heatLoad ? 1 : 0.3 }}
                    />
                    <span className={`md:text-sm text-xs ${active.heatLoad ? "text-gray-800" : "text-gray-400"}`}>
                        עומס חום
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HeatVsProductionChart;
