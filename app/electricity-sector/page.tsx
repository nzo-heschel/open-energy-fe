'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LineChart from '@/components/Charts/LineChart';
import PieChart from '@/components/Charts/PieChart';
import NewsletterPopup from '@/components/NewsletterPopup';
import { Download, Info, BarChart3, ChevronLeft, ChevronRight, ExternalLink, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import topleft from '@/public/images/Ellipse 89.png'
import image1 from '@/public/Frame 427319915.png'
import image2 from '@/public/Frame 427319913.png'
import image3 from '@/public/Frame 427319914.png'
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import InterestPage from '@/components/InterestPage';
import RejectionChart from '@/components/RejectionChart';
import DashChart from '@/components/DashChart';
import Market from '@/components/Market';
import SMP from '@/components/SMP';
import Electritiy from '@/components/Electritiy';



export default function ElectricitySector() {
    const [activeTab, setActiveTab] = useState<'market' | 'smp'>();
    const [smpDetails, setSmpDetails] = useState(false)
    const [marketDetails, setMarketDetails] = useState(false)
    const [selectedTimeframe, setSelectedTimeframe] = useState('יומי');

    const handleSMP = (() => {
        setSmpDetails(!smpDetails)
        setActiveTab('smp');
    })
    const handleMarket = (() => {
        setMarketDetails(!marketDetails)
        setActiveTab('market');
    })

    // Data for electricity consumption line chart - matching Figma design
    const electricityData = {
        dates: ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24'],
        series: [
            {
                name: 'אחר',
                data: [1000, 800, 600, 500, 400, 300, 200, 150, 200, 400, 600, 800, 1000],
                color: '#64748b'
            },
            {
                name: 'אנרגיות מתחדשות',
                data: [0, 0, 0, 200, 800, 1200, 1600, 1800, 1600, 1200, 800, 200, 0],
                color: '#10b981'
            },
            {
                name: 'אנרגיות פוסיליות',
                data: [7500, 7000, 6500, 6000, 5500, 5000, 4500, 4000, 4500, 5500, 6500, 7000, 7500],
                color: '#f59e0b'
            }
        ]
    };

    // Data for energy sources pie chart - matching Figma design
    const energySourcesData = [
        { name: 'אנרגיות פוסיליות', value: 48, color: '#CEA073' },
        { name: 'אנרגיות מתחדשות', value: 98, color: '#2F7A4F' },
        { name: 'אחר', value: 34, color: '#648AA3' },
    ];


    return (
        <div className="">
            <div className="container mx-auto px-5 md:py-[52px] py-5 md:space-y-[52px] space-y-5 relative w-full overflow-hidden" >
                {/* Main Content */}
                <div className="md:space-y-[52px] space-y-8 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:px-[30px] px-6 md:py-[50px] py-6 md:rounded-[40px] rounded-[20px]">
                    <div className="">
                        <h2 className="md:text-3xl text-2xl font-bold text-[#276E4E]">משק החשמל בישראל</h2>
                        <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
                        <div className="flex flex-col gap-2 max-w-[1043px] w-full md:text-xl text-base">
                            <p className="text-[#484C56] max-w-full leading-[120%]">
                                משק החשמל בישראל מורכב ממספר גורמים מרכזיים: משרד האנרגיה, האחראי על קביעת מדיניות האנרגיה, רשות החשמל, המפקחת על השוק וקובעת את התעריפים, וחברת נגה – ניהול מערכת החשמל, המנהלת את אספקת החשמל ושומרת על איזון בין ביקוש לייצור בזמן אמת.
                            </p>
                        </div>
                        <Button variant="link" className="text-[#358BFF] mt-2 mr-0 p-0">
                            קרא פחות...
                        </Button>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Energy Sources Pie Chart */}
                        <Card className="bg-white border border-orange-200 rounded-2xl shadow-sm">
                            <CardHeader>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="md:text-lg text-base text-right flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold">
                                            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g opacity="0.5">
                                                    <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                                    <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                                </g>
                                            </svg>
                                            תמהיל יצור אנרגיה
                                        </CardTitle>
                                        <div className="flex items-start md:gap-4 gap-2">
                                            <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                                            <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                                        </div>
                                    </div>
                                    <div className="md:text-sm text-xs text-slate-600 mr-[90px]">פרק זמן:</div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="-mt-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">מיון לפי:</span>
                                        <div className="relative w-[202px]">
                                            <select
                                                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                            >
                                                <option>יומי</option>
                                                <option>שבועי</option>
                                                <option>חודשי</option>
                                            </select>

                                            {/* Custom dropdown arrow */}
                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">
                                                <ChevronDown size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative w-full h-[400px]">
                                    <PieChart
                                        data={energySourcesData}
                                        height={300}
                                        innerRadius="40%"
                                        showLabels={false}
                                    />
                                    {/* Center text */}
                                    <div className="absolute -top-[25%] inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-sm text-slate-600 text-center">סה"כ</div>
                                            <div className="md:text-base text-sm font-bold">MW 5,734</div>
                                        </div>
                                    </div>
                                    {/* Label with percentage */}
                                    {/* <div className="absolute top-16 right-16 bg-orange-100 px-2 py-1 rounded text-xs">
                    38% | אנרגיות פוסיליות
                  </div> */}
                                </div>

                                <div className="-mt-10 flex justify-start">
                                    <Button variant="link" className="text-blue-600 text-sm">
                                        הצג נתונים <ChevronLeft className="w-4 h-4 mr-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Electricity Consumption Line Chart */}
                        <Card className="bg-white border border-orange-200 rounded-2xl shadow-sm">
                            <CardHeader>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-5 justify-between">
                                        <CardTitle className="md:text-lg text-sm text-right flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold">
                                            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g opacity="0.5">
                                                    <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                                    <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                                </g>
                                            </svg>
                                            משק החשמל בישראל - נתב על
                                        </CardTitle>
                                        <div className="flex items-start md:gap-4 gap-2">
                                            <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                                            <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                                        </div>
                                    </div>
                                    <div className="md:text-sm text-xs text-slate-600 mr-[90px]">פרק זמן:</div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 -mt-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">מיון לפי:</span>
                                        <div className="relative w-[202px]">
                                            <select
                                                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                            >
                                                <option>יומי</option>
                                                <option>שבועי</option>
                                                <option>חודשי</option>
                                            </select>

                                            {/* Custom dropdown arrow */}
                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">
                                                <ChevronDown size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <LineChart
                                    data={electricityData}
                                    yAxisLabel="[MW]"
                                    height={300}
                                />
                                {/* Legend */}
                                <div className="mt-4 flex justify-start">
                                    <Button variant="link" className="text-blue-600 text-sm">
                                        הצג נתונים <ChevronLeft className="w-4 h-4 mr-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* Bottom Section - Additional Data Links */}
                <div className="bg-[#FDFBF6] border border-[#DEDEDE]/70 md:rounded-[40px] rounded-[20px] pb-5 md:px-[30px] px-5 space-y-[30px]">
                    <div className="flex flex-col gap-2 my-[30px]">
                        <h3 className="md:text-lg text-base font-extrabold text-[#276E4E]">לנתונים נוספים</h3>
                        <div className="flex items-center md:gap-6 gap-3">
                            <button
                                onClick={handleMarket}
                                className={`text-[#59687D] font-bold border py-[6px] px-6 rounded-full md:text-base text-sm transition-all ${activeTab === 'market'
                                    ? 'bg-[#1E8025] border-[#1E8025] text-white'
                                    : 'bg-white border-[#DEDEDE] hover:bg-gray-50'
                                    }`}
                            >
                                שוק חשמל תחרותי
                            </button>

                            <button
                                onClick={handleSMP}
                                className={`text-[#59687D] font-bold border py-[6px] px-6 rounded-full md:text-base text-sm transition-all ${activeTab === 'smp'
                                    ? 'bg-[#1E8025] border-[#1E8025] text-white'
                                    : 'bg-white border-[#DEDEDE] hover:bg-gray-50'
                                    }`}
                            >
                                SMP
                            </button>
                        </div>

                        <div>
                            {activeTab === 'smp' && (
                                <div className='flex flex-col gap-6 md:pt-[60px] pt-10'>
                                    <SMP />
                                    <Electritiy />
                                </div>
                            )}

                            {activeTab === 'market' && (
                                <div className="flex flex-col gap-6 md:pt-[60px] pt-10">
                                    <Market />
                                    <div className="fle flex-col">
                                        <DashChart />
                                        <RejectionChart />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <InterestPage />
        </div >
    );
}