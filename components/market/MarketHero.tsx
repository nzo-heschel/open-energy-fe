'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function MarketHero() {
  const [showMore, setShowMore] = useState(false);

  return (
    <section className="text-right mb-12">
      <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--brand-green)' }}>
        משק החשמל בישראל
      </h1>
      <div className="w-16 h-1 mb-8 mr-0" style={{ backgroundColor: 'var(--brand-green)' }}></div>
      
      <div className="max-w-4xl text-lg leading-relaxed mb-6 mr-0" style={{ color: 'var(--color-muted)' }}>
        <p className="mb-4">
          משק החשמל בישראל עובר מהפכה טכנולוגית. המעבר האנרגטי מתבסס על שלושה עמודי תווך: 
          הפחתת מחירות האנרגיה, שיפור יעילות האנרגיה והפחתת פליטות הפחמן. המטרה היא להגיע 
          לאפס נטו פליטות פחמן עד 2050. המעבר כולל הגדלת הספקת החשמל ממקורות מתחדשים 
          כמו אנרגיה סולארית ואנרגיית רוח, ושיפור יעילות האנרגיה בכל המגזרים.
        </p>
        
        {showMore && (
          <p className="mb-4">
            הנתונים המוצגים כאן משקפים את המצב הנוכחי והמגמות העתידיות של משק החשמל בישראל, 
            כולל המטרות הלאומיות להגדלת חלק האנרגיות המתחדשות, מחירי החשמל השוליים, 
            ויעילות השימוש באנרגיה. כל המידע מתעדכן באופן שוטף ומציג את התפתחות המגזר 
            בזמן אמת.
          </p>
        )}
      </div>
      
      <Button 
        variant="link" 
        className="p-0 h-auto font-bold text-blue-600 hover:text-blue-800"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? 'הסתר' : 'קרא עוד...'}
      </Button>
    </section>
  );
}