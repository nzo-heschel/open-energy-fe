// Market API response types
export type TimePoint = { 
  t: string; // ISO timestamp
  value: number; 
};

export type SeriesLine = { 
  key: string; 
  label: string; 
  unit: 'MW' | 'MWh' | '₪/MWh'; 
  points: TimePoint[]; 
};

export type MarketOverviewResponse = {
  series: SeriesLine[]; // demand, generation_by_source: coal, gas, renewables, other
  meta: { updatedAt: string };
};

export type MixResponse = {
  totalMW: number;
  breakdown: { 
    key: 'coal' | 'gas' | 'solar' | 'wind' | 'other'; 
    label: string; 
    valueMW: number; 
    color?: string;
  }[];
  meta: { updatedAt: string };
};

export type SmpLineResponse = {
  series: SeriesLine[]; // e.g., smp_with_aluminum, smp_without_aluminum
  meta: { currency: 'ILS'; unit: '₪/MWh' };
};

export type SmpScatterResponse = {
  points: { 
    demandMW: number; 
    price: number; 
    ts: string; 
    category?: string; 
  }[];
};

export type FilterOptions = {
  granularity: 'hour' | 'day' | 'week' | 'month' | 'year';
  period: 'today' | 'week' | 'month' | 'year';
  category?: string;
};