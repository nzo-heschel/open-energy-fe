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

// Energy mix pie chart API response
export type EnergyMixResponse = {
  start_date: string;
  end_date: string;
  filter: string;
  level1: {
    "Non-renewables": number;
    "Renewables": number;
    "Other": number;
  };
  level2: {
    "Non-renewables": {
      coal: number;
      natural_gas: number;
      diesel: number;
    };
    "Renewables": {
      photoVoltaic: number;
      biogas: number;
      wind: number;
      solar_thermal: number;
      pv_storage: number;
    };
    "Other": {
      other: number;
      pumped_storage: number;
    };
  };
  total_generation: number;
  renewable_share_percent: number;
  categories: {
    category_name: string;
    total_value: number;
    sub_categories: {
      sub_category_name: string;
      value: number;
    }[];
  }[];
  tooltip: string;
};

// SMP API response
export type SMPResponse = {
  start_date: string;
  end_date: string;
  view: string;
  chart_with_constraints: Array<{
    hour: string;
    price: number;
  }>;
  chart_without_constraints: Array<{
    hour: string;
    price: number;
  }>;
  min_price: number;
  max_price: number;
  avg_price: number;
};