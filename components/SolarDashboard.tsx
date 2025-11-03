"use client";

import React, { useMemo } from "react";

type Props = {
    gaugePercent?: number;
    nationalAveragePercent?: number;
    topBarPercent?: number;
    bottomBarPercent?: number;
    installedKW?: number;
    potentialKW?: number;
    supplyKm?: number;
    supplyPerCapita?: number;
};

export default function SolarDashboard({
    gaugePercent = 8,
    nationalAveragePercent = 38,
    topBarPercent = 42,
    bottomBarPercent = 18,
    installedKW = 123,
    potentialKW = 123,
    supplyKm = 272.5,
    supplyPerCapita = 272.5,
}: Props) {
    // Responsive SVG geometry
    const svgDimensions = useMemo(() => {
        // Base dimensions for larger screens
        const baseW = 720;
        const baseH = 280;
        const baseR = 160;
        const baseStrokeW = 56;

        return {
            svgW: baseW,
            svgH: baseH,
            r: baseR,
            strokeW: baseStrokeW,
            cx: baseW / 2,
            cy: baseH,
        };
    }, []);

    const { svgW, svgH, cx, cy, r, strokeW } = svgDimensions;

    // arc length of semicircle
    const arcLen = Math.PI * r;

    // compute point on semicircle for the national average (38%)
    const callout = useMemo(() => {
        const p = Math.max(0, Math.min(100, nationalAveragePercent));
        const angle = Math.PI * (1 - p / 100);
        const px = cx + Math.cos(angle) * r;
        const py = cy - Math.sin(angle) * r;

        const clampedPy = Math.max(strokeW / 2, Math.min(cy, py));
        const labelX = px - 110;
        const labelY = clampedPy - 56;
        const midX = px - 36;
        const midY = clampedPy - 18;

        return { px, py: clampedPy, midX, midY, labelX, labelY };
    }, [nationalAveragePercent, cx, cy, r, strokeW]);

    return (
        <div className="" dir="rtl">
            {/* Outer container with responsive padding */}
            <div className="w-full rounded-[16px] border border-[#E9C863] p-4 md:p-6 pb-12 md:pb-20 bg-white shadow-sm">
                {/* Header */}
                <div className="flex justify-start items-center text-right">
                    <div>
                        <div className="text-[#484C56] font-extrabold text-base md:text-lg">
                            מימוש פוטנציאל סולארי
                        </div>
                        <div className="text-sm">
                            <span className="text-base md:text-lg text-[#484C56] font-normal">ביישוב:</span>
                            <span className="text-base md:text-lg text-[#1E8025] font-semibold mr-1">תל אביב</span>
                        </div>
                    </div>
                </div>

                {/* Gauge section */}
                <div className="flex justify-center mt-4 md:mt-6 w-full mx-auto">
                    <div className="relative flex justify-center items-center w-full" style={{ maxWidth: svgW }}>
                        {/* Center percentage - shows actual gauge percentage (8%) */}
                        <div className="absolute flex flex-col text-center items-center top-1/2 left-1/2 -translate-x-1/2 -mt-1 md:mt-12">
                            <h1 className="text-[#484C56] text-base md:text-3xl lg:text-4xl font-semibold">
                                {gaugePercent}%
                            </h1>
                            <p className="text-[#484C56] text-[8px] md:text-base lg:text-lg font-extrabold -mt-2">
                                מימוש פוטנציאל
                            </p>
                        </div>

                        {/* Gauge with labels */}
                        <div className="w-full">
                            {/* Responsive SVG container */}
                            <div className="md:w-full w-full flex flex-row-reverse justify-center items-end space-x-0 border-b-[3px] md:border-b-[5px] border-black">
                                <h5 className="block text-[#484C56] text-sm md:text-base lg:text-xl font-extrabold">
                                    0%
                                </h5>
                                <svg
                                    viewBox={`0 0 ${svgW} ${svgH}`}
                                    className="md:w-[720px] w-auto md:h-auto h-auto p-0 space-x-0"
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    {/* background semicircular ring */}
                                    <path
                                        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                                        stroke="#e2e2e2"
                                        strokeWidth={strokeW}
                                        fill="none"
                                        strokeLinecap="butt"
                                    />

                                    {/* green arc (gauge) - shows actual progress (8%) */}
                                    <path
                                        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                                        stroke="#4f9b58"
                                        strokeWidth={strokeW}
                                        fill="none"
                                        strokeLinecap="butt"
                                        style={{
                                            strokeDasharray: `${(gaugePercent / 100) * arcLen} ${arcLen}`,
                                        }}
                                    />

                                    {/* small inner white semicircle */}
                                    <circle cx={cx} cy={cy} r={r - strokeW / 2 - 4} fill="#ffffff" />

                                    {/* small marker circle - positioned at national average (38%) */}
                                    {/* <circle cx={callout.px} cy={callout.py} r={8} fill="#4f9b58" stroke="#ffffff" strokeWidth={2} /> */}

                                    {/* connector polyline - to national average marker */}
                                    <polyline
                                        points={`${callout.px - 18},${callout.py + 40} ${callout.midX - 20},${callout.midY} ${callout.labelX - 135},${callout.labelY + 38}`}
                                        fill="none"
                                        stroke="#1E8025"
                                        strokeWidth={1}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <h5 className="block text-[#484C56] text-sm md:text-base lg:text-xl font-extrabold">
                                    100%
                                </h5>
                            </div>
                            <div
                                // style={{ left: callout.labelX, top: callout.labelY }}
                                className="absolute md:top-20 top-5 md:left-24 left-6 md:text-right text-left block"
                            >
                                <div className="flex items-left gap-2">
                                    <div className="md:font-semibold font-normal text-gray-700 text-[8px] md:text-base">
                                        ממוצע ארצי ({nationalAveragePercent}%)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Callout label - national average */}
                    </div>
                </div>

                {/* Content area under gauge */}
                <div className="w-full mt-6 md:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
                    {/* Status cards - now on top for mobile */}
                    <div className="flex flex-col gap-2 order-2 lg:order-1">
                        <h3 className="text-[#484C56] font-extrabold text-lg md:text-xl">סטטוס יישובי</h3>
                        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                            <div className="w-full px-4 py-3 md:py-[10px] rounded-[16px] md:rounded-[20px] border border-[#C3C3C3] bg-white text-right">
                                <div className="text-[#484C56] text-sm md:text-base font-normal">סך פוטנציאל הקמה</div>
                                <div className="text-xl md:text-2xl lg:text-[34px] text-[#484C56] font-extrabold mt-1 md:mt-2">
                                    {potentialKW} <span className="text-base md:text-xl font-bold">קילוואט</span>
                                </div>
                            </div>

                            <div className="w-full px-4 py-3 md:py-[10px] rounded-[16px] md:rounded-[20px] border border-[#C3C3C3] bg-white text-right">
                                <div className="text-[#484C56] text-sm md:text-base font-normal">סך הספק מותקן</div>
                                <div className="text-xl md:text-2xl lg:text-[34px] text-[#484C56] font-extrabold mt-1 md:mt-2">
                                    {installedKW} <span className="text-base md:text-xl font-bold">קילוואט</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress bars - now below for mobile */}
                    <div className="order-1 lg:order-2">
                        <div className="text-gray-700 text-center font-semibold text-base md:text-lg">ממוצע ארצי</div>
                        <div className="h-4 w-[2px] bg-[#2F7A4F] mx-auto my-2"></div>

                        {/* first bar - הספק לקמ"ר */}
                        <div className="mb-4 md:mb-6">
                            <div className="flex justify-center gap-1 items-baseline flex-wrap">
                                <div className="text-gray-700 font-semibold text-sm md:text-base">
                                    הספק לקמ"ר: <span className="font-bold">{supplyKm}</span>
                                </div>
                                <div className="text-gray-400 text-xs md:text-sm">(מגהוואט/קמ"ר)</div>
                            </div>

                            <div className="relative mt-2 md:mt-3 h-3 md:h-4 bg-gray-200 shadow-inner rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-3 md:h-4 rounded-full"
                                    style={{ width: `${topBarPercent}%`, background: "#E9AE00" }}
                                />

                                <div className="absolute top-[-4px] md:top-[-6px] left-1/2 h-12 md:h-16" style={{ width: 0 }}>
                                    <div className="w-[2px] h-12 md:h-16 bg-[#2F7A4F] mx-auto" />
                                </div>
                            </div>
                        </div>

                        {/* second bar - הספק לתושב */}
                        <div className="mb-2">
                            <div className="flex justify-center gap-1 items-baseline flex-wrap">
                                <div className="text-gray-700 font-semibold text-sm md:text-base">
                                    הספק לתושב: <span className="font-bold">{supplyPerCapita}</span>
                                </div>
                                <div className="text-gray-400 text-xs md:text-sm">(קילוואט/תושב)</div>
                            </div>

                            <div className="relative mt-2 md:mt-3 h-3 md:h-4 bg-gray-200 shadow-inner rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-3 md:h-4 rounded-full"
                                    style={{ width: `${bottomBarPercent}%`, background: "#A7BF56" }}
                                />

                                <div className="absolute top-[-4px] md:top-[-6px] left-1/2 h-12 md:h-16" style={{ width: 0 }}>
                                    <div className="w-[2px] h-12 md:h-16 bg-[#2F7A4F] mx-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}