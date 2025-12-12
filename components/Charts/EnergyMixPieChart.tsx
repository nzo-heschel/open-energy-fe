'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { ECharts, ECElementEvent } from 'echarts';
import { LEVEL1_COLORS, LEVEL2_COLORS } from '@/lib/colors';
import type { EnergyMixResponse } from '@/types/dto';

// Translation map for level 2 energy source names
const level2NameTranslations: Record<string, string> = {
  'photoVoltaic': 'פוטו וולטאי',
  'biogas': 'ביו גז',
  'wind': 'רוח',
  'solar_thermal': 'תרמו סולרי',
  'pv_storage': 'פוטו וולטאי משולב אגירה',
  'coal': 'פחם',
  'natural_gas': 'גז טבעי',
  'diesel': 'סולר',
  'other': 'אחר',
  'pumped_storage': 'אגירה שאובה'
};

interface EnergyMixPieChartProps {
  energyMixData?: EnergyMixResponse | null;
  height?: number;
  showLevel2?: boolean;
}

export default function EnergyMixPieChart({
  energyMixData,
  height = 300,
  showLevel2 = false
}: EnergyMixPieChartProps) {

  // Transform level 1 data
  const level1Data = useMemo(() => {
    if (!energyMixData?.level1) {
      return [];
    }

    const { level1 } = energyMixData;
    return [
      { name: 'אנרגיות פוסיליות', value: level1['Non-renewables'] || 0, color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
      { name: 'אנרגיות מתחדשות', value: level1['Renewables'] || 0, color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
      { name: 'אחר', value: level1['Other'] || 0, color: LEVEL1_COLORS['אחר'] },
    ];
  }, [energyMixData]);

  // Transform level 2 data
  const level2Data = useMemo(() => {
    if (!energyMixData?.level2) {
      return [];
    }

    const level2DataArray: Array<{ name: string; value: number; color: string }> = [];

    // Transform Non-renewables
    if (energyMixData.level2['Non-renewables']) {
      const nonRenewables = energyMixData.level2['Non-renewables'];
      Object.entries(nonRenewables).forEach(([key, value]) => {
        if (value && value > 0) {
          level2DataArray.push({
            name: level2NameTranslations[key] || key,
            value: value,
            color: LEVEL2_COLORS[key] || '#5470c6'
          });
        }
      });
    }

    // Transform Renewables
    if (energyMixData.level2.Renewables) {
      const renewables = energyMixData.level2.Renewables;
      Object.entries(renewables).forEach(([key, value]) => {
        if (value && value > 0) {
          level2DataArray.push({
            name: level2NameTranslations[key] || key,
            value: value,
            color: LEVEL2_COLORS[key] || '#5470c6'
          });
        }
      });
    }

    // Transform Other
    if (energyMixData.level2.Other) {
      const other = energyMixData.level2.Other;
      Object.entries(other).forEach(([key, value]) => {
        if (value && value > 0) {
          level2DataArray.push({
            name: level2NameTranslations[key] || key,
            value: value,
            color: LEVEL2_COLORS[key] || '#5470c6'
          });
        }
      });
    }

    return level2DataArray;
  }, [energyMixData]);

  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const chartRef = useRef<ECharts | null>(null);
  const [selectedLegends, setSelectedLegends] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsClient(true);
    // Initialize all legends as selected (visible)
    const allData = showLevel2 && level2Data && level2Data.length > 0
      ? [...level1Data, ...level2Data]
      : level1Data;
    const initialSelection: Record<string, boolean> = {};
    allData.forEach(item => {
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
  }, [level1Data, level2Data, showLevel2]);

  const getOpacity = (name: string) => {
    if (!hoveredItem) return 1;
    return hoveredItem === name ? 1 : 0.3;
  };

  const onChartReady = (chart: ECharts) => {
    chartRef.current = chart;

    // Listen for legend select changes from the chart itself
    // Using functional update to avoid stale closure issues
    chart.on('legendSelectChanged', (params: any) => {
      setSelectedLegends(prev => {
        const newSelection = { ...prev };
        newSelection[params.name] = params.selected[params.name];
        return newSelection;
      });
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

  const option = useMemo(() => {
    const series: any[] = [];

    if (showLevel2 && level2Data && level2Data.length > 0) {
      // Nested donut chart: inner ring (level 1) and outer ring (level 2)

      // Inner ring - Level 1 (smaller dimensions)
      series.push({
        name: 'Level 1',
        type: 'pie',
        radius: ['30%', '45%'], // Inner ring dimensions
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: (params: any) => {
            if (!params || params.percent === undefined) return false;
            return params.percent > 30;
          },
          formatter: '{b}\n{d}%',
          position: 'outside',
          fontSize: 12,
          fontWeight: 'normal'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 5
        },
        emphasis: {
          disabled: true, // Disable click interactions
          label: {
            show: (params: any) => {
              console.log(params);
              if (!params || params.percent === undefined) return false;
              return params.percent > 30;
            },
            formatter: '{b}\n{d}%'
          }
        },
        tooltip: {
          show: true,
          formatter: '{b}: {c} MW ({d}%)'
        },
        data: level1Data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || '#5470c6',
            opacity: getOpacity(item.name)
          }
        }))
      });

      // Outer ring - Level 2 (detailed breakdown)
      series.push({
        name: 'Level 2',
        type: 'pie',
        radius: ['50%', isMobile ? '90%' : '80%'], // Outer ring dimensions
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: (params: any) => {
            console.log(params);
            if (!params || params.percent === undefined) return false;
            return params.percent > 30;
          },
          formatter: '{b}\n{d}%',
          position: 'outside',
          fontSize: 12,
          fontWeight: 'normal'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 5
        },
        emphasis: {
          disabled: true, // Disable click interactions
          label: {
            show: (params: any) => {
              console.log(params);
              if (!params || params.percent === undefined) return false;
              return params.percent > 30;
            },
            formatter: '{b}\n{d}%'
          }
        },
        tooltip: {
          show: true,
          formatter: '{b}: {c} MW ({d}%)'
        },
        data: level2Data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || '#5470c6',
            opacity: getOpacity(item.name)
          }
        }))
      });
    } else {
      // Single ring chart - Level 1 only
      series.push({
        name: 'Energy Mix',
        type: 'pie',
        radius: ['40%', isMobile ? '90%' : '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: (params: any) => {
            console.log(params);
            if (!params || params.percent === undefined) return false;
            return params.percent > 30;
          },
          formatter: '{b}\n{d}%',
          position: 'outside',
          fontSize: 12,
          fontWeight: 'normal'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 5
        },
        emphasis: {
          disabled: true, // Disable click interactions
          label: {
            show: (params: any) => {
              console.log(params);
              if (!params || params.percent === undefined) return false;
              return params.percent > 30;
            },
            formatter: '{b}\n{d}%'
          }
        },
        tooltip: {
          show: true,
          formatter: '{b}: {c} MW ({d}%)'
        },
        data: level1Data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || '#5470c6',
            opacity: getOpacity(item.name)
          }
        }))
      });
    }

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}: ${params.value.toLocaleString('he-IL')} MW (${params.percent}%)`;
        }
      },
      legend: {
        show: false,
      },
      series
    };
  }, [level1Data, level2Data, showLevel2, isMobile, hoveredItem]);

  // Group level2 items by their parent category
  const groupedLevel2Data = useMemo(() => {
    if (!showLevel2 || !level2Data || level2Data.length === 0) {
      return null;
    }

    // Map Hebrew names to categories
    const categoryMap: Record<string, { name: string; color: string }> = {
      'פחם': { name: 'אנרגיות פוסיליות', color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
      'גז טבעי': { name: 'אנרגיות פוסיליות', color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
      'סולר': { name: 'אנרגיות פוסיליות', color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
      'פוטו וולטאי': { name: 'אנרגיות מתחדשות', color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
      'ביו גז': { name: 'אנרגיות מתחדשות', color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
      'רוח': { name: 'אנרגיות מתחדשות', color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
      'תרמו סולרי': { name: 'אנרגיות מתחדשות', color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
      'פוטו וולטאי משולב אגירה': { name: 'אנרגיות מתחדשות', color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
      'אחר': { name: 'אחר', color: LEVEL1_COLORS['אחר'] },
      'אגירה שאובה': { name: 'אחר', color: LEVEL1_COLORS['אחר'] }
    };

    const grouped: Record<string, typeof level2Data> = {};

    level2Data.forEach(item => {
      const category = categoryMap[item.name]?.name || 'אחר';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    // Return in the order of level1Data
    return level1Data.map(category => ({
      category,
      items: grouped[category.name] || []
    })).filter(group => group.items.length > 0);
  }, [showLevel2, level2Data, level1Data]);

  // Get all legend items (level1 and level2 if showLevel2 is true)
  const allLegendItems = showLevel2 && level2Data && level2Data.length > 0
    ? [...level1Data, ...level2Data]
    : level1Data;

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-slate-500">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-visible relative" style={{ padding: '20px' }}>
      <ReactECharts
        option={option}
        style={{
          height: `${height}px`,
          width: '100%'
        }}
        opts={{
          renderer: 'canvas'
        }}
        notMerge={true}
        lazyUpdate={false}
        onChartReady={onChartReady}
        onEvents={{
          mouseover: (params: any) => {
            const name = params.data?.name || params.name;
            if (name) {
              setHoveredItem(name);
            }
          },
          mouseout: () => {
            setHoveredItem(null);
          },
          // Also update state when user clicks on pie segments
          click: (params: ECElementEvent) => {
            if (params.componentType === 'series' && params.seriesType === 'pie') {
              handleLegendClick(params.name);
            }
          }
        }}
      />
      {/* Center text */}
      {energyMixData?.total_generation !== undefined && (
        <div className="absolute top-[170px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-sm text-slate-600 text-center">סה&quot;כ</div>
            <div className="md:text-base text-sm font-bold text-center">MW {energyMixData.total_generation}</div>
          </div>
        </div>
      )}

      {/* Custom Legend */}
      {showLevel2 && groupedLevel2Data ? (
        <div className="mt-5 space-y-5">
          {groupedLevel2Data.map((group, groupIndex) => {
            return (
              <div key={groupIndex} className="space-y-1.5">
                {/* Category title row with colored right border */}
                <div
                  className="flex items-center gap-2 pr-2 border-r-2"
                  style={{
                    borderRightColor: group.category.color || '#5470c6',
                  }}
                >
                  <span className="md:text-sm text-xs font-medium">{group.category.name}</span>
                </div>
                {/* Detailed items row */}
                <div className="flex flex-wrap justify-start md:gap-x-6 gap-x-3 gap-y-1 text-xs font-medium mr-2">
                  {group.items.map((item, itemIndex) => {
                    const isSelected = selectedLegends[item.name] !== false;
                    return (
                      <div
                        key={itemIndex}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleLegendClick(item.name)}
                        style={{
                          opacity: isSelected ? 1 : 0.4,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color || '#5470c6' }}
                        ></div>
                        <span className="md:text-sm text-xs">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap justify-start md:gap-6 gap-3 text-xs font-medium mt-5">
          {allLegendItems.map((item, index) => {
            const isSelected = selectedLegends[item.name] !== false; // Default to true if not set
            return (
              <div
                key={index}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleLegendClick(item.name)}
                style={{
                  opacity: isSelected ? 1 : 0.4,
                  transition: 'opacity 0.2s ease'
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color || '#5470c6' }}
                ></div>
                <span className="md:text-sm text-xs">{item.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

