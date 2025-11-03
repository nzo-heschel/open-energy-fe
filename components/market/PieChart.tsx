'use client';

import { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { MixResponse } from '@/types/dto';

interface PieChartProps {
  data: MixResponse;
  title?: string;
  height?: number;
  innerRadius?: string;
  showLabels?: boolean;
}

export default function PieChart({ 
  data, 
  title, 
  height = 400,
  innerRadius = '50%',
  showLabels = false 
}: PieChartProps) {
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef<any>(null);

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
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'var(--color-border)',
      borderWidth: 1,
      textStyle: {
        fontFamily: 'Heebo, sans-serif',
        fontSize: 12
      },
      formatter: (params: any) => {
        const percentage = params.percent;
        const value = params.value.toLocaleString('he-IL');
        return `<div style="text-align: right;">
          <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
          <div>${value} MW (${percentage}%)</div>
        </div>`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      right: 0,
      textStyle: {
        fontSize: 12,
        fontFamily: 'Heebo, sans-serif',
        color: 'var(--color-text)'
      },
      formatter: (name: string) => {
        const item = data.breakdown.find(b => b.label === name);
        if (item) {
          const percentage = ((item.valueMW / data.totalMW) * 100).toFixed(1);
          return `${name} (${percentage}%)`;
        }
        return name;
      }
    },
    series: [
      {
        type: 'pie',
        radius: [innerRadius, '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: {
          show: showLabels,
          position: 'outside',
          fontSize: 11,
          fontFamily: 'Heebo, sans-serif',
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: showLabels
        },
        data: data.breakdown.map(item => ({
          value: item.valueMW,
          name: item.label,
          itemStyle: {
            color: item.color || 'var(--chart-green)'
          }
        }))
      }
    ]
  }), [data, title, height, innerRadius, showLabels]);

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div style={{ color: 'var(--color-muted)' }}>טוען גרף...</div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: `${height}px` }}
        opts={{ renderer: 'canvas' }}
      />
      
      {/* Center text for donut chart */}
      {innerRadius !== '0%' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>סה"כ</div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              MW {data.totalMW.toLocaleString('he-IL')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}