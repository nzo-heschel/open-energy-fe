"use client";

import { useSMP, exportSMP } from "@/lib/api";
import api from "@/public/images/API.png";
import download from "@/public/images/download_2.png";
import { format, parseISO, subDays } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";
import SMPGraph from "./Graph/SMPGraph";
import TooltipInfo from "./TooltipInfo";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import DateRangePicker from "./ui/DateRangePicker";

const getLast7DaysDateRange = () => {
  const today = new Date();
  return {
    start: format(subDays(today, 6), "yyyy-MM-dd"),
    end: format(today, "yyyy-MM-dd"),
  };
};

const toDateRangePickerValue = (range: {
  start: string;
  end: string;
}): [Date, Date] => [parseISO(range.start), parseISO(range.end)];

const SMP = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>("7 ימים אחרונים");
  const [startEndDate, setStartEndDate] = useState(getLast7DaysDateRange);
  //tooltips
  const [showTooltip, setShowTooltip] = useState(false);
  const {
    data: smpData,
    isLoading,
    error,
  } = useSMP(startEndDate.start, startEndDate.end);

  useEffect(() => {
    if (!smpData?.start_date || !smpData?.end_date) return;
    const { start_date, end_date } = smpData;
    setStartEndDate((prev) => {
      if (prev.start === start_date && prev.end === end_date) return prev;
      return { start: start_date, end: end_date };
    });
  }, [smpData?.start_date, smpData?.end_date]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setStartEndDate({
      start: startDate,
      end: endDate,
    });
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      await exportSMP(startEndDate.start, startEndDate.end);
    } catch (error) {
      console.error("Failed to export SMP data:", error);
    }
  };

  return (
    <div className="flex flex-col md:gap-[30px] gap-5">
      <div className="flex flex-col md:gap-5 gap-3 max-w-[1043px] w-full">
        <h2 className="text-[#276E4E] md:text-[34px] text-2xl font-extrabold">
          SMP
        </h2>
        <p className="text-[#484C56] md:text-xl text-base font-normal">
          מחיר השוק הסיטונאי, SMP, משמש כבסיס לסחר בחשמל בין יצרנים ומספקים במשק. בחלק זה ניתן לראות את השינויים ב-SMP לאורך זמן, אל מול נתוני הביקוש לחשמל.
        </p>
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
                      <path
                        d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z"
                        fill="#A1A1A1"
                      />
                      <path
                        d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z"
                        fill="#A1A1A1"
                      />
                    </g>
                  </svg>

                  {/* Tooltip that appears on hover */}
                  {showTooltip && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                      <TooltipInfo
                        content={
                          <>
                            <p>
                              הגרף מציג את הקשר בין ביקוש החשמל (במגה-ואט) לבין מחיר השוק הסיטונאי (SMP) ב־₪ למגה-ואט־שעה, לאורך ימים נבחרים.
                            </p>
                            <p>
                              הנתונים נלקחים מאתר חברת ניהול מערכת החשמל – נוגה.{" "}
                              <a
                                href="https://www.noga-iso.co.il/trade/smp/"
                                target="_blank"
                                rel="noopener noreferrer"
                                dir="ltr"
                                className="whitespace-nowrap"
                              >
                                https://www.noga-iso.co.il/trade/smp/
                              </a>
                            </p>
                            <p>
                              הנתונים מתעדכנים מעת לעת. בתצוגה יומית או חודשית, ניתן לראות את ממוצע הערכים באותו היום/ חודש (בהתאמה).
                            </p>
                            <p>
                              צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO. התפתחות מחיר השוק הסיטונאי (SMP).
                            </p>
                          </>
                        }
                      />
                    </div>
                  )}
                </div>
                (SMP) התפתחות מחיר השוק הסיטונאי
              </CardTitle>
              <div className="flex items-start md:gap-4 gap-2">
                <a
                  href="/api#energy-smp"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label="View API Documentation"
                >
                  <Image
                    src={api}
                    width={32}
                    height={32}
                    className="w-[32px] h-[32px]"
                    alt="API"
                  />
                </a>
                <button
                  onClick={handleExport}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label="Export to Excel"
                >
                  <Image
                    src={download}
                    width={32}
                    height={32}
                    className="w-[32px] h-[32px]"
                    alt="Download"
                  />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="-mt-4 flex items-center gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">מיון לפי:</span>
              <DateRangePicker
                value={toDateRangePickerValue(startEndDate)}
                onDateRangeChange={handleDateRangeChange}
                onPresetChange={setSelectedPreset}
                defaultPreset="last7Days"
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
            <SMPGraph
              key={`smp-${startEndDate.start}-${startEndDate.end}`}
              data={smpData}
              startDate={startEndDate.start}
              endDate={startEndDate.end}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default SMP;
