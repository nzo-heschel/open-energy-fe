'use client';

import Image from "next/image";
import topleft from '@/public/images/Ellipse 89 (1).png'
import frame1 from '@/public/images/Frame 427319914.png'
import frame2 from '@/public/images/Frame 427319914 (1).png'
import frame3 from '@/public/images/Frame 427319914 (2).png'
import logoicon from '@/public/images/logoicon.png'
import logo from '@/public/images/logo.png'



export default function AboutSection() {
  return (
    <div className="">
      <Image src={topleft} width={600} height={600} className='size-[600px] absolute top-0 left-0 z-1' alt='image' />

      {/* Header with geometric background */}
      <div className="relative overflow-hidden min-h-[500px]">
        {/* Geometric shapes */}

        <div className="relative z-10 md:p-12 p-5 flex items-center justify-between min-h-[500px]">
          <div className="max-w-full">
            <h1 className="md:text-5xl text-3xl font-extrabold text-[#484C56]">אודותינו</h1>
            <div className="w-[92px] h-1 bg-[#276E4E] md:my-5 my-3"></div>

            <div className="flex flex-col gap-6">
              {/* Content section with image */}
              <div className="bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-10">
                <div className="flex md:flex-row flex-col items-center md:gap-0 gap-5">
                  <div className="flex flex-col w-full md:gap-5 gap-3 text-right">
                    <h2 className="md:text-[34px] text-2xl font-extrabold text-[#276E4E]">מרכז השל למדיניות</h2>
                    <div className="w-[46px] h-1 bg-[#276E4E] mr-auto"></div>
                    <p className="text-[#484C56] md:text-lg text-sm font-normal">
                      (ע"ר) היא עמותה עם חשיבה פורצת דרך וחדשנית שבאה למצוא פתרונות יצירתיים, פרקטיים ומעוררי השראה להתמודדות עם אתגרי המאה ה-21. אנחנו מקדמים שינוי בחברה הישראלית ובמיוחד עשייה למען האקלים באמצעות יצירת ליבה של ידע מחקרי, תיאורטי ומעשי והנחלתו דרך הכשרות מנהיגות, קורסים למשרתי ציבור ולציבור הרחב, והסברה למקבלי החלטות על מנת ליצור השפעה ושינוי מדיניות.
                    </p>
                    {/* Logo */}
                    <Image src={logoicon} width={75} height={65} className='' alt='logoicon' />
                  </div>
                  {/* Circular image */}
                  <div className="w-full flex justify-end rounded-full">
                    <Image src={frame1} width={350} height={230} className="w-[350px] md:h-[230px] h-[150px] object-cover rounded-full" alt="image" />
                  </div>
                </div>
              </div>

              {/* Content section with image */}
              <div className="bg-transparent md:px-[60px] px-5 md:py-[50px] py-10">
                <div className="flex md:flex-row flex-col items-center md:gap-0 gap-5">
                  {/* Circular image */}
                  <div className="w-full flex justify-start">
                    <Image src={frame2} width={350} height={230} className="w-[350px] md:h-[230px] h-[150px] object-cover rounded-full" alt="image" />
                  </div>
                  <div className="flex flex-col w-full md:gap-5 gap-3 text-right">
                    <h2 className="md:text-[34px] text-2xl font-extrabold text-[#276E4E]">פרויקט NZO </h2>
                    <div className="w-[46px] h-1 bg-[#276E4E] mr-auto"></div>
                    <p className="text-[#484C56] md:text-lg text-sm font-normal">
                      הפרויקט נוסד במטרה לצמצם את פליטות הפחמן של מדינת ישראל, על ידי איפוס הפליטות מהמרכיב הגדול ביותר - ייצור חשמל. זאת באמצעות מעבר למשק חשמל מבוזר, דיגיטלי ומבוסס על אנרגיות מתחדשות. לב הפרויקט נשען על מחקר טכנו-כלכלי מבוסס-נתונים ומודלים אלטרנטיביים למשק החשמל. בנוסף למחקרים, פרויקט NZO מבצע מחקרי שטח, מיפוי וסיוע בהסרת חסמים ועבודה עם מקבלי החלטות. לאתר הפרוייקט.
                    </p>
                    {/* Logo */}
                    <Image src={logo} width={75} height={65} className='' alt='logo' />
                  </div>
                </div>
              </div>

              {/* Content section with image */}
              <div className="bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-10">
                <div className="flex md:flex-row flex-col justify-between items-center md:gap-0 gap-5">
                  <div className="flex flex-col w-full md:gap-5 gap-3 text-right">
                    <h2 className="md:text-[34px] text-2xl font-extrabold text-[#276E4E]">יצירת קשר</h2>
                    <div className="w-[46px] h-1 bg-[#276E4E] mr-auto"></div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#484C56] md:text-lg text-sm font-normal">סעדיה גאון 26 תל אביב</p>
                      <p className="text-[#484C56] md:text-lg text-sm font-normal">טלפון: 03-5608788</p>
                      <p className="text-[#484C56] md:text-lg text-sm font-normal">heschel@heschel.org.il</p>
                    </div>
                  </div>
                  {/* Circular image */}
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