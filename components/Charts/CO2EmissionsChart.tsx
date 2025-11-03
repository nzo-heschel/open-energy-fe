"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type DataPoint = {
  date: string;
  co2: number;
  savings: number;
};

// Sample data for different time periods
const dataByPeriod = {
  monthly: [
    { date: "1/24", co2: 9000, savings: 6200 },
    { date: "2/24", co2: 7200, savings: 5000 },
    { date: "3/24", co2: 8000, savings: 5800 },
    { date: "4/24", co2: 7600, savings: 4900 },
    { date: "5/24", co2: 7000, savings: 5100 },
    { date: "6/24", co2: 6800, savings: 4800 },
    { date: "7/24", co2: 5600, savings: 3100 },
    { date: "8/24", co2: 6000, savings: 3300 },
    { date: "9/24", co2: 5500, savings: 3000 },
    { date: "10/24", co2: 5000, savings: 2800 },
    { date: "11/24", co2: 5200, savings: 2500 },
    { date: "12/24", co2: 5400, savings: 3000 },
  ],
  quarterly: [
    { date: "Q1/24", co2: 8100, savings: 5667 },
    { date: "Q2/24", co2: 7133, savings: 4933 },
    { date: "Q3/24", co2: 5700, savings: 3133 },
    { date: "Q4/24", co2: 5200, savings: 2767 },
  ],
  yearly: [
    { date: "2021", co2: 8500, savings: 5800 },
    { date: "2022", co2: 7200, savings: 5200 },
    { date: "2023", co2: 6500, savings: 4500 },
    { date: "2024", co2: 5800, savings: 3800 },
  ]
};

type TimePeriod = keyof typeof dataByPeriod;

const CO2EmissionsChart = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState({ co2: true, savings: true });
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");

  const toggle = (key: keyof typeof active) =>
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(event.target.value as TimePeriod);
  };

  const opacity = (key: string) => {
    if (!hovered) return 1;
    return hovered === key ? 1 : 0.3;
  };

  const getLegendOpacity = (key: string) => {
    if (!hovered) return 1;
    return hovered === key ? 1 : 0.5;
  };

  // Get the current data based on selected period
  const currentData = dataByPeriod[selectedPeriod];

  return (
    <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            סך פליטות CO₂ מול יחס פליטות CO₂
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex items-center">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cursor-pointer"
                    >
                      <g opacity="0.5">
                        <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                        <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                      </g>
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>נתונים על פליטות CO₂ ויחס הפליטות ביחס לייצור חשמל</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </h2>
          <p className="mr-14">פרק זמן:</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">סינון לפי:</span>
            <div className="relative w-[202px]">
              <select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
              >
                <option value="monthly">חודש</option>
                <option value="quarterly">רבעון</option>
                <option value="yearly">שנה</option>
              </select>

              {/* Custom dropdown arrow */}
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">
                <ChevronDown size={14} />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start md:gap-4 gap-2">
          <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='API' />
          <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='Download' />
        </div>
      </div>

      <div className="md:h-[500px] h-[300px]">
        {/* <div className="flex justify-between items-end text-right">
          <p className="text-right text-xs text-[#707585] font-normal">קצב פליטות <br />mTCO₂/<br />MWh</p>
          <p className="text-right text-xs text-[#707585] font-normal">סך פליטות <br />[mTCO₂/h]</p>
        </div> */}
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={currentData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              label={{
                value: ">סך פליטות [mTCO₂/h]",
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
              style={{
                transform: 'translateX(25px)'
              }}
              label={{
                value: "קצב פליטות mTCO₂/MWh",
                angle: 90,
                position: "insideRight",
                style: { textAnchor: 'middle' }
              }}
            />
            {active.co2 && (
              <Line
                yAxisId="left"
                type="linear"
                dataKey="co2"
                stroke="#1E8025"
                strokeWidth={2}
                dot={false}
                opacity={opacity("co2")}
              />
            )}
            {active.savings && (
              <Line
                yAxisId="right"
                type="linear"
                dataKey="savings"
                stroke="#F4D150"
                strokeWidth={2}
                dot={false}
                opacity={opacity("savings")}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex justify-start gap-6 mt-4 md:pr-10">
        <div
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
          onClick={() => toggle("co2")}
          onMouseEnter={() => setHovered("co2")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: getLegendOpacity("co2") }}
        >
          <span
            className="w-2 h-2 rounded-full transition-opacity duration-200"
            style={{
              backgroundColor: "#1E8025",
              opacity: active.co2 ? 1 : 0.3,
            }}
          ></span>
          <span
            className={`md:text-sm text-xs transition-all duration-200 ${active.co2 ? "text-gray-800" : "text-gray-400"
              }`}
          >
            סך פליטות
          </span>
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
          onClick={() => toggle("savings")}
          onMouseEnter={() => setHovered("savings")}
          onMouseLeave={() => setHovered(null)}
          style={{ opacity: getLegendOpacity("savings") }}
        >
          <span
            className="w-2 h-2 rounded-full transition-opacity duration-200"
            style={{
              backgroundColor: "#F4D150",
              opacity: active.savings ? 1 : 0.3,
            }}
          ></span>
          <span
            className={`md:text-sm text-xs transition-all duration-200 ${active.savings ? "text-gray-800" : "text-gray-400"
              }`}
          >
            יחס פליטות
          </span>
        </div>
      </div>
    </div>
  );
};

export default CO2EmissionsChart;