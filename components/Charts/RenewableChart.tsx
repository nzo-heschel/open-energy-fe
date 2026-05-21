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
} from "recharts";
import {
  exportRenewablesDelivery4RenewableForecastIsrael,
  useRenewablesDelivery4,
} from "@/lib/api";
import TooltipInfo from "../TooltipInfo";

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
  rows: {
    year: number;
    renewable_share_percent: number;
    realistic_forecast_percent: number;
    ministry_target_percent: number;
    nzo_target_percent: number;
  }[],
  activePredictions: { ministry: boolean; nzo: boolean },
): { chartData: ChartRow[]; lastYearWithActual: number } {
  if (!rows.length) {
    return { chartData: [], lastYearWithActual: 0 };
  }

  const lastYearWithActual = rows.reduce(
    (max, r) => (r.renewable_share_percent > 0 ? Math.max(max, r.year) : max),
    0,
  );

  const chartData: ChartRow[] = rows.map((r) => {
    const hasActual = r.renewable_share_percent > 0;
    const historicalActualPct = r.renewable_share_percent;
    const actualLinePct = hasActual
      ? historicalActualPct
      : r.realistic_forecast_percent;
    const ministryPct = r.ministry_target_percent;
    const nzoPct = r.nzo_target_percent;

    const inBarRange = lastYearWithActual > 0 && r.year <= lastYearWithActual;
    const actualBar = inBarRange ? historicalActualPct : null;
    const histForGap = historicalActualPct;
    const showMinistry = activePredictions.ministry;
    const showNzo = activePredictions.nzo;
    const stackTopAfterActual =
      showMinistry && inBarRange
        ? Math.max(histForGap, ministryPct)
        : histForGap;

    return {
      year: r.year,
      actualLinePct,
      historicalActualPct,
      ministryPct,
      nzoPct,
      actualBar,
      ministryBar:
        showMinistry && inBarRange
          ? Math.max(0, ministryPct - histForGap)
          : null,
      nzoBar:
        showNzo && inBarRange
          ? Math.max(0, nzoPct - stackTopAfterActual)
          : null,
    };
  });

  return { chartData, lastYearWithActual };
}

