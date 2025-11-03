'use client';

import { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { SmpScatterResponse } from '@/types/dto';

interface ScatterChartProps {
  data: SmpScatterResponse;
  title?: string;
  height?: number;
}

export default function ScatterChart({ 
  data, 
  title, 
  height = 400 
}: ScatterChartProps) {
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const processedData = useMemo(() => {
    const withAluminum = data.points
      .filter(p => p.category === 'with_aluminum')
      .map(p => [p.demandMW, p.price, p.ts]);
    
    const withoutAluminum = data.points
      .filter(p => p.category === 'without_aluminum')
      .map(p => [p.demandMW, p.price, p.ts]);

    return { withAluminum, withoutAluminum };
  }, [data]);

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
        const [demand, price, timestamp] = params.data;
        const date = new Date(timestamp).toLocaleDateString('he-IL');
        const time = new Date(timestamp).toLocaleTimeString('he-IL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        return `<div style="text-align: right;">
          <div style="font-weight: bold; margin-bottom: 4px;">${params.seriesName}</div>
          <div>ביקוש: ${demand.toLocaleString('he-IL')} MW</div>
          <div>מחיר: ${price.toLocaleString('he-IL')} ₪/MWh</div>
          <div style="margin-top: 4px; font-size: 11px; color: var(--color-muted);">${date} ${time}</div>
        </div>`;
      }
    },
    legend: {
      data: ['מחיר שולי כולל אלומיניום', 'מחיר שולי ללא אלומיניום'],
      bottom: 0,
      right: 0,
      textStyle: {
        fontSize: 12,
        fontFamily: 'Heebo, sans-serif',
        color: 'var(--color-text)'
      }
    },
    grid: {
      left: '10%',
      right: '4%',
      bottom: '15%',
      top: title ? '15%' : '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'ביקוש נטו (MW)',
      nameLocation: 'middle',
      nameGap: 30,
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
    yAxis: {
      type: 'value',
      name: 'מחיר (₪/MWh)',
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
        color: 'var(--color-muted)'
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
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none'
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none'
      }
    ],
    series: [
      {
        name: 'מחיר שולי כולל אלומיניום',
        type: 'scatter',
        data: processedData.withAluminum,
        symbolSize: 6,
        itemStyle: {
          color: 'var(--chart-yellow)',
          opacity: 0.7
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      },
      {
        name: 'מחיר שולי ללא אלומיניום',
        type: 'scatter',
        data: processedData.withoutAluminum,
        symbolSize: 6,
        itemStyle: {
          color: 'var(--chart-green)',
          opacity: 0.7
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  }), [data, title, processedData]);

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