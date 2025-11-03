'use client';

import { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { formatTooltip } from '@/lib/format';
import type { SeriesLine } from '@/types/dto';

interface LineChartProps {
  data: SeriesLine[];
  title?: string;
  yAxisLabel?: string;
  height?: number;
  showLegend?: boolean;
}

export default function LineChart({ 
  data, 
  title, 
  yAxisLabel, 
  height = 400,
  showLegend = true 
}: LineChartProps) {
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef<any>(null);

  const getSeriesColor = (index: number): string => {
    const colors = [
      'var(--chart-yellow)',
      'var(--chart-green)',
      'var(--chart-blue)',
      'var(--chart-brown)',
      'var(--chart-olive)'
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const option = useMemo(() => ({
    title: title ? {
      text: title,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Heebo, sans-serif',
        color: 'var(--color-text)'
      }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: 'var(--brand-green)'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'var(--color-border)',
      borderWidth: 1,
      textStyle: {
        fontFamily: 'Heebo, sans-serif',
        fontSize: 12
      },
      formatter: formatTooltip
    },
    legend: showLegend ? {
      data: data.map(s => s.label),
      bottom: 0,
      textStyle: {
        fontSize: 12,
        fontFamily: 'Heebo, sans-serif',
        color: 'var(--color-text)'
      },
      right: 0
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: showLegend ? '15%' : '10%',
      top: title ? '15%' : '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data[0]?.points.map(p => p.t) || [],
      axisLabel: {
        formatter: (value: string) => {
          return new Date(value).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        },
        fontSize: 11,
        fontFamily: 'Heebo, sans-serif',
        color: 'var(--color-muted)'
      },
      axisLine: {
        lineStyle: {
          color: 'var(--color-border)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        fontSize: 12,
        fontFamily: 'Heebo, sans-serif',
        color: 'var(--color-text)'
      },
      axisLabel: {
        fontSize: 11,
        fontFamily: 'Heebo, sans-serif',
        color: 'var(--color-muted)',
        formatter: (value: number) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value.toString();
        }
      },
      axisLine: {
        lineStyle: {
          color: 'var(--color-border)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'var(--color-border)',
          type: 'dashed'
        }
      }
    },
    series: data.map((s, index) => ({
      name: s.label,
      type: 'line',
      data: s.points.map(p => ({ value: p.value, unit: s.unit })),
      smooth: true,
      lineStyle: {
        width: 2,
        color: getSeriesColor(index)
      },
      itemStyle: {
        color: getSeriesColor(index)
      },
      symbol: 'circle',
      symbolSize: 4
    }))
  }), [data, title, yAxisLabel, showLegend]);

  const getChartInstance = () => {
    return chartRef.current?.getEchartsInstance();
  };

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div style={{ color: 'var(--color-muted)' }}>טוען גרף...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: `${height}px` }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}