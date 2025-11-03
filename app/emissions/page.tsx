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
import Electricity from '@/components/Electritiy';
import CO2EmissionsChart from '@/components/Charts/CO2EmissionsChart';
import CO2LineChart from '@/components/Charts/CO2LineChart';
import CO2DonutChart from '@/components/Charts/CO2DonutChart';



export default function Emissions() {
    const [activeTab, setActiveTab] = useState<'market' | 'smp'>();
    const [smpDetails, setSmpDetails] = useState(false)
    const [marketDetails, setMarketDetails] = useState(false)
    const [selectedTimeframe, setSelectedTimeframe] = useState('יומי');
    const [showMore, setShowMore] = useState(true)

    const handleChange = () => {
        setShowMore(!showMore)
    }

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
                <div className="md:space-y-[52px] space-y-8 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:px-[60px] px-6 md:py-[50px] py-6 md:rounded-[40px] rounded-[20px]">
                    <div className="">
                        <h2 className="md:text-3xl text-2xl font-bold text-[#276E4E]">פליטות CO₂</h2>
                        <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
                        <div className="flex flex-col gap-2 max-w-[1043px] w-full md:text-xl text-base">
                            <p className="text-[#484C56] max-w-full leading-[120%]">
                                כאן יהיה הסבר.  לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית הועניב היושבב שערש שמחויט - שלושע ותלברו חשלו שעותלשך וחאית נובש ערששף. זותה מנק הבקיץ אפאח דלאמת יבש.
                            </p>
                            {!showMore && (
                                <>
                                    <p className="text-[#484C56] max-w-full leading-[120%]">
                                        כאן יהיה הסבר.  לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית הועניב היושבב שערש שמחויט - שלושע ותלברו חשלו שעותלשך וחאית נובש ערששף. זותה מנק הבקיץ אפאח דלאמת יבש.
                                    </p>
                                    <p className="text-[#484C56] max-w-full leading-[120%]">
                                        כאן יהיה הסבר.  לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית הועניב היושבב שערש שמחויט - שלושע ותלברו חשלו שעותלשך וחאית נובש ערששף. זותה מנק הבקיץ אפאח דלאמת יבש.
                                    </p>
                                </>
                            )}
                        </div>
                        <Button variant="link" className="text-[#358BFF] mt-2 mr-0 p-0" onClick={handleChange}>
                            {showMore ? (
                                <span>
                                    קרא עוד…
                                </span>
                            ) : (
                                <span>
                                    קרא פחות…
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CO2DonutChart />
                        <CO2LineChart />
                    </div>
                    <CO2EmissionsChart />
                </div>



                {/* <div className="bg-[#FDFBF6] border border-[#E9C863] md:rounded-[40px] rounded-[20px] py-10 px-5 space-y-[30px]"> */}
                {/* </div> */}
            </div>

            <InterestPage />
        </div >
    );
}