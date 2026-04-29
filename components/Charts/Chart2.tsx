'use client';

import { ENERGY_MIX_FIGMA_FALLBACK, LEVEL1_COLORS } from '@/lib/colors';
import { differenceInDays, differenceInMonths, differenceInYears, format, parseISO } from 'date-fns';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useState } from 'react';

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
  startDate?: string;
  endDate?: string;
  showLevel2?: boolean;
  height?: number;
}

export default function Chart2({ data, title, startDate, endDate, showLevel2 = false, height = 450 }: LineChartProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedLegends, setSelectedLegends] = useState<Record<string, boolean>>({});

  // Initialize all series as visible
  useEffect(() => {
    setIsClient(true);
    const initialSelection: Record<string, boolean> = {};
    data.series.forEach(series => {
      initialSelection[series.name] = true;
    });
    setSelectedLegends(initialSelection);
  }, [data.series]);

  const handleLegendClick = (seriesName: string) => {
    setSelectedLegends(prev => ({
      ...prev,
      [seriesName]: !prev[seriesName]
    }));
  };

  // Get visible series indices based on selectedLegends
  const visibleSeries = useMemo(() => {
    return data.series.map(series => selectedLegends[series.name] !== false);
  }, [data.series, selectedLegends]);

  // Calculate date range to determine X-axis formatting (for label rotation/spacing)
  const dateRangeInfo = useMemo(() => {
    if (!startDate || !endDate) {
      return { type: 'day' as const, days: 0, months: 0, years: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start);
    const months = differenceInMonths(end, start);
    const years = differenceInYears(end, start);

    // Determine format type based on actual date range
    if (years >= 1) {
      return { type: 'year' as const, days, months, years };
    } else if (months >= 1) {
      return { type: 'month' as const, days, months, years };
    } else if (days <= 1) {
      return { type: 'time' as const, days, months, years };
    } else {
      return { type: 'day' as const, days, months, years };
    }
  }, [startDate, endDate]);

  // Format labels the same way as SMPGraph
  const formatXAxisLabels = useMemo(() => {
    if (!data.dates || data.dates.length === 0) return [];

    return data.dates.map(label => {
      // Try to parse the label as a date
      // Labels from API might be in various formats like "19 Dec", "2025-12-19", etc.
      let date: Date | null = null;

      // Try parsing as ISO date first
      if (label.match(/^\d{4}-\d{2}-\d{2}/)) {
        date = parseISO(label);
      } else if (label.match(/^\d{4}-\d{2}$/)) {
        // Year-month format
        date = parseISO(label + '-01');
      } else {
        // Try general date parsing
        date = new Date(label);
      }

      if (date && !isNaN(date.getTime())) {
        // Format based on date range type, same as SMPGraph
        if (dateRangeInfo.type === 'time') {
          // 1 day: show time only (HH:mm)
          return format(date, 'HH:mm');
        } else if (dateRangeInfo.type === 'day') {
          // Multiple days but less than month: show days (dd/MM)
          return format(date, 'dd/MM');
        } else if (dateRangeInfo.type === 'month') {
          // Month view: show month/year (MM/yy)
          return format(date, 'MM/yy');
        } else if (dateRangeInfo.type === 'year') {
          // Year view: show year only (yyyy)
          return format(date, 'yyyy');
        }
      }

      // Fallback to original label if parsing fails
      return label;
    });
  }, [data.dates, dateRangeInfo.type]);

  // Calculate X-axis interval to prevent label overlap
  const xAxisInterval = useMemo(() => {
    if (dateRangeInfo.type === 'year' || dateRangeInfo.type === 'month') {
      return 'auto';
    }
    // For day/time views, calculate interval based on data length
    const dataLength = formatXAxisLabels.length;
    if (dataLength > 30) {
      return Math.floor(dataLength / 15); // Show ~15 labels max
    } else if (dataLength > 15) {
      return Math.floor(dataLength / 10); // Show ~10 labels max
    } else {
      return 0; // Show all labels if 15 or fewer
    }
  }, [formatXAxisLabels.length, dateRangeInfo.type]);

  // No rotation - same as SMPGraph
  const shouldRotateLabels = false;

  const option = useMemo(() => {

    return {
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
        },
        backgroundColor: 'white',
        borderColor: 'transparent',
        borderWidth: 0,
        padding: [8, 8],
        textStyle: {
          color: '#59687D',
          fontSize: 14,
          fontFamily: 'Heebo, sans-serif'
        },
        extraCssText: 'box-shadow: 0px 2px 30px 2px #99BF4129; border-radius: 10px;',
        formatter: (params: any) => {
          if (!params || !Array.isArray(params)) return '';

          // Get the label (date/time) from the first param
          const label = params[0]?.axisValue || '';

          // Calculate total generation at this point (sum of all visible series values)
          const total = params.reduce((sum: number, param: any) => {
            const value = param.value || 0;
            return sum + (typeof value === 'number' ? value : 0);
          }, 0);

          // Build tooltip content matching PrivateConsumersChart style
          let content = '<div style="background: white; padding: 8px; direction: rtl;">';

          // Label (date/time) at top
          content += `<p style="color: #59687D; font-weight: 400; font-size: 14px; margin: 0 0 4px 0; font-family: 'Heebo', sans-serif;">${label}</p>`;

          // Total with border bottom
          content += `<p style="color: #59687D; font-weight: 500; font-size: 16px; margin: 0 0 4px 0; padding-bottom: 4px; border-bottom: 1px solid #59687D; font-family: 'Heebo', sans-serif;">סה"כ ${total.toLocaleString('he-IL')}</p>`;

          // Each series item
          params.forEach((param: any) => {
            const value = param.value || 0;
            const numValue = typeof value === 'number' ? value : 0;
            const percentage = total > 0 ? ((numValue / total) * 100).toFixed(1) : '0';
            const color = param.color || ENERGY_MIX_FIGMA_FALLBACK;

            content += `
              <div style="display: flex; align-items: flex-start; gap: 4px; padding-top: 4px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; margin-left: 8px; margin-top: 4px; flex-shrink: 0;"></div>
                <span style="display: flex; flex-direction: column; color: #59687D; font-size: 14px; line-height: 1.4; font-family: 'Heebo', sans-serif;">
                  <span style="font-weight: 400;">${param.seriesName} | ${percentage}%</span>
                  <span style="font-weight: 600;">${numValue.toLocaleString('he-IL')} MW</span>
                </span>
              </div>
            `;
          });

          content += '</div>';
          return content;
        }
      },
      legend: {
        show: false, // Hide the default ECharts legend
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: formatXAxisLabels,
        axisLabel: {
          fontSize: 11,
          rotate: shouldRotateLabels ? -45 : 0,
          interval: xAxisInterval,
          // Add margin to prevent label cutoff
          margin: 8,
          // Hide labels that are too close together
          hideOverlap: true
        }
      },
      yAxis: {
        type: 'value',
        name: "[MWh]",
        nameLocation: 'middle',
        nameGap: 50,
        nameRotate: 90,
        nameTextStyle: {
          fontSize: 12,
          fontFamily: 'Heebo, sans-serif'
        },
        axisLabel: {
          fontSize: 11,
          formatter: (value: number) => {
            if (value >= 1000) {
              return (value / 1000) + 'K';
            }
            return value.toString();
          }
        }
      },
      series: data.series.map((s, index) => ({
        name: s.name,
        type: 'line',
        data: visibleSeries[index] ? s.data : [],
        lineStyle: {
          color: s.color
        },
        itemStyle: {
          color: s.color
        },
      }))
    };
  }, [data, title, visibleSeries, formatXAxisLabels, xAxisInterval, shouldRotateLabels]);

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-center flex-1 min-h-[300px]" style={{ height: `${height}px` }}>
        <div className="text-slate-500">טוען גרף...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 w-full" style={{ height: `${height}px` }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', minHeight: `${height}px` }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Custom Legend - aligned to bottom of card */}
      <div className="mt-auto pt-6">
        {showLevel2 ? (
          (() => {
            // Map series names to categories
            const categoryMap: Record<string, { name: string; color: string }> = {
              'פחם': { name: "אנרגיה פוסילית", color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
              'גז טבעי': { name: "אנרגיה פוסילית", color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
              'סולר': { name: "אנרגיה פוסילית", color: LEVEL1_COLORS['אנרגיות פוסיליות'] },
              'פוטו וולטאי': { name: "אנרגיה מתחדשת", color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
              'ביו גז': { name: "אנרגיה מתחדשת", color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
              'רוח': { name: "אנרגיה מתחדשת", color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
              'תרמו סולרי': { name: "אנרגיה מתחדשת", color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
              'פוטו וולטאי משולב אגירה': { name: "אנרגיה מתחדשת", color: LEVEL1_COLORS['אנרגיות מתחדשות'] },
              'אחר': { name: 'אחר', color: LEVEL1_COLORS['אחר'] },
              'אגירה שאובה': { name: 'אחר', color: LEVEL1_COLORS['אחר'] }
            };

            // Group series by category
            const grouped: Record<string, typeof data.series> = {};
            data.series.forEach(series => {
              const category = categoryMap[series.name]?.name || 'אחר';
              if (!grouped[category]) {
                grouped[category] = [];
              }
              grouped[category].push(series);
            });

            // Order: Fossil, Renewable, Other, Total
            const categoryOrder = ["אנרגיה פוסילית", "אנרגיה מתחדשת", 'אחר', 'סה"כ'];
            const orderedGroups = categoryOrder
              .filter(cat => grouped[cat] && grouped[cat].length > 0)
              .map(cat => ({
                category: { name: cat, color: LEVEL1_COLORS[cat] || ENERGY_MIX_FIGMA_FALLBACK },
                items: grouped[cat]
              }));

            return (
              <div className="mt-5 space-y-5">
                {orderedGroups.map((group, groupIndex) => (
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
                      {group.items.map((series, itemIndex) => {
                        const isSelected = selectedLegends[series.name] !== false;
                        return (
                          <div
                            key={itemIndex}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => handleLegendClick(series.name)}
                            style={{
                              opacity: isSelected ? 1 : 0.4,
                              transition: 'opacity 0.2s ease'
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: series.color || ENERGY_MIX_FIGMA_FALLBACK }}
                            ></div>
                            <span className="md:text-sm text-xs">{series.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        ) : (
          <div className="flex flex-wrap justify-start md:gap-6 gap-3 text-xs font-medium mt-5">
            {data.series.map((series, index) => {
              const isSelected = selectedLegends[series.name] !== false;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleLegendClick(series.name)}
                  style={{
                    opacity: isSelected ? 1 : 0.4,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: series.color || ENERGY_MIX_FIGMA_FALLBACK }}
                  ></div>
                  <span className="md:text-sm text-xs">{series.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}