import type {
  CO2EmissionsMixResponse,
  CO2EmissionsOverTimeResponse,
  CO2EmissionsRatioResponse,
  CO2EmissionsSavingsResponse,
  CO2TotalProductionResponse,
  EnergyMixResponse,
  EnergyOverviewResponse,
  FilterOptions,
  MarketOverviewResponse,
  MixResponse,
  PrivateSupplierConnectedConsumersResponse,
  SmpLineResponse,
  SMPProductionVsMarginalPriceResponse,
  SMPResponse,
  SmpScatterResponse,
  SwitchingRequestsResponse
} from '@/types/dto';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, differenceInMonths } from 'date-fns';

const API_BASE = 'https://api.open-energy.madebyomnis.com/';
const INTERNAL_API_KEY = 'int_api_9f3c7e2a4b8d6c1f0a5e9d2b7c4a1e6f';

// Helper function to calculate granularity based on preset and date range
const getGranularityFromPresetAndDateRange = (presetLabel: string | undefined, startDate: string, endDate: string): 'day' | 'month' | 'year' => {
  // If preset is provided, use it to determine granularity
  if (presetLabel) {
    switch (presetLabel) {
      case 'היום': // Today
        return 'day';
      case 'חודש זה': // This month
        return 'month';
      case 'שנה זו': // This year
        return 'year';
      case 'עשור זה': // This decade
        return 'year';
      case 'טווח מותאם אישית': // Custom range - fall through to date range logic
      default:
        // For custom range or unknown preset, use date range logic
        break;
    }
  }

  // For custom range or when no preset, calculate based on date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = differenceInDays(end, start);
  const months = differenceInMonths(end, start);
  const years = Math.floor(months / 12);

  // Use 'day' granularity only if same day (0 days difference)
  if (days === 0) {
    return 'day';
  } else if (days >= 1 && days <= 62) {
    return 'month';
  } else {
    return 'year';
  }
};

