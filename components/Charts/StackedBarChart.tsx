'use client';

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';

interface StackedBarChartProps {
  data: {
    categories: string[];
    series: {
      name: string;
      data: number[];
      color?: string;
    }[];
  };
  title?: string;
  yAxisLabel?: string;
  height?: number;
  horizontal?: boolean;
}

export default function StackedBarChart({ 
  data, 
  title, 
  yAxisLabel, 
  height = 400,
  horizontal = false 
}: StackedBarChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        type: 'shadow'
      },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: data.series.map(s => s.name),
      bottom: 0,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: horizontal ? 'value' : 'category',
      data: horizontal ? undefined : data.categories,
      axisLabel: {
        fontSize: 11,
        interval: 0,
        rotate: horizontal ? 0 : 45
      }
    },
    yAxis: {
      type: horizontal ? 'category' : 'value',
      data: horizontal ? data.categories : undefined,
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        fontSize: 11,
        formatter: (value: number) => {
          if (typeof value === 'number' && value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value.toString();
        }
      }
    },
    series: data.series.map(s => ({
      name: s.name,
      type: 'bar',
      stack: 'total',
      data: s.data,
      itemStyle: {
        color: s.color || '#5470c6'
      },
      emphasis: {
        focus: 'series'
      }
    }))
  }), [data, title, yAxisLabel, height, horizontal]);

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
    </div>
  );
}