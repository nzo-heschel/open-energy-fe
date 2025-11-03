'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Mail } from 'lucide-react';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    'לצורך עבודה בתחום עסקי',
    'לצרכים משפחתיים',
    'לצורך מחקר אקדמיים',
    'לצורך מדיה (עיתונות)',
    'לצורך פרטי'
  ];

  useEffect(() => {
    // Check if user has already submitted the form
    const hasSubmitted = sessionStorage.getItem('newsletter-submitted');

    if (!hasSubmitted) {
      // Show popup after 1 second (for testing, change to 10000 for 10 seconds)
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save in session that user has submitted the form
    sessionStorage.setItem('newsletter-submitted', 'true');

    // Add logic here to send data to server
    console.log('Newsletter subscription:', { interests: selectedInterests });

    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button at the Top */}
      {/* <div className="fixed top-4 right-4 z-[500000]">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-full flex items-center"
        >
          <Mail className="w-4 h-4 ml-2" />
          הצגת הטופס
        </Button>
      </div> */}

      {/* Popup Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative bg-white border border-[#357A5B] rounded-2xl max-w-[447px] w-full p-[30px] mx-4">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute -top-14 left-0 p-2 w-[44px] h-[44px] bg-white border border-[#357A5B] rounded-xl flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <h3 className='text-[#484C56] text-[28px] md:text-[34px] font-extrabold leading-tight'>
              האתר חופשי לשימושך באופן מלא!
            </h3>
            <div className="w-[46px] h-1 bg-[#276E4E] my-4 mr-0"></div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              לצורך שיפור חוויית השימוש באתר, נשמח לדעת
              האם השימוש באתר הינו:
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Interest areas */}
              <div className="text-right space-y-3">
                {interests.map((interest) => (
                  <label key={interest} className="flex flex-row-reverse items-center justify-end gap-3 text-gray-700 cursor-pointer">
                    <span className="text-[#59687D] font-medium text-base">{interest}</span>
                    <input
                      type="radio"
                      name="interest"
                      value={interest}
                      checked={selectedInterests.includes(interest)}
                      onChange={() => {
                        setSelectedInterests([interest]);
                      }}
                      className="w-5 h-5 text-green-600 border-2 border-[#59687D] focus:ring-green-500 focus:ring-2 rounded-full"
                    />
                  </label>
                ))}
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-max bg-[#1E8025] hover:bg-green-700 text-white font-medium py-[10px] px-[30px] rounded-full text-xl font-extrabold"
                >
                  המשך גלישה באתר
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}