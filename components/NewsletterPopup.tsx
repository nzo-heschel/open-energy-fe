'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

async function trackReason(reason: number) {
  await fetch('/api/newsletter-track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    "פרטי",
    "אקדמי",
    "עיתונאי",
    "עסקי",
    "אחר"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reason =
      selectedInterests.length > 0 ? interests.indexOf(selectedInterests[0]) + 1 : 0;
    if (reason >= 1 && reason <= 5) {
      setIsPending(true);
      try {
        await trackReason(reason);
      } catch {
        /* ignore */
      } finally {
        setIsPending(false);
      }
    }

    sessionStorage.setItem('newsletter-submitted', 'true');
    setIsOpen(false);
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
  };

  return (
    <>
      {/* Popup Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative bg-white border border-[#357A5B] rounded-2xl max-w-[447px] w-full p-[30px] mx-4">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="absolute -top-14 left-0 p-2 w-[44px] h-[44px] bg-white border border-[#357A5B] rounded-xl flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <h3 className='text-[#484C56] text-[28px] md:text-[34px] font-extrabold leading-tight'>
              השימוש באתר חופשי וללא עלות!
            </h3>
            <div className="w-[46px] h-1 bg-[#276E4E] my-4 mr-0"></div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              לאיזה צורך השימוש שלך באתר?:
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Interest areas */}
              <div
                className={`text-right space-y-3 ${isPending ? 'pointer-events-none opacity-60' : ''}`}
              >
                {interests.map((interest) => (
                  <label key={interest} className="flex flex-row-reverse items-center justify-end gap-3 text-gray-700 cursor-pointer">
                    <span className="text-[#59687D] font-medium text-base">{interest}</span>
                    <input
                      type="radio"
                      name="interest"
                      value={interest}
                      disabled={isPending}
                      checked={selectedInterests.includes(interest)}
                      onChange={() => {
                        setSelectedInterests([interest]);
                      }}
                      className="w-5 h-5 text-green-600 border-2 border-[#59687D] focus:ring-green-500 focus:ring-2 rounded-full"
                    />
                  </label>
                ))}

              </div>
              <p className='text-gray-600 text-sm'>אני מאשר/ת לאתר זה להשתמש ב'עוגיות' (Cookies) ובטכנולוגיות דומות כדי לשפר את חווית המשתמש, בהתאם למדיניות הפרטיות.
              </p>
              {/* Submit button */}
              <div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-max bg-[#1E8025] hover:bg-green-700 text-white font-medium py-[10px] px-[30px] rounded-full text-xl font-extrabold disabled:opacity-70"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                      <span>שולח…</span>
                    </span>
                  ) : (
                    'המשך גלישה באתר'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}