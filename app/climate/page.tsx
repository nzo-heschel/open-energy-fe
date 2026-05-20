"use client";
import HeatVsProductionChart from "@/components/Charts/HeatVsProductionChart";
import InterestPage from "@/components/InterestPage";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Page = () => {
  const [showMore, setShowMore] = useState(true);

  const handleChange = () => {
    setShowMore(!showMore);
  };
  return (
    <div className="">
      <div className="container mx-auto px-5 md:py-[52px] py-5 md:space-y-[52px] space-y-5 relative w-full overflow-hidden">
        <div className="md:space-y-[52px] space-y-8 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:px-[60px] px-6 md:py-[50px] py-6 md:rounded-[40px] rounded-[20px]">
          <div className="">
            <h2 className="md:text-3xl text-2xl font-bold text-[#276E4E]">
              אקלים
            </h2>
            <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
            <div className="flex flex-col gap-2 max-w-[1043px] w-full md:text-xl text-base">
              <p className="text-[#484C56] max-w-full leading-[120%]">
                האקלים ומזג האוויר משפיעים רבות על הביקוש לחשמל. עם התגברות משבר האקלים אנו צפויים לראות באופן תדיר תופעות כמו גלי חום וקור קיצוניים.
              </p>
              {/* {!showMore && (
                <>
                  <p className="text-[#484C56] max-w-full leading-[120%]">
                    כאן יהיה הסבר. לורם איפסום דולור סיט אמט, קונסקטורר
                    אדיפיסינג אלית הועניב היושבב שערש שמחויט - שלושע ותלברו חשלו
                    שעותלשך וחאית נובש ערששף. זותה מנק הבקיץ אפאח דלאמת יבש.
                  </p>
                  <p className="text-[#484C56] max-w-full leading-[120%]">
                    כאן יהיה הסבר. לורם איפסום דולור סיט אמט, קונסקטורר
                    אדיפיסינג אלית הועניב היושבב שערש שמחויט - שלושע ותלברו חשלו
                    שעותלשך וחאית נובש ערששף. זותה מנק הבקיץ אפאח דלאמת יבש.
                  </p>
                </>
              )} */}
            </div>
            {/* <Button
              variant="link"
              className="text-[#358BFF] mt-2 mr-0 p-0"
              onClick={handleChange}
            >
              {showMore ? <span>קרא עוד…</span> : <span>קרא פחות…</span>}
            </Button> */}
          </div>
          <HeatVsProductionChart />
        </div>
      </div>

      <InterestPage />
    </div>
  );
};

export default Page;
