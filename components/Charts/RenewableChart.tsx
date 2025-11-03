"use client";

import Image from "next/image";
import React, { useState } from "react";
import download from "@/public/images/download_2.png";
import api from "@/public/images/API.png";
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";

// --- DATA ---
const data = [
    { year: 2020, actual: { pct: 16, twh: 23 }, ministry: { pct: 24, twh: 8 }, nzo: { pct: 20, twh: 30 } },
    { year: 2022, actual: { pct: 20, twh: 27 }, ministry: { pct: 28, twh: 0 }, nzo: { pct: 24, twh: 33 } },
    { year: 2024, actual: { pct: 24, twh: 29 }, ministry: { pct: 32, twh: 2 }, nzo: { pct: 28, twh: 35 } },
    { year: 2026, actual: { pct: 28, twh: 31 }, ministry: { pct: 36, twh: 4 }, nzo: { pct: 32, twh: 37 } },
    { year: 2028, actual: { pct: 33, twh: 33 }, ministry: { pct: 41, twh: 6 }, nzo: { pct: 37, twh: 39 } },
    { year: 2030, actual: { pct: 38, twh: 35 }, ministry: { pct: 47, twh: 8 }, nzo: { pct: 44, twh: 41 } },
    { year: 2032, actual: { pct: 43, twh: 40 }, ministry: { pct: 53, twh: 3 }, nzo: { pct: 50, twh: 46 } },
    { year: 2034, actual: { pct: 48, twh: 45 }, ministry: { pct: 59, twh: 8 }, nzo: { pct: 56, twh: 51 } },
    { year: 2036, actual: { pct: 53, twh: 51 }, ministry: { pct: 66, twh: 3 }, nzo: { pct: 62, twh: 56 } },
    { year: 2038, actual: { pct: 58, twh: 57 }, ministry: { pct: 73, twh: 8 }, nzo: { pct: 68, twh: 62 } },
    { year: 2040, actual: { pct: 66, twh: 63 }, ministry: { pct: 80, twh: 6 }, nzo: { pct: 74, twh: 68 } },
    { year: 2042, actual: { pct: 72, twh: 69 }, ministry: { pct: 87, twh: 2 }, nzo: { pct: 80, twh: 74 } },
    { year: 2044, actual: { pct: 78, twh: 75 }, ministry: { pct: 96, twh: 8 }, nzo: { pct: 88, twh: 80 } },
    { year: 2046, actual: { pct: 84, twh: 81 }, ministry: { pct: 106, twh: 8 }, nzo: { pct: 95, twh: 86 } },
    { year: 2048, actual: { pct: 90, twh: 87 }, ministry: { pct: 114, twh: 9 }, nzo: { pct: 103, twh: 92 } },
    { year: 2050, actual: { pct: 97, twh: 95 }, ministry: { pct: 124, twh: 7 }, nzo: { pct: 110, twh: 99 } },
];

