'use client';

import { Button } from '@/components/ui/button';
import topleft from '@/public/images/Ellipse 89 (1).png';
import mark from '@/public/images/mark.png';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {
      name: '',
      phone: '',
      email: '',
      message: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'יש למלא את השדה המבוקש';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'יש למלא את השדה המבוקש';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'יש למלא את השדה המבוקש';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת דוא"ל לא תקינה';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'יש למלא את השדה המבוקש';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Show congratulatory message
      setIsSubmitted(true);
      // Reset form and errors
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setErrors({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors] && value.trim()) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const getInputClassName = (fieldName: string) => {
    const hasError = errors[fieldName as keyof typeof errors];
    const baseClass = "text-left outline-none placeholder:font-medium placeholder:text-base h-10 w-full !border-b focus:placeholder:text-[#E9C863]";

    if (hasError) {
      return `${baseClass} placeholder:text-[#CEA073] !border-b-[#CEA073]`;
    }
    return `${baseClass} placeholder:text-[#59687D] !border-b-[#59687D]/39`;
  };

  const getTextareaClassName = () => {
    const hasError = errors.message;
    const baseClass = "text-left outline-none placeholder:font-medium placeholder:text-base min-h-[120px] h-[80px] resize-none w-full border-b focus:placeholder:text-[#E9C863]";

    if (hasError) {
      return `${baseClass} placeholder:text-[#CEA073] border-b-[#CEA073]`;
    }
    return `${baseClass} placeholder:text-[#59687D] border-b-[#59687D]/39`;
  };

  return (
    <div className="">
      <Image src={topleft} width={600} height={600} className='size-[600px] absolute top-0 left-0 z-1' alt='image' />

      <div className="container mx-auto px-5 md:py-[52px] py-10 relative w-full overflow-hidden z-10">
        <h1 className="md:text-[45px] text-3xl font-extrabold text-[#484C56] leading-tight">
          יצירת קשר
        </h1>
        <div className="w-[46px] h-1 bg-[#276E4E] md:mt-[18px] mt-3 mr-0"></div>
        <div className="bg-[#FDFBF6] border border-[#DEDEDE]/70 md:rounded-[40px] rounded-[20px] overflow-hidden md:p-10 p-5 md:mt-[30px] mt-5">
          <div className="flex md:flex-row flex-col gap-5 justify-between items-center">
            <div>
              <h2 className="md:text-[34px] text-2xl font-extrabold text-[#484C56] leading-[110%]">
                לא מצאתם מה שחיפשתם?
                <br />
                <span className='text-[#276E4E]'>יש לכם הצעת שיפור?</span>
              </h2>
              <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3 mr-0"></div>
              <p className="text-[#484C56] md:text-lg text-base">
                אתם מוזמנים ליצור איתנו קשר ונענה בהקדם
              </p>
            </div>

            <div className="bg-white rounded-[20px] p-10 border border-[#E9C863] max-w-[516px] w-full">
              {isSubmitted ? (
                <div className="relative flex flex-col md:gap-10 gap-5 items-center justify-center md:h-[450px] h-[200px] text-center">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="absolute -top-6 -left-6 p-1 rounded-full text-[#484C56] hover:bg-[#FDFBF6] hover:text-[#1E8025] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E8025] focus:ring-offset-2"
                    aria-label="סגור"
                  >
                    <X className="w-10 h-10 text-[#C3C3C3]" />
                  </button>
                  <Image src={mark} width={80} height={80} className='w-[80px] h-[80px]' alt='' />
                  <div className="flex flex-col items-center gap-[10px] text-center w-full">
                    <h3 className="md:text-2xl text-lg font-bold text-[#1E8025]">
                      ההודעה נשלחה בהצלחה!
                    </h3>
                    <p className="text-[#484C56] md:text-lg text-base">
                      מישהו מהצוות שלנו ייצור קשר איתך בקרוב.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col md:gap-10 gap-5">
                  <div className="relative">
                    <div className="relative">
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${getInputClassName('name')}`}
                        placeholder="שם"
                      />
                      {!formData.name && (
                        <span className="absolute right-[40px] top-0 h-10 flex items-center text-[#E9C863] pointer-events-none pr-1">*</span>
                      )}
                    </div>
                    {errors.name && (
                      <p className="text-right text-[#CEA073] text-sm mt-1 absolute bottom-[-20px] right-0">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${getInputClassName('email')}`}
                        placeholder="כתובת דוא״ל"
                      />
                      {!formData.email && (
                        <span className="absolute right-[100px] top-0 h-10 flex items-center text-[#E9C863] pointer-events-none pr-1">*</span>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-right text-[#CEA073] text-sm mt-1 absolute bottom-[-20px] right-0">
                        {errors.email}
                      </p>
                    )}
                  </div>


                  <div className="relative">
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${getInputClassName('phone')}`}
                      placeholder="ארגון (אם יש)"
                    />
                    {errors.phone && (
                      <p className="text-right text-[#CEA073] text-sm mt-1 absolute bottom-[-20px] right-0">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`${getTextareaClassName()}`}
                      placeholder="כתבו כאן את תוכן הפנייה"
                    ></textarea>
                    {errors.message && (
                      <p className="text-right text-[#CEA073] text-sm mt-1 absolute bottom-[-20px] right-0">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="max-w-[192px] w-full bg-[#1E8025] text-white rounded-full h-10 text-lg font-extrabold"
                  >
                    שליחה
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}