'use client';

import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import heILocale from 'antd/locale/he_IL';
import {
  endOfMonth,
  endOfYear,
  format as formatDate,
  isSameDay,
  startOfMonth,
  startOfToday,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import dayjs, { Dayjs } from 'dayjs';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';

// Configure dayjs to use Hebrew locale at module level
if (typeof globalThis.window !== 'undefined') {
  import('dayjs/locale/he').then(() => {
    dayjs.locale('he');
  });
}

interface DateRangePickerProps {
  value?: [Date, Date];
  onChange?: (dates: [Date | null, Date | null] | null) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  onPresetChange?: (presetLabel: string) => void;
  defaultPreset?: 'today' | 'thisMonth' | 'thisYear' | 'thisDecade' | 'lastYear' | 'last7Days';
  placeholder?: [string, string];
  format?: string;
}
// Helper function to convert Date to Dayjs with Hebrew locale
const dateToDayjs = (date: Date): Dayjs => {
  return dayjs(date).locale('he');
};

// Helper function to convert Dayjs to Date
const dayjsToDate = (dayjsDate: Dayjs | null): Date | null => {
  return dayjsDate ? dayjsDate.toDate() : null;
};

export default function DateRangePicker({
  value,
  onChange,
  onDateRangeChange,
  onPresetChange,
  defaultPreset = 'last7Days',
  placeholder = ['תאריך התחלה', 'תאריך סיום'],
  format = 'DD/MM/YYYY',
}: DateRangePickerProps) {
  // Ensure dayjs uses Hebrew locale
  useEffect(() => {
    import('dayjs/locale/he').then(() => {
      dayjs.locale('he');
    });
  }, []);

  // Get default date range based on preset using date-fns
  const getDefaultDateRange = (preset: string): [Date, Date] => {
    const today = new Date();
    switch (preset) {
      case 'today':
        return [startOfToday(), startOfToday()];
      case 'last7Days':
        // Last 7 days: from 7 days ago to today
        return [subDays(today, 6), today];
      case 'thisMonth':
        return [startOfMonth(today), endOfMonth(today)];
      case 'thisYear':
        return [startOfYear(today), endOfYear(today)];
      case 'thisDecade':
        return [startOfYear(subYears(today, 9)), endOfYear(today)];
      case 'lastYear':
        // Last 12 months: from 12 months ago to today
        return [startOfMonth(subMonths(today, 11)), endOfMonth(today)];
      default:
        return [subDays(today, 6), today];
    }
  };

  const [dateRange, setDateRange] = useState<[Date, Date]>(() => {
    return value || getDefaultDateRange(defaultPreset);
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Presets for date range picker using date-fns
  const presets: Array<{ label: string; value: [Date, Date] }> = [
    {
      label: 'היום',
      value: [startOfToday(), startOfToday()],
    },
    {
      label: '7 ימים אחרונים',
      value: [subDays(new Date(), 6), new Date()],
    },
    {
      label: 'חודש זה',
      value: [startOfMonth(new Date()), endOfMonth(new Date())],
    },
    {
      label: 'שנה זו',
      value: [startOfYear(new Date()), endOfYear(new Date())],
    },
    {
      label: '12 חודשים אחרונים',
      value: [startOfMonth(subMonths(new Date(), 11)), endOfMonth(new Date())],
    },
    {
      label: 'עשור זה',
      value: [startOfYear(subYears(new Date(), 9)), endOfYear(new Date())],
    },
  ];

  // Get preset label for default
  const getDefaultPresetLabel = (preset: string): string => {
    switch (preset) {
      case 'today':
        return 'היום';
      case 'last7Days':
        return '7 ימים אחרונים';
      case 'thisMonth':
        return 'חודש זה';
      case 'thisYear':
        return 'שנה זו';
      case 'lastYear':
        return '12 חודשים אחרונים';
      case 'thisDecade':
        return 'עשור זה';
      default:
        return '7 ימים אחרונים';
    }
  };

  // Initialize selected preset
  useEffect(() => {
    if (!selectedPreset) {
      const defaultLabel = getDefaultPresetLabel(defaultPreset);
      setSelectedPreset(defaultLabel);
      if (onPresetChange) {
        onPresetChange(defaultLabel);
      }
    }
  }, [defaultPreset, selectedPreset, onPresetChange]);

  // Convert presets to RangePickerProps format (convert Date to Dayjs for Ant Design)
  const presetsForPicker: RangePickerProps['presets'] = presets.map(preset => ({
    label: preset.label,
    value: [dateToDayjs(preset.value[0]), dateToDayjs(preset.value[1])],
  }));

  // Update date range state when picker changes
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dayjsToDate(dates[0]);
      const endDate = dayjsToDate(dates[1]);

      if (startDate && endDate) {
        setDateRange([startDate, endDate]);

        // Check if the selected range matches any preset using date-fns
        const matchedPreset = presets.find(preset => {
          const [presetStart, presetEnd] = preset.value;
          return isSameDay(startDate, presetStart) && isSameDay(endDate, presetEnd);
        });

        const newPreset = matchedPreset ? matchedPreset.label : 'טווח מותאם אישית';
        setSelectedPreset(newPreset);
        if (onPresetChange) {
          onPresetChange(newPreset);
        }

        // Call onChange if provided (convert to Date)
        if (onChange) {
          onChange([startDate, endDate]);
        }

        // Call onDateRangeChange with formatted dates using date-fns
        if (onDateRangeChange) {
          onDateRangeChange(
            formatDate(startDate, 'yyyy-MM-dd'),
            formatDate(endDate, 'yyyy-MM-dd')
          );
        }
      }
    } else {
      // Handle null case
      if (onChange) {
        onChange(null);
      }
    }
  };

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      setDateRange(value);
    }
  }, [value]);

  // Convert Date range to Dayjs range for Ant Design
  const dayjsDateRange: [Dayjs, Dayjs] = useMemo(() => [
    dateToDayjs(dateRange[0]),
    dateToDayjs(dateRange[1])
  ], [dateRange]);

  // Track which panel is being navigated to prevent synchronization
  const panelRef = useRef<HTMLDivElement>(null);
  const activeNavigationRef = useRef<'left' | 'right' | null>(null);
  const savedDatesRef = useRef<{ left: Dayjs; right: Dayjs }>({
    left: dayjsDateRange[0],
    right: dayjsDateRange[1],
  });

  // Intercept navigation to maintain independent panel states
  useEffect(() => {
    if (!panelRef.current) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const navBtn = target.closest(
        '.ant-picker-header-super-prev-btn, .ant-picker-header-super-next-btn, .ant-picker-header-prev-btn, .ant-picker-header-next-btn'
      );

      if (navBtn) {
        const panel = navBtn.closest('.ant-picker-panel');
        if (panel) {
          const panels = panelRef.current?.querySelectorAll('.ant-picker-panel');
          if (panels && panels.length === 2) {
            // Determine which panel was clicked
            if (panel === panels[0]) {
              activeNavigationRef.current = 'left';
              savedDatesRef.current.left = dayjsDateRange[0];
            } else if (panel === panels[1]) {
              activeNavigationRef.current = 'right';
              savedDatesRef.current.right = dayjsDateRange[1];
            }
          }
        }
      }
    };

    const container = panelRef.current;
    container.addEventListener('click', handleClick, true);

    return () => {
      container.removeEventListener('click', handleClick, true);
    };
  }, [dayjsDateRange]);

  return (
    <div className="relative date-range-picker-wrapper">
      <DatePicker.RangePicker
        value={dayjsDateRange}
        onChange={handleDateRangeChange}
        presets={presetsForPicker}
        format={format}
        placeholder={placeholder}
        locale={heILocale.DatePicker}
        separator=" - "
        suffixIcon={<ChevronDown className="w-4 h-4 stroke-[#59687D]" />}
        className="date-range-picker-select"
        allowClear={false}
        picker="date"
        showNow={false}
        panelRender={(panelNode) => (
          <div
            ref={panelRef}
            className="date-range-picker-panel"
          >
            {panelNode}
          </div>
        )}
      />
    </div>
  );
}


