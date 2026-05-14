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
  rows: {
    year: number;
    renewable_share_percent: number;
    realistic_forecast_percent: number;
    ministry_target_percent: number;
    nzo_target_percent: number;
  }[],
  selectedPrediction: "ministry" | "nzo",
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
    const historicalActualPct = pct(r.renewable_share_percent);
    const actualLinePct = hasActual
      ? historicalActualPct
      : pct(r.realistic_forecast_percent);
    const ministryPct = pct(r.ministry_target_percent);
    const nzoPct = pct(r.nzo_target_percent);

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
        selectedPrediction === "nzo" && inBarRange
          ? Math.max(0, nzoPct - histForGap)
          : null,
    };
  });

  return { chartData, lastYearWithActual };
}

export default function RenewableChart() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<
    "ministry" | "nzo"
  >("ministry");
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, error } = useRenewablesDelivery4();
  const { chartData, lastYearWithActual } = useMemo(
    () => buildChartRows(data?.data ?? [], selectedPrediction),
    [data?.data, selectedPrediction],
  );

  const title =
    data?.title_he ?? data?.title ?? "יעדי אנרגיות מתחדשות מול ייצור בפועל";

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
    const targetPct =
      selectedPrediction === "ministry" ? row.ministryPct : row.nzoPct;
    const actualPct =
      row.historicalActualPct > 0 ? row.historicalActualPct : row.actualLinePct;
    const gapPct = targetPct - actualPct;

    const lineItems = payload.filter(
      (p) =>
        p.dataKey === "actualLinePct" ||
        p.dataKey === "ministryPct" ||
        p.dataKey === "nzoPct",
    );

    return (
      <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 text-sm">
        <p className="font-medium">שנה {row.year}</p>
        {row.year <= lastYearWithActual && lastYearWithActual > 0 && (
          <p className="mt-2 text-[#484C56] text-xs">
            יעד ({selectedPrediction === "ministry" ? "משרד" : "NZO"}):{" "}
            <span className="font-medium">{targetPct.toFixed(1)}%</span>
            <br />
            בפועל:{" "}
            <span className="font-medium">
              {row.historicalActualPct.toFixed(1)}%
            </span>
            <br />
            פער: <span className="font-medium">{gapPct.toFixed(1)}%</span>
          </p>
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
          {title}
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
          style={{ opacity: selectedPrediction === "ministry" ? 1 : 0.5 }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#957669" }}
          />
          <span
            className={`md:text-sm text-xs ${selectedPrediction === "ministry" ? "text-gray-800" : "text-gray-400"}`}
          >
            לפי יעד משרד האנרגיה
          </span>
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
          onClick={() => togglePrediction("nzo")}
          onMouseEnter={() => setHovered("nzo")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: selectedPrediction === "nzo" ? 1 : 0.5 }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#8BBFE1" }}
          />
          <span
            className={`md:text-sm text-xs ${selectedPrediction === "nzo" ? "text-gray-800" : "text-gray-400"}`}
          >
            יעד NZO
          </span>
        </div>
      </div>
      <div className="flex justify-end items-center my-4">
        <div
          className=" text-[14px] w-[70px] text-sm text-gray-700"
          style={{ fontFamily: "Heebo, sans-serif" }}
        >
          אחוז אנרגיה מתחדשת
        </div>
      </div>
      <div className="md:h-[500px] h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<CustomTooltip />} />
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
                selectedPrediction === "ministry" ? opacity("ministry") : 0
              }
            />

            <Bar
              dataKey="nzoBar"
              fill="#8BBFE1"
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
              stroke="#957669"
              strokeWidth={2}
              dot={false}
              name="יעד משרד האנרגיה"
              opacity={opacity("ministry")}
            />
            <Line
              type="monotone"
              dataKey="nzoPct"
              stroke="#8BBFE1"
              strokeWidth={2}
              dot={false}
              name="יעד NZO"
              opacity={opacity("nzo")}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 pointer-events-none">
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
        </div>
      </div>
    </div>
  );
}
