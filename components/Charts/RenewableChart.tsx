"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Spin } from "antd";
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
    ReferenceLine,
} from "recharts";
import {
    exportRenewablesDelivery4RenewableForecastIsrael,
    useRenewablesDelivery4,
} from "@/lib/api";

const pct = (fraction: number) => fraction * 100;

type ChartRow = {
    year: number;
    actualLinePct: number;
    historicalActualPct: number;
    ministryPct: number;
    nzoPct: number;
    actualBar: number | null;
    ministryBar: number | null;
    nzoBar: number | null;
};

function buildChartRows(
    rows: { year: number; renewable_rate: number; realistic_forecast: number; ministry_target: number; nzo_target: number }[],
    selectedPrediction: "ministry" | "nzo"
): { chartData: ChartRow[]; lastYearWithActual: number } {
    if (!rows.length) {
        return { chartData: [], lastYearWithActual: 0 };
    }

    const lastYearWithActual = rows.reduce((max, r) => (r.renewable_rate > 0 ? Math.max(max, r.year) : max), 0);

    const chartData: ChartRow[] = rows.map((r) => {
        const hasActual = r.renewable_rate > 0;
        const historicalActualPct = pct(r.renewable_rate);
        const actualLinePct = hasActual ? historicalActualPct : pct(r.realistic_forecast);
        const ministryPct = pct(r.ministry_target);
        const nzoPct = pct(r.nzo_target);

        const inBarRange = lastYearWithActual > 0 && r.year <= lastYearWithActual;
        const actualBar = inBarRange ? historicalActualPct : null;
        const histForGap = historicalActualPct;

        return {
            year: r.year,
            actualLinePct,
            historicalActualPct,
            ministryPct,
            nzoPct,
            actualBar,
            ministryBar:
                selectedPrediction === "ministry" && inBarRange
                    ? Math.max(0, ministryPct - histForGap)
                    : null,
            nzoBar:
                selectedPrediction === "nzo" && inBarRange ? Math.max(0, nzoPct - histForGap) : null,
        };
    });

    return { chartData, lastYearWithActual };
}

