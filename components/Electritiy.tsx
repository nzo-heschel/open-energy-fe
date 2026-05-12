"use client";

import {
  useSMPProductionVsMarginalPrice,
  exportSMPProductionVsMarginalPrice,
} from "@/lib/api";
import api from "@/public/images/API.png";
import download from "@/public/images/download_2.png";
import { endOfYear, format, startOfYear } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import ElectricityGraphWithTabs from "./Graph/ElectricityGraph";
import TooltipInfo from "./TooltipInfo";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import DateRangePicker from "./ui/DateRangePicker";

const Electricity = () => {
  //tooltips
  const [showTooltip, setShowTooltip] = useState(false);

  const [selectedPreset, setSelectedPreset] = useState<string>("שנה זו");
  const [startEndDate, setStartEndDate] = useState(() => {
    const today = new Date();
    return {
      start: format(startOfYear(today), "yyyy-MM-dd"),
      end: format(endOfYear(today), "yyyy-MM-dd"),
    };
  });

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setStartEndDate({
      start: startDate,
      end: endDate,
    });
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      await exportSMPProductionVsMarginalPrice(
        startEndDate.start,
        startEndDate.end,
      );
    } catch (error) {
      console.error(
        "Failed to export SMP production vs marginal price data:",
        error,
      );
    }
  };

  // Fetch SMP production vs marginal price data
  const {
    data: smpProductionData,
    isLoading,
    error,
  } = useSMPProductionVsMarginalPrice(startEndDate.start, startEndDate.end);

  return (
    <div className="flex flex-col md:gap-[30px] gap-5">
      <Card className="bg-white border border-[#E9C863] rounded-2xl">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <CardTitle className="md:text-lg text-base md:text-right flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold p-0 text-left">
                <div
                  className="relative "
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                    className="cursor-help"
                    xmlns="http://www.w3.org/2000/svg"
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
                  {showTooltip && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 z-50">
                      <TooltipInfo content="Lorem ipsum" />
                    </div>
                  )}
                </div>
                מחיר השוק הסיטונאי (SMP) מול הביקוש לחשמל
              </CardTitle>
              <div className="flex items-start md:gap-4 gap-2">
                <a
                  href="/api#energy-smp-production-vs-marginal-price"
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
          <div className="-mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">מיון לפי:</span>
              <DateRangePicker
                onDateRangeChange={handleDateRangeChange}
                onPresetChange={setSelectedPreset}
                defaultPreset="last7Days"
              />
            </div>
          </div>
          <ElectricityGraphWithTabs
            data={smpProductionData}
            isLoading={isLoading}
            error={error}
            startDate={startEndDate.start}
            endDate={startEndDate.end}
            selectedPreset={selectedPreset}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Electricity;
