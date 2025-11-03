'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GaugeChart from '@/components/Charts/GaugeChart';
import PieChart from '@/components/Charts/PieChart';
import { Download, Info, ChevronDown } from 'lucide-react';

interface TargetData {
  year: number;
  installationType: string;
  targetMW: number;
  currentMW: number;
  targetTWh: number;
  currentTWh: number;
  efficiency: number;
  co2Reduction: number;
  yearlyReduction: number;
  cumulativeReduction: number;
  installationCost: number;
  maintenanceCost: number;
  details: string;
}

export default function RenewableTargetsSection() {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedRegion, setSelectedRegion] = useState('כל אזור');

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Sample data for renewable targets
  const targetData: TargetData[] = [
    {
      year: 3,
      installationType: 'גר',
      targetMW: 77,
      currentMW: 77,
      targetTWh: 77,
      currentTWh: 77,
      efficiency: 4,
      co2Reduction: 287196,
      yearlyReduction: 58,
      cumulativeReduction: 287196,
      installationCost: 58,
      maintenanceCost: 0,
      details: 'פרטים נוספים על התקנות גג'
    },
    {
      year: 3,
      installationType: 'גר כביש',
      targetMW: 77,
      currentMW: 77,
      targetTWh: 77,
      currentTWh: 77,
      efficiency: 3,
      co2Reduction: 7196,
      yearlyReduction: 58,
      cumulativeReduction: 7196,
      installationCost: 58,
      maintenanceCost: 0,
      details: 'פרטים נוספים על תחנות כביש'
    },
    {
      year: 3,
      installationType: 'וחוץ',
      targetMW: 77,
      currentMW: 77,
      targetTWh: 77,
      currentTWh: 77,
      efficiency: 3,
      co2Reduction: 287196,
      yearlyReduction: 58,
      cumulativeReduction: 287196,
      installationCost: 58,
      maintenanceCost: 0,
      details: 'פרטים נוספים על תחנות רוח'
    },
    {
      year: 4,
      installationType: 'וטבעי',
      targetMW: 77,
      currentMW: 77,
      targetTWh: 77,
      currentTWh: 77,
      efficiency: 6,
      co2Reduction: 7196,
      yearlyReduction: 58,
      cumulativeReduction: 7196,
      installationCost: 58,
      maintenanceCost: 0,
      details: 'פרטים נוספים על גז טבעי'
    },
    {
      year: 3,
      installationType: 'נוגה',
      targetMW: 77,
      currentMW: 77,
      targetTWh: 77,
      currentTWh: 77,
      efficiency: 4,
      co2Reduction: 287196,
      yearlyReduction: 58,
      cumulativeReduction: 287196,
      installationCost: 58,
      maintenanceCost: 0,
      details: 'פרטים נוספים על תחנות נוגה'
    }
  ];

  // Sample data for photovoltaic breakdown by region
  const photovoltaicData = [
    { name: 'צפון', value: 25.1, color: '#10b981' },
    { name: 'מרכז', value: 22.0, color: '#3b82f6' },
    { name: 'מערב ירושלים', value: 11.54, color: '#f59e0b' },
    { name: 'איילת', value: 7.16, color: '#ef4444' },
    { name: 'דרום', value: 30.88, color: '#8b5cf6' },
    { name: 'אחר', value: 3.32, color: '#64748b' }
  ];

  const currentProgress = 8; // 8% progress toward renewable target

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">אנרגיות מתחדשות</h1>
        <p className="text-slate-600 mb-6">
          אפשר לבחינה נוכחים כאן המידע. לורם איפסום דולור סיט אמט, קונסקטור אדיפיסיטינג אליט הניתוח טרושני ושליטה והלכו השון שמועדים והאת נבטי טרוש. זהות מינב במין אמא דואקלו יובת מבוין אפסא דואקלת יבעל.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <p className="text-sm font-medium text-slate-700 self-center ml-4">סנן מידע אחרת:</p>
          <Button variant="outline" size="sm" className="bg-green-100 border-green-300 text-green-800">
            יעדים חיוניים
          </Button>
          <Button variant="outline" size="sm">
            יעילותי חשמליות
          </Button>
          <Button variant="outline" size="sm">
            בקשות תיבור ותשובות
          </Button>
          <Button variant="outline" size="sm">
            מתקנים יועלמים מרגזמיים
          </Button>
        </div>
      </div>

      {/* Targets Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">יעדוח יטובים</h2>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gauge Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">מינימם פוטובולטאי מתקבל</CardTitle>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <select 
                    className="text-sm border rounded px-2 py-1"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option>כל אזור טל</option>
                    <option>צפון</option>
                    <option>מרכז</option>
                    <option>דרום</option>
                  </select>
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-600">דיוטע על גליאל</div>
            </CardHeader>
            <CardContent>
              <GaugeChart 
                value={currentProgress}
                max={100}
                title="מינימם פוטובולטאי"
                unit="%"
                height={250}
                color="#10b981"
              />
              
              {/* Progress Bars */}
              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium">מחציח אמת</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>המוטח הכל (גיווטטסועות)</span>
                    <span className="font-medium">272.5 GW</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span>המוטח לישראל (גיווטטסועות)</span>
                    <span className="font-medium">272.5 GW</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-700">123</div>
                  <div className="text-xs text-slate-600">GW נו הטרחל הסכם</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-700">123</div>
                  <div className="text-xs text-slate-600">קוווטים</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">נתונים ויעדים</CardTitle>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 text-sm"
              >
                התרחש הנוכחיים חיוניים
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-slate-600">
                      <th className="text-right py-2">שנה</th>
                      <th className="text-right py-2">מקומת התוכנות ככלי זמן</th>
                      <th className="text-right py-2">נהגח מקומת (MW)</th>
                      <th className="text-right py-2">מקומת נטוני מוצר (MW)</th>
                      <th className="text-right py-2">יעיל רכב כההיש התוכנון</th>
                      <th className="text-right py-2">נולע מהיד כח נמוך (טון CO₂-שוו)</th>
                      <th className="text-right py-2">נפח הואה שוקה להרגע (טון CO₂-שוו)</th>
                      <th className="text-right py-2">ניטול גומרו רוגע שוקה להרגע (טון CO₂-שוו)</th>
                      <th className="text-right py-2">נוהרס יומי נינוק נותח</th>
                      <th className="text-right py-2">נולע נזונה שוקע נ₪ ח לגיל</th>
                      <th className="text-right py-2">יופ</th>
                      <th className="text-right py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetData.map((row, index) => (
                      <>
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="py-2 text-center">{row.year}</td>
                          <td className="py-2">{row.installationType}</td>
                          <td className="py-2 text-center">{row.targetMW}</td>
                          <td className="py-2 text-center">{row.currentMW}</td>
                          <td className="py-2 text-center">{row.efficiency}</td>
                          <td className="py-2 text-center">{row.co2Reduction.toLocaleString()}</td>
                          <td className="py-2 text-center">{row.yearlyReduction}%</td>
                          <td className="py-2 text-center">{row.cumulativeReduction.toLocaleString()}</td>
                          <td className="py-2 text-center">{row.installationCost}%</td>
                          <td className="py-2 text-center">{row.maintenanceCost}</td>
                          <td className="py-2 text-center">גר</td>
                          <td className="py-2 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleRow(index)}
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${expandedRows.has(index) ? 'rotate-180' : ''}`} />
                            </Button>
                          </td>
                        </tr>
                        {expandedRows.has(index) && (
                          <tr className="bg-slate-50">
                            <td colSpan={12} className="py-4 px-4 text-sm text-slate-600">
                              <div className="space-y-2">
                                <p><strong>פרטים נוספים:</strong> {row.details}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <span className="font-medium">יעד TWh:</span>
                                    <span className="ml-2">{row.targetTWh}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">נוכחי TWh:</span>
                                    <span className="ml-2">{row.currentTWh}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">יעילות:</span>
                                    <span className="ml-2">{row.efficiency}%</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">עלות תחזוקה:</span>
                                    <span className="ml-2">₪{row.maintenanceCost.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  לכל היטובים
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פוטובולטאי יגרח מידווח התחדרותי לפני טקסט</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart 
                data={photovoltaicData}
                height={350}
                showLabels={true}
              />
              <div className="space-y-4">
                <h3 className="font-medium text-slate-800">התפלגות לפי אזורים</h3>
                <div className="space-y-2">
                  {photovoltaicData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}