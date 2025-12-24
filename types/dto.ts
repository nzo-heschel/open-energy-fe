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

// Energy line chart API response
export type EnergyOverviewResponse = {
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
  series_granularity: string;
  series_units: string;
  series: Array<{
    period: string;
    label: string;
    non_renewables_mw: number;
    renewables_mw: number;
    other_mw: number;
    total_mw: number;
    non_renewables_share_percent: number;
    renewables_share_percent: number;
    other_share_percent: number;
    renewable_share_percent: number;
    // Level 2 breakdown for each period
    level2?: {
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
    // Individual source values
    coal_mw?: number;
    natural_gas_mw?: number;
    diesel_mw?: number;
    photoVoltaic_mw?: number;
    biogas_mw?: number;
    wind_mw?: number;
    solar_thermal_mw?: number;
    pv_storage_mw?: number;
    other_source_mw?: number;
    pumped_storage_mw?: number;
  }>;
  tooltip: string;
};

// SMP API response
export type SMPResponse = {
  chart_with_constraints: Array<{
    timestamp: string;
    price: number;
  }>;
  chart_without_constraints: Array<{
    timestamp: string;
    price: number;
  }>;
  correlation_view: Array<{
    timestamp: string;
    net_demand: number;
    price: number;
  }>;
  daily_average: Array<{
    period: string;
    price_with_constraints: number;
    price_without_constraints: number;
    net_demand?: number;
  }>;
  end_date: string;
  monthly_average: Array<{
    period: string;
    price_with_constraints: number;
    price_without_constraints: number;
    net_demand?: number;
  }>;
  start_date: string;
  view: string;
};

// Energy overview API response (for pie chart)
export type EnergyMixResponse = {
  start_date: string;
  end_date: string;
  filter: string;
  categories: Array<{
    category_name: string;
    total_value: number;
    sub_categories: Array<{
      sub_category_name: string;
      value: number;
    }>;
  }>;
  category_percentages: {
    renewables: number;
    non_renewables: number;
    other: number;
  };
  tooltip: string;
  total: number;
  level1: {
    fossil_energy: number;
    renewable_energy: number;
    other: number;
  };
  level2: {
    fossil_energy: {
      coal: number;
      natural_gas: number;
      diesel: number;
    };
    renewable_energy: {
      photovoltaic: number;
      biogas: number;
      wind: number;
      solar: number;
    };
    other: {
      other: number;
      pumped_storage: number;
    };
  };
  renewable_generation: number;
  renewable_share_percent: number;
};

// Private supplier connected consumers API response (placeholder - will be updated after testing endpoint)
export type PrivateSupplierConnectedConsumersResponse = any;

// SMP production vs marginal price API response
export type SMPProductionVsMarginalPriceResponse = {
  combined_series: Array<{
    net_demand: number;
    price_with_constraints?: number;
    price_without_constraints?: number;
    smp: number;
    timestamp: string;
  }>;
  correlation: Array<{
    smp: number;
    net_demand: number;
  }>;
  daily_average: Array<{
    period: string;
    avg_smp: number;
    price_with_constraints?: number;
    price_without_constraints?: number;
    net_demand?: number;
  }>;
  daily_smp: Array<{
    date: string;
    daily_smp_avg: number;
    daily_smp_avg_with_constraints: number;
    daily_smp_avg_without_constraints: number;
  }>;
  end_date: string;
  monthly_average: Array<{
    period: string;
    avg_smp: number;
    price_with_constraints?: number;
    price_without_constraints?: number;
    net_demand?: number;
  }>;
  yearly_average: Array<{
    period: string;
    avg_smp: number;
    price_with_constraints?: number;
    price_without_constraints?: number;
    net_demand?: number;
  }>;
  net_demand_series: Array<{
    timestamp: string;
    net_demand: number;
  }>;
  smp_series: Array<{
    timestamp: string;
    smp: number;
    price_with_constraints?: number;
    price_without_constraints?: number;
  }>;
  start_date: string;
  view: string;
  correlation_by_view: {
    day: Array<{
      timestamp: string;
      net_demand: number;
      price_with_constraints: number;
      price_without_constraints: number;
    }>;
    month: Array<{
      timestamp: string;
      net_demand: number;
      price_with_constraints: number;
      price_without_constraints: number;
    }>;
    year: Array<{
      timestamp: string;
      net_demand: number;
      price_with_constraints: number;
      price_without_constraints: number;
    }>;
  }
};

// Switching requests API response (placeholder - will be updated after testing endpoint)
export type SwitchingRequestsResponse = any;