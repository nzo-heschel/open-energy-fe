"use client"

import React, { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import Image from 'next/image'
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import PrivateConsumersChart from './Charts/PrivateConsumersChart'
import TooltipInfo from './TooltipInfo'
import { startOfYear, endOfYear, format } from 'date-fns'
import { usePrivateSupplierConnectedConsumers, exportPrivateSupplierConnectedConsumers } from '@/lib/api'

const Market = () => {
    //tooltips
    const [showTooltip, setShowTooltip] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>('2025');
    const [segmentType, setSegmentType] = useState<'regulation_type' | 'sector' | 'meter_type' | 'status' | 'rejection_reason'>('regulation_type');
    const [selectedSegment, setSelectedSegment] = useState<string>('');

    // Calculate start and end dates based on selected year
    const startEndDate = useMemo(() => {
        const year = parseInt(selectedYear);
        const start = new Date(year, 0, 1); // January 1st
        const end = new Date(year, 11, 31); // December 31st
        return {
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
        };
    }, [selectedYear]);

    // Fetch private supplier connected consumers data
    const { data: privateConsumersData, isLoading, error } = usePrivateSupplierConnectedConsumers(
        startEndDate.start,
        startEndDate.end
    );

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(event.target.value);
    };

    const handleExport = async () => {
        try {
            await exportPrivateSupplierConnectedConsumers(startEndDate.start, startEndDate.end);
        } catch (error) {
            console.error('Failed to export data:', error);
            // You could add a toast notification here
        }
    };

    return (
        <div className='flex flex-col md:gap-[30px] gap-5'>
            <div className="flex flex-col md:gap-5 gap-3 max-w-[1043px] w-full">
                <h2 className='text-[#276E4E] md:text-[34px] text-2xl font-extrabold'>שוק מספקי חשמל פרטיים</h2>
                <p className='text-[#484C56] md:text-xl text-base font-normal'>בישראל, משק החשמל מתבסס על מגוון מקורות אנרגיה, בהם גז טבעי, אנרגיה סולארית, ופחם. הגרף הראשון מציג את תמהיל ייצור האנרגיה לפי אחוזים מכלל הצריכה, בעוד הגרף השני מספק נתונים עדכניים על ביקוש וייצור החשמל בזמן אמת. יחד, גרפים אלו מספקים תמונת מצב ברורה וחדשנית על מערכת האנרגיה בישראל.</p>
            </div>
            <Card className="bg-white border border-[#E9C863] rounded-2xl">
                <CardHeader>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 justify-between">
                            <CardTitle className="md:text-lg text-base md:text-right text-left flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold">
                                <div className="relative "
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" className="cursor-help" xmlns="http://www.w3.org/2000/svg">
                                        <g opacity="0.5">
                                            <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                            <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                        </g>
                                    </svg>
                                    {showTooltip && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                                            <TooltipInfo
                                                content="נתונים על צרכנים פרטיים המחוברים לספקי חשמל שונים"
                                            />
                                        </div>
                                    )}
                                </div>
                                צרכנים המחוברים לספקי חשמל פרטיים                            </CardTitle>
                            <div className="flex items-start md:gap-4 gap-2">
                                <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                                <button
                                    onClick={handleExport}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    aria-label="Export to Excel"
                                >
                                    <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='export' />
                                </button>
                            </div>
                        </div>
                        {/* <div className="md:text-sm text-xs text-slate-600 mr-[90px]">פרק זמן:</div> */}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="-mt-4 flex items-center gap-4">
                        <div className="flex flex-wrap items-center gap-5">
                            <span className="text-sm text-slate-600 mt-6">מיון לפי:</span>

                            <div className="relative w-[113px]">
                                <label htmlFor="year-selector" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>שנה:</span>
                                    <select
                                        id="year-selector"
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                        <ChevronDown size={14} />
                                    </span>
                                </label>
                            </div>
                            <div className="relative w-[179px]">
                                <label htmlFor="segment-type-selector" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>סוג פילוח:</span>
                                    <select
                                        id="segment-type-selector"
                                        value={segmentType}
                                        onChange={(e) => {
                                            setSegmentType(e.target.value as typeof segmentType);
                                            setSelectedSegment(''); // Reset selected segment when changing type
                                        }}
                                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                    >
                                        <option value="regulation_type">סוג רגולציה</option>
                                        <option value="sector">מגזר</option>
                                        <option value="meter_type">סוג מונה</option>
                                        <option value="status">סטטוס</option>
                                        <option value="rejection_reason">סיבת דחייה</option>
                                    </select>
                                </label>
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                            </div>
                            {privateConsumersData?.segments[segmentType] && privateConsumersData.segments[segmentType].length > 0 && (
                                <div className="relative w-[179px]">
                                    <label htmlFor="segment-selector" className='flex flex-col gap-1'>
                                        <span className='text-sm text-slate-600'>ערך ספציפי:</span>
                                        <select
                                            id="segment-selector"
                                            value={selectedSegment}
                                            onChange={(e) => setSelectedSegment(e.target.value)}
                                            className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                        >
                                            <option value="">הכל</option>
                                            {Array.from(new Set(
                                                privateConsumersData.segments[segmentType].map((item: any) => {
                                                    const key = segmentType === 'regulation_type' ? item.regulation_type :
                                                        segmentType === 'sector' ? item.sector :
                                                            segmentType === 'meter_type' ? item.meter_type :
                                                                segmentType === 'status' ? item.status : item.rejection_reason;
                                                    return key;
                                                })
                                            )).map(key => {
                                                // Hebrew labels mapping
                                                const labelMap: Record<string, Record<string, string>> = {
                                                    sector: {
                                                        residential: 'ביתי',
                                                        non_residential: 'לא ביתי',
                                                    },
                                                    regulation_type: {
                                                        competitive_supply: 'אספקה תחרותית',
                                                        existing_regulation: 'רגולציה קיימת',
                                                    },
                                                    meter_type: {
                                                        basic: 'בסיסי',
                                                        smart: 'חכם',
                                                    },
                                                };

                                                const label = labelMap[segmentType]?.[key] || key;
                                                return (
                                                    <option key={key} value={key}>{label}</option>
                                                );
                                            })}
                                        </select>
                                    </label>
                                    <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                        <ChevronDown size={14} />
                                    </span>
                                </div>
                            )}

                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <p className="text-slate-600">טוען נתונים...</p>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <p className="text-red-600">שגיאה בטעינת הנתונים</p>
                        </div>
                    ) : (
                        <PrivateConsumersChart
                            data={privateConsumersData}
                            segmentType={segmentType}
                            selectedSegment={selectedSegment || undefined}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default Market