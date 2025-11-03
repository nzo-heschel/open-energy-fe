import './globals.css';
import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import ClientProvider from '@/components/ClientProvider';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'פלטפורמת נתוני אנרגיה פתוחה - NZO',
  description: 'פלטפורמה ציבורית לחקר וניתוח נתוני אנרגיה ופליטות בישראל',
  keywords: 'אנרגיה, פליטות, CO2, אנרגיה מתחדשת, ישראל, נתונים',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} ${heebo.variable}`}>
        <ClientProvider>
          <Header />
          {children}
          <Footer />
        </ClientProvider>
      </body>
    </html>
  );
}