'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, ExternalLink, Download, Clock, CheckCircle } from 'lucide-react';

interface DataSource {
  name: string;
  organization: string;
  description: string;
  dataTypes: string[];
  updateFrequency: string;
  lastUpdated: string;
  status: 'active' | 'maintenance' | 'delayed';
  url?: string;
  apiAvailable: boolean;
}

export default function DataSourcesSection() {
  const dataSources: DataSource[] = [
    {
      name: 'נתוני ייצור חשמל',
      organization: 'חברת החשמל לישראל',
      description: 'נתונים על ייצור חשמל מכל המקורות, כולל תחנות כוח קונבנציונליות ומתחדשות',
      dataTypes: ['ייצור חשמל', 'צריכה', 'עומס שיא', 'מקורות אנרגיה'],
      updateFrequency: 'כל 15 דקות',
      lastUpdated: '2024-01-15 14:30',
      status: 'active',
      url: 'https://www.iec.co.il',
      apiAvailable: true
    },
    {
      name: 'נתוני אנרגיות מתחדשות',
      organization: 'רשות החשמל',
      description: 'מידע מפורט על התקנות אנרגיה מתחדשת, רישיונות והספק מותקן',
      dataTypes: ['אנרגיה סולארית', 'אנרגיית רוח', 'רישיונות', 'הספק מותקן'],
      updateFrequency: 'יומי',
      lastUpdated: '2024-01-15 08:00',
      status: 'active',
      url: 'https://www.pua.gov.il',
      apiAvailable: true
    },
    {
      name: 'נתוני פליטות CO2',
      organization: 'משרד להגנת הסביבה',
      description: 'נתונים על פליטות גזי חממה ממקורות אנרגיה שונים',
      dataTypes: ['פליטות CO2', 'גזי חממה', 'מקורות פליטה', 'יעדי הפחתה'],
      updateFrequency: 'חודשי',
      lastUpdated: '2024-01-01 00:00',
      status: 'active',
      url: 'https://www.gov.il/he/departments/ministry_of_environmental_protection',
      apiAvailable: false
    },
    {
      name: 'נתוני יעילות אנרגטית',
      organization: 'משרד האנרגיה',
      description: 'מידע על תוכניות יעילות אנרגטית וחיסכון באנרגיה',
      dataTypes: ['יעילות אנרגטית', 'חיסכון באנרגיה', 'תוכניות ממשלתיות'],
      updateFrequency: 'רבעוני',
      lastUpdated: '2024-01-01 00:00',
      status: 'maintenance',
      url: 'https://www.gov.il/he/departments/ministry_of_energy',
      apiAvailable: false
    },
    {
      name: 'נתוני מחירי אנרגיה',
      organization: 'הלשכה המרכזית לסטטיסטיקה',
      description: 'מחירי דלק, חשמל וגז לצרכנים ולתעשייה',
      dataTypes: ['מחירי חשמל', 'מחירי דלק', 'מחירי גז', 'מדדי מחירים'],
      updateFrequency: 'חודשי',
      lastUpdated: '2024-01-10 12:00',
      status: 'delayed',
      url: 'https://www.cbs.gov.il',
      apiAvailable: true
    },
    {
      name: 'נתוני צריכת אנרגיה',
      organization: 'משרד האנרגיה',
      description: 'נתונים על צריכת אנרגיה לפי מקטורים ואזורים',
      dataTypes: ['צריכת חשמל', 'צריכת דלק', 'צריכה לפי מגזרים'],
      updateFrequency: 'חודשי',
      lastUpdated: '2024-01-12 10:00',
      status: 'active',
      url: 'https://www.gov.il/he/departments/ministry_of_energy',
      apiAvailable: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'פעיל';
      case 'maintenance': return 'תחזוקה';
      case 'delayed': return 'עיכוב';
      default: return 'לא ידוע';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-100 to-blue-100 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">מקורות נתונים</h1>
        <p className="text-lg text-slate-600 mb-4">
          הפלטפורמה שלנו מבוססת על נתונים מאומתים ממקורות רשמיים. כל המידע מתעדכן באופן קבוע ועובר בדיקות איכות קפדניות.
        </p>
        <div className="flex items-center space-x-4 space-x-reverse">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {dataSources.filter(ds => ds.status === 'active').length} מקורות פעילים
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {dataSources.filter(ds => ds.apiAvailable).length} זמינים ב-API
          </Badge>
        </div>
      </div>

      {/* Data Quality Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>תקני איכות הנתונים</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">מקורות מאומתים</h3>
              <p className="text-sm text-slate-600">כל הנתונים מגיעים ממקורות רשמיים ומאומתים בלבד</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">עדכון קבוע</h3>
              <p className="text-sm text-slate-600">הנתונים מתעדכנים באופן אוטומטי לפי לוחות זמנים קבועים</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">בדיקות איכות</h3>
              <p className="text-sm text-slate-600">כל נתון עובר בדיקות איכות ואימות לפני פרסום</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">שקיפות מלאה</h3>
              <p className="text-sm text-slate-600">כל מקור נתונים מתועד עם קישור למקור המקורי</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">רשימת מקורות הנתונים</h2>
        
        <div className="grid gap-6">
          {dataSources.map((source, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <p className="text-sm text-blue-600 font-medium">{source.organization}</p>
                    <Badge className={getStatusColor(source.status)}>
                      {getStatusText(source.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {source.apiAvailable && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        API זמין
                      </Badge>
                    )}
                    {source.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{source.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">סוגי נתונים:</h4>
                    <div className="flex flex-wrap gap-1">
                      {source.dataTypes.map((type, typeIndex) => (
                        <Badge key={typeIndex} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">תדירות עדכון:</span>
                      <span className="font-medium">{source.updateFrequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">עדכון אחרון:</span>
                      <span className="font-medium">{source.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 ml-2" />
                    הורד נתונים
                  </Button>
                  {source.apiAvailable && (
                    <Button variant="outline" size="sm">
                      <Database className="w-4 h-4 ml-2" />
                      תיעוד API
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>הנחיות לשימוש בנתונים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">רישוי ושימוש</h3>
              <p className="text-sm text-slate-600">
                כל הנתונים בפלטפורמה זמינים לשימוש ציבורי תחת רישיון Creative Commons. יש לציין את המקור בעת שימוש בנתונים.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">אחריות ודיוק</h3>
              <p className="text-sm text-slate-600">
                אנו עושים כל מאמץ להבטיח דיוק הנתונים, אך איננו אחראים לשגיאות או השמטות. מומלץ לאמת נתונים קריטיים מול המקור המקורי.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">דיווח על בעיות</h3>
              <p className="text-sm text-slate-600">
                אם נתקלת בשגיאה או בעיה בנתונים, אנא דווח לנו באמצעות טופס הקשר או בדוא"ל data@openenergy.gov.il
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}