'use client';

import topleft from '@/public/images/Ellipse 89 (1).png';
import frame1 from '@/public/images/heshel_logo.png';
import frame3 from '@/public/images/Frame 427319914 (2).png';
import frame2 from '@/public/images/nzo_logo.png';
import logo from '@/public/images/logo.png';
import logoicon from '@/public/images/logoicon.png';
import Image from "next/image";



export default function AboutSection() {
  return (
    <div className="">
      <Image src={topleft} width={600} height={600} className='size-[600px] absolute top-0 left-0 z-1' alt='image' />

      <div className="relative overflow-hidden min-h-[500px]">


        <div className="relative z-10 md:p-12 p-5 flex items-center justify-between min-h-[500px]">
          <div className="max-w-full">
            <h1 className="md:text-5xl text-3xl font-extrabold text-[#484C56]">אודותינו</h1>
            <div className="w-[92px] h-1 bg-[#276E4E] md:my-5 my-3"></div>

            <div className="flex flex-col gap-6">
              <div className="bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-10">
                <div className="flex md:flex-row flex-col items-center md:gap-0 gap-5">
                  <div className="flex flex-col w-full md:gap-5 gap-3 text-right">
                    <h2 className="md:text-[34px] text-2xl font-extrabold text-[#276E4E]">
                      <a href="http://www.nzo.org.il" target="_blank" rel="noopener noreferrer" className="hover:underline">פרויקט NZO</a>
                    </h2>
                    <div className="w-[46px] h-1 bg-[#276E4E] mr-auto"></div>
                    <p className="text-[#484C56] md:text-lg text-sm font-normal">
                      פרויקט NZO (שמשמעותו Net ZerO Emissions) נוסד במטרה לצמצם את פליטות הפחמן של מדינת ישראל, על ידי איפוס הפליטות מהמרכיב הגדול ביותר - ייצור חשמל. הפרויקט פועל החל משנת 2019 להאצת המעבר של מדינת ישראל למשק מבוסס אנרגיה מתחדשת, באמצעות מחקר, מודלים מבוססי נתונים ומעורבות בשיח ובמדיניות הממשלתית.
                      <br />
                      <a href="http://www.nzo.org.il" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">www.NZO.org.il</a>
                    </p>

                  </div>
                  <div className="w-full flex justify-end rounded-full">
                    <Image src={frame2} width={350} height={230} className="w-[350px] object-contain md:h-[230px] rounded-full" alt="image" />

                  </div>
                </div>
              </div>

              <div className="bg-transparent md:px-[60px] px-5 md:py-[50px] py-10">
                <div className="flex md:flex-row flex-col items-center md:gap-0 gap-5">
                  <div className="w-full flex justify-start">
                    <Image src={frame1} width={350} height={230} className="w-[350px] object-contain md:h-[230px]" alt="image" />
                  </div>
                  <div className="flex flex-col w-full md:gap-5 gap-3 text-right">
                    <h2 className="md:text-[34px] text-2xl font-extrabold text-[#276E4E]">
                      <a href="http://www.heschel.org.il/" target="_blank" rel="noopener noreferrer" className="hover:underline">מרכז השל לקיימות</a>
                    </h2>
                    <div className="w-[46px] h-1 bg-[#276E4E] mr-auto"></div>
                    <p className="text-[#484C56] md:text-lg text-sm font-normal">
                      מרכז השל לקיימות (ע"ר) מפתח ומיישם את חזון הקיימות: חברה צודקת ומלוכדת, כלכלה חסונה ודמוקרטית, וסביבה יצרנית ובריאה לכל תושביה. המרכז מחבר בין ידע רעיוני לידע מעשי, מפיץ את סיפור הקיימות בדרכים יצירתיות, ומסייע לסוכני שינוי מכל המגזרים לקדם תהליכי שינוי משמעותיים בישראל.
                      <br />
                      <a href="http://www.heschel.org.il/" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">www.Heschel.org.il</a>

                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-10">
                <div className="flex md:flex-row flex-col justify-between items-center md:gap-0 gap-5">
                  <div className="flex flex-col w-full md:gap-5 gap-3 text-right">
                    <h2 className="md:text-[34px] text-2xl font-extrabold text-[#276E4E]">יצירת קשר</h2>
                    <div className="w-[46px] h-1 bg-[#276E4E] mr-auto"></div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#484C56] md:text-lg text-sm font-normal">סעדיה גאון 26 תל אביב</p>
                      <p className="text-[#484C56] md:text-lg text-sm font-normal">טלפון: 077-3448514</p>
                      <p className="text-[#484C56] md:text-lg text-sm font-normal"><a href="mailto:Nufar@Heschel.org.il" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">Nufar@Heschel.org.il</a>
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex justify-end rounded-full">
                    <Image src={frame3} width={350} height={230} className="w-[350px] md:h-[230px] h-[150px] object-cover rounded-full" alt="image" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}