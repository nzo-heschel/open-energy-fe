'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FilterOptions } from '@/types/dto';
import { getGranularityLabel, getPeriodLabel } from '@/lib/format';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  showGranularity?: boolean;
  showPeriod?: boolean;
  showCategory?: boolean;
}

export default function FilterBar({ 
  filters, 
  onFiltersChange, 
  showGranularity = true,
  showPeriod = true,
  showCategory = false 
}: FilterBarProps) {
  const granularityOptions = [
    { value: 'hour', label: 'שעתי' },
    { value: 'day', label: 'יומי' },
    { value: 'week', label: 'שבועי' },
    { value: 'month', label: 'חודשי' },
    { value: 'year', label: 'שנתי' }
  ];

  const periodOptions = [
    { value: 'today', label: 'היום' },
    { value: 'week', label: 'השבוע' },
    { value: 'month', label: 'החודש' },
    { value: 'year', label: 'השנה' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'הכל' },
    { value: 'with_aluminum', label: 'כולל אלומיניום' },
    { value: 'without_aluminum', label: 'ללא אלומיניום' }
  ];

  return (
    <div className="flex items-center gap-4 mb-6 flex-wrap">
      {showGranularity && (
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>מיון לפי:</span>
          <Select 
            value={filters.granularity} 
            onValueChange={(value) => onFiltersChange({ ...filters, granularity: value as any })}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {granularityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showPeriod && (
        <div className="flex items-center gap-2">
          <Select 
            value={filters.period} 
            onValueChange={(value) => onFiltersChange({ ...filters, period: value as any })}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showCategory && (
        <div className="flex items-center gap-2">
          <Select 
            value={filters.category || 'all'} 
            onValueChange={(value) => onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}