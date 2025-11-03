import React from 'react'
import SMPGraph from './Graph/SMPGraph'
import { Button } from './ui/button'
import { ChevronDown, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import Image from 'next/image'
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'

const SMP = () => {
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
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" className="inline-flex items-center">
                                                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
                                                    <g opacity="0.5">
                                                        <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                                                        <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                                                    </g>
                                                </svg>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>מחיר השולי (SMP) הוא המחיר המשתנה של יחידת חשמל אחת בזמן נתון</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                מחיר שוליי על פני זמן SMP
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
                    <SMPGraph />
                </CardContent>
            </Card>
        </div>
    )
}

export default SMP