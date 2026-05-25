"use client";

import CO2DonutChart from "@/components/Charts/CO2DonutChart";
import CO2EmissionsChart from "@/components/Charts/CO2EmissionsChart";
import CO2LineChart from "@/components/Charts/CO2LineChart";
import InterestPage from "@/components/InterestPage";

export default function Emissions() {

  return (
    <div className="">
      <div className="container mx-auto px-5 md:py-[52px] py-5 md:space-y-[52px] space-y-5 relative w-full overflow-hidden">
        {/* Main Content */}
        <div className="md:space-y-[52px] space-y-8 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:px-[60px] px-6 md:py-[50px] py-6 md:rounded-[40px] rounded-[20px]">
          <div className="">
            <h2 className="md:text-3xl text-2xl font-bold text-[#276E4E]">
              פליטות CO₂
            </h2>
            <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
            <div className="flex flex-col gap-2 max-w-[1043px] w-full md:text-xl text-base">
              <p className="text-[#484C56] max-w-full leading-[120%]">
                ייצור חשמל ממקורות מאובנים גורם לפליטות רבות של גזי חממה, ובראשם CO2. המעבר לאנרגיה מתחדשת צפוי להפחית פליטות גזי חממה, ולמתן את התדרדרות משבר האקלים.
              </p>
            </div>
          </div>

          {/* Charts Grid: Figma line chart 649px, donut 532px → ratio ~1 : 1.22, gap 23px */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.22fr] gap-[23px]">
            <CO2DonutChart />
            <CO2LineChart />
          </div>
          <CO2EmissionsChart />
        </div>

      </div>

      <InterestPage />
    </div>
  );
}
