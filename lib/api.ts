import { useQuery } from '@tanstack/react-query';
import type {
  MarketOverviewResponse,
  MixResponse,
  SmpLineResponse,
  SmpScatterResponse,
  FilterOptions,
  EnergyMixResponse,
  SMPResponse
} from '@/types/dto';

const API_BASE = 'https://open-energy-be-vo4yi.ondigitalocean.app/';

// Generic fetcher
const fetcher = async (url: string) => {
  const response = await fetch(url);
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

//++ Energy mix pie chart data
export const useEnergyMix = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<EnergyMixResponse>({
    queryKey: ['energy-mix-pie', startDate, endDate],
    queryFn: async () => {
      // For development: return real server response
      return {
        start_date: "2025-12-01",
        end_date: "2025-12-31",
        filter: "month",
        level1: {
          "Non-renewables": 1186685.0883333334,
          "Renewables": 189910.78499999997,
          "Other": 33407.77166666667
        },
        level2: {
          "Non-renewables": {
            "coal": 109355.2983333334,
            "natural_gas": 1077329.79,
            "diesel": 0.0
          },
          "Renewables": {
            "photoVoltaic": 147196.20416666663,
            "biogas": 1741.2841666666666,
            "wind": 19996.850833333338,
            "solar_thermal": 5815.047499999991,
            "pv_storage": 15161.398333333333
          },
          "Other": {
            "other": 4855.199166666666,
            "pumped_storage": 28552.5725
          }
        },
        total_generation: 1410003.645,
        renewable_share_percent: 13.47,
        categories: [
          {
            category_name: "renewables",
            total_value: 189910.78499999997,
            sub_categories: [
              { sub_category_name: "photo_voltaic", value: 147196.20416666663 },
              { sub_category_name: "biogas", value: 1741.2841666666666 },
              { sub_category_name: "wind", value: 19996.850833333338 },
              { sub_category_name: "solar_thermal", value: 5815.047499999991 },
              { sub_category_name: "pv_storage", value: 15161.398333333333 }
            ]
          },
          {
            category_name: "non_renewables",
            total_value: 1186685.0883333334,
            sub_categories: [
              { sub_category_name: "coal", value: 109355.2983333334 },
              { sub_category_name: "natural_gas", value: 1077329.79 },
              { sub_category_name: "diesel", value: 0 }
            ]
          },
          {
            category_name: "other",
            total_value: 33407.77166666667,
            sub_categories: [
              { sub_category_name: "other", value: 4855.199166666666 },
              { sub_category_name: "pumped_storage", value: 28552.5725 }
            ]
          }
        ],
        tooltip: "The pie chart shows Israel's electricity generation mix and illustrates the different energy sources: fossil (coal, natural gas, diesel), renewables (photovoltaic, biogas, wind, solar-thermal, photovoltaic with storage), and other (other, pumped storage). Data are updated hourly from the NOGA system operator."
      } as any;

      // Uncomment to use actual API:
      // try {
      //   const data = await fetcher(`${API_BASE}api/v1/energy/production-mix?${params}`);
      //   return data;
      // } catch (error) {
      //   console.warn('API call failed:', error);
      //   throw error;
      // }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

//++ Export energy mix data
export const exportEnergyMix = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/energy/production-mix/export?${params}`);
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
};
//++export energy consumption data 
export const exportEnergyConsumption = async (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  try {
    const response = await fetch(`${API_BASE}api/v1/energy/overview/export?${params}`);
    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'energy-consumption-export.xlsx'; // default filename

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

//++ smp #3
export const useSMP = (startDate: string, endDate: string) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);

  return useQuery<SMPResponse>({
    queryKey: ['smp', startDate, endDate],
    queryFn: async () => {
      // Mock response for development
      return {
        start_date: startDate,
        end_date: endDate,
        view: "day",
        chart_with_constraints: [
          { hour: "00:00", price: 425.5 },
          { hour: "01:00", price: 398.2 },
          { hour: "02:00", price: 410.3 },
          { hour: "03:00", price: 395.8 },
          { hour: "04:00", price: 402.1 },
          { hour: "05:00", price: 415.7 },
          { hour: "06:00", price: 450.2 },
          { hour: "07:00", price: 480.5 },
          { hour: "08:00", price: 495.3 },
          { hour: "09:00", price: 510.3 },
          { hour: "10:00", price: 505.1 },
          { hour: "11:00", price: 498.7 },
          { hour: "12:00", price: 490.2 },
          { hour: "13:00", price: 485.4 },
          { hour: "14:00", price: 480.1 },
          { hour: "15:00", price: 475.8 },
          { hour: "16:00", price: 470.3 },
          { hour: "17:00", price: 465.2 },
          { hour: "18:00", price: 460.5 },
          { hour: "19:00", price: 455.8 },
          { hour: "20:00", price: 445.2 },
          { hour: "21:00", price: 435.7 },
          { hour: "22:00", price: 420.3 },
          { hour: "23:00", price: 410.1 }
        ],
        chart_without_constraints: [
          { hour: "00:00", price: 420.0 },
          { hour: "01:00", price: 390.5 },
          { hour: "02:00", price: 400.2 },
          { hour: "03:00", price: 385.7 },
          { hour: "04:00", price: 392.1 },
          { hour: "05:00", price: 405.5 },
          { hour: "06:00", price: 440.0 },
          { hour: "07:00", price: 470.3 },
          { hour: "08:00", price: 485.1 },
          { hour: "09:00", price: 500.2 },
          { hour: "10:00", price: 495.0 },
          { hour: "11:00", price: 488.5 },
          { hour: "12:00", price: 480.0 },
          { hour: "13:00", price: 475.2 },
          { hour: "14:00", price: 470.0 },
          { hour: "15:00", price: 465.5 },
          { hour: "16:00", price: 460.1 },
          { hour: "17:00", price: 455.0 },
          { hour: "18:00", price: 450.3 },
          { hour: "19:00", price: 445.5 },
          { hour: "20:00", price: 435.0 },
          { hour: "21:00", price: 425.5 },
          { hour: "22:00", price: 410.1 },
          { hour: "23:00", price: 400.0 }
        ],
        min_price: 380.5,
        max_price: 510.3,
        avg_price: 445.2
      } as SMPResponse;

      // Uncomment to use actual API:
      // try {
      //   const data = await fetcher(`${API_BASE}api/v1/smp?${params}`);
      //   return data;
      // } catch (error) {
      //   console.warn('API call failed:', error);
      //   throw error;
      // }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
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