export default function RenewableChart() {
    const [hovered, setHovered] = useState<string | null>(null);
    const [selectedPrediction, setSelectedPrediction] = useState<"ministry" | "nzo">("ministry");
    const [exporting, setExporting] = useState(false);

    const { data, isLoading, error } = useRenewablesDelivery4();

    const { chartData, lastYearWithActual } = useMemo(
        () => buildChartRows(data?.data ?? [], selectedPrediction),
        [data?.data, selectedPrediction]
    );

    const title = data?.title_he ?? data?.title ?? "יעדי אנרגיות מתחדשות מול ייצור בפועל";

    const togglePrediction = (key: "ministry" | "nzo") => {
        setSelectedPrediction(key);
    };

    const opacity = (key: string) => {
        if (!hovered) return 1;
        return hovered === key ? 1 : 0.3;
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportRenewablesDelivery4RenewableForecastIsrael();
        } catch (e) {
            console.error(e);
        } finally {
            setExporting(false);
        }
    };

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{ dataKey?: string; name?: string; value?: number; payload: ChartRow }>;
    }) => {
        if (!active || !payload?.length) return null;

        const row = payload[0].payload;
        const targetPct = selectedPrediction === "ministry" ? row.ministryPct : row.nzoPct;
        const actualPct = row.historicalActualPct > 0 ? row.historicalActualPct : row.actualLinePct;
        const gapPct = targetPct - actualPct;

        const lineItems = payload.filter(
            (p) =>
                p.dataKey === "actualLinePct" || p.dataKey === "ministryPct" || p.dataKey === "nzoPct"
        );

        return (
            <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 text-sm">
                <p className="font-medium">שנה {row.year}</p>
                {row.year <= lastYearWithActual && lastYearWithActual > 0 && (
                    <p className="mt-2 text-[#484C56] text-xs">
                        יעד ({selectedPrediction === "ministry" ? "משרד" : "NZO"}):{" "}
                        <span className="font-medium">{targetPct.toFixed(1)}%</span>
                        <br />
                        בפועל: <span className="font-medium">{row.historicalActualPct.toFixed(1)}%</span>
                        <br />
                        פער: <span className="font-medium">{gapPct.toFixed(1)}%</span>
                    </p>
                )}
                {lineItems.map((p) => (
                    <p key={String(p.dataKey)} className="mt-1.5 text-[#484C56] text-sm font-normal">
                        <span className="text-[#59687D] font-normal">{p.name}</span>
                        <br />
                        <span className="font-medium">{typeof p.value === "number" ? p.value.toFixed(1) : ""}%</span>
                    </p>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center min-h-[300px]">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !chartData.length) {
        return (
            <div className="w-full text-center text-red-600 text-sm py-8">
                לא ניתן לטעון את נתוני התרשים
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">{title}</h2>
                <div className="flex items-start md:gap-4 gap-2">
                    <Link href="/api#renewables-delivery-4-renewable-forecast-israel" className="leading-none">
                        <Image src={api} width={32} height={32} alt="api" />
                    </Link>
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting}
                        className="leading-none disabled:opacity-50"
                        aria-label="ייצוא לאקסל"
                    >
                        <Image src={download} width={32} height={32} alt="download" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row mt-3 justify-start gap-6 mb-4">
                <div
                    className="flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setHovered("actual")}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1E8025" }} />
                    <span className="md:text-sm text-xs text-gray-800">ייצור בפועל / תחזית ריאלית</span>
                </div>

                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                    onClick={() => togglePrediction("nzo")}
                    onMouseEnter={() => setHovered("nzo")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ opacity: selectedPrediction === "nzo" ? 1 : 0.5 }}
                >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#957669" }} />
                    <span
                        className={`md:text-sm text-xs ${selectedPrediction === "nzo" ? "text-gray-800" : "text-gray-400"}`}
                    >
                        יעד NZO
                    </span>
                </div>

                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                    onClick={() => togglePrediction("ministry")}
                    onMouseEnter={() => setHovered("ministry")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ opacity: selectedPrediction === "ministry" ? 1 : 0.5 }}
                >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8BBFE1" }} />
                    <span
                        className={`md:text-sm text-xs ${selectedPrediction === "ministry" ? "text-gray-800" : "text-gray-400"}`}
                    >
                        יעד משרד האנרגיה
                    </span>
                </div>
            </div>

            <div className="md:h-[500px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis
                            label={{
                                value: "[%]",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: "middle", fontFamily: "Heebo, sans-serif" },
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={() => null} />
                        <ReferenceLine
                            x={2030}
                            stroke="#C4C4C4"
                            strokeDasharray="4 4"
                            label={{ value: "2030", position: "top", fill: "#59687D", fontSize: 11 }}
                        />
                        <ReferenceLine
                            x={2050}
                            stroke="#C4C4C4"
                            strokeDasharray="4 4"
                            label={{ value: "2050", position: "top", fill: "#59687D", fontSize: 11 }}
                        />

                        <Bar
                            dataKey="actualBar"
                            fill="#1E8025"
                            barSize={28}
                            stackId="stack"
                            name="ייצור בפועל"
                            opacity={opacity("actual")}
                        >
                            <LabelList
                                dataKey="actualBar"
                                position="insideTop"
                                offset={10}
                                formatter={(val: number) => (val != null && val > 0 ? `${val.toFixed(0)}` : "")}
                                style={{ fill: "#ffffff90", fontSize: 14, fontWeight: 400 }}
                            />
                        </Bar>

                        <Bar
                            dataKey="ministryBar"
                            fill="#8BBFE1"
                            barSize={28}
                            stackId="stack"
                            name="יעד משרד האנרגיה"
                            opacity={selectedPrediction === "ministry" ? opacity("ministry") : 0}
                        />

                        <Bar
                            dataKey="nzoBar"
                            fill="#957669"
                            barSize={28}
                            stackId="stack"
                            name="יעד NZO"
                            opacity={selectedPrediction === "nzo" ? opacity("nzo") : 0}
                        />

                        <Line
                            type="monotone"
                            dataKey="actualLinePct"
                            stroke="#1E8025"
                            strokeWidth={2}
                            dot={false}
                            name="ייצור בפועל / תחזית ריאלית"
                            opacity={opacity("actual")}
                        />
                        <Line
                            type="monotone"
                            dataKey="ministryPct"
                            stroke="#8BBFE1"
                            strokeWidth={2}
                            dot={false}
                            name="יעד משרד האנרגיה"
                            opacity={opacity("ministry")}
                        />
                        <Line
                            type="monotone"
                            dataKey="nzoPct"
                            stroke="#957669"
                            strokeWidth={2}
                            dot={false}
                            name="יעד NZO"
                            opacity={opacity("nzo")}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
