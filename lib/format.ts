// Formatting utilities
export const formatNumber = (value: number, unit?: string): string => {
  const formatted = new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  
  return unit ? `${formatted} ${unit}` : formatted;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
  
  return new Intl.DateTimeFormat('he-IL', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatTooltip = (params: any[]): string => {
  if (!params || params.length === 0) return '';
  
  const time = formatDate(params[0].axisValue);
  let content = `<div style="text-align: right; font-family: Heebo, sans-serif;">`;
  content += `<div style="margin-bottom: 8px; font-weight: bold;">${time}</div>`;
  
  params.forEach(param => {
    const color = param.color;
    const name = param.seriesName;
    const unit = param.data && typeof param.data === 'object' ? param.data.unit : undefined;
    const value = formatNumber(param.value, unit);
    
    content += `<div style="margin-bottom: 4px;">`;
    content += `<span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-left: 8px;"></span>`;
    content += `<span>${name}: ${value}</span>`;
    content += `</div>`;
  });
  
  content += `</div>`;
  return content;
};

export const getGranularityLabel = (granularity: string): string => {
  const labels: Record<string, string> = {
    hour: 'שעתי',
    day: 'יומי',
    week: 'שבועי',
    month: 'חודשי',
    year: 'שנתי',
  };
  return labels[granularity] || granularity;
};

export const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    today: 'היום',
    week: 'השבוע',
    month: 'החודש',
    year: 'השנה',
  };
  return labels[period] || period;
};