'use client'

import React, { useState } from 'react'
import SMPGraph from './Graph/SMPGraph'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import Image from 'next/image'
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import { useSMP } from '@/lib/api'
import DateRangePicker from './ui/DateRangePicker'
import { startOfYear, endOfYear, format } from 'date-fns'
import TooltipInfo from './TooltipInfo'

const SMP = () => {
    const [selectedPreset, setSelectedPreset] = useState<string>('שנה זו');
    const [startEndDate, setStartEndDate] = useState(() => {
        const today = new Date();
        return {
            start: format(startOfYear(today), 'yyyy-MM-dd'),
            end: format(endOfYear(today), 'yyyy-MM-dd')
        };
    });
    //tooltips
    const [showTooltip, setShowTooltip] = useState(false);
    const { data: smpData, isLoading, error } = useSMP(startEndDate.start, startEndDate.end);

    const handleDateRangeChange = (startDate: string, endDate: string) => {
        setStartEndDate({
            start: startDate,
            end: endDate
        });
    };

    return (
        <div className='flex flex-col md:gap-[30px] gap-5'>
            <div className="flex flex-col md:gap-5 gap-3 max-w-[1043px] w-full">
                <h2 className='text-[#276E4E] md:text-[34px] text-2xl font-extrabold'>SMP</h2>
                <p className='text-[#484C56] md:text-xl text-base font-normal'>בישראל, משק החשמל מתבסס על מגוון מקורות אנרגיה, בהם גז טבעי, אנרגיה סולארית, ופחם. הגרף הראשון מציג את תמהיל ייצור האנרגיה לפי אחוזים מכלל הצריכה, בעוד הגרף השני מספק נתונים עדכניים על ביקוש וייצור החשמל בזמן אמת. יחד, גרפים אלו מספקים תמונת מצב ברורה וחדשנית על מערכת האנרגיה בישראל.</p>
            </div>
            <Card className="bg-white border border-[#E9C863] rounded-2xl">
                <CardHeader>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 justify-between">
                            <CardTitle className="md:text-lg text-base md:text-right text-left flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold">
                                <div
                                    className="relative"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <svg
                                        width="21"
                                        height="21"
                                        viewBox="0 0 21 21"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="cursor-help"
                                    >
                                        <g opacity="0.5">
                                            <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                            <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                        </g>
                                    </svg>

                                    {/* Tooltip that appears on hover */}
                                    {showTooltip && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                                            <TooltipInfo
                                                content="Lorem ipsum"
                                            />
                                        </div>
                                    )}
                                </div>

                                מחיר שולי על פני זמן SMP
                            </CardTitle>
                            <div className="flex items-start md:gap-4 gap-2">
                                <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                                <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                            </div>
                        </div>
                        <div className="md:text-sm text-xs text-slate-600 mr-[90px]">
                            פרק זמן: {selectedPreset || 'שנה זו'}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="-mt-4 flex items-center gap-4 flex-wrap mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">מיון לפי:</span>
                            <DateRangePicker
                                onDateRangeChange={handleDateRangeChange}
                                onPresetChange={setSelectedPreset}
                                defaultPreset="thisYear"
                            />
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
                    ) : smpData ? (
                        <SMPGraph data={smpData} startDate={startEndDate.start} endDate={startEndDate.end} />
                    ) : null}
                </CardContent>
            </Card>
        </div>
    )
}

export default SMP