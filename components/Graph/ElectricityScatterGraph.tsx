"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { useState } from "react";
import { Button } from "../ui/button";

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-[10px] shadow-md border-none" style={{ boxShadow: "0px 2px 30px 2px #99BF4129" }}>
        {/* <p className="text-gray-700 font-medium mb-2 border-b border-[#59687D]">{label}</p> */}
        <div className="space-y-1">
          {payload.slice(0, 1).map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex flex-col">
              <div className="flex items-center">
                {/* <div
                  className="w-2 h-2 rounded-full ml-2"
                  style={{ backgroundColor: entry.color }}
                ></div> */}
                <span className="text-sm text-[#484C56]">{entry.name}</span>
                <span className="text-gray-600 mx-1">|</span>
                <span className="text-sm text-[#484C56] ml-1">
                  {entry.value.toLocaleString()} ₪
                </span>
              </div>
              <span className="text-sm text-[#484C56] leading-3">
                {entry.value.toLocaleString()} MW
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Custom Legend Component ---
const CustomLegend = (props: any) => {
  const { payload } = props;
  const [activeSeries, setActiveSeries] = useState<string[]>([]);

  const handleClick = (dataKey: string) => {
    if (activeSeries.includes(dataKey)) {
      setActiveSeries(activeSeries.filter(key => key !== dataKey));
    } else {
      setActiveSeries([...activeSeries, dataKey]);
    }
  };

  return (
    <div className="flex items-center justify-between md:ml-10 ml-0 mt-6 md:pr-10 pr-5">
      <div className="flex flex-row-reverse justify-end">
        {payload.map((entry: any, index: number) => {
          const isActive = !activeSeries.includes(entry.dataKey);

          return (
            <div
              key={`legend-${index}`}
              onClick={() => handleClick(entry.dataKey)}
              className={`flex items-center cursor-pointer px-3 py-1 rounded-lg ${isActive ? 'bg-transparent' : 'opacity-50'
                }`}
            >
              <div
                className="w-2 h-2 rounded-full ml-2"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="md:text-sm text-[10px]">{entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Component 1: Scatter Graph ---
const scatterData1 = Array.from({ length: 100 }).map((_, i) => ({
  price: Math.floor(Math.random() * 13000) + 1,
  demand: Math.floor(Math.random() * 200) + 5,
  type: i % 2 === 0 ? "ביקוש נטו" : "מחיר שוליי כולל אילוצים",
}));

const CustomYAxisLabel = (props: any) => {
  const { viewBox } = props;
  return (
    <text
      x={viewBox.x}
      y={viewBox.y}
      dy={-20}
      dx={20}
      textAnchor="middle"
      className="text-sm font-normal text-[#707585]"
      transform={`rotate(0 ${viewBox.x} ${viewBox.y})`}
    >
      <tspan x={viewBox.x} dy="em" dx="1.3rem">[MWh]</tspan>
    </text>
  );
};

export function ElectricityScatterGraph() {
  return (
    <div className="w-full md:h-[500px] h-[300px] md:mt-0 -mt-10">
      {/* <h2 className="text-xl font-bold text-gray-800 mb-4 text-right">
        ייצור חשמל אל מול המחיר השוליי
      </h2> */}
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 50, right: 10, left: 30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="price" name="מחיר שוליי" tick={{ fontSize: 12 }} />
          <YAxis dataKey="demand" name="MW" tick={{ fontSize: 12 }} label={<CustomYAxisLabel />} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Scatter name="ביקוש נטו" data={scatterData1.filter((d) => d.type === "ביקוש נטו")} fill="#166534" />
          <Scatter name="מחיר שוליי כולל אילוצים" data={scatterData1.filter((d) => d.type !== "ביקוש נטו")} fill="#eab308" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Component 2: Line Graph ---
const lineData2 = [
  { time: "00:00", withExc: 110, withoutExc: 165, demandWith: 2800, demandWithout: 6300 },
  { time: "02:00", withExc: 90, withoutExc: 140, demandWith: 2600, demandWithout: 6100 },
  { time: "04:00", withExc: 85, withoutExc: 135, demandWith: 2500, demandWithout: 6000 },
  { time: "06:00", withExc: 100, withoutExc: 160, demandWith: 2700, demandWithout: 6200 },
  { time: "10:00", withExc: 110, withoutExc: 165, demandWith: 2800, demandWithout: 6300 },
  { time: "14:00", withExc: 95, withoutExc: 140, demandWith: 2600, demandWithout: 6000 },
  { time: "18:00", withExc: 90, withoutExc: 135, demandWith: 2500, demandWithout: 5900 },
  { time: "22:00", withExc: 100, withoutExc: 145, demandWith: 2650, demandWithout: 6050 },
  { time: "24:00", withExc: 105, withoutExc: 150, demandWith: 2700, demandWithout: 6100 },
];

export function ElectricityLineGraph() {
  return (
    <div className="w-full h-[500px] bg-transparent">
      {/* <h2 className="text-xl font-bold text-gray-800 mb-4 text-right">
        ייצור חשמל אל מול המחיר השוליי
      </h2> */}
      <ResponsiveContainer width="100%" height="95%">
        <LineChart data={lineData2} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} domain={[0, 220]} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 11000]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="withoutExc"
            stroke="#166534"
            strokeWidth={2}
            dot={false}
            name="מחיר שוליי ללא אילוצים"
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="withExc"
            stroke="#eab308"
            strokeWidth={2}
            dot={false}
            name="מחיר שוליי כולל אילוצים"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}