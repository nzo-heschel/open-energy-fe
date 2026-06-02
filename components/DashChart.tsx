import React, { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import Image from 'next/image'
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import DashboardCharts from './Charts/DashboardChart'
import TooltipInfo from './TooltipInfo'
import { useSwitchingRequests, exportSwitchingRequests, buildExportDateRangeSuffix } from '@/lib/api'
import YearMultiSelectDropdown from './ui/YearMultiSelectDropdown'

const DashChart = () => {
    //tooltips
    const [showTooltip, setShowTooltip] = useState(false);
    const [customerType, setCustomerType] = useState<'residential' | 'non_residential' | undefined>(undefined);
    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [selectedRegulationType, setSelectedRegulationType] = useState<string>('all');

    // Fetch switching requests data to get available years
    // First fetch without year filter to get available years
    const { data: switchingData } = useSwitchingRequests(customerType);

    const yearOptions = useMemo(
        () =>
            (switchingData?.available_years ?? [])
                .map(String)
                .sort((a, b) => Number(b) - Number(a)),
        [switchingData?.available_years],
    );

    const apiYears = useMemo(() => {
        if (selectedYears.length === 0 || selectedYears.length === yearOptions.length) {
            return undefined;
        }
        return selectedYears;
    }, [selectedYears, yearOptions]);

    // Get available years from API response, default to empty array
    const availableYears = switchingData?.available_years ?? [];

    // Fetch data with selected years filter
    const { data: filteredData } = useSwitchingRequests(
        customerType,
        apiYears
    );

    // Use filtered data if year(s) selected, otherwise use all data
    // Note: regulation_type filtering is done client-side in the chart component
    const chartData = apiYears && filteredData ? filteredData : switchingData;

    const handleExport = async () => {
        try {
            const exportYears = apiYears ?? (selectedYears.length > 0 ? selectedYears : yearOptions);
            const dateRange = buildExportDateRangeSuffix({
                year: exportYears.length === 1 ? exportYears[0] : undefined,
                years: exportYears.length > 1 ? exportYears : undefined,
                fallbackStartYear: switchingData?.start_year,
                fallbackEndYear: availableYears.length
                    ? Math.max(...availableYears)
                    : undefined,
            });
            await exportSwitchingRequests(exportYears.length > 0 ? exportYears : undefined, customerType, dateRange);
        } catch (error) {
            console.error('Failed to export data:', error);
            // You could add a toast notification here
        }
    };

    return (
        <div className='flex flex-col md:gap-[30px] gap-5'>

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
                                                content={
                                                    <>
                                                        <p>
                                                            הנתונים נלקחים מאתר רשות החשמל.{" "}
                                                            <a
                                                                href="https://www.gov.il/he/pages/bi_olam_haspaka"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="whitespace-nowrap"
                                                            >
                                                                https://www.gov.il/he/pages/bi_olam_haspaka
                                                            </a>
                                                        </p>
                                                        <p>הנתונים מתעדכנים מעת לעת.</p>
                                                        <p>
                                                            צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. סטטוס בקשות ניוד.
                                                        </p>
                                                        <p className="font-semibold text-[#484C56] pt-1">
                                                            הערות כלליות:
                                                        </p>
                                                        <p>
                                                            המידע מבוסס על נתונים המועברים על ידי מנהל המערכת לרשות החשמל, והם יתעדכנו באופן שוטף.
                                                        </p>
                                                        <p>
                                                            הנתונים מתייחסים למספר המונים ולא למספר הצרכנים, כלומר במקרה בו יש מספר מונים עבור צרכן אחד, כל המונים נספרים במספר המונים הכולל.
                                                        </p>
                                                        <p>
                                                            הסקטורים סווגו על ידי הרשות, על בסיס תיאור הפעילות שהועבר מנוגה. סיווג הסקטורים אינו בהכרח תואם את סיווג הסקטורים כפי שמופיעים בדיווחים אחרים של הרשות או בדיווחים אחרים של חברת החשמל וחברת נוגה.
                                                        </p>
                                                        <p>גודל חיבור הינו במונחי GVA.</p>
                                                        <p>
                                                            במקרה של סתירה בין סוג הצרכן (&quot;לא ביתי&quot;) והסקטור (&quot;משקי בית&quot;) הרשות סיווגה את המונה לפי גודל החיבור.
                                                        </p>
                                                        <p>חדרי מדרגות נכללים כצרכנים &quot;לא ביתיים&quot;.</p>
                                                    </>
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                                סטטוס בקשות ניוד
                            </CardTitle>
                            <div className="flex items-start md:gap-4 gap-2">
                                <a
                                    href="/api#switching-requests"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    aria-label="View API Documentation"
                                >
                                    <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='API' />
                                </a>
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
                        <div className="flex items-center gap-5">
                            <span className="text-sm text-slate-600 mt-6">סינון לפי:</span>

                            <div className="relative w-[113px] year-filter-dropdown">
                                <label htmlFor="" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>שנה:</span>
                                    <YearMultiSelectDropdown
                                        selectedYears={selectedYears}
                                        onChange={setSelectedYears}
                                        options={yearOptions}
                                        isOpen={isYearDropdownOpen}
                                        setIsOpen={setIsYearDropdownOpen}
                                    />
                                </label>
                            </div>
                            <div className="relative w-[179px]">
                                <label htmlFor="regulation-type-selector" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>סוג מספק:</span>
                                    <select
                                        id="regulation-type-selector"
                                        value={selectedRegulationType}
                                        onChange={(e) => setSelectedRegulationType(e.target.value)}
                                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                    >
                                        <option value="all">הכל</option>
                                        <option value="virtual_suppliers">מספקים וירטואליים</option>
                                        <option value="suppliers_with_generation">מספקים עם אמצעי ייצור</option>
                                    </select>
                                </label>
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                            </div>
                            <div className="relative w-[179px]">
                                <label htmlFor="customer-type-selector" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>ביתי / לא ביתי:</span>
                                    <select
                                        id="customer-type-selector"
                                        value={customerType || 'all'}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setCustomerType(value === 'all' ? undefined : value as 'residential' | 'non_residential');
                                        }}
                                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                    >
                                        <option value="all">הכל</option>
                                        <option value="residential">ביתי</option>
                                        <option value="non_residential">לא ביתי</option>
                                    </select>
                                </label>
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                            </div>

                        </div>
                    </div>
                    <DashboardCharts
                        customerType={customerType}
                        data={chartData}
                        regulationType={selectedRegulationType}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default DashChart