'use client';

import { LEVEL1_COLORS, LEVEL2_COLORS } from '@/lib/colors';
import type { EnergyMixResponse, EnergyOverviewResponse } from '@/types/dto';
import { ECElementEvent, ECharts } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// Translation map for level 2 energy source names (all keys in lowercase)
const level2NameTranslations: Record<string, string> = {
  'photovoltaic': 'פוטו וולטאי',
  'biogas': 'ביו גז',
  'wind': 'רוח',
  'solar_thermal': 'תרמו סולרי',
  'solar': 'תרמו סולרי',
  'pv_storage': 'פוטו וולטאי משולב אגירה',
  'coal': 'פחם',
  'natural_gas': 'גז טבעי',
  'diesel': 'סולר',
  'other': 'אחר',
  'pumped_storage': 'אגירה שאובה'
};

// Helper function to normalize keys for lookup (lowercase, replace spaces with underscores)
const normalizeKey = (key: string): string => {
  return key.toLowerCase().replace(/\s+/g, '_');
};

interface EnergyMixPieChartProps {
  energyMixData?: EnergyMixResponse | EnergyOverviewResponse | null;
  height?: number;
  showLevel2?: boolean;
}

export default function EnergyMixPieChart({
  energyMixData,
  height = 450,
  showLevel2 = false
}: EnergyMixPieChartProps) {

  // Transform level 1 data
  const level1Data = useMemo(() => {
    if (!energyMixData?.level1) {
      return [];
    }

    const { level1 } = energyMixData;

    // Check if it's EnergyMixResponse format (fossil_energy, renewable_energy, other)
    if ('fossil_energy' in level1) {
      return [
        { name: 'אנרגיות פוסיליות', value: level1.fossil_energy || 0, color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
        { name: 'אנרגיות מתחדשות', value: level1.renewable_energy || 0, color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
        { name: 'אחר', value: level1.other || 0, color: LEVEL1_COLORS['אחר'] },
      ];
    }

    // Check if it's format with non_renewables, renewables, other (lowercase with underscores)
    if ('non_renewables' in level1) {
      const level1Any = level1 as any;
      return [
        { name: 'אנרגיות פוסיליות', value: level1Any.non_renewables || 0, color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
        { name: 'אנרגיות מתחדשות', value: level1Any.renewables || 0, color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
        { name: 'אחר', value: level1Any.other || 0, color: LEVEL1_COLORS['אחר'] },
      ];
    }

    // EnergyOverviewResponse format (Non-renewables, Renewables, Other)
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

    // Check if it's EnergyMixResponse format (fossil_energy, renewable_energy, other)
    if ('fossil_energy' in energyMixData.level2) {
      // Transform fossil_energy
      if (energyMixData.level2.fossil_energy) {
        const fossilEnergy = energyMixData.level2.fossil_energy;
        Object.entries(fossilEnergy).forEach(([key, value]) => {
          if (value && value > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: value,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }

      // Transform renewable_energy
      if (energyMixData.level2.renewable_energy) {
        const renewableEnergy = energyMixData.level2.renewable_energy;
        Object.entries(renewableEnergy).forEach(([key, value]) => {
          if (value && value > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: value,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }

      // Transform other
      if (energyMixData.level2.other) {
        const other = energyMixData.level2.other;
        Object.entries(other).forEach(([key, value]) => {
          if (value && value > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: value,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }
    } else if ('non_renewables' in energyMixData.level2) {
      // Format with non_renewables, renewables, other (lowercase with underscores)
      const level2Any = energyMixData.level2 as any;
      // Transform non_renewables
      if (level2Any.non_renewables) {
        const nonRenewables = level2Any.non_renewables;
        Object.entries(nonRenewables).forEach(([key, value]) => {
          const numValue = typeof value === 'number' ? value : 0;
          if (numValue > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: numValue,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }

      // Transform renewables
      if (level2Any.renewables) {
        const renewables = level2Any.renewables;
        Object.entries(renewables).forEach(([key, value]) => {
          const numValue = typeof value === 'number' ? value : 0;
          if (numValue > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: numValue,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }

      // Transform other
      if (level2Any.other) {
        const other = level2Any.other;
        Object.entries(other).forEach(([key, value]) => {
          const numValue = typeof value === 'number' ? value : 0;
          if (numValue > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: numValue,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }
    } else {
      // EnergyOverviewResponse format (Non-renewables, Renewables, Other)
      // Transform Non-renewables
      if (energyMixData.level2['Non-renewables']) {
        const nonRenewables = energyMixData.level2['Non-renewables'];
        Object.entries(nonRenewables).forEach(([key, value]) => {
          if (value && value > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: value,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }

      // Transform Renewables
      if (energyMixData.level2.Renewables) {
        const renewables = energyMixData.level2.Renewables;
        Object.entries(renewables).forEach(([key, value]) => {
          if (value && value > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: value,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }

      // Transform Other
      if (energyMixData.level2.Other) {
        const other = energyMixData.level2.Other;
        Object.entries(other).forEach(([key, value]) => {
          if (value && value > 0) {
            const normalizedKey = normalizeKey(key);
            level2DataArray.push({
              name: level2NameTranslations[normalizedKey] || key,
              value: value,
              color: LEVEL2_COLORS[normalizedKey] || '#5470c6'
            });
          }
        });
      }
    }

    return level2DataArray;
  }, [energyMixData]);

  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMdPlus, setIsMdPlus] = useState(false);
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

    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsMdPlus(width >= 768); // md breakpoint and above
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [level1Data, level2Data, showLevel2]);

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
    const getOpacity = (name: string) => {
      if (!hoveredItem) return 1;
      return hoveredItem === name ? 1 : 0.3;
    };

    const series: any[] = [];

    // Radius values - inner ring moved inward, outer ring moved outward and made thinner
    const innerRingInner = isMdPlus ? '20%' : '18%'; // Moved inner ring inward
    const innerRingOuter = isMdPlus ? '30%' : '28%'; // Inner ring width (10% width)
    const outerRingInner = isMdPlus ? '75%' : '73%'; // Outer ring moved further outward
    const outerRingOuter = isMdPlus ? (isMobile ? '90%' : '85%') : (isMobile ? '90%' : '83%'); // Outer ring moved further outward but thinner (only 8-10% width, similar to inner ring)
    const singleRingInner = isMdPlus ? '45%' : '40%';
    const singleRingOuter = isMdPlus ? (isMobile ? '95%' : '85%') : (isMobile ? '95%' : '80%');

    if (showLevel2 && level2Data && level2Data.length > 0) {
      // Nested donut chart: inner ring (level 1) and outer ring (level 2)

      // Inner ring - Level 1 (smaller dimensions)
      series.push({
        name: 'Level 1',
        type: 'pie',
        radius: [innerRingInner, innerRingOuter], // Inner ring dimensions
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: (params: any) => {
            if (!params || params.percent === undefined) return false;
            return params.percent > 20; // Show labels for segments > 20%
          },
          formatter: (params: any) => {
            const percent = params.percent || 0;
            return `{name|${params.name}}\n{percent|${percent.toFixed(2)}%}`;
          },
          position: 'outside',
          rich: {
            name: {
              fontSize: 14,
              fontWeight: 500,
              color: '#484C56',
              fontFamily: 'Heebo, sans-serif',
              lineHeight: 18
            },
            percent: {
              fontSize: 12,
              fontWeight: 400,
              color: '#484C56',
              fontFamily: 'Heebo, sans-serif',
              lineHeight: 16
            }
          }
        },
        labelLine: {
          show: true,
          length: 20, // Increased length to move text further from inner ring
          length2: 15 // Increased second segment length
        },
        emphasis: {
          disabled: true, // Disable click interactions
          label: {
            show: (params: any) => {
              if (!params || params.percent === undefined) return false;
              return params.percent > 20;
            },
            formatter: (params: any) => {
              const percent = params.percent || 0;
              return `{name|${params.name}}\n{percent|${percent.toFixed(2)}%}`;
            },
            rich: {
              name: {
                fontSize: 14,
                fontWeight: 500,
                color: '#484C56',
                fontFamily: 'Heebo, sans-serif',
                lineHeight: 18
              },
              percent: {
                fontSize: 12,
                fontWeight: 400,
                color: '#484C56',
                fontFamily: 'Heebo, sans-serif',
                lineHeight: 16
              }
            }
          }
        },
        tooltip: {
          show: true,
          // Use the main tooltip formatter instead of series-level formatter
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
        radius: [outerRingInner, outerRingOuter], // Outer ring dimensions
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: (params: any) => {
            if (!params || params.percent === undefined) return false;
            return params.percent > 30;
          },
          formatter: (params: any) => {
            const percent = params.percent || 0;
            return `{name|${params.name}}\n{percent|${percent.toFixed(2)}%}`;
          },
          position: 'outside',
          rich: {
            name: {
              fontSize: 16,
              fontWeight: 500,
              color: '#484C56',
              fontFamily: 'Heebo, sans-serif',
              lineHeight: 20
            },
            percent: {
              fontSize: 14,
              fontWeight: 400,
              color: '#484C56',
              fontFamily: 'Heebo, sans-serif',
              lineHeight: 18
            }
          }
        },
        labelLine: {
          show: true,
          length: 25, // Increased length to move text further from outer ring
          length2: 20 // Increased second segment length
        },
        emphasis: {
          disabled: true, // Disable click interactions
          label: {
            show: (params: any) => {
              if (!params || params.percent === undefined) return false;
              return params.percent > 30;
            },
            formatter: (params: any) => {
              const percent = params.percent || 0;
              return `{name|${params.name}}\n{percent|${percent.toFixed(2)}%}`;
            },
            rich: {
              name: {
                fontSize: 16,
                fontWeight: 500,
                color: '#484C56',
                fontFamily: 'Heebo, sans-serif',
                lineHeight: 20
              },
              percent: {
                fontSize: 14,
                fontWeight: 400,
                color: '#484C56',
                fontFamily: 'Heebo, sans-serif',
                lineHeight: 18
              }
            }
          }
        },
        tooltip: {
          show: true,
          // Use the main tooltip formatter instead of series-level formatter
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
        radius: [singleRingInner, singleRingOuter],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: (params: any) => {
            if (!params || params.percent === undefined) return false;
            return params.percent > 30;
          },
          formatter: (params: any) => {
            const percent = params.percent || 0;
            return `{name|${params.name}}\n{percent|${percent.toFixed(2)}%}`;
          },
          position: 'outside',
          rich: {
            name: {
              fontSize: 16,
              fontWeight: 500,
              color: '#484C56',
              fontFamily: 'Heebo, sans-serif',
              lineHeight: 20
            },
            percent: {
              fontSize: 14,
              fontWeight: 400,
              color: '#484C56',
              fontFamily: 'Heebo, sans-serif',
              lineHeight: 18
            }
          }
        },
        labelLine: {
          show: true,
          length: 25, // Increased length to move text further from outer ring
          length2: 20 // Increased second segment length
        },
        emphasis: {
          disabled: true, // Disable click interactions
          label: {
            show: (params: any) => {
              if (!params || params.percent === undefined) return false;
              return params.percent > 30;
            },
            formatter: (params: any) => {
              const percent = params.percent || 0;
              return `{name|${params.name}}\n{percent|${percent.toFixed(2)}%}`;
            },
            rich: {
              name: {
                fontSize: 16,
                fontWeight: 500,
                color: '#484C56',
                fontFamily: 'Heebo, sans-serif',
                lineHeight: 20
              },
              percent: {
                fontSize: 14,
                fontWeight: 400,
                color: '#484C56',
                fontFamily: 'Heebo, sans-serif',
                lineHeight: 18
              }
            }
          }
        },
        tooltip: {
          show: true,
          // Use the main tooltip formatter instead of series-level formatter
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

    // Calculate total for percentage calculation (not used in formatter but kept for consistency)
    const totalValue = showLevel2 && level2Data && level2Data.length > 0
      ? level2Data.reduce((sum, item) => sum + item.value, 0)
      : level1Data.reduce((sum, item) => sum + item.value, 0);

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'white',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: {
          color: '#59687D',
          fontSize: 14,
          fontFamily: 'Heebo, sans-serif'
        },
        extraCssText: 'box-shadow: 0px 2px 30px 2px #99BF4129; border-radius: 8px;',
        formatter: (params: any) => {
          const value = typeof params.value === 'number' ? params.value : 0;
          const percent = params.percent || 0;

          // Get the color from the data - ECharts provides color in params.color or params.data.itemStyle.color
          let itemColor = params.color || params.data?.itemStyle?.color || '#5470c6';

          // Fallback: try to find color from our data arrays
          if (itemColor === '#5470c6') {
            const dataIndex = params.dataIndex;
            const seriesIndex = params.seriesIndex;
            if (seriesIndex === 0 && level1Data[dataIndex]) {
              itemColor = level1Data[dataIndex].color || '#5470c6';
            } else if (seriesIndex === 1 && level2Data[dataIndex]) {
              itemColor = level2Data[dataIndex].color || '#5470c6';
            }
          }

          // Format value with locale string (matching DashboardChart style)
          const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedPercent = percent.toFixed(1);

          // Return HTML string - ECharts will render this
          // Using compact format to ensure proper rendering
          return `<div style="background: white; padding: 0; margin: 0;"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${itemColor}; flex-shrink: 0;"></span><span style="color: #59687D; font-weight: 500; font-size: 14px;">${params.name}</span></div><div style="color: #59687D; display: flex; align-items: baseline; gap: 4px;"><span style="font-weight: 600; font-size: 16px;">${formattedValue}</span><span style="font-size: 14px;">MW</span><span style="font-size: 14px; font-weight: 600; margin-right: 8px;">${formattedPercent}%</span></div></div>`;
        }
      },
      legend: {
        show: false,
        // Explicitly set all items as selected (visible) to ensure ECharts internal state is synced
        selected: (() => {
          const selection: Record<string, boolean> = {};
          level1Data.forEach(item => { selection[item.name] = true; });
          if (showLevel2 && level2Data) {
            level2Data.forEach(item => { selection[item.name] = true; });
          }
          return selection;
        })(),
      },
      series
    };
  }, [level1Data, level2Data, showLevel2, isMobile, isMdPlus, hoveredItem]);

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

  // Calculate responsive height - slightly larger for md+ screens
  const chartHeight = isMdPlus ? Math.max(height * 1.2, 550) : height;

  return (
    <div className="w-full overflow-visible relative" style={{ padding: '20px' }}>
      <ReactECharts
        option={option}
        style={{
          height: `${chartHeight}px`,
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
      {(() => {
        const total = (energyMixData as EnergyMixResponse)?.total;
        const centerY = chartHeight / 2;
        return total !== undefined ? (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            style={{ top: `${centerY}px` }}
          >
            <div className="text-center">
              <div className="text-sm text-slate-600 text-center">סה&quot;כ</div>
              <div className="md:text-base text-sm font-bold text-center">MW {total.toFixed()}</div>
            </div>
          </div>
        ) : null;
      })()}

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

