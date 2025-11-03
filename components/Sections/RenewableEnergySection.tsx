'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StackedBarChart from '@/components/Charts/StackedBarChart';
import { Download, Info, Filter } from 'lucide-react';

export default function RenewableEnergySection() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');

  // Sample data for regional renewable energy capacity
  const regionalData = {
    categories: ['2021', '2022', '2023', '2024', '2025'],
    series: [
      {
        name: 'פרטי',
        data: [1500, 1800, 2200, 2800, 3200],
        color: '#10b981'
      },
      {
        name: 'אנדזה אחרות',
        data: [800, 1200, 1500, 1800, 2000],
        color: '#3b82f6'
      },
      {
        name: 'מסחרי אחרות',
        data: [400, 600, 800, 1000, 1200],
        color: '#f59e0b'
      },
      {
        name: 'קטן',
        data: [200, 300, 400, 500, 600],
        color: '#ef4444'
      }
    ]
  };

  // Sample data for renewable energy by region over time
  const timeSeriesData = {
    categories: ['ינו', 'נור שעו', 'נפק', 'צנזיץ', 'חיט', 'יוכן', 'דל', 'צמינוס', 'ספיטמק', 'ספצומבר', 'נוכמבר', 'דימבר'],
    series: [
      {
        name: '2024',
        data: [400, 420, 380, 460, 480, 520, 540, 580, 560, 600, 580, 620],
        color: '#10b981'
      },
      {
        name: '2023',
        data: [350, 370, 340, 400, 420, 450, 480, 510, 490, 520, 500, 540],
        color: '#3b82f6'
      },
      {
        name: '2022',
        data: [300, 320, 290, 340, 360, 380, 400, 430, 410, 440, 420, 460],
        color: '#f59e0b'
      },
      {
        name: '2021',
        data: [250, 270, 240, 280, 300, 320, 340, 360, 350, 380, 360, 400],
        color: '#ef4444'
      }
    ]
  };

  const filters = [
    { id: 'installation-efficiency', label: 'מתקנים יועלמים מרגזמיים' },
    { id: 'renewable-electricity', label: 'חשמל ימנו מתחדשים' },
    { id: 'green-targets', label: 'יעדים ירוקים' },
    { id: 'electricity-efficiency', label: 'יעילותי חשמליות' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">אנרגיות מתחדשות</h1>
        <p className="text-slate-600 mb-6">
          אפשר לבחינה נוכחים כאן המידע. לורם איפסום דולור סיט אמט, קונסקטור אדיפיסיטינג אליט. הניתוח טרושני ושליטה והלכו השון שמועדים והאת נבטי טרוש. זהות מינב במין אמא דואקלו יובת מבוין אפסא דואקלת.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <p className="text-sm font-medium text-slate-700 self-center ml-4">סנן מידע אחרת:</p>
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              className={selectedFilter === filter.id ? 'bg-renewable hover:bg-renewable/90' : ''}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">בקשות תיבור ותשובות</h2>

        {/* Regional Capacity Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">הקסמת התנהגות מתוכן לפי תומים</CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                <select 
                  className="text-sm border rounded px-2 py-1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
                <Button variant="outline" size="sm">
                  הצג הכל
                </Button>
                <Button variant="outline" size="sm">
                  כנוסע שבחש
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StackedBarChart 
              data={regionalData}
              yAxisLabel="MW"
              height={400}
            />
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-renewable">2,817</div>
                <div className="text-sm text-slate-600">סול</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-wind">1,674</div>
                <div className="text-sm text-slate-600">רוח</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-solar">947</div>
                <div className="text-sm text-slate-600">מומדזה אחרות</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-gas">5,438</div>
                <div className="text-sm text-slate-600">סך הכול</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Time Series Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">הקסמת התנהגות מתוכן לפי תומים (קוליזירטים)</CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                <select className="text-sm border rounded px-2 py-1">
                  <option>מקור זמן</option>
                </select>
                <select className="text-sm border rounded px-2 py-1">
                  <option>מירו לפני</option>
                </select>
                <Button variant="outline" size="sm">
                  הצג הכל
                </Button>
                <Button variant="outline" size="sm">
                  כנוסע שבחש
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StackedBarChart 
              data={timeSeriesData}
              yAxisLabel="TWh לאחר התיקן"
              height={400}
            />
            <div className="mt-4 flex justify-center space-x-6 space-x-reverse text-sm">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-slate-600">+8051 יח' הבדה ל'</span>
                <Badge variant="outline">3000-431</Badge>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-slate-600">5000-631 יח'</span>
                <Badge variant="outline">501-630</Badge>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-slate-600">0-200 יח'</span>
                <Badge variant="outline">0-200 יח'</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Another Regional Chart */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">הקסמת התנהגות מתוכן לפי תומים (קוליזירטים)</CardTitle>
          </CardHeader>
          <CardContent>
            <StackedBarChart 
              data={{
                categories: ['2021', '2022', '2023', '2024', '2025'],
                series: [
                  { name: 'תחנים', data: [1200, 1400, 1600, 1800, 2000], color: '#10b981' },
                  { name: 'מתחדשותים חדשות', data: [600, 800, 1000, 1200, 1400], color: '#3b82f6' },
                  { name: 'מירעה אגרותים', data: [400, 500, 600, 700, 800], color: '#f59e0b' },
                  { name: 'בעלותי', data: [200, 250, 300, 350, 400], color: '#ef4444' }
                ]
              }}
              yAxisLabel="MW"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Small Regional Chart */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">הקסמת התנהגות מתוכן לפי מתוך</CardTitle>
          </CardHeader>
          <CardContent>
            <StackedBarChart 
              data={{
                categories: ['2021', '2022', '2023', '2024', '2025', '2026'],
                series: [
                  { name: 'תחנים', data: [800, 900, 1000, 1100, 1200, 1300], color: '#10b981' },
                  { name: 'מתחדשותים חדשות', data: [400, 500, 600, 700, 800, 900], color: '#3b82f6' },
                  { name: 'מירעה אגרותים', data: [200, 250, 300, 350, 400, 450], color: '#f59e0b' },
                  { name: 'בעלותי', data: [100, 125, 150, 175, 200, 225], color: '#ef4444' }
                ]
              }}
              yAxisLabel="MW"
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}