"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const labels = [2020, 2022, 2024, 2026, 2028, 2030, 2040, 2050];

export default function EnergyTargetsChart() {
    const data = {
        labels,
        datasets: [
            {
                type: "bar" as const,
                label: "ייצור בפועל",
                data: [12, 14, 16, 18, 20, 22, 28, 35],
                backgroundColor: "#15803d", // Green bars
                borderRadius: 6,
                yAxisID: "y",
            },
            {
                type: "line" as const,
                label: "יעד משרד האנרגיה",
                data: [15, 17, 19, 21, 23, 25, 33, 42],
                borderColor: "#facc15", // Yellow line
                borderWidth: 2,
                tension: 0.3,
                pointBackgroundColor: "#facc15",
                fill: false,
                yAxisID: "y",
            },
            {
                type: "line" as const,
                label: "יעד NZO",
                data: [16, 18, 20, 23, 25, 28, 36, 45],
                borderColor: "#3b82f6", // Blue line
                borderWidth: 2,
                tension: 0.3,
                pointBackgroundColor: "#3b82f6",
                fill: false,
                yAxisID: "y",
            },
        ],
    };

    const options: ChartOptions = {
        responsive: true,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    drawBorder: false,
                } as any,
            },
            y: {
                beginAtZero: true,
                min: 0,
                max: 50,
                ticks: {
                    callback: function (value) {
                        return value + "%";
                    },
                },
                grid: {
                    color: "#e5e7eb",
                } as any,
            },
        },
    };

    return (
        <div className="w-full h-[500px] bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-center mb-4">
                יעדי אנרגיות מתחדשות מול ייצור בפועל
            </h2>
            {/* Use type="bar" as the base chart type */}
            <Chart type="bar" data={data} options={options} />
        </div>
    );
}