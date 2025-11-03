'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { ECharts, ECElementEvent } from 'echarts';

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  height?: number;
  innerRadius?: string;
  showLabels?: boolean;
}

export default function PieChart({
  data,
  title,
  height = 300,
  innerRadius = '0%',
  showLabels = true
}: PieChartProps) {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef<ECharts | null>(null);
  const [selectedLegends, setSelectedLegends] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsClient(true);
    // Initialize all legends as selected (visible)
    const initialSelection: Record<string, boolean> = {};
    data.forEach(item => {
      initialSelection[item.name] = true;
    });
    setSelectedLegends(initialSelection);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [data]);

  const onChartReady = (chart: ECharts) => {
    chartRef.current = chart;

    // Listen for legend select changes from the chart itself
    chart.on('legendSelectChanged', (params: any) => {
      const newSelection = { ...selectedLegends };
      newSelection[params.name] = params.selected[params.name];
      setSelectedLegends(newSelection);
    });
  };

  const handleLegendClick = (name: string) => {
    if (!chartRef.current) return;

    // Dispatch legend select action to the chart
    chartRef.current.dispatchAction({
      type: 'legendToggleSelect',
      name: name
    });

    // The state will be updated via the legendSelectChanged event listener
  };

  const option = useMemo(() => ({
    title: title ? {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: isMobile ? 18 : 16,
        fontWeight: 'bold',
      }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: false, // We'll use our custom legend instead
    },
    series: [
      {
        name: title || 'Data',
        type: 'pie',
        radius: [innerRadius, isMobile ? '90%' : '80%'],
        center: isMobile ? ['50%', '50%'] : ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: showLabels,
          position: 'outside',
          fontSize: isMobile ? 12 : 11,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobile ? 14 : 12,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: showLabels,
          length: isMobile ? 15 : 10,
          length2: isMobile ? 10 : 5
        },
        data: data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || '#5470c6'
          }
        }))
      }
    ]
  }), [data, title, innerRadius, showLabels, isMobile]);

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-slate-500">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-visible">
      <ReactECharts
        option={option}
        style={{
          height: `${height}px`,
          width: '100%'
        }}
        opts={{
          renderer: 'canvas'
        }}
        onChartReady={onChartReady}
        onEvents={{
          // Also update state when user clicks on pie segments
          click: (params: ECElementEvent) => {
            if (params.componentType === 'series' && params.seriesType === 'pie') {
              handleLegendClick(params.name);
            }
          }
        }}
      />

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-start md:gap-6 gap-3 text-xs font-medium mt-5">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleLegendClick(item.name)}
            style={{
              opacity: selectedLegends[item.name] ? 1 : 0.4,
              transition: 'opacity 0.2s ease'
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color || '#5470c6' }}
            ></div>
            <span className="md:text-sm text-xs">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}