'use client';

import { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface LineChartProps {
  data: {
    dates: string[];
    series: {
      name: string;
      data: number[];
      color?: string;
    }[];
  };
  title?: string;
  yAxisLabel?: string;
  height?: number;
}

export default function LineChart({ data, title, yAxisLabel, height = 400 }: LineChartProps) {
  const [isClient, setIsClient] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<boolean[]>([]);

  // Initialize all series as visible
  useEffect(() => {
    setIsClient(true);
    setVisibleSeries(data.series.map(() => true));
  }, [data.series]);

  const handleLegendClick = (index: number) => {
    const newVisibleSeries = [...visibleSeries];
    newVisibleSeries[index] = !newVisibleSeries[index];
    setVisibleSeries(newVisibleSeries);
  };

  const option = useMemo(() => ({
    title: title ? {
      text: title,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      show: false, // Hide the default ECharts legend
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates,
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        fontSize: 11,
        formatter: (value: number) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value.toString();
        }
      }
    },
    series: data.series.map((s, index) => ({
      name: s.name,
      type: 'line',
      stack: 'Total',
      data: visibleSeries[index] ? s.data : [],
      lineStyle: {
        color: s.color
      },
      itemStyle: {
        color: s.color
      },
      areaStyle: s.color && visibleSeries[index] ? {
        color: s.color,
        opacity: 0.1
      } : undefined
    }))
  }), [data, title, yAxisLabel, visibleSeries]);

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-slate-500">טוען גרף...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={option}
        style={{ height: `${height}px` }}
        opts={{ renderer: 'canvas' }}
      />

      {/* Custom Legend */}
      <div className="flex flex-row-reverse justify-end md:gap-6 gap-3 text-xs font-medium mt-2">
        {data.series.map((series, index) => (
          <div
            key={index}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleLegendClick(index)}
            style={{ opacity: visibleSeries[index] ? 1 : 0.4 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: series.color || '#888' }}
            ></div>
            <span className='md:text-sm text-xs'>{series.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}