// --- TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Filter to only show line data (exclude bar data)
        const linePayload = payload.filter((p: any) =>
            p.dataKey === "actual.pct" ||
            p.dataKey === "ministry.pct" ||
            p.dataKey === "nzo.pct"
        );

        return (
            <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 text-sm">
                <p className="font-medium">שנה</p>
                {linePayload.map((p: any) => {
                    const value = p.value;
                    const dataKey = p.dataKey.split(".")[0];
                    const twh = p.payload[dataKey]?.twh;
                    return (
                        <p key={p.dataKey} className="mt-1.5 text-[#484C56] text-sm font-normal">
                            <span className="text-[#59687D] font-normal">{p.name}</span>
                            <br />
                            <p className="flex gap-1 font-medium text-sm">
                                <span className="flex flex-row-reverse">{twh}<span>TWh</span></span>
                                <span>| {value}%</span>
                            </p>
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

// --- COMPONENT ---
export default function RenewableChart() {
    const [hovered, setHovered] = useState<string | null>(null);
    const [selectedPrediction, setSelectedPrediction] = useState<"ministry" | "nzo">("ministry");

    const togglePrediction = (key: "ministry" | "nzo") => {
        setSelectedPrediction(key);
    };

    const opacity = (key: string) => {
        if (!hovered) return 1;
        return hovered === key ? 1 : 0.3;
    };

    // Preprocess data - stacked bars only up to 2024, lines continue throughout
    const adjustedData = data.map((d) => ({
        ...d,
        // Green base bar - always shows actual data up to 2024
        actualBar: d.year <= 2024 ? d.actual.pct : null,
        // Stacked prediction bars - show the difference between prediction and actual, only up to 2024
        ministryBar: selectedPrediction === "ministry" && d.year <= 2024 ? d.ministry.pct - d.actual.pct : null,
        nzoBar: selectedPrediction === "nzo" && d.year <= 2024 ? d.nzo.pct - d.actual.pct : null,
    }));

    return (
        <div className="w-full">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    יעדי אנרגיות מתחדשות מול ייצור בפועל
                </h2>
                <div className="flex items-start md:gap-4 gap-2">
                    <Image src={api} width={32} height={32} alt="api" />
                    <Image src={download} width={32} height={32} alt="download" />
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-start gap-6 mb-4">
                {/* Actual - Always visible */}
                <div
                    className="flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setHovered("actual")}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1E8025" }}></span>
                    <span className="md:text-sm text-xs text-gray-800">ייצור בפועל</span>
                </div>


                {/* NZO - Toggleable */}
                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                    onClick={() => togglePrediction("nzo")}
                    onMouseEnter={() => setHovered("nzo")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ opacity: selectedPrediction === "nzo" ? 1 : 0.5 }}
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: "#957669",
                        }}
                    ></span>
                    <span
                        className={`md:text-sm text-xs ${selectedPrediction === "nzo" ? "text-gray-800" : "text-gray-400"
                            }`}
                    >
                        יעד NZO
                    </span>
                </div>

                {/* Ministry - Toggleable */}
                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                    onClick={() => togglePrediction("ministry")}
                    onMouseEnter={() => setHovered("ministry")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ opacity: selectedPrediction === "ministry" ? 1 : 0.5 }}
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: "#8BBFE1",
                        }}
                    ></span>
                    <span
                        className={`md:text-sm text-xs ${selectedPrediction === "ministry" ? "text-gray-800" : "text-gray-400"
                            }`}
                    >
                        יעד משרד האנרגיה
                    </span>
                </div>

            </div>

            {/* Chart */}
            <div className="md:h-[500px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={adjustedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={() => null} />

                        {/* Green base bar - Actual data up to 2024 */}
                        <Bar
                            dataKey="actualBar"
                            fill="#1E8025"
                            barSize={28}
                            stackId="stack"
                            name="ייצור בפועל"
                            opacity={opacity("actual")}
                        >
                            <LabelList
                                dataKey={"actualBar"}
                                position="insideTop"
                                offset={10}
                                formatter={(val: number) => (val ? `${val}` : "")}
                                style={{ fill: "#ffffff90", fontSize: 14, fontWeight: 400, width: 100 }}
                            />
                        </Bar>

                        {/* Ministry stacked bar - Difference between ministry and actual, up to 2024 */}
                        <Bar
                            dataKey="ministryBar"
                            fill="#8BBFE1"
                            barSize={28}
                            stackId="stack"
                            name="יעד משרד האנרגיה"
                            opacity={selectedPrediction === "ministry" ? opacity("ministry") : 0}
                        />

                        {/* NZO stacked bar - Difference between nzo and actual, up to 2024 */}
                        <Bar
                            dataKey="nzoBar"
                            fill="#957669"
                            barSize={28}
                            stackId="stack"
                            name="יעד NZO"
                            opacity={selectedPrediction === "nzo" ? opacity("nzo") : 0}
                        />

                        {/* Lines for the full values - ALWAYS VISIBLE throughout timeline */}
                        <Line
                            type="monotone"
                            dataKey="actual.pct"
                            stroke="#1E8025"
                            strokeWidth={2}
                            dot={false}
                            name="ייצור בפועל"
                            opacity={opacity("actual")}
                        />
                        <Line
                            type="monotone"
                            dataKey="ministry.pct"
                            stroke="#8BBFE1"
                            strokeWidth={2}
                            dot={false}
                            name="יעד משרד האנרגיה"
                            opacity={opacity("ministry")}
                        />
                        <Line
                            type="monotone"
                            dataKey="nzo.pct"
                            stroke="#957669"
                            strokeWidth={2}
                            dot={false}
                            name="יעד NZO"
                            opacity={opacity("nzo")}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div >
    );
}