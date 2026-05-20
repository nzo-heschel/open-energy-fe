import RenewableChart from "@/components/Charts/RenewableChart";
import RenewableChart2 from "@/components/Charts/RenewableChart2";
import InterestPage from "@/components/InterestPage";

const page = () => {
  return (
    <div className="">
      <div className="container mx-auto px-5 md:py-[52px] py-5 md:space-y-[52px] space-y-5 relative w-full overflow-hidden">
        {/* Main Content */}
        <div className="md:space-y-[52px] space-y-8 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:px-[60px] px-6 md:py-[50px] py-6 md:rounded-[40px] rounded-[20px]">
          <div className="">
            <h2 className="md:text-3xl text-2xl font-bold text-[#276E4E]">
              יעדי אנרגיה מתחדשת{" "}
            </h2>
            <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
            <div className="flex flex-col gap-2 w-full md:text-xl text-base">
              <p className="text-[#484C56] max-w-full leading-[120%]">
                החלטת ממשלה 465 קובעת יעד לייצור חשמל ממקורות מתחדשים של 20% בשנת 2025, ו-30% בשנת 2030. אנו ב-NZO מציבים יעדים שאפנתיים יותר. בגרף ניתן לראות יעדים אלו לעומת שיעור המתחדשות בפועל              </p>
            </div>
          </div>
          <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] py-10 px-5 space-y-[30px]">
            <RenewableChart />
          </div>
        </div>
        <div className="md:space-y-[52px] space-y-8 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:px-[60px] px-6 md:py-[50px] py-6 md:rounded-[40px] rounded-[20px]">
          <div className="">
            <h2 className="md:text-3xl text-2xl font-bold text-[#276E4E]">
              השוואה למדינות אחרות בעולם
            </h2>

            <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
            <div className="flex flex-col gap-2 w-full md:text-xl text-base">
              <p className="text-[#484C56] max-w-full leading-[120%]">
                מדינות רבות הציבו יעדים למעבר לאנרגיה מתחדשת. מגוון מקורות
                האנרגיה המתחדשים והנקיים משתנה בין המדינות. בחלק זה ניתן לראות
                את התקדמות
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#E9C863] md:rounded-[40px] rounded-[20px] py-10 px-5 space-y-[30px]">
            <RenewableChart2 />
          </div>
        </div>

        {/* Bottom Section - Additional Data Links */}
      </div>

      <InterestPage />
    </div>
  );
};

export default page;