export default function RenewableChart() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [isChartHovered, setIsChartHovered] = useState(false);
  const [activePredictions, setActivePredictions] = useState({
    ministry: true,
    nzo: true,
  });
  const [exporting, setExporting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { data, isLoading, error } = useRenewablesDelivery4();
  const { chartData, lastYearWithActual } = useMemo(
    () => buildChartRows(data?.data ?? [], activePredictions),
    [data?.data, activePredictions],
  );
  const togglePrediction = (key: "ministry" | "nzo") => {
    setActivePredictions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  const getLineMetrics = () => {
    if (chartData.length < 2)
      return {
        actual: { end: 0, angle: 0 },
        ministry: { end: 0, angle: 0 },
        nzo: { end: 0, angle: 0 },
        historical: { end: 0, angle: 0 },
      };

    const firstYear = chartData[0];
    const lastYear = chartData[chartData.length - 1];

    const calculateAngle = (startVal: number, endVal: number) => {
      const rise = endVal - startVal;
      const run = (chartData.length - 1) * 8;
      return -Math.atan(rise / run) * (180 / Math.PI);
    };

    return {
      actual: {
        end: lastYear.actualLinePct,
        angle: calculateAngle(firstYear.actualLinePct, lastYear.actualLinePct),
      },
      ministry: {
        end: lastYear.ministryPct,
        angle: calculateAngle(firstYear.ministryPct, lastYear.ministryPct),
      },
      nzo: {
        end: lastYear.nzoPct,
        angle: calculateAngle(firstYear.nzoPct, lastYear.nzoPct),
      },
      historical: {
        end: lastYear.historicalActualPct,
        angle: calculateAngle(
          firstYear.historicalActualPct,
          lastYear.historicalActualPct,
        ),
      },
    };
  };

  const lineMetrics = getLineMetrics();

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      dataKey?: string;
      name?: string;
      value?: number;
      payload: ChartRow;
    }>;
  }) => {
    if (!active || !payload?.length) return null;

    const row = payload[0].payload;
    const actualPct =
      row.historicalActualPct > 0 ? row.historicalActualPct : row.actualLinePct;

    const lineItems = payload.filter(
      (p) =>
        p.dataKey === "actualLinePct" ||
        (p.dataKey === "ministryPct" && activePredictions.ministry) ||
        (p.dataKey === "nzoPct" && activePredictions.nzo),
    );
    return (
      <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 text-sm">
        <p className="font-medium">שנה {row.year}</p>
        {row.year <= lastYearWithActual &&
          lastYearWithActual > 0 &&
          row.historicalActualPct > 0 && (
            <>
              <p className="mt-2 text-[#484C56] text-xs">
                בפועל:{" "}
                <span className="font-medium">
                  {row.historicalActualPct.toFixed(1)}%
                </span>
              </p>
              {activePredictions.ministry && (
                <p className="mt-1 text-[#484C56] text-xs">
                  יעד משרד:{" "}
                  <span className="font-medium">
                    {row.ministryPct.toFixed(1)}%
                  </span>
                  {" · "}
                  פער:{" "}
                  <span className="font-medium">
                    {(row.ministryPct - actualPct).toFixed(1)}%
                  </span>
                </p>
              )}
              {activePredictions.nzo && (
                <p className="mt-1 text-[#484C56] text-xs">
                  יעד NZO:{" "}
                  <span className="font-medium">{row.nzoPct.toFixed(1)}%</span>
                  {" · "}
                  פער:{" "}
                  <span className="font-medium">
                    {(row.nzoPct - actualPct).toFixed(1)}%
                  </span>
                </p>
              )}
            </>
          )}
        {lineItems.map((p) => (
          <p
            key={String(p.dataKey)}
            className="mt-1.5 text-[#484C56] text-sm font-normal"
          >
            <span className="text-[#59687D] font-normal">{p.name}</span>
            <br />
            <span className="font-medium">
              {typeof p.value === "number" ? p.value.toFixed(1) : ""}%
            </span>
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
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          יעדים מול ייצור בפועל
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
                <path
                  d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z"
                  fill="#59687D"
                />
                <path
                  d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z"
                  fill="#59687D"
                />
              </g>
            </svg>
            {showTooltip && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                <TooltipInfo
                  content={
                    <>
                      <p>
                        שיעור המתחדשות לקוח מתוך דו&quot;ח מצב משק החשמל השנתי.
                      </p>
                      <p>
                        היעד הממשלתי מסתמך על היעד ל-20% מתחדשות בשנת 2025, ו-30%
                        בשנת 2030, והערכה לינארית של המשמעויות לשנים האחרות
                        המוצגות בגרף.
                      </p>
                      <p>
                        היעד של פרויקט NZO מסתמך על היעד ל-50% מתחדשות בשנת 2030,
                        ו-95% בשנת 2050, והערכה לינארית של המשמעויות לשנים
                        האחרות המוצגות בגרף.
                      </p>
                      <p>
                        צפי ריאלי מסתמך על גידול ממוצע בשיעור המתחדשות בשלושת
                        השנים האחרונות.
                      </p>
                      <p>הנתונים מתעדכנים מעת לעת.</p>
                      <p>
                        צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO.
                        יעדים מול ייצור בפועל.
                      </p>
                    </>
                  }
                />
              </div>
            )}
          </div>
        </h2>
        <div className="flex items-start md:gap-4 gap-2">
          <Link
            href="/api#renewables-delivery-4-renewable-forecast-israel"
            className="leading-none"
          >
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
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#1E8025" }}
          />
          <span className="md:text-sm text-xs text-gray-800">
            לפי ייצור בפועל
          </span>
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
          onClick={() => togglePrediction("ministry")}
          onMouseEnter={() => setHovered("ministry")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: activePredictions.ministry ? 1 : 0.5 }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#957669" }}
          />
          <span
            className={`md:text-sm text-xs ${activePredictions.ministry ? "text-gray-800" : "text-gray-400"}`}
          >
            לפי יעד משרד האנרגיה
          </span>
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
          onClick={() => togglePrediction("nzo")}
          onMouseEnter={() => setHovered("nzo")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: activePredictions.nzo ? 1 : 0.5 }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#8BBFE1" }}
          />
          <span
            className={`md:text-sm text-xs ${activePredictions.nzo ? "text-gray-800" : "text-gray-400"}`}
          >
            יעד NZO
          </span>
        </div>
      </div>
      <div
        className="md:h-[500px] h-[300px] relative"
        onMouseLeave={() => setIsChartHovered(false)}
      >
        <div
          className={`w-full h-full relative ${isChartHovered ? "z-20" : "z-0"}`}
          onMouseEnter={() => setIsChartHovered(true)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 20, bottom: 28 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                label={{
                  value: "שיעור אנרגיה מתחדשת",
                  position: "insideBottom",
                  offset: -8,
                  style: {
                    textAnchor: "middle",
                    fontFamily: "Heebo, sans-serif",
                    fontSize: 12,
                  },
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                label={{
                  value: "שיעור אנרגיה מתחדשת",
                  angle: -90,
                  position: "insideLeft",
                  dx: 5,
                  style: {
                    textAnchor: "middle",
                    fontFamily: "Heebo, sans-serif",
                    fontSize: 12,
                  },
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 50 }}
              />
              <Legend content={() => null} />

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
                  formatter={(val: number) =>
                    val != null && val > 0 ? `${val.toFixed(0)}` : ""
                  }
                  style={{ fill: "#ffffff90", fontSize: 14, fontWeight: 400 }}
                />
              </Bar>

              <Bar
                dataKey="ministryBar"
                fill="#957669"
                barSize={28}
                stackId="stack"
                name="יעד משרד האנרגיה"
                opacity={
                  activePredictions.ministry ? opacity("ministry") : 0
                }
              />

              <Bar
                dataKey="nzoBar"
                fill="#8BBFE1"
                barSize={28}
                stackId="stack"
                name="יעד NZO"
                opacity={activePredictions.nzo ? opacity("nzo") : 0}
              />

              <Line
                type="monotone"
                dataKey="actualLinePct"
                stroke="#1E8025"
                strokeWidth={2}
                dot={false}
                name="צפי ריאלי"
                opacity={opacity("actual")}
              />
              <Line
                type="monotone"
                dataKey="ministryPct"
                stroke="#957669"
                strokeWidth={2}
                dot={false}
                name="יעד משרד האנרגיה"
                opacity={
                  activePredictions.ministry ? opacity("ministry") : 0
                }
              />
              <Line
                type="monotone"
                dataKey="nzoPct"
                stroke="#8BBFE1"
                strokeWidth={2}
                dot={false}
                name="יעד NZO"
                opacity={activePredictions.nzo ? opacity("nzo") : 0}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute text-sm font-medium whitespace-nowrap"
            style={{
              color: "#1E8025",
              right: "20px",
              top: `${100 - lineMetrics.actual.end}%`,
              transform: `rotate(${lineMetrics.actual.angle}deg)`,
              transformOrigin: "left center",
            }}
          >
            צפי ריאלי לפי יצור בפועל
          </div>
          {activePredictions.nzo && (
            <div
              className="absolute text-sm font-medium whitespace-nowrap"
              style={{
                color: "#8BBFE1",
                right: "20px",
                top: `${100 - lineMetrics.nzo.end}%`,
                transform: `rotate(${lineMetrics.nzo.angle}deg)`,
                transformOrigin: "left center",
              }}
            >
              לפי יעד NZO
            </div>
          )}
          {activePredictions.ministry && (
            <div
              className="absolute text-sm font-medium whitespace-nowrap"
              style={{
                color: "#957669",
                right: "20px",
                top: `${100 - lineMetrics.ministry.end}%`,
                transform: `rotate(${lineMetrics.ministry.angle}deg)`,
                transformOrigin: "left center",
              }}
            >
              יעד אנרגיות מתחדשות לפי משרד האנרגיה
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
