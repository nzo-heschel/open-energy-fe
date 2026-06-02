import type {
  CO2EmissionsMixResponse,
  CO2EmissionsOverTimeResponse,
  CO2EmissionsRatioResponse,
  CO2EmissionsSavingsResponse,
  CO2TotalProductionResponse,
  CO2TotalVsRatioResponse,
  EnergyMixResponse,
  EnergyOverviewResponse,
  FilterOptions,
  HeatLoadVsGenerationResponse,
  InstalledCapacityByFacilitySizeResponse,
  InstalledCapacityCumulativeResponse,
  InstalledCapacityGrowthResponse,
  MarketOverviewResponse,
  MixResponse,
  PrivateSupplierConnectedConsumersResponse,
  RenewablesDelivery4InternationalComparisonResponse,
  RenewablesDelivery4Response,
  RenewablesPotentialByIndustryResponse,
  RenewablesProductionMixResponse,
  RenewablesTransitionResponse,
  ResponseCapacityByDistrictResponse,
  ResponseCapacityByPeriodResponse,
  ResponseCapacityBySizeResponse,
  SmpLineResponse,
  SMPProductionVsMarginalPriceResponse,
  SMPResponse,
  SmpScatterResponse,
  SwitchingRequestsResponse
} from '@/types/dto';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { differenceInDays, differenceInMonths } from 'date-fns';
import {
  buildExportDateRangeSuffix,
  downloadBlob,
  resolveExportFilename,
} from '@/lib/exportDownload';

export { buildExportDateRangeSuffix } from '@/lib/exportDownload';

const API_BASE = 'https://api.open-energy.madebyomnis.com/';
const INTERNAL_API_KEY = 'int_api_9f3c7e2a4b8d6c1f0a5e9d2b7c4a1e6f';

const normalizeYearsParam = (years?: string | string[]): string[] | undefined => {
  if (years === undefined) return undefined;
  const list = (Array.isArray(years) ? years : [years]).filter(Boolean);
  return list.length > 0 ? list : undefined;
};

const appendYearParams = (params: URLSearchParams, years?: string | string[]) => {
  const list = normalizeYearsParam(years);
  if (!list) return;
  list.forEach((year) => params.append('year', year));
};