// Generic fetcher
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'x-api-key': INTERNAL_API_KEY,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// Market overview data
export const useMarketOverview = (filters: Partial<FilterOptions>) => {
  const params = new URLSearchParams();
  if (filters.granularity) params.set('granularity', filters.granularity);
  if (filters.period) params.set('period', filters.period);

  return useQuery<MarketOverviewResponse>({
    queryKey: ['market-overview', filters],
    queryFn: () => fetcher(`${API_BASE}/market/overview?${params}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
};

// SMP line chart data
export const useSmpLine = (filters: Partial<FilterOptions>) => {
  const params = new URLSearchParams();
  if (filters.granularity) params.set('granularity', filters.granularity);
  if (filters.period) params.set('period', filters.period);

  return useQuery<SmpLineResponse>({
    queryKey: ['smp-line', filters],
    queryFn: () => fetcher(`${API_BASE}/smp/line?${params}`),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

// SMP scatter chart data
export const useSmpScatter = (filters: Partial<FilterOptions>) => {
  const params = new URLSearchParams();
  if (filters.period) params.set('period', filters.period);
  if (filters.category) params.set('category', filters.category);

  return useQuery<SmpScatterResponse>({
    queryKey: ['smp-scatter', filters],
    queryFn: () => fetcher(`${API_BASE}/smp/scatter?${params}`),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};





//


//1
export const useEnergyMix = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<EnergyMixResponse>({
    queryKey: ['energy-mix', startDate, endDate],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/energy/overview?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};


export const exportEnergyMix = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/energy/overview/export?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'energy-mix-export.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create a temporary URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}


//2
export const useEnergyOverview = (startDate: string, endDate: string, presetLabel?: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<EnergyOverviewResponse>({
    queryKey: ['energy-overview', startDate, endDate, presetLabel],
    queryFn: async () => {
      try {
        // Determine granularity based on preset and date range
        const granularity = getGranularityFromPresetAndDateRange(presetLabel, startDate, endDate);
        params.set('granularity', granularity);

        const data = await fetcher(`${API_BASE}api/v1/energy/production-mix?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

export const exportEnergyOverview = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/energy/production-mix/export?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'energy-overview-export.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create a temporary URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};







//++ smp #3
export const useSMP = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<SMPResponse>({
    queryKey: ['smp', startDate, endDate],
    queryFn: async () => {
      try {
        // Use trailing slash to avoid redirect (redirects don't include custom headers)
        const data = await fetcher(`${API_BASE}api/v1/energy/smp/?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ SMP production vs marginal price data
export const useSMPProductionVsMarginalPrice = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<SMPProductionVsMarginalPriceResponse>({
    queryKey: ['smp-production-vs-marginal-price', startDate, endDate],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/energy/smp-production-vs-marginal-price/?${params}`);

        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Private supplier connected consumers data
export const usePrivateSupplierConnectedConsumers = (startDate: string, endDate: string) => {
  return useQuery<PrivateSupplierConnectedConsumersResponse>({
    queryKey: ['private-supplier-connected-consumers', startDate, endDate],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.set('start_date', startDate);
        params.set('end_date', endDate);

        const data = await fetcher(`${API_BASE}api/v1/private-supplier-connected-consumers/?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Export private supplier connected consumers data
export const exportPrivateSupplierConnectedConsumers = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) {
    params.set('start_date', startDate);
  }
  if (endDate) {
    params.set('end_date', endDate);
  }

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/private-supplier-connected-consumers/export?${params}`
      : `${API_BASE}api/v1/private-supplier-connected-consumers/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'private_suppliers_consumers.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create a temporary URL and trigger download
    const urlObject = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlObject);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Switching requests data
export const useSwitchingRequests = (customerType?: 'residential' | 'non_residential', year?: string) => {
  return useQuery<SwitchingRequestsResponse>({
    queryKey: ['switching-requests', customerType, year],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (customerType) {
          params.set('customer_type', customerType);
        }
        if (year) {
          params.set('year', year);
        }

        const url = params.toString()
          ? `${API_BASE}api/v1/switching-requests/?${params}`
          : `${API_BASE}api/v1/switching-requests/`;

        const data = await fetcher(url);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Export switching requests data
export const exportSwitchingRequests = async (year?: string, customerType?: 'residential' | 'non_residential') => {
  const params = new URLSearchParams();
  if (year) {
    params.set('year', year);
  }
  if (customerType) {
    params.set('customer_type', customerType);
  }

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/switching-requests/export?${params}`
      : `${API_BASE}api/v1/switching-requests/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'switching_requests.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    } else if (year) {
      // Fallback: use year in filename if provided
      filename = `switching_requests_${year}.xlsx`;
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create a temporary URL and trigger download
    const urlObject = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlObject);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ CO2 Emissions Mix data (pie chart + infographics + time series)
export const useCO2EmissionsMix = (startDate: string, endDate: string, view?: 'day' | 'month' | 'year') => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (view) params.set('view', view);

  return useQuery<CO2EmissionsMixResponse>({
    queryKey: ['co2-emissions-mix', startDate, endDate, view],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/co2/emissions-mix?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Export CO2 Emissions Mix data
export const exportCO2EmissionsMix = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/co2/emissions-mix/export?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'co2-emissions-mix.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create a temporary URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ CO2 Emissions Savings data
export const useCO2EmissionsSavings = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<CO2EmissionsSavingsResponse>({
    queryKey: ['co2-emissions-savings', startDate, endDate],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/co2/emissions-savings?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ CO2 Emissions Ratio data
export const useCO2EmissionsRatio = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<CO2EmissionsRatioResponse>({
    queryKey: ['co2-emissions-ratio', startDate, endDate],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/co2/emissions-ratio?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ CO2 Total Production data
export const useCO2TotalProduction = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<CO2TotalProductionResponse>({
    queryKey: ['co2-total-production', startDate, endDate],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/co2/total-production?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ CO2 Emissions Over Time data
export const useCO2EmissionsOverTime = (startDate: string, endDate: string, view?: 'month' | 'year' | 'custom') => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (view) {
    params.set('view', view);
  }

  return useQuery<CO2EmissionsOverTimeResponse>({
    queryKey: ['co2-emissions-over-time', startDate, endDate, view],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/co2/emissions-over-time?${params}`);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Export CO2 Emissions Over Time data
export const exportCO2EmissionsOverTime = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/co2/emissions-over-time/export?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'co2-emissions-over-time.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create a temporary URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Mock data generators for development
export const generateMockMarketData = (): MarketOverviewResponse => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return {
    series: [
      {
        key: 'demand',
        label: 'ביקוש',
        unit: 'MW',
        points: hours.map(h => ({
          t: `2024-01-15T${h.toString().padStart(2, '0')}:00:00Z`,
          value: 8000 + Math.sin(h * Math.PI / 12) * 2000 + Math.random() * 500
        }))
      },
      {
        key: 'renewables',
        label: 'אנרגיות מתחדשות',
        unit: 'MW',
        points: hours.map(h => ({
          t: `2024-01-15T${h.toString().padStart(2, '0')}:00:00Z`,
          value: h > 6 && h < 18 ? Math.max(0, 1500 + Math.sin((h - 6) * Math.PI / 12) * 1000) : 0
        }))
      },
      {
        key: 'fossil',
        label: 'אנרגיות פוסיליות',
        unit: 'MW',
        points: hours.map(h => ({
          t: `2024-01-15T${h.toString().padStart(2, '0')}:00:00Z`,
          value: 6000 - (h > 6 && h < 18 ? Math.max(0, 1000 + Math.sin((h - 6) * Math.PI / 12) * 800) : 0)
        }))
      }
    ],
    meta: { updatedAt: new Date().toISOString() }
  };
};

export const generateMockMixData = (): MixResponse => {
  return {
    totalMW: 8734,
    breakdown: [
      { key: 'gas', label: 'גז טבעי', valueMW: 4200, color: '#D6B83A' },
      { key: 'coal', label: 'פחם', valueMW: 1800, color: '#8A6B55' },
      { key: 'solar', label: 'סולארי', valueMW: 1500, color: '#4BAE4F' },
      { key: 'wind', label: 'רוח', valueMW: 800, color: '#4A7BD0' },
      { key: 'other', label: 'אחר', valueMW: 434, color: '#6B7A69' }
    ],
    meta: { updatedAt: new Date().toISOString() }
  };
};

export const generateMockSmpData = (): SmpLineResponse => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return {
    series: [
      {
        key: 'smp_with_aluminum',
        label: 'מחיר שולי כולל אלומיניום ₪ 6000',
        unit: '₪/MWh',
        points: hours.map(h => ({
          t: `2024-01-15T${h.toString().padStart(2, '0')}:00:00Z`,
          value: 400 + Math.sin(h * Math.PI / 12) * 100 + Math.random() * 50
        }))
      },
      {
        key: 'smp_without_aluminum',
        label: 'מחיר שולי ללא אלומיניום ₪ 3200',
        unit: '₪/MWh',
        points: hours.map(h => ({
          t: `2024-01-15T${h.toString().padStart(2, '0')}:00:00Z`,
          value: 300 + Math.sin(h * Math.PI / 12) * 80 + Math.random() * 40
        }))
      }
    ],
    meta: { currency: 'ILS', unit: '₪/MWh' }
  };
};

export const generateMockScatterData = (): SmpScatterResponse => {
  const points = Array.from({ length: 200 }, (_, i) => ({
    demandMW: 6000 + Math.random() * 4000,
    price: 200 + Math.random() * 400,
    ts: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: Math.random() > 0.5 ? 'with_aluminum' : 'without_aluminum'
  }));

  return { points };
};