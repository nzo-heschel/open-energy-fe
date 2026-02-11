'use client';

import AboutSection from '@/components/Sections/AboutSection';
import ApiSection from '@/components/Sections/ApiSection';
import ContactSection from '@/components/Sections/ContactSection';
import DataSourcesSection from '@/components/Sections/DataSourcesSection';
import HomePage from '@/components/Sections/HomePage';
import RenewableEnergySection from '@/components/Sections/RenewableEnergySection';
import RenewableTargetsSection from '@/components/Sections/RenewableTargetsSection';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    if (section === 'market') {
      router.push('/market');
    } else {
      setActiveSection(section);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      case 'renewable':
        return <RenewableEnergySection />;
      case 'efficiency':
        return <RenewableEnergySection />;
      case 'co2':
        return <RenewableEnergySection />;
      case 'targets':
        return <RenewableTargetsSection />;
      case 'electric':
        return <RenewableEnergySection />;
      case 'api':
        return <ApiSection />;
      case 'data-sources':
        return <DataSourcesSection />;
      case 'about':
        return <AboutSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <HomePage />
    </div>
  );
}