const yearsQueryKey = (years?: string | string[]) =>
  normalizeYearsParam(years)?.slice().sort().join(',') ?? 'all';

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
  const dateRange = `${startDate}-${endDate}`;

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
    let filename = `energy-mix-${dateRange}.xlsx`; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    if (!filename.includes(startDate) || !filename.includes(endDate)) {
      filename = filename.replace(/(\.[^.]+)?$/, `-${dateRange}$1`);
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
    let filename = `energy-overview-${startDate}-${endDate}.xlsx`; // default filename

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

//++ Export SMP data
export const exportSMP = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/energy/smp/export?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = params.toString() ? `smp-data-${startDate}-${endDate}.xlsx` : 'smp-data.xlsx'; // default filename

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

//++ Export SMP Production vs Marginal Price data
export const exportSMPProductionVsMarginalPrice = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/energy/smp-production-vs-marginal-price/export?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = params.toString() ? `smp-production-vs-marginal-price-${startDate}-${endDate}.xlsx` : 'smp-production-vs-marginal-price.xlsx'; // default filename

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
    let filename = `private_suppliers_consumers-${startDate}-${endDate}.xlsx`; // default filename

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
export const useSwitchingRequests = (
  customerType?: 'residential' | 'non_residential',
  years?: string | string[],
) => {
  return useQuery<SwitchingRequestsResponse>({
    queryKey: ['switching-requests', customerType, yearsQueryKey(years)],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (customerType) {
          params.set('customer_type', customerType);
        }
        appendYearParams(params, years);

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
    // Keep showing previous data while refetching with new filters to prevent flashing empty state
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Export switching requests data
export const exportSwitchingRequests = async (
  years?: string | string[],
  customerType?: 'residential' | 'non_residential',
  dateRange?: string,
) => {
  const params = new URLSearchParams();
  appendYearParams(params, years);
  if (customerType) {
    params.set('customer_type', customerType);
  }

  const normalizedYears = normalizeYearsParam(years);
  const dateRangeSuffix =
    dateRange ??
    (normalizedYears
      ? buildExportDateRangeSuffix({
          year: normalizedYears.length === 1 ? normalizedYears[0] : undefined,
          years: normalizedYears.length > 1 ? normalizedYears : undefined,
        })
      : buildExportDateRangeSuffix({ year: 'all' }));

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

    const defaultFilename = dateRangeSuffix
      ? `switching_requests-${dateRangeSuffix}.xlsx`
      : 'switching_requests.xlsx';
    const filename = resolveExportFilename(
      defaultFilename,
      response.headers.get('Content-Disposition'),
      dateRangeSuffix,
    );

    downloadBlob(await response.blob(), filename);
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
    let filename = params.toString() ? `co2-emissions-mix-${startDate}-${endDate}.xlsx` : 'co2-emissions-mix.xlsx'; // default filename

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
    let filename = params.toString() ? `co2-emissions-over-time-${startDate}-${endDate}.xlsx` : 'co2-emissions-over-time.xlsx'; // default filename

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

//++ CO2 Total vs Ratio data (combined chart + infographics)
export const useCO2TotalVsRatio = (startDate: string, endDate: string, view?: 'month' | 'year' | 'custom') => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (view) {
    params.set('view', view);
  }

  return useQuery<CO2TotalVsRatioResponse>({
    queryKey: ['co2-total-vs-ratio', startDate, endDate, view],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/co2/total-vs-ratio?${params}`);
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

//++ Export CO2 Total vs Ratio data
export const exportCO2TotalVsRatio = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/co2/total-vs-ratio/export-csv?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = params.toString() ? `co2-total-vs-ratio-${startDate}-${endDate}.xlsx` : 'co2-total-vs-ratio.xlsx'; // default filename

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

//++ Heat load vs generation data
export const useHeatLoadVsGeneration = (startDate?: string, endDate?: string, view?: 'month' | 'year' | 'custom') => {
  return useQuery<HeatLoadVsGenerationResponse>({
    queryKey: ['heat-load-vs-generation', startDate, endDate, view],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (startDate) {
          params.set('start_date', startDate);
        }
        if (endDate) {
          params.set('end_date', endDate);
        }
        if (view) {
          params.set('view', view);
        }

        const url = params.toString()
          ? `${API_BASE}api/v1/heat-load-vs-generation/?${params}`
          : `${API_BASE}api/v1/heat-load-vs-generation/`;

        const data = await fetcher(url);
        return data;
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
    },
    // Keep showing previous data while refetching with new filters to prevent flashing empty state
    placeholderData: keepPreviousData,
    // Refetch immediately when query key changes (when date range or view changes)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Export heat load vs generation data
export const exportHeatLoadVsGeneration = async (startDate?: string, endDate?: string, view?: 'month' | 'year' | 'custom') => {
  const params = new URLSearchParams();
  if (startDate) {
    params.set('start_date', startDate);
  }
  if (endDate) {
    params.set('end_date', endDate);
  }
  if (view) {
    params.set('view', view);
  }

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/heat-load-vs-generation/export?${params}`
      : `${API_BASE}api/v1/heat-load-vs-generation/export`;

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
    let filename = params.toString() ? `heat_load_vs_generation-${startDate}-${endDate}-${view}.xlsx` : 'heat_load_vs_generation.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    } else if (startDate && endDate) {
      // Fallback: use date range in filename if provided
      filename = `heat_load_vs_generation_${startDate}_to_${endDate}.xlsx`;
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

//++ Renewables Production Mix data
export const useRenewablesProductionMix = (startDate: string, endDate: string, category?: 'solar' | 'wind' | 'other') => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (category) {
    params.set('category', category);
  }

  return useQuery<RenewablesProductionMixResponse>({
    queryKey: ['renewables-production-mix', startDate, endDate, category],
    queryFn: async () => {
      try {
        const data = await fetcher(`${API_BASE}api/v1/renewables/production-mix?${params}`);
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

//++ Export Renewables Production Mix data
export const exportRenewablesProductionMix = async (startDate: string, endDate: string, category?: 'solar' | 'wind' | 'other') => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (category) {
    params.set('category', category);
  }

  try {
    const response = await fetch(`${API_BASE}api/v1/renewables/production-mix/export?${params}`, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `renewables-production-mix-${startDate}-${endDate}.xlsx`; // default filename

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

//++ Renewables delivery-4 — Israel renewable forecast vs targets
export const useRenewablesDelivery4 = () => {
  return useQuery<RenewablesDelivery4Response>({
    queryKey: ['renewables-delivery-4'],
    queryFn: async () => {
      const data = await fetcher(`${API_BASE}api/v1/renewables/delivery-4/renewable-forecast-israel
`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

export const exportRenewablesDelivery4RenewableForecastIsrael = async () => {
  try {
    const response = await fetch(
      `${API_BASE}api/v1/renewables/delivery-4/renewable-forecast-israel/export`,
      {
        headers: {
          'x-api-key': INTERNAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'renewable-forecast-israel.xlsx';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const urlObject = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlObject);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

const buildInternationalComparisonParams = (include2050: boolean, includeSolar: boolean) => {
  const params = new URLSearchParams();
  params.set('include_2050_targets', include2050 ? 'true' : 'false');
  params.set('include_solar_share', includeSolar ? 'true' : 'false');
  return params;
};

//++ Renewables delivery-4 — international renewable comparison
export const useRenewablesDelivery4InternationalComparison = (
  include2050: boolean,
  includeSolar: boolean
) => {
  const params = buildInternationalComparisonParams(include2050, includeSolar);

  return useQuery<RenewablesDelivery4InternationalComparisonResponse>({
    queryKey: ['renewables-delivery-4-international-comparison', include2050, includeSolar],
    queryFn: async () => {
      const data = await fetcher(
        `${API_BASE}api/v1/renewables/delivery-4/international-renewable-comparison?${params}`
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

export const exportRenewablesDelivery4InternationalComparison = async (
  include2050: boolean,
  includeSolar: boolean
) => {
  const params = buildInternationalComparisonParams(include2050, includeSolar);
  try {
    const response = await fetch(
      `${API_BASE}api/v1/renewables/delivery-4/international-renewable-comparison/export?${params}`,
      {
        headers: {
          'x-api-key': INTERNAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'international-renewable-comparison.xlsx';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const urlObject = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlObject);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Renewables Transition data
export const useRenewablesTransition = (year?: string) => {
  const params = new URLSearchParams();
  if (year) {
    params.set('year', year);
  }

  return useQuery<RenewablesTransitionResponse>({
    queryKey: ['renewables-transition', year],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/transition?${params}`
          : `${API_BASE}api/v1/renewables/transition`;
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

//++ Export Renewables Transition data
export const exportRenewablesTransition = async (year?: string) => {
  const params = new URLSearchParams();
  if (year) {
    params.set('year', year);
  }

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/transition/export?${params}`
      : `${API_BASE}api/v1/renewables/transition/export`;

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
    let filename = params.toString() ? `renewables-transition-${year}.xlsx` : 'renewables-transition.xlsx'; // default filename

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    } else if (year) {
      filename = `renewables-transition-${year}.xlsx`;
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

//++ Renewables Potential by Industry data
// Pass `year` to anchor a single-year request, or `startDate`/`endDate` for a
// wider date_range fetch. When both are supplied the date range wins.
export const useRenewablesPotentialByIndustry = (
  year?: string,
  startDate?: string,
  endDate?: string,
) => {
  const params = new URLSearchParams();
  if (startDate && endDate) {
    params.set('start_date', startDate);
    params.set('end_date', endDate);
  } else if (year) {
    params.set('year', year);
  }

  return useQuery<RenewablesPotentialByIndustryResponse>({
    queryKey: ['renewables-potential-by-industry', year, startDate, endDate],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/potential-by-industry?${params}`
          : `${API_BASE}api/v1/renewables/potential-by-industry`;
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

//++ Export Renewables Potential by Industry data
export const exportRenewablesPotentialByIndustry = async (
  year?: string,
  startDate?: string,
  endDate?: string,
) => {
  const params = new URLSearchParams();
  if (startDate && endDate) {
    params.set('start_date', startDate);
    params.set('end_date', endDate);
  } else if (year) {
    params.set('year', year);
  }

  const dateRangeSuffix = buildExportDateRangeSuffix({
    startDate,
    endDate,
    year,
  });

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/potential-by-industry/export?${params}`
      : `${API_BASE}api/v1/renewables/potential-by-industry/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const defaultFilename = dateRangeSuffix
      ? `renewables-potential-by-industry-${dateRangeSuffix}.xlsx`
      : 'renewables-potential-by-industry.xlsx';
    const filename = resolveExportFilename(
      defaultFilename,
      response.headers.get('Content-Disposition'),
      dateRangeSuffix,
    );

    downloadBlob(await response.blob(), filename);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Installed Capacity Cumulative data
export type InstalledCapacityFilters = {
  year?: number;
  district?: 'Jerusalem' | 'North' | 'South' | 'Haifa' | 'Center' | 'Tel Aviv' | 'Judea & Samaria' | 'Other';
  technology?: 'Photovoltaic' | 'Wind' | 'Solar Thermal' | 'Other';
};

export const useInstalledCapacityCumulative = (filters?: InstalledCapacityFilters) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }

  return useQuery<InstalledCapacityCumulativeResponse>({
    queryKey: ['installed-capacity-cumulative', filters?.year, filters?.district, filters?.technology],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/installed-capacity/cumulative?${params}`
          : `${API_BASE}api/v1/renewables/installed-capacity/cumulative`;
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

//++ Export Installed Capacity Cumulative data
export const exportInstalledCapacityCumulative = async (
  filters?: InstalledCapacityFilters,
  dateRange?: string,
) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }

  const dateRangeSuffix =
    dateRange ?? buildExportDateRangeSuffix({ year: filters?.year });

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/installed-capacity/cumulative/export?${params}`
      : `${API_BASE}api/v1/renewables/installed-capacity/cumulative/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const defaultFilename = dateRangeSuffix
      ? `installed-capacity-cumulative-${dateRangeSuffix}.xlsx`
      : 'installed-capacity-cumulative.xlsx';
    const filename = resolveExportFilename(
      defaultFilename,
      response.headers.get('Content-Disposition'),
      dateRangeSuffix,
    );

    downloadBlob(await response.blob(), filename);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Installed Capacity Growth data
export const useInstalledCapacityGrowth = (filters?: Omit<InstalledCapacityFilters, 'year'>) => {
  const params = new URLSearchParams();
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }

  return useQuery<InstalledCapacityGrowthResponse>({
    queryKey: ['installed-capacity-growth', filters?.district, filters?.technology],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/installed-capacity/growth?${params}`
          : `${API_BASE}api/v1/renewables/installed-capacity/growth`;
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

//++ Export Installed Capacity Growth data
export const exportInstalledCapacityGrowth = async (filters?: Omit<InstalledCapacityFilters, 'year'>) => {
  const params = new URLSearchParams();
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/installed-capacity/growth/export?${params}`
      : `${API_BASE}api/v1/renewables/installed-capacity/growth/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'installed-capacity-growth.xlsx';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const urlObject = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlObject);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Installed Capacity by Facility Size data
export type InstalledCapacityByFacilitySizeFilters = {
  year?: number;
  district?: 'Jerusalem' | 'North' | 'South' | 'Haifa' | 'Center' | 'Tel Aviv' | 'Judea & Samaria' | 'Other';
};

export const useInstalledCapacityByFacilitySize = (filters?: InstalledCapacityByFacilitySizeFilters) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }

  return useQuery<InstalledCapacityByFacilitySizeResponse>({
    queryKey: ['installed-capacity-by-facility-size', filters?.year, filters?.district],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/installed-capacity/by-facility-size?${params}`
          : `${API_BASE}api/v1/renewables/installed-capacity/by-facility-size`;
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

//++ Export Installed Capacity by Facility Size data
export const exportInstalledCapacityByFacilitySize = async (
  filters?: InstalledCapacityByFacilitySizeFilters,
  dateRange?: string,
) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }

  const dateRangeSuffix =
    dateRange ?? buildExportDateRangeSuffix({ year: filters?.year });

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/installed-capacity/by-facility-size/export?${params}`
      : `${API_BASE}api/v1/renewables/installed-capacity/by-facility-size/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const defaultFilename = dateRangeSuffix
      ? `installed-capacity-by-facility-size-${dateRangeSuffix}.xlsx`
      : 'installed-capacity-by-facility-size.xlsx';
    const filename = resolveExportFilename(
      defaultFilename,
      response.headers.get('Content-Disposition'),
      dateRangeSuffix,
    );

    downloadBlob(await response.blob(), filename);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Response Capacity by Period data
export type ResponseCapacityByPeriodFilters = {
  year?: number;
  district?: 'Jerusalem' | 'North' | 'South' | 'Haifa' | 'Center' | 'Tel Aviv' | 'Judea & Samaria' | 'Other';
  technology?: 'Photovoltaic' | 'Wind' | 'Other';
  response_type?: 'Positive' | 'Partial Positive' | 'Limited Positive' | 'Negative';
  include_cancelled?: boolean;
};

export const useResponseCapacityByPeriod = (
  filters?: ResponseCapacityByPeriodFilters,
  queryOptions?: { enabled?: boolean },
) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }
  if (filters?.response_type) {
    params.set('response_type', filters.response_type);
  }
  if (filters?.include_cancelled !== undefined) {
    params.set('include_cancelled', filters.include_cancelled.toString());
  }

  return useQuery<ResponseCapacityByPeriodResponse>({
    enabled: queryOptions?.enabled ?? true,
    queryKey: ['response-capacity-by-period', filters?.year, filters?.district, filters?.technology, filters?.response_type, filters?.include_cancelled],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/response-capacity/by-period?${params}`
          : `${API_BASE}api/v1/renewables/response-capacity/by-period`;
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

//++ Export Response Capacity by Period data
export const exportResponseCapacityByPeriod = async (
  filters?: ResponseCapacityByPeriodFilters,
  dateRange?: string,
) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }
  if (filters?.response_type) {
    params.set('response_type', filters.response_type);
  }
  if (filters?.include_cancelled !== undefined) {
    params.set('include_cancelled', filters.include_cancelled.toString());
  }

  const dateRangeSuffix =
    dateRange ?? buildExportDateRangeSuffix({ year: filters?.year });

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/response-capacity/by-period/export?${params}`
      : `${API_BASE}api/v1/renewables/response-capacity/by-period/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const defaultFilename = dateRangeSuffix
      ? `response-capacity-by-period-${dateRangeSuffix}.xlsx`
      : 'response-capacity-by-period.xlsx';
    const filename = resolveExportFilename(
      defaultFilename,
      response.headers.get('Content-Disposition'),
      dateRangeSuffix,
    );

    downloadBlob(await response.blob(), filename);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Response Capacity by Size data
export type ResponseCapacityBySizeFilters = {
  year?: number;
  district?: 'Jerusalem' | 'North' | 'South' | 'Haifa' | 'Center' | 'Tel Aviv' | 'Judea & Samaria' | 'Other';
  include_cancelled?: boolean;
};

export const useResponseCapacityBySize = (filters?: ResponseCapacityBySizeFilters) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.include_cancelled !== undefined) {
    params.set('include_cancelled', filters.include_cancelled.toString());
  }

  return useQuery<ResponseCapacityBySizeResponse>({
    queryKey: ['response-capacity-by-size', filters?.year, filters?.district, filters?.include_cancelled],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/response-capacity/by-size?${params}`
          : `${API_BASE}api/v1/renewables/response-capacity/by-size`;
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

//++ Export Response Capacity by Size data
export const exportResponseCapacityBySize = async (
  filters?: ResponseCapacityBySizeFilters,
  dateRange?: string,
) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.district) {
    params.set('district', filters.district);
  }
  if (filters?.include_cancelled !== undefined) {
    params.set('include_cancelled', filters.include_cancelled.toString());
  }

  const dateRangeSuffix =
    dateRange ?? buildExportDateRangeSuffix({ year: filters?.year });

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/response-capacity/by-size/export?${params}`
      : `${API_BASE}api/v1/renewables/response-capacity/by-size/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const defaultFilename = dateRangeSuffix
      ? `response-capacity-by-size-${dateRangeSuffix}.xlsx`
      : 'response-capacity-by-size.xlsx';
    const filename = resolveExportFilename(
      defaultFilename,
      response.headers.get('Content-Disposition'),
      dateRangeSuffix,
    );

    downloadBlob(await response.blob(), filename);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

//++ Response Capacity by District data
export type ResponseCapacityByDistrictFilters = {
  year?: number;
  technology?: 'Photovoltaic' | 'Wind' | 'Other';
  include_cancelled?: boolean;
};

export const useResponseCapacityByDistrict = (filters?: ResponseCapacityByDistrictFilters) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }
  if (filters?.include_cancelled !== undefined) {
    params.set('include_cancelled', filters.include_cancelled.toString());
  }

  return useQuery<ResponseCapacityByDistrictResponse>({
    queryKey: ['response-capacity-by-district', filters?.year, filters?.technology, filters?.include_cancelled],
    queryFn: async () => {
      try {
        const url = params.toString()
          ? `${API_BASE}api/v1/renewables/response-capacity/by-district?${params}`
          : `${API_BASE}api/v1/renewables/response-capacity/by-district`;
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

//++ Export Response Capacity by District data
export const exportResponseCapacityByDistrict = async (
  filters?: ResponseCapacityByDistrictFilters,
  dateRange?: string,
) => {
  const params = new URLSearchParams();
  if (filters?.year) {
    params.set('year', filters.year.toString());
  }
  if (filters?.technology) {
    params.set('technology', filters.technology);
  }
  if (filters?.include_cancelled !== undefined) {
    params.set('include_cancelled', filters.include_cancelled.toString());
  }

  const dateRangeSuffix =
    dateRange ?? buildExportDateRangeSuffix({ year: filters?.year });

  try {
    const url = params.toString()
      ? `${API_BASE}api/v1/renewables/response-capacity/by-district/export?${params}`
      : `${API_BASE}api/v1/renewables/response-capacity/by-district/export`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': INTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const defaultFilename = dateRangeSuffix
      ? `response-capacity-by-district-${dateRangeSuffix}.xlsx`
      : 'response-capacity-by-district.xlsx';
    const filename = resolveExportFilename(
      defaultFilename,
      response.headers.get('Content-Disposition'),
      dateRangeSuffix,
    );

    downloadBlob(await response.blob(), filename);
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