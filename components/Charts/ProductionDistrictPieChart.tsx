"use client";

import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface DataItem {
    name: string;
    value: number;
}

const data: DataItem[] = [
    { name: "יו\"ש", value: 3.15 },
    { name: "הצפון", value: 27.17 },
    { name: "המרכז", value: 23.98 },
    { name: "הדרום", value: 20.82 },
    { name: "חיפה", value: 11.54 },
    { name: "תל אביב", value: 7.16 },
    { name: "ירושלים", value: 6.35 },
];

// Custom colors (similar to your image)
const COLORS = [
    "#8BBFE1",
    "#1C1A17",
    "#957669",
    "#98C74E",
    "#60A261",
    "#276E4E",
    "#358BFF",
];

// Custom label renderer
const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
}: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20; // push labels outside
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <g>
            <rect
                x={x - 40}
                y={y - 15}
                width={80}
                height={40}
                fill="white"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={1}
                rx={4}
                ry={4}
            />
            <text
                x={x}
                y={y + 10}
                fill="#59687D"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight="700"
            >
                {`${data[index].value}%`}
            </text>
            <text
                x={x}
                y={y - 5}
                fill="#59687D"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight="400"
            >
                {`${data[index].name}`}
            </text>
        </g>
    );
};

const ProductionDistrictPieChart: React.FC = () => {
    return (
        <div className="w-full md:h-[600px] h-[350px] flex flex-col justify-center py-6 px-10 border border-[#E9C863] bg-white rounded-[16px]">
            <h2 className="text-lg font-extrabold text-[#484C56] mb-4">
                פוטנציאל ייצור אנרגיה מתחדשת לפי מחוז
            </h2>
            <ResponsiveContainer width="100%" height="120%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={135}
                        outerRadius={200}
                        paddingAngle={0}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        startAngle={90}  // Start at top (12 o'clock position)
                        endAngle={-270} // Go clockwise
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    {/* <Tooltip
                        formatter={(value: number, name: string) =>
                            [`${value}%`, name]
                        }
                    /> */}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProductionDistrictPieChart;