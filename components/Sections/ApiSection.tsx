'use client';

import topleft from '@/public/images/Ellipse 89 (1).png';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import InterestPage from '../InterestPage';

interface ApiEndpoint {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  method: string;
  parameters?: string[];
  responseExample?: string;
}

interface ApiData {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  category: string;
}

export default function ApiSection() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Handle scroll to section on page load if hash exists
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const copyToClipboard = (endpointData: ApiEndpoint) => {
    const textToCopy = `
Endpoint: ${endpointData.endpoint}
Description: ${endpointData.description}
Method: ${endpointData.method}
${endpointData.parameters ? `Parameters:\n${endpointData.parameters.map(p => `- ${p}`).join('\n')}` : ''}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopiedEndpoint(endpointData.id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiEndpoints: ApiEndpoint[] = [
    // Energy Overview Endpoints
    {
      id: 'energy-overview',
      title: 'סקירה כללית של משק החשמל',
      description: 'Hierarchical breakdown of energy sources with percentages',
      endpoint: 'GET /api/v1/energy/overview',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: `{
  "start_date": "2025-01-06",
  "end_date": "2026-01-06",
  "filter": "year",
  "categories": [...],
  "category_percentages": {
    "renewables": 15.11,
    "non_renewables": 82.89,
    "other": 2.0
  },
  "total": 80561884.0441667,
  "level1": {...},
  "level2": {...},
  "renewable_share_percent": 15.11
}`
    },
    {
      id: 'energy-overview-details',
      title: 'פרטי סקירה כללית',
      description: 'Detailed hierarchical view for deep analysis',
      endpoint: 'GET /api/v1/energy/overview/details',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
    },
    {
      id: 'energy-overview-export',
      title: 'ייצוא סקירה כללית',
      description: 'Export energy overview to Excel file',
      endpoint: 'GET /api/v1/energy/overview/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: 'Streamed Excel file (energy_overview.xlsx)'
    },
    // Energy Production Mix Endpoints
    {
      id: 'energy-production-mix',
      title: 'תמהיל יצור אנרגיה',
      description: 'Aggregated electricity production mix by source type (fossil, renewable, other)',
      endpoint: 'GET /api/v1/energy/production-mix',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'granularity (optional, Day | Month | Year)'],
      responseExample: `{
  "start_date": "2025-01-06",
  "end_date": "2026-01-06",
  "filter": "year",
  "level1": {
    "Non-renewables": 66781294.08,
    "Renewables": 12176723.06,
    "Other": 1608640.27
  },
  "level2": {...},
  "total_generation": 80566657.42,
  "renewable_share_percent": 15.11,
  "series": [...]
}`
    },
    {
      id: 'energy-production-mix-export',
      title: 'ייצוא תמהיל יצור',
      description: 'Export production mix to Excel file',
      endpoint: 'GET /api/v1/energy/production-mix/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: 'Streamed Excel file (production_mix.xlsx)'
    },
    // SMP Endpoints
    {
      id: 'energy-smp',
      title: 'מחיר שולי SMP',
      description: 'System Marginal Price (electricity market clearing price) data',
      endpoint: 'GET /api/v1/energy/smp',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD, defaults to last 1 day)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: `{
  "daily_average": [...],
  "monthly_average": [...],
  "chart_without_constraints": [...],
  "chart_with_constraints": [...],
  "correlation_view": [...],
  "samples": [...],
  "view": "day",
  "start_date": "2026-01-05",
  "end_date": "2026-01-06"
}`
    },
    {
      id: 'energy-smp-export',
      title: 'ייצוא נתוני SMP',
      description: 'Export SMP data to Excel file',
      endpoint: 'GET /api/v1/energy/smp/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: 'Streamed Excel file (smp-data.xlsx)'
    },
    {
      id: 'energy-smp-production-vs-marginal-price',
      title: 'יצור מול מחיר שולי',
      description: 'Correlate electricity production with marginal pricing for market analysis',
      endpoint: 'GET /api/v1/energy/smp-production-vs-marginal-price',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: `{
  "start_date": "2026-01-05",
  "end_date": "2026-01-06",
  "view": "day",
  "smp_series": [...],
  "net_demand_series": [...],
  "combined_series": [...],
  "correlation": [...],
  "daily_average": [...],
  "monthly_average": [...]
}`
    },
    {
      id: 'energy-smp-production-vs-marginal-price-export',
      title: 'ייצוא יצור מול מחיר שולי',
      description: 'Export SMP production vs marginal price data to Excel file',
      endpoint: 'GET /api/v1/energy/smp-production-vs-marginal-price/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: 'Streamed Excel file (smp-production-vs-marginal-price.xlsx)'
    },
    // Private Suppliers Endpoints
    {
      id: 'private-supplier-connected-consumers',
      title: 'צרכנים מחוברים לספקים פרטיים',
      description: 'Monthly time series of consumers connected to private electricity suppliers',
      endpoint: 'GET /api/v1/private-supplier-connected-consumers',
      method: 'GET',
      parameters: ['start_date (optional, MM-YYYY)', 'end_date (optional, MM-YYYY)'],
      responseExample: `{
  "start_date": "2026-01-01",
  "end_date": "2026-01-01",
  "unit": "count",
  "data": [
    {
      "month": "2026-01",
      "total_consumers": 316929.0,
      "new_additions": 316929.0
    }
  ],
  "segments": {...}
}`
    },
    {
      id: 'private-supplier-export',
      title: 'ייצוא נתוני ספקים פרטיים',
      description: 'Export private suppliers data to Excel',
      endpoint: 'GET /api/v1/private-supplier-connected-consumers/export',
      method: 'GET',
      parameters: ['start_date (optional)', 'end_date (optional)'],
      responseExample: 'Streamed Excel file (private_suppliers_consumers.xlsx)'
    },
    {
      id: 'private-supplier-download-source',
      title: 'הורדת קובץ מקור ספקים פרטיים',
      description: 'Download raw source CSV file with all private supplier data',
      endpoint: 'GET /api/v1/private-supplier-connected-consumers/download-source',
      method: 'GET',
      responseExample: 'CSV file download'
    },
    // Switching Requests Endpoints
    {
      id: 'switching-requests',
      title: 'בקשות ניוד צרכנים',
      description: 'Consumer electricity supplier switching request data',
      endpoint: 'GET /api/v1/switching-requests',
      method: 'GET',
      parameters: ['customer_type (optional, residential | non_residential)', 'year (optional)'],
      responseExample: `{
  "filter": {
    "customer_type": "all",
    "year": "all"
  },
  "available_years": [2021],
  "charts": {
    "requests_by_status": {...},
    "requests_by_customer_type": {...},
    "requests_by_regulation_type": {...},
    "requests_by_rejection_reason": {...}
  },
  "monthly_requests": [...],
  "total_requests": 888882,
  "total_rejections": 277708
}`
    },
    {
      id: 'switching-requests-export',
      title: 'ייצוא בקשות ניוד',
      description: 'Export switching request data to Excel',
      endpoint: 'GET /api/v1/switching-requests/export',
      method: 'GET',
      parameters: ['year (optional)'],
      responseExample: 'Streamed Excel file (switching_requests_YYYY.xlsx)'
    },
    // CO2 Emissions Endpoints
    {
      id: 'co2-emissions-savings',
      title: 'פליטות CO2 כולל',
      description: 'Total CO2 emissions (coal + natural gas + diesel) for the selected period',
      endpoint: 'GET /api/v1/co2/emissions-savings',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: `{
  "total": 2505223.89,
  "unit": "tons CO2",
  "start_date": "2026-01-03",
  "end_date": "2026-02-02"
}`
    },
    {
      id: 'co2-emissions-ratio',
      title: 'יחס פליטות CO2',
      description: 'Total CO2 emissions ratio (tons CO2 per MWh) for the selected period',
      endpoint: 'GET /api/v1/co2/emissions-ratio',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: `{
  "total": 261.1633,
  "unit": "tons CO2/MWh",
  "start_date": "2026-01-03",
  "end_date": "2026-02-02"
}`
    },
    {
      id: 'co2-total-production',
      title: 'סך יצור חשמל',
      description: 'Total system generation (MWh) for the selected period',
      endpoint: 'GET /api/v1/co2/total-production',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)'],
      responseExample: `{
  "total": 7036671.71,
  "unit": "MWh",
  "start_date": "2026-01-03",
  "end_date": "2026-02-02"
}`
    },
    {
      id: 'co2-emissions-mix',
      title: 'תמהיל פליטות CO2',
      description: 'CO2 emissions mix (pie chart + infographics + time series)',
      endpoint: 'GET /api/v1/co2/emissions-mix',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'view (optional, day | month | year)'],
      responseExample: `{
  "view": "month",
  "start_date": "2026-01-03",
  "end_date": "2026-02-02",
  "total_emissions": 2505223.89,
  "total_emissions_unit": "tons CO2",
  "pie_chart": {
    "coal": { "value": 391019.99, "percentage": 15.61 },
    "natural_gas": { "value": 2093868.51, "percentage": 83.58 },
    "diesel": { "value": 20335.38, "percentage": 0.81 }
  },
  "infographics": {...},
  "time_series": [...]
}`
    },
    {
      id: 'co2-emissions-mix-export',
      title: 'ייצוא תמהיל פליטות CO2',
      description: 'Export CO2 emissions mix to Excel file',
      endpoint: 'GET /api/v1/co2/emissions-mix/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'view (optional, day | month | year)'],
      responseExample: 'Streamed Excel file (co2_emissions_mix_STARTDATE_to_ENDDATE.xlsx)'
    },
    {
      id: 'co2-emissions-over-time',
      title: 'פליטות CO2 על פני זמן',
      description: 'CO2 emissions over time (chart + infographics)',
      endpoint: 'GET /api/v1/co2/emissions-over-time',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'view (optional, month | year | custom)'],
      responseExample: `{
  "view": "month",
  "start_date": "2026-01-03",
  "end_date": "2026-02-02",
  "infographics": {...},
  "chart_data": [
    {
      "period": "2026-01-03",
      "label": "03 Jan",
      "coal": 12431.86,
      "natural_gas": 64471.12,
      "diesel": 39.73,
      "total_emissions": 76942.7
    }
  ]
}`
    },
    {
      id: 'co2-emissions-over-time-export',
      title: 'ייצוא פליטות CO2 על פני זמן',
      description: 'Export CO2 emissions over time to Excel file',
      endpoint: 'GET /api/v1/co2/emissions-over-time/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'view (optional, month | year | custom)'],
      responseExample: 'Streamed Excel file (co2_emissions_over_time_STARTDATE_to_ENDDATE.xlsx)'
    },
    {
      id: 'co2-total-vs-ratio',
      title: 'סך פליטות מול יחס פליטות CO2',
      description: 'Total CO2 emissions vs CO2 emissions ratio (combined chart + infographics)',
      endpoint: 'GET /api/v1/co2/total-vs-ratio',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'view (optional, month | year | custom)'],
      responseExample: `{
  "view": "month",
  "start_date": "2026-01-03",
  "end_date": "2026-02-02",
  "infographics": {...},
  "chart_data": [
    {
      "period": "2026-01-03",
      "total_emissions": 76942.7,
      "emissions_ratio": 8.4958,
      "generation_mwh": 218258.07
    }
  ]
}`
    },
    // Data Files Endpoints
    {
      id: 'data-files-status',
      title: 'סטטוס קבצי נתונים',
      description: 'Returns freshness status for both datasets (private_suppliers and switching_requests)',
      endpoint: 'GET /api/v1/data-files/status',
      method: 'GET',
      responseExample: `{
  "private_suppliers": {
    "dataset": "private_suppliers",
    "status": "fresh",
    "age_days": 0.002,
    "filename": "Files_Netunei_hashmal_mp_niyud_17-12-2025.csv"
  },
  "switching_requests": {
    "dataset": "switching_requests",
    "status": "fresh",
    "age_days": 0.0002,
    "filename": "Files_Netunei_hashmal_mp_tzarchan_17-12-2025.csv"
  }
}`
    },
    {
      id: 'data-files-upload',
      title: 'העלאת קובץ נתונים',
      description: 'Uploads a new data file for a specific source',
      endpoint: 'POST /api/v1/data-files/upload',
      method: 'POST',
      parameters: ['source (required, private_suppliers | switching_requests)', 'file (required, UploadFile)'],
      responseExample: `{
  "dataset": "private_suppliers",
  "stored_as": "some_file_name.csv",
  "message": "File uploaded. Re-run the target API to get the updated results."
}`
    },
    // Installed Capacity Endpoints
    {
      id: 'installed-capacity-cumulative',
      title: 'הספק מותקן (מצטבר)',
      description: 'Returns the cumulative installed capacity time series with technology and district breakdowns',
      endpoint: 'GET /api/v1/renewables/installed-capacity/cumulative',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'district (optional, Jerusalem|North|South|Haifa|Center|Tel Aviv|Judea & Samaria|Other)',
        'technology (optional, Photovoltaic|Wind|Solar Thermal|Other)'
      ],
      responseExample: `{
  "title": "Installed Capacity (Cumulative) of Renewable Energy Facilities",
  "total_installed_mw": 7756.107,
  "total_facilities": 63687,
  "series": [
    {
      "period": "2012-01",
      "added_mw": 0.123,
      "cumulative_mw": 0.123
    }
  ],
  "technology_breakdown": {
    "Photovoltaic": 7200.0,
    "Wind": 300.0,
    "Solar Thermal": 150.0,
    "Other": 106.107
  },
  "district_breakdown": {
    "South": 3000.0,
    "North": 1500.0
  }
}`
    },
    {
      id: 'installed-capacity-cumulative-export',
      title: 'ייצוא הספק מותקן (מצטבר)',
      description: 'Export cumulative installed capacity data to Excel file',
      endpoint: 'GET /api/v1/renewables/installed-capacity/cumulative/export',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'district (optional)',
        'technology (optional)'
      ],
      responseExample: 'Streamed Excel file (installed_capacity_cumulative.xlsx)'
    },
    {
      id: 'installed-capacity-growth',
      title: 'קצב גידול הספק מותקן',
      description: 'Reports yearly additions plus percentage growth on the cumulative series',
      endpoint: 'GET /api/v1/renewables/installed-capacity/growth',
      method: 'GET',
      parameters: [
        'district (optional)',
        'technology (optional)'
      ],
      responseExample: `{
  "title": "Installed Capacity — Growth Rate",
  "series": [
    {
      "year": 2024,
      "added_mw": 420.0,
      "cumulative_mw": 7200.0,
      "growth_rate_percent": 6.2
    }
  ],
  "filters_applied": {
    "district": null,
    "technology": "Photovoltaic"
  }
}`
    },
    {
      id: 'installed-capacity-growth-export',
      title: 'ייצוא קצב גידול הספק מותקן',
      description: 'Export installed capacity growth data to Excel file',
      endpoint: 'GET /api/v1/renewables/installed-capacity/growth/export',
      method: 'GET',
      parameters: [
        'district (optional)',
        'technology (optional)'
      ],
      responseExample: 'Streamed Excel file (installed_capacity_growth.xlsx)'
    },
    {
      id: 'installed-capacity-by-facility-size',
      title: 'הספק מותקן לפי גודל מתקן',
      description: 'Returns installed capacity broken down by facility size brackets over time',
      endpoint: 'GET /api/v1/renewables/installed-capacity/by-facility-size',
      method: 'GET',
      parameters: [
        'district (optional, Jerusalem|North|South|Haifa|Center|Tel Aviv|Judea & Samaria|Other)'
      ],
      responseExample: `{
  "series": [
    {
      "year": 2020,
      "size_brackets": {
        "Up to 16 kW": 125000.5,
        "16–50 kW": 85000.2,
        "50–200 kW": 45000.1,
        "200 kW–1 MW": 32000.0,
        "1–5 MW": 18000.0,
        "5–50 MW": 12000.0,
        "50+ MW": 8000.0
      }
    }
  ],
  "total_mw": 7500.0
}`
    },
    {
      id: 'installed-capacity-by-facility-size-export',
      title: 'ייצוא הספק מותקן לפי גודל מתקן',
      description: 'Export installed capacity by facility size data to Excel file',
      endpoint: 'GET /api/v1/renewables/installed-capacity/by-facility-size/export',
      method: 'GET',
      parameters: [
        'district (optional)'
      ],
      responseExample: 'Streamed Excel file (installed_capacity_by_facility_size.xlsx)'
    },
    // Response Capacity by Period Endpoints
    {
      id: 'response-capacity-by-period',
      title: 'קיבולת תגובה לפי תקופה',
      description: 'Aggregated response capacity per time period with breakdowns by response type',
      endpoint: 'GET /api/v1/renewables/response-capacity/by-period',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'district (optional, Jerusalem|North|South|Haifa|Center|Tel Aviv|Judea & Samaria|Other)',
        'technology (optional, Photovoltaic|Wind|Other)',
        'response_type (optional, Positive|Partial Positive|Limited Positive|Negative)',
        'include_cancelled (optional, bool)'
      ],
      responseExample: `{
  "title": "Response Capacity Divided by Period",
  "total_mw": 18214.205,
  "series": [
    {
      "period": "2023-12",
      "total_mw": 320.5,
      "request_count": 820,
      "response_type_breakdown": {
        "Positive": 238.5,
        "Negative": 40.0,
        "Partial Positive": 30.0,
        "Limited Positive": 12.0
      }
    }
  ],
  "response_type_breakdown": {
    "Positive": 15000.0,
    "Negative": 1500.0,
    "Partial Positive": 1000.0,
    "Limited Positive": 714.0
  }
}`
    },
    {
      id: 'response-capacity-by-period-export',
      title: 'ייצוא קיבולת תגובה לפי תקופה',
      description: 'Export response capacity by period data to Excel file',
      endpoint: 'GET /api/v1/renewables/response-capacity/by-period/export',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'district (optional)',
        'technology (optional)',
        'response_type (optional)',
        'include_cancelled (optional, bool)'
      ],
      responseExample: 'Streamed Excel file (response_capacity_by_period.xlsx)'
    },
    // Response Capacity by Size Endpoints
    {
      id: 'response-capacity-by-size',
      title: 'קיבולת תגובה לפי גודל מתקן',
      description: 'Shows response MW split by size brackets plus yearly totals',
      endpoint: 'GET /api/v1/renewables/response-capacity/by-size',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'district (optional, Jerusalem|North|South|Haifa|Center|Tel Aviv|Judea & Samaria|Other)',
        'include_cancelled (optional, bool)'
      ],
      responseExample: `{
  "title": "Response Capacity by Facility Size",
  "series": [
    {
      "year": 2024,
      "size_bracket": "1–5 MW",
      "total_mw": 1240.0,
      "request_count": 220
    }
  ],
  "size_brackets": [
    "Up to 16 kW",
    "16–50 kW",
    "50–200 kW",
    "200 kW–1 MW",
    "1–5 MW",
    "5–50 MW",
    "50+ MW"
  ]
}`
    },
    {
      id: 'response-capacity-by-size-export',
      title: 'ייצוא קיבולת תגובה לפי גודל מתקן',
      description: 'Export response capacity by size data to Excel file',
      endpoint: 'GET /api/v1/renewables/response-capacity/by-size/export',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'district (optional)',
        'include_cancelled (optional, bool)'
      ],
      responseExample: 'Streamed Excel file (response_capacity_by_size.xlsx)'
    },
    // Response Capacity by District Endpoints
    {
      id: 'response-capacity-by-district',
      title: 'קיבולת תגובה לפי מחוז',
      description: 'Aggregates response capacity per district with a technology breakdown',
      endpoint: 'GET /api/v1/renewables/response-capacity/by-district',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'technology (optional, Photovoltaic|Wind|Other)',
        'include_cancelled (optional, bool)'
      ],
      responseExample: `{
  "title": "Response Capacity Divided by District",
  "series": [
    {
      "district": "South",
      "total_mw": 7200.0,
      "request_count": 2100,
      "technology_breakdown": {
        "Photovoltaic": 6800.0,
        "Wind": 400.0
      }
    }
  ],
  "district_technology_breakdown": {
    "South": {
      "Photovoltaic": 6800.0,
      "Wind": 400.0
    }
  }
}`
    },
    {
      id: 'response-capacity-by-district-export',
      title: 'ייצוא קיבולת תגובה לפי מחוז',
      description: 'Export response capacity by district data to Excel file',
      endpoint: 'GET /api/v1/renewables/response-capacity/by-district/export',
      method: 'GET',
      parameters: [
        'year (optional, int)',
        'technology (optional)',
        'include_cancelled (optional, bool)'
      ],
      responseExample: 'Streamed Excel file (response_capacity_by_district.xlsx)'
    },
    // Renewables Transition Endpoints
    {
      id: 'renewables-transition',
      title: 'המעבר לאנרגיות מתחדשות',
      description: 'Shows the national transition to renewables month by month',
      endpoint: 'GET /api/v1/renewables/transition',
      method: 'GET',
      parameters: ['year (optional, 4-digit year; defaults to the current year)'],
      responseExample: `{
  "year": "2025",
  "renewable_share_percent": 16.2,
  "monthly_totals": [
    {
      "month": "2025-01",
      "renewable_mw": 4880.0,
      "total_mw": 28500.0,
      "renewable_share_percent": 17.1
    }
  ],
  "notes": "Share is calculated with 5-minute samples divided by 12 and grouped by month."
}`
    },
    {
      id: 'renewables-transition-export',
      title: 'ייצוא נתוני מעבר לאנרגיות מתחדשות',
      description: 'Export renewables transition data to Excel file',
      endpoint: 'GET /api/v1/renewables/transition/export',
      method: 'GET',
      parameters: ['year (optional, 4-digit year)'],
      responseExample: 'Streamed Excel file (renewables_transition.xlsx)'
    },
    // Renewables Potential by Industry Endpoints
    {
      id: 'renewables-potential-by-industry',
      title: 'פוטנציאל אנרגיות מתחדשות לפי ענף',
      description: 'Estimates renewable production potential per industry vertical',
      endpoint: 'GET /api/v1/renewables/potential-by-industry',
      method: 'GET',
      parameters: ['year (optional, 4-digit year; defaults to the current year)'],
      responseExample: `{
  "year": "2025",
  "total_potential_mw": 3865.3,
  "industry_breakdown": [
    {
      "industry_type": "industrial",
      "renewable_potential_mw": 1670.2,
      "solar_share_percent": 48.6
    }
  ],
  "notes": "Industry names follow the Electricity Authority classification."
}`
    },
    {
      id: 'renewables-potential-by-industry-export',
      title: 'ייצוא פוטנציאל אנרגיות מתחדשות לפי ענף',
      description: 'Export renewables potential by industry data to Excel file',
      endpoint: 'GET /api/v1/renewables/potential-by-industry/export',
      method: 'GET',
      parameters: ['year (optional, 4-digit year)'],
      responseExample: 'Streamed Excel file (renewables_potential_by_industry.xlsx)'
    },
    // Renewables Production Mix Endpoints
    {
      id: 'renewables-production-mix',
      title: 'תמהיל ייצור אנרגיות מתחדשות',
      description: 'Returns the renewable portion of the production mix with breakdowns for solar, wind, and other sources',
      endpoint: 'GET /api/v1/renewables/production-mix',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'category (optional, solar | wind | other)'],
      responseExample: `{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "view": "month",
  "total_renewable_mw": 124500.4,
  "breakdown": [
    {
      "type": "photovoltaic",
      "value": 101750.2,
      "share_percent": 81.8
    },
    {
      "type": "wind",
      "value": 15000.6,
      "share_percent": 12.1
    },
    {
      "type": "other",
      "value": 8000.4,
      "share_percent": 6.1
    }
  ],
  "series": [
    {
      "period": "2026-01-01",
      "solar_mw": 4200.5,
      "wind_mw": 520.0,
      "other_mw": 230.1
    }
  ]
}`
    },
    {
      id: 'renewables-production-mix-export',
      title: 'ייצוא תמהיל ייצור אנרגיות מתחדשות',
      description: 'Export renewables production mix to Excel file',
      endpoint: 'GET /api/v1/renewables/production-mix/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'category (optional, solar | wind | other)'],
      responseExample: 'Streamed Excel file (renewables_production_mix.xlsx)'
    },
    // Heat Load vs Generation Endpoints
    {
      id: 'heat-load-vs-generation',
      title: 'עומס חום מול ייצור חשמל',
      description: 'Heat load vs electricity generation based on meteorological CSV data and generation data',
      endpoint: 'GET /api/v1/heat-load-vs-generation',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'view (optional, month | year | custom)'],
      responseExample: `{
  "view": "year",
  "start_date": "2026-02-01",
  "end_date": "2026-02-18",
  "units": {
    "heat_load": "THI",
    "electricity_generation": "MW"
  },
  "series": [
    {
      "period": "2026-02-16/2026-02-22",
      "label": "16 Feb",
      "heat_load": 11.96,
      "electricity_generation_mw": 8620.43
    }
  ]
}`
    },
    {
      id: 'heat-load-vs-generation-export',
      title: 'ייצוא עומס חום מול ייצור חשמל',
      description: 'Export heat load vs electricity generation to Excel',
      endpoint: 'GET /api/v1/heat-load-vs-generation/export',
      method: 'GET',
      parameters: ['start_date (optional, YYYY-MM-DD)', 'end_date (optional, YYYY-MM-DD)', 'view (optional, month | year | custom)'],
      responseExample: 'Streamed Excel file (heat_load_vs_generation_STARTDATE_to_ENDDATE.xlsx)'
    },
    // API Catalog Endpoint
    {
      id: 'api-catalog',
      title: 'קטלוג API',
      description: 'Returns a catalog of all registered public-facing API endpoints',
      endpoint: 'GET /api/v1/apis/',
      method: 'GET',
      responseExample: `[
  {
    "title": "Energy Overview",
    "link": "/api/v1/energy/overview",
    "method": "GET",
    "description": "Hierarchical breakdown of generation by source.",
    "params": [...],
    "sample_response": ["200"],
    "sample_response_body": {...}
  }
]`
    },
  ];

  const apiData: ApiData[] = [
    // Energy Overview
    { id: 'energy-overview', name: 'Hierarchical breakdown of energy sources', endpoint: 'api/v1/energy/overview', method: 'GET', category: 'Energy' },
    { id: 'energy-overview-details', name: 'Detailed hierarchical view', endpoint: 'api/v1/energy/overview/details', method: 'GET', category: 'Energy' },
    { id: 'energy-overview-export', name: 'Export energy overview to Excel', endpoint: 'api/v1/energy/overview/export', method: 'GET', category: 'Energy' },
    // Energy Production Mix
    { id: 'energy-production-mix', name: 'Aggregated electricity production mix', endpoint: 'api/v1/energy/production-mix', method: 'GET', category: 'Energy' },
    { id: 'energy-production-mix-export', name: 'Export production mix to Excel', endpoint: 'api/v1/energy/production-mix/export', method: 'GET', category: 'Energy' },
    // SMP
    { id: 'energy-smp', name: 'System Marginal Price data', endpoint: 'api/v1/energy/smp', method: 'GET', category: 'SMP' },
    { id: 'energy-smp-export', name: 'Export SMP data to Excel', endpoint: 'api/v1/energy/smp/export', method: 'GET', category: 'SMP' },
    { id: 'energy-smp-production-vs-marginal-price', name: 'Production vs Marginal Price', endpoint: 'api/v1/energy/smp-production-vs-marginal-price', method: 'GET', category: 'SMP' },
    { id: 'energy-smp-production-vs-marginal-price-export', name: 'Export Production vs Marginal Price', endpoint: 'api/v1/energy/smp-production-vs-marginal-price/export', method: 'GET', category: 'SMP' },
    // Private Suppliers
    { id: 'private-supplier-connected-consumers', name: 'Private supplier connected consumers', endpoint: 'api/v1/private-supplier-connected-consumers', method: 'GET', category: 'Suppliers' },
    { id: 'private-supplier-export', name: 'Export private suppliers data', endpoint: 'api/v1/private-supplier-connected-consumers/export', method: 'GET', category: 'Suppliers' },
    { id: 'private-supplier-download-source', name: 'Download raw source CSV', endpoint: 'api/v1/private-supplier-connected-consumers/download-source', method: 'GET', category: 'Suppliers' },
    // Switching Requests
    { id: 'switching-requests', name: 'Consumer switching request data', endpoint: 'api/v1/switching-requests', method: 'GET', category: 'Switching' },
    { id: 'switching-requests-export', name: 'Export switching requests', endpoint: 'api/v1/switching-requests/export', method: 'GET', category: 'Switching' },
    // CO2 Emissions
    { id: 'co2-emissions-savings', name: 'Total CO2 emissions', endpoint: 'api/v1/co2/emissions-savings', method: 'GET', category: 'CO2' },
    { id: 'co2-emissions-ratio', name: 'CO2 emissions ratio', endpoint: 'api/v1/co2/emissions-ratio', method: 'GET', category: 'CO2' },
    { id: 'co2-total-production', name: 'Total system generation', endpoint: 'api/v1/co2/total-production', method: 'GET', category: 'CO2' },
    { id: 'co2-emissions-mix', name: 'CO2 emissions mix', endpoint: 'api/v1/co2/emissions-mix', method: 'GET', category: 'CO2' },
    { id: 'co2-emissions-mix-export', name: 'Export CO2 emissions mix', endpoint: 'api/v1/co2/emissions-mix/export', method: 'GET', category: 'CO2' },
    { id: 'co2-emissions-over-time', name: 'CO2 emissions over time', endpoint: 'api/v1/co2/emissions-over-time', method: 'GET', category: 'CO2' },
    { id: 'co2-emissions-over-time-export', name: 'Export CO2 emissions over time', endpoint: 'api/v1/co2/emissions-over-time/export', method: 'GET', category: 'CO2' },
    { id: 'co2-total-vs-ratio', name: 'Total vs Ratio CO2 emissions', endpoint: 'api/v1/co2/total-vs-ratio', method: 'GET', category: 'CO2' },
    // Installed Capacity
    { id: 'installed-capacity-cumulative', name: 'Cumulative installed capacity', endpoint: 'api/v1/renewables/installed-capacity/cumulative', method: 'GET', category: 'Renewables' },
    { id: 'installed-capacity-cumulative-export', name: 'Export cumulative installed capacity', endpoint: 'api/v1/renewables/installed-capacity/cumulative/export', method: 'GET', category: 'Renewables' },
    { id: 'installed-capacity-growth', name: 'Installed capacity growth rate', endpoint: 'api/v1/renewables/installed-capacity/growth', method: 'GET', category: 'Renewables' },
    { id: 'installed-capacity-growth-export', name: 'Export installed capacity growth', endpoint: 'api/v1/renewables/installed-capacity/growth/export', method: 'GET', category: 'Renewables' },
    { id: 'installed-capacity-by-facility-size', name: 'Installed capacity by facility size', endpoint: 'api/v1/renewables/installed-capacity/by-facility-size', method: 'GET', category: 'Renewables' },
    { id: 'installed-capacity-by-facility-size-export', name: 'Export installed capacity by facility size', endpoint: 'api/v1/renewables/installed-capacity/by-facility-size/export', method: 'GET', category: 'Renewables' },
    { id: 'response-capacity-by-period', name: 'Response capacity by period', endpoint: 'api/v1/renewables/response-capacity/by-period', method: 'GET', category: 'Renewables' },
    { id: 'response-capacity-by-period-export', name: 'Export response capacity by period', endpoint: 'api/v1/renewables/response-capacity/by-period/export', method: 'GET', category: 'Renewables' },
    { id: 'response-capacity-by-size', name: 'Response capacity by size', endpoint: 'api/v1/renewables/response-capacity/by-size', method: 'GET', category: 'Renewables' },
    { id: 'response-capacity-by-size-export', name: 'Export response capacity by size', endpoint: 'api/v1/renewables/response-capacity/by-size/export', method: 'GET', category: 'Renewables' },
    { id: 'response-capacity-by-district', name: 'Response capacity by district', endpoint: 'api/v1/renewables/response-capacity/by-district', method: 'GET', category: 'Renewables' },
    { id: 'response-capacity-by-district-export', name: 'Export response capacity by district', endpoint: 'api/v1/renewables/response-capacity/by-district/export', method: 'GET', category: 'Renewables' },
    // Renewables Transition
    { id: 'renewables-transition', name: 'National transition to renewables', endpoint: 'api/v1/renewables/transition', method: 'GET', category: 'Renewables' },
    { id: 'renewables-transition-export', name: 'Export renewables transition', endpoint: 'api/v1/renewables/transition/export', method: 'GET', category: 'Renewables' },
    // Renewables Potential by Industry
    { id: 'renewables-potential-by-industry', name: 'Renewables potential by industry', endpoint: 'api/v1/renewables/potential-by-industry', method: 'GET', category: 'Renewables' },
    { id: 'renewables-potential-by-industry-export', name: 'Export renewables potential by industry', endpoint: 'api/v1/renewables/potential-by-industry/export', method: 'GET', category: 'Renewables' },
    // Renewables Production Mix
    { id: 'renewables-production-mix', name: 'Renewables production mix breakdown', endpoint: 'api/v1/renewables/production-mix', method: 'GET', category: 'Renewables' },
    { id: 'renewables-production-mix-export', name: 'Export renewables production mix', endpoint: 'api/v1/renewables/production-mix/export', method: 'GET', category: 'Renewables' },
    // Heat Load vs Generation
    { id: 'heat-load-vs-generation', name: 'Heat load vs electricity generation', endpoint: 'api/v1/heat-load-vs-generation', method: 'GET', category: 'Climate' },
    { id: 'heat-load-vs-generation-export', name: 'Export heat load vs generation', endpoint: 'api/v1/heat-load-vs-generation/export', method: 'GET', category: 'Climate' },
    // Data Files
    { id: 'data-files-status', name: 'Data files freshness status', endpoint: 'api/v1/data-files/status', method: 'GET', category: 'Data' },
    { id: 'data-files-upload', name: 'Upload data file', endpoint: 'api/v1/data-files/upload', method: 'POST', category: 'Data' },
    // API Catalog
    { id: 'api-catalog', name: 'API endpoints catalog', endpoint: 'api/v1/apis/', method: 'GET', category: 'General' },
  ];

  return (
    <div className="">
      <Image src={topleft} width={600} height={600} className='size-[600px] absolute top-0 left-0 z-1' alt='image' />

      <div className="container mx-auto px-5 md:py-[52px] py-10 relative w-full overflow-hidden z-10">
        {/* Header */}
        <div className="md:px-[60px] px-5">
          <h1 className="md:text-5xl text-3xl font-extrabold text-[#484C56]">API</h1>
          <div className="w-[92px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
          <p className="md:text-lg text-base text-[#484C56] font-normal mb-4">
            תיעוד API עבור גישה לנתוני אנרגיה, פליטות CO2, ונתוני שוק החשמל בישראל.
          </p>
          <p className="text-sm text-[#59687D] mb-4">
            All date parameters use YYYY-MM-DD format. Omitted dates default to sensible ranges (usually last 365 days or last 1 day).
          </p>
        </div>
        <div className="flex flex-col bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-5">
          <h2 className='md:text-[34px] text-2xl text-[#276E4E] font-extrabold'>כללי</h2>
          <div className="flex flex-col gap-1 items-end">
            <p className='md:text-xl text-base font-normal text-right text-[#484C56]'>Base URL: <Link className='text-[#5D6FFF]' href={''}>https://api.open-energy.madebyomnis.com/</Link></p>
            <p className='md:text-xl text-base font-normal text-right text-[#484C56]'>Authentication: API Key required (x-api-key header)</p>
            <p className='md:text-xl text-base font-normal text-right text-[#484C56]'>Formats Supported: JSON, Excel (for export endpoints)</p>
          </div>
        </div>

        {/* API Documentation */}
        <div className="md:my-10 my-5 flex flex-col md:gap-10 gap-5">
          <div className="flex flex-col bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-5">
            <h2 className='md:text-[34px] text-2xl text-[#276E4E] font-extrabold'>רשימה של שיטות API</h2>
            <p className="md:text-lg text-base text-[#484C56] font-normal mb-4">
              נקודות הקצה והפונקציונליות שלהן.
            </p>
            <div className="relative overflow-x-auto rounded-lg max-w-[975px] w-full">
              <table className='w-full text-sm text-right rounded-lg'>
                <thead className='border border-[#C3C3C3] bg-[#DEDEDE]/70'>
                  <tr className='md:text-xl text-base font-extrabold border border-[#C3C3C3]'>
                    <th className='text-right p-3 border border-[#C3C3C3]'>שיטה</th>
                    <th className='text-right p-3 border border-[#C3C3C3]'>נקודת קצה / קוד</th>
                    <th className='text-right p-3 border border-[#C3C3C3]'>תאוּר</th>
                  </tr>
                </thead>
                <tbody>
                  {apiData.map((data) =>
                  (
                    <tr key={data.id}>
                      <td className='bg-white text-right p-3 border border-[#C3C3C3] md:text-xl text-base text-[#484C56] font-normal'>{data.method}</td>
                      <td className='bg-white text-right p-3 border border-[#C3C3C3] md:text-xl text-base text-[#484C56] font-normal'>
                        <Link href={`#${data.id}`} className='text-[#5D6FFF] hover:underline'>{data.endpoint}</Link>
                      </td>
                      <td className='bg-white text-right p-3 border border-[#C3C3C3] md:text-xl text-base text-[#484C56] font-normal'>{data.name}</td>
                    </tr>
                  )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-5">
            <h2 className='md:text-[34px] mb-6 text-2xl text-[#276E4E] font-extrabold'>נקודות הקצה</h2>
            <div className="flex flex-col gap-6">
              {apiEndpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  id={endpoint.id}
                  className="max-w-[780px] text-left w-full bg-white border border-[#C3C3C3] p-5 rounded-xl scroll-mt-24"
                >
                  <div className="border-b border-[#59687D] py-3 flex flex-row-reverse justify-between items-start md:items-center gap-3">
                    <div className="text-right">
                      <h3 className='text-[#484C56] font-extrabold md:text-xl text-base text-right flex justify-end'><span>:</span>Сhart title</h3>
                      <p className='text-[#484C56] md:text-xl text-base font-normal'>{endpoint.title}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(endpoint)}
                      className={`flex items-center gap-1 px-3 py-1 rounded border border-[#276E4E] text-[#276E4E] ${copiedEndpoint === endpoint.id
                        ? 'bg-[#276E4E] text-white'
                        : 'hover:bg-[#276E4E] hover:text-white'
                        } transition-colors duration-200`}
                    >
                      {copiedEndpoint === endpoint.id ? (
                        <div className="flex items-center">
                          <div><span>!</span>Copied</div>
                        </div>
                      ) : (
                        <>
                          Copy
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="py-4 md:space-y-3 space-y-1">
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <span className="text-right font-semibold">Endpoint: </span>
                      <span className="py-1 rounded font-mono text-[#5D6FFF]">{endpoint.endpoint}</span>
                    </div>
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <span className="font-semibold">Description: </span>
                      <span>{endpoint.description}</span>
                    </div>
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <span className="font-semibold">Method: </span>
                      <span className={`px-2 py-0.5 rounded text-white text-sm ${endpoint.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'}`}>
                        {endpoint.method}
                      </span>
                    </div>
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                        <div className="flex justify-end font-semibold"><span>:</span>Parameters</div>
                        <ul className="mt-1 px-8">
                          {endpoint.parameters.map((param, idx) => (
                            <li key={idx} className='text-right font-mono text-sm'>{param}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {endpoint.responseExample && (
                      <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                        <div className="flex justify-end font-semibold"><span>:</span>Response Example</div>
                        <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded mt-2 overflow-x-auto text-xs text-left" dir="ltr">
                          {endpoint.responseExample}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InterestPage />
    </div>
  );
}
