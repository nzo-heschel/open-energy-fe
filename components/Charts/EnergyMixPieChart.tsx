'use client';

import { ENERGY_MIX_FIGMA_FALLBACK, LEVEL1_COLORS, LEVEL2_COLORS } from '@/lib/colors';
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
  /** When true, use height as-is on all screens (for consistent card layout) */
  useFixedHeight?: boolean;
}

export default function EnergyMixPieChart({
  energyMixData,
  height = 450,
  showLevel2 = false,
  useFixedHeight = false
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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
              color: LEVEL2_COLORS[normalizedKey] || ENERGY_MIX_FIGMA_FALLBACK
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

    // Radius values matching Figma design
    const innerRingInner = isMdPlus ? '32%' : '30%'; // More space for center text
    const innerRingOuter = isMdPlus ? '42%' : '40%'; // Thin inner ring (10% width)
    const outerRingInner = isMdPlus ? '48%' : '46%'; // Start of outer ring (small gap from inner)
    const outerRingOuter = isMdPlus ? '88%' : '85%'; // Thick outer ring (40% width)
    const singleRingInner = isMdPlus ? '45%' : '40%';
    const singleRingOuter = isMdPlus ? '85%' : '80%';

    if (showLevel2 && level2Data && level2Data.length > 0) {
      // Nested donut chart: inner ring (level 1) and outer ring (level 2)

      // Inner ring - Level 1 (smaller dimensions)
      series.push({
        name: 'Level 1',
        type: 'pie',
        radius: [innerRingInner, innerRingOuter], // Inner ring dimensions
        center: ['50%', '50%'],
        startAngle: 90, // 12 o'clock = middle-top (ECharts: 0=3 o'clock, 90=12 o'clock)
        anticlockwise: true,
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        emphasis: {
          disabled: true,
          label: {
            show: false
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
            color: item.color || ENERGY_MIX_FIGMA_FALLBACK,
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
        startAngle: 90, // 12 o'clock = middle-top (ECharts: 0=3 o'clock, 90=12 o'clock)
        clockwise: true,
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        emphasis: {
          disabled: true,
          label: {
            show: false
          }
        },
        tooltip: {
          show: true,
        },
        data: level2Data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || ENERGY_MIX_FIGMA_FALLBACK,
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
        startAngle: 90, // 12 o'clock = middle-top (ECharts: 0=3 o'clock, 90=12 o'clock)
        clockwise: true,
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        emphasis: {
          disabled: true,
          label: {
            show: false
          }
        },
        tooltip: {
          show: true,
        },
        data: level1Data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || ENERGY_MIX_FIGMA_FALLBACK,
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

          // Format value with locale string
          const formattedValue = value.toLocaleString('en-US', { maximumFractionDigits: 0 });
          const formattedPercent = percent.toFixed(0);

          // Return HTML string matching Figma design: "Name | Percentage%" on top, "ValueMW" below
          return `<div style="background: white; padding: 4px 8px; margin: 0; text-align: center;"><div style="color: #59687D; font-weight: 500; font-size: 14px; margin-bottom: 4px;">${params.name} | ${formattedPercent}%</div><div style="color: #59687D; font-weight: 700; font-size: 16px;">${formattedValue}MW</div></div>`;
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

  const chartHeight = useFixedHeight ? height : (isMdPlus ? Math.max(height * 1.2, 550) : height);

  const total = (energyMixData as EnergyMixResponse)?.total;

  return (
    <div className="w-full flex flex-col h-full min-h-0 overflow-visible relative" style={{ padding: '20px' }}>
      <div className="flex-1 min-h-0 flex items-center justify-center relative">
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
            click: (params: ECElementEvent) => {
              if (params.componentType === 'series' && params.seriesType === 'pie') {
                handleLegendClick(params.name);
              }
            }
          }}
        />
        {total !== undefined ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-sm text-slate-500 text-center">סה&quot;כ</div>
              <div className="md:text-lg text-base font-bold text-slate-700 text-center">MW {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Custom Legend - aligned to bottom of card */}
      <div className="mt-auto pt-1">
      {showLevel2 && groupedLevel2Data ? (
        <div className="space-y-5">
          {groupedLevel2Data.map((group, groupIndex) => {
            return (
              <div key={groupIndex} className="space-y-1.5">
                {/* Category title row with colored right border */}
                <div
                  className="flex items-center gap-2 pr-2 border-r-2"
                  style={{
                    borderRightColor: group.category.color || ENERGY_MIX_FIGMA_FALLBACK,
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
                          style={{ backgroundColor: item.color || ENERGY_MIX_FIGMA_FALLBACK }}
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
                  style={{ backgroundColor: item.color || ENERGY_MIX_FIGMA_FALLBACK }}
                ></div>
                <span className="md:text-sm text-xs">{item.name}</span>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

