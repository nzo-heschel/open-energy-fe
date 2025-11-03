'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import MarketHero from '@/components/market/MarketHero';
import MetricCard from '@/components/market/MetricCard';
import FilterBar from '@/components/market/FilterBar';
import ChartCard from '@/components/market/ChartCard';
import LineChart from '@/components/market/LineChart';
import PieChart from '@/components/market/PieChart';
import ScatterChart from '@/components/market/ScatterChart';
import type { FilterOptions } from '@/types/dto';
import { 
  generateMockMarketData, 
  generateMockMixData, 
  generateMockSmpData, 
  generateMockScatterData 
} from '@/lib/api';
import '@/styles/theme.css';

export default function MarketPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterOptions>({
    granularity: 'hour',
    period: 'today'
  });

  const handleSectionChange = (section: string) => {
    if (section === 'market') {
      // Already on market page
      return;
    } else if (section === 'home') {
      router.push('/');
    } else {
      router.push(`/?section=${section}`);
    }
  };

  // Mock data - replace with actual API calls
  const marketData = generateMockMarketData();
  const mixData = generateMockMixData();
  const smpData = generateMockSmpData();
  const scatterData = generateMockScatterData();

  // Persist filters in localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('market-filters');
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('market-filters', JSON.stringify(filters));
  }, [filters]);

  const handleExport = (format: 'csv' | 'xlsx' | 'png', chartType: string) => {
    console.log(`Exporting ${chartType} as ${format}`);
    // Implement export logic here
  };

  const handleApiClick = (endpoint: string) => {
    window.open(`/api-docs#${endpoint}`, '_blank');
  };

  const quickLinks = [
    {
      title: 'ביקוש חשמל - תחזית יומית',
      subtitle: 'תחזית יומית',
      link: 'למידע במאגר הנתונים',
      color: 'var(--brand-green)'
    },
    {
      title: 'דו"ח מצב - משק האנרגיה (2023)',
      subtitle: '(2023)',
      link: 'הורדה',
      color: 'var(--brand-olive)'
    },
    {
      title: 'דו"ח מצב - משק החשמל (מעודכן)',
      subtitle: '(משוערך)',
      link: 'הורדת קובץ EXCEL',
      color: 'var(--brand-yellow)'
    },
    {
      title: 'ירחונים וחדשות של סטט האנרגיה',
      subtitle: 'האנרגיה',
      link: 'למאגר',
      color: 'var(--brand-brown)'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        // activeSection="market" 
        // onSectionChange={handleSectionChange} 
      />
      
      <main className="market-container py-8">
        {/* Hero Section */}
        <MarketHero />

        {/* Key Metrics Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              value="8,734"
              unit="MW"
              label="סך הכל ביקוש"
              color="var(--brand-green)"
            />
            <MetricCard
              value="2,817"
              unit="MW"
              label="אנרגיה סולארית"
              color="var(--chart-yellow)"
            />
            <MetricCard
              value="1,674"
              unit="MW"
              label="אנרגיית רוח"
              color="var(--chart-blue)"
            />
            <MetricCard
              value="947"
              unit="MW"
              label="אנרגיות פוסיליות"
              color="var(--chart-brown)"
            />
          </div>
        </section>

        {/* Main Charts Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Market Overview Line Chart */}
            <ChartCard
              title="משק החשמל בישראל - נתונים כלליים"
              subtitle="נתונים בזמן אמת"
              onApiClick={() => handleApiClick('market-overview')}
              onExport={(format) => handleExport(format, 'market-overview')}
            >
              <div className="mb-4">
                <FilterBar 
                  filters={filters}
                  onFiltersChange={setFilters}
                  showGranularity={true}
                  showPeriod={true}
                />
              </div>
              <LineChart 
                data={marketData.series}
                yAxisLabel="[MW]"
                height={350}
              />
              <div className="mt-4 text-center">
                <Button variant="link" className="text-blue-600 text-sm">
                  הצג נתונים <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </ChartCard>

            {/* Energy Mix Pie Chart */}
            <ChartCard
              title="תמהיל יצור אנרגיה"
              subtitle="נתונים בזמן אמת"
              onApiClick={() => handleApiClick('energy-mix')}
              onExport={(format) => handleExport(format, 'energy-mix')}
            >
              <PieChart 
                data={mixData}
                height={350}
                innerRadius="50%"
              />
              <div className="mt-4 text-center">
                <Button variant="link" className="text-blue-600 text-sm">
                  הצג נתונים <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </ChartCard>
          </div>

          {/* Additional Data Links */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8 space-x-reverse">
                <Button variant="link" className="text-blue-600 p-0 h-auto text-sm hover:underline">
                  SMP
                </Button>
                <Button variant="link" className="text-blue-600 p-0 h-auto text-sm hover:underline">
                  שוק מסחרי תשתיות פרטיים
                </Button>
              </div>
              <h3 className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                לנתונים נוספים
              </h3>
            </div>
          </div>
        </section>

        {/* SMP Section */}
        <section className="mb-12">
          <div className="text-right mb-8">
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              SMP
            </h2>
            <div className="w-16 h-1 mb-6 mr-0" style={{ backgroundColor: 'var(--brand-green)' }}></div>
            <p className="text-lg leading-relaxed mb-6 max-w-4xl" style={{ color: 'var(--color-muted)' }}>
              בישראל פועל שוק החשמל המבוסס על מכרזים של משק החשמל. הנתונים הבאים מציגים את המחירים השעתיים של החשמל במשק החשמל הישראלי. המחירים לפי אזורים מבוססים על מחירי החשמל בזמן אמת. הנתונים מתעדכנים בזמן אמת ומציגים את המחירים השעתיים של החשמל במשק החשמל הישראלי.
            </p>
          </div>

          <div className="space-y-8">
            {/* SMP Line Chart */}
            <ChartCard
              title="מחיר שולי (SMP) על פני יום"
              subtitle="נתונים בזמן אמת"
              onApiClick={() => handleApiClick('smp-line')}
              onExport={(format) => handleExport(format, 'smp-line')}
            >
              <div className="mb-4">
                <FilterBar 
                  filters={filters}
                  onFiltersChange={setFilters}
                  showGranularity={true}
                  showPeriod={true}
                />
              </div>
              <LineChart 
                data={smpData.series}
                yAxisLabel="מחיר [₪/MWh]"
                height={400}
              />
            </ChartCard>

            {/* SMP Scatter Chart */}
            <ChartCard
              title="ביקוש חשמל מול המחיר השולי"
              subtitle="נתונים בזמן אמת"
              onApiClick={() => handleApiClick('smp-scatter')}
              onExport={(format) => handleExport(format, 'smp-scatter')}
            >
              <div className="mb-4">
                <FilterBar 
                  filters={filters}
                  onFiltersChange={setFilters}
                  showGranularity={false}
                  showPeriod={true}
                  showCategory={true}
                />
              </div>
              <ScatterChart 
                data={scatterData}
                height={400}
              />
              <div className="mt-4 text-center">
                <Button variant="link" className="text-blue-600 text-sm">
                  הצג נתונים <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </ChartCard>
          </div>
        </section>

        {/* Quick Links Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              אולי יעניין אותך גם
            </h3>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <div 
                key={index} 
                className="chart-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderLeftColor: link.color, borderLeftWidth: '4px' }}
              >
                <h4 className="font-semibold mb-2 text-right" style={{ color: 'var(--color-text)' }}>
                  {link.title}
                </h4>
                <p className="text-sm mb-4 text-right" style={{ color: 'var(--color-muted)' }}>
                  {link.subtitle}
                </p>
                <Button variant="link" className="text-blue-600 text-sm p-0 h-auto">
                  {link.link} <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}