'use client';

import { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subYears,
  format as formatDate,
  isSameDay,
  startOfToday,
} from 'date-fns';
import heILocale from 'antd/locale/he_IL';
import { ChevronDown } from 'lucide-react';
import './styles.css';
// Configure dayjs to use Hebrew locale at module level
if (typeof window !== 'undefined') {
  import('dayjs/locale/he').then(() => {
    dayjs.locale('he');
  });
}

interface DateRangePickerProps {
  value?: [Date, Date];
  onChange?: (dates: [Date | null, Date | null] | null) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  onPresetChange?: (presetLabel: string) => void;
  defaultPreset?: 'today' | 'thisMonth' | 'thisYear' | 'thisDecade';
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
  defaultPreset = 'thisYear',
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
      case 'thisMonth':
        return [startOfMonth(today), endOfMonth(today)];
      case 'thisYear':
        return [startOfYear(today), endOfYear(today)];
      case 'thisDecade':
        return [startOfYear(subYears(today, 9)), endOfYear(today)];
      default:
        return [startOfYear(today), endOfYear(today)];
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
      label: 'חודש זה',
      value: [startOfMonth(new Date()), endOfMonth(new Date())],
    },
    {
      label: 'שנה זו',
      value: [startOfYear(new Date()), endOfYear(new Date())],
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
      case 'thisMonth':
        return 'חודש זה';
      case 'thisYear':
        return 'שנה זו';
      case 'thisDecade':
        return 'עשור זה';
      default:
        return 'שנה זו';
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
  const dayjsDateRange: [Dayjs, Dayjs] = [
    dateToDayjs(dateRange[0]),
    dateToDayjs(dateRange[1])
  ];

  // Determine if we should show preset label or dates
  const isPresetSelected = selectedPreset && selectedPreset !== 'טווח מותאם אישית';

  // Custom format function for the picker
  const formatValue = (value: Dayjs | null): string => {
    if (!value) return '';

    // If preset is selected, return empty to avoid duplication with placeholder
    if (isPresetSelected) {
      return '';
    }

    // For custom range, show formatted date
    return value.format(format);
  };

  return (
    <div className="relative date-range-picker-wrapper">
      <DatePicker.RangePicker
        value={dayjsDateRange}
        onChange={handleDateRangeChange}
        presets={presetsForPicker}
        format={formatValue}
        placeholder={isPresetSelected ? [selectedPreset || '', ''] : placeholder}
        locale={heILocale.DatePicker}
        inputReadOnly={!!isPresetSelected}
        separator=""
        suffixIcon={<ChevronDown className="w-4 h-4 stroke-[#59687D]" />}
        className="date-range-picker-select"
      />
    </div>
  );
}


