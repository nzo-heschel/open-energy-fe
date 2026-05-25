import { exportSwitchingRequests, useSwitchingRequests, buildExportDateRangeSuffix } from '@/lib/api'
import api from '@/public/images/API.png'
import download from '@/public/images/download_2.png'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import RejectionReasonsCharts from './Charts/RejectionReasonsCharts'
import TooltipInfo from './TooltipInfo'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const RejectionChart = () => {
    //tooltips
    const [showTooltip, setShowTooltip] = useState(false);

    // State for filters
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [customerType, setCustomerType] = useState<'residential' | 'non_residential' | undefined>(undefined);
    const [selectedRegulationType, setSelectedRegulationType] = useState<string>('all');
    const [selectedRejectionReasons, setSelectedRejectionReasons] = useState<string[]>(['missing_power_of_attorney', 'meter_issues', 'request_form_issues', 'other']);
    const [showRejectionReasonDropdown, setShowRejectionReasonDropdown] = useState(false);

    // All available rejection reasons
    const allRejectionReasons = [
        { value: 'missing_power_of_attorney', label: 'ייפוי כח חסר' },
        { value: 'meter_issues', label: "בעיות במונה" },
        { value: 'request_form_issues', label: 'בעיות במילוי הבקשה' },
        { value: 'other', label: 'אחר' },
    ];

    // Get display text for rejection reason filter
    const getRejectionReasonDisplayText = () => {
        if (selectedRejectionReasons.length === 0) {
            return 'הכל';
        }
        if (selectedRejectionReasons.length === allRejectionReasons.length) {
            return 'הכל';
        }
        if (selectedRejectionReasons.length === 1) {
            const selected = allRejectionReasons.find(r => r.value === selectedRejectionReasons[0]);
            return selected?.label || 'הכל';
        }
        return 'בחירה מרובה';
    };

    // Handle rejection reason toggle
    const toggleRejectionReason = (reason: string) => {
        setSelectedRejectionReasons(prev => {
            if (prev.includes(reason)) {
                const newSelection = prev.filter(r => r !== reason);
                return newSelection.length > 0 ? newSelection : [reason]; // Keep at least one selected
            } else {
                return [...prev, reason];
            }
        });
    };

    // Fetch data to get available years (without filters initially)
    const { data: initialData } = useSwitchingRequests();

    // Set default to last year when data is available
    useEffect(() => {
        if (initialData?.available_years && initialData.available_years.length > 0 && selectedYear === 'all') {
            const lastYear = Math.max(...initialData.available_years).toString();
            setSelectedYear(lastYear);
        }
    }, [initialData?.available_years, selectedYear]);

    // Fetch data with filters
    const { data: switchingData } = useSwitchingRequests(
        customerType,
        selectedYear !== 'all' ? selectedYear : undefined
    );

    // Handle export
    const availableYears = initialData?.available_years ?? switchingData?.available_years ?? [];

    const handleExport = async () => {
        try {
            const year = selectedYear !== 'all' ? selectedYear : undefined;
            const dateRange = buildExportDateRangeSuffix({
                year,
                years: year ? undefined : availableYears.map(String),
                fallbackStartYear: initialData?.start_year ?? switchingData?.start_year,
                fallbackEndYear: availableYears.length
                    ? Math.max(...availableYears)
                    : undefined,
            });
            await exportSwitchingRequests(year, customerType, dateRange);
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    };
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.rejection-reason-dropdown')) {
                setShowRejectionReasonDropdown(false);
            }
        };
        if (showRejectionReasonDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRejectionReasonDropdown]);

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
                                                            צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. בקשות ניוד- סיבות דחיה.
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
                                בקשות ניוד - סיבות דחיה
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
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="-mt-4 flex items-center gap-4">
                        <div className="flex flex-wrap items-center gap-5">
                            <span className="text-sm text-slate-600 mt-6">סינון לפי:</span>

                            <div className="relative w-[113px]">
                                <label htmlFor="" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>שנה:</span>
                                    <select
                                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        {switchingData?.available_years?.map((year) => (
                                            <option key={year} value={year.toString()}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                        <ChevronDown size={14} />
                                    </span>
                                </label>
                            </div>
                            <div className="relative w-[179px]">
                                <label htmlFor="" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>סוג מספק:</span>
                                    <select
                                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                        value={selectedRegulationType}
                                        onChange={(e) => setSelectedRegulationType(e.target.value)}
                                    >
                                        <option value="all">הכל</option>
                                        <option value="virtual_suppliers">מספקים וירטואליים</option>
                                        <option value="suppliers_with_generation">מספקים עם אמצעי ייצור</option>
                                    </select>
                                </label>
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                                {/* Custom dropdown arrow */}
                            </div>
                            <div className="relative w-[179px]">
                                <label htmlFor="" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>ביתי / לא ביתי:</span>
                                    <select
                                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                                        value={customerType || 'all'}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setCustomerType(value === 'all' ? undefined : value as 'residential' | 'non_residential');
                                        }}
                                    >
                                        <option value="all">הכל</option>
                                        <option value="residential">ביתי</option>
                                        <option value="non_residential">לא ביתי</option>
                                    </select>
                                </label>
                                <span className="pointer-events-none absolute left-3 top-[40px] -translate-y-1/2 text-black text-xs">
                                    <ChevronDown size={14} />
                                </span>
                                {/* Custom dropdown arrow */}
                            </div>
                            <div className="relative w-[179px]">
                                <label htmlFor="" className='flex flex-col gap-1'>
                                    <span className='text-sm text-slate-600'>
                                        סיבת דחיה:
                                    </span>
                                    <div className="relative rejection-reason-dropdown">
                                        <button
                                            type="button"
                                            className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6 text-right flex items-center justify-between"
                                            onClick={() => setShowRejectionReasonDropdown(!showRejectionReasonDropdown)}
                                        >
                                            <span className="text-black text-xs">{getRejectionReasonDisplayText()}</span>
                                            <ChevronDown size={14} className="text-black" />
                                        </button>
                                        {showRejectionReasonDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                                {allRejectionReasons.map((reason) => (
                                                    <label
                                                        key={reason.value}
                                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRejectionReasons.includes(reason.value)}
                                                            onChange={() => toggleRejectionReason(reason.value)}
                                                            className="cursor-pointer"
                                                        />
                                                        <span className="text-xs text-gray-700">{reason.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>

                        </div>
                    </div>
                    <RejectionReasonsCharts
                        data={switchingData}
                        customerType={customerType}
                        year={selectedYear !== 'all' ? selectedYear : undefined}
                        regulationType={selectedRegulationType}
                        rejectionReasons={selectedRejectionReasons}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default RejectionChart