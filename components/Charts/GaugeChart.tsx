'use client';

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';

interface GaugeChartProps {
  value: number;
  max?: number;
  title?: string;
  unit?: string;
  height?: number;
  color?: string;
}

export default function GaugeChart({ 
  value, 
  max = 100, 
  title, 
  unit = '%',
  height = 300,
  color = '#67C23A'
}: GaugeChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const option = useMemo(() => ({
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: max,
        splitNumber: 4,
        itemStyle: {
          color: color,
          shadowColor: 'rgba(0,138,255,0.45)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2
        },
        progress: {
          show: true,
          roundCap: true,
          width: 12
        },
        pointer: {
          icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.1819,735.267632 2090.567,735.112809 C2090.386068,735.101477 2090.20779,735.07938 2090.03293,735.04826 L2090.03293,735.04826 C2086.97707,734.566955 2084.90615,731.956479 2084.90615,728.841932 L2084.90615,617.493351 C2084.90615,616.352462 2085.74266,615.30999 2090.36389,615.30999 Z',
          length: '75%',
          width: 8,
          offsetCenter: [0, '5%']
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 12
          }
        },
        axisTick: {
          splitNumber: 2,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        splitLine: {
          length: 12,
          lineStyle: {
            width: 3,
            color: '#999'
          }
        },
        axisLabel: {
          distance: 30,
          color: '#999',
          fontSize: 12
        },
        title: {
          show: !!title,
          fontSize: 14,
          fontWeight: 'bold',
          color: '#464646',
          offsetCenter: [0, '30%']
        },
        detail: {
          fontSize: 18,
          fontWeight: 'bold',
          borderRadius: 8,
          offsetCenter: [0, '10%'],
          valueAnimation: true,
          formatter: function (value: number) {
            return `${value}${unit}`;
          },
          color: 'auto'
        },
        data: [
          {
            value: value,
            name: title || ''
          }
        ]
      }
    ]
  }), [value, max, title, unit, color]);

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