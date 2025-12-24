'use client';

import { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { differenceInDays, differenceInMonths, differenceInYears, format, parseISO } from 'date-fns';
import { LEVEL1_COLORS } from '@/lib/colors';

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
}

export default function Chart2({ data, title, startDate, endDate, showLevel2 = false }: LineChartProps) {
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
        name: "[MW]",
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: {
          fontSize: 12
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
  }, [data, title, visibleSeries, formatXAxisLabels, dateRangeInfo, xAxisInterval, shouldRotateLabels]);

  if (!isClient) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `300px` }}>
        <div className="text-slate-500">טוען גרף...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={option}
        style={{ height: `300px` }}
        opts={{ renderer: 'canvas' }}
      />

      {/* Custom Legend */}
      {showLevel2 ? (
        (() => {
          // Map series names to categories
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
            'אגירה שאובה': { name: 'אחר', color: LEVEL1_COLORS['אחר'] },
            'סה"כ': { name: 'סה"כ', color: '#000000' }
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
          const categoryOrder = ['אנרגיות פוסיליות', 'אנרגיות מתחדשות', 'אחר', 'סה"כ'];
          const orderedGroups = categoryOrder
            .filter(cat => grouped[cat] && grouped[cat].length > 0)
            .map(cat => ({
              category: { name: cat, color: LEVEL1_COLORS[cat] || '#5470c6' },
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
                      borderRightColor: group.category.color || '#5470c6',
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
                            style={{ backgroundColor: series.color || '#5470c6' }}
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
                  style={{ backgroundColor: series.color || '#5470c6' }}
                ></div>
                <span className="md:text-sm text-xs">{series.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}