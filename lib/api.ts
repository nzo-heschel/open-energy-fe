import { useQuery } from '@tanstack/react-query';
import type { 
  MarketOverviewResponse, 
  MixResponse, 
  SmpLineResponse, 
  SmpScatterResponse,
  FilterOptions 
} from '@/types/dto';

// Mock API base URL - replace with actual API
const API_BASE = '/api';

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

// Energy mix data
export const useEnergyMix = (filters: Partial<FilterOptions>) => {
  const params = new URLSearchParams();
  if (filters.period) params.set('period', filters.period);
  
  return useQuery<MixResponse>({
    queryKey: ['energy-mix', filters],
    queryFn: () => fetcher(`${API_BASE}/market/mix?${params}`),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
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