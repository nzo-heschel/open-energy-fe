'use client'
import React, { useState } from 'react'
import ProductionTable from './Table/ProductionTable'
import ProductionDistrictPieChart from './Charts/ProductionDistrictPieChart'
import SolarDashboard from './SolarDashboard'


const CommunityDisplay = () => {
    const [activeTab, setActiveTab] = useState<'tab' | 'tab'>();
    const [smpDetails, setSmpDetails] = useState(false)

    const handleTab = (() => {
        setSmpDetails(!smpDetails)
        setActiveTab('tab');
    })

    return (
        <div>
            <div className="md:px-[60px] px-5 pb-[52px]">
                <h2 className='text-[#276E4E] text-[34px] font-extrabold'>תצוגה יישובית</h2>
                <label htmlFor='' className='text-[#484C56] text-base font-medium flex items-center gap-4'>שם היישוב:
                    <div className="flex items-center gap-2 rounded-full px-4 pl-3 py-2 border border-[#C3C3C3] w-[200px] transition-all duration-300 hover:border-gray-300" style={{ backgroundColor: '#ffffff' }}>
                        <input
                            type="text"
                            placeholder="תל אביב"
                            className="bg-transparent border-none text-sm focus:outline-none transition-colors duration-200 w-full"
                        />
                        <div className="w-[18px] flex items-center justify-center transition-transform duration-200 hover:scale-110">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.75 15.75L12.4875 12.4875M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z" stroke="#C3C3C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </label>
            </div>
            <div className="min-h-screen bg-[#FDFBF6] border border-[#DEDEDE]/70 md:rounded-[40px] rounded-[20px] md:px-[60px] px-5 md:py-[50px] py-5 flex flex-col">
                <SolarDashboard />

                <div className="flex flex-col gap-2 my-[52px]">
                    <h2 className='text-[#276E4E] text-xl font-extrabold'>נתונים נוספים:</h2>
                    <button
                        onClick={handleTab}
                        className={`text-[#59687D] font-bold border w-max py-[6px] px-6 rounded-full md:text-base text-sm transition-all ${activeTab === 'tab'
                            ? 'bg-[#1E8025] border-[#1E8025] text-white'
                            : 'bg-white border-[#DEDEDE] hover:bg-gray-50'
                            }`}
                    >
                        פוטנציאל ייצור בחלוקה למחוזות
                    </button>
                </div>

                {activeTab === 'tab' && (
                    <div className="flex flex-col gap-16">
                        <ProductionTable />
                        <ProductionDistrictPieChart />
                    </div>
                )}
            </div>
        </div>
    )
}

export default CommunityDisplay