'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { id: 'about', label: 'אודותינו' },
  { id: 'contact', label: 'צור קשר' },
  { id: 'api', label: 'API' }
];
const otherNavItems = [
  { id: 'predictions', label: 'תחזיות והשוואות' },
  { id: 'climate', label: 'אקלים' },
  { id: 'emissions', label: 'פליטות CO2' },
  { id: 'renewable-energy', label: 'אנרגיות מתחדשות' },
  { id: '#electricity-sector', label: 'משק החשמל' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check if current page is homepage
  useEffect(() => {
    setIsHomepage(pathname === '/');
  }, [pathname]);

  // Scroll detection with throttling - only on homepage
  useEffect(() => {
    if (!isHomepage) {
      // On other pages, always show the expanded section
      setIsScrolled(true);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          setIsScrolled(scrollTop > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Check if a nav item is active
  const isActive = (itemId: string) => {
    return pathname === `/${itemId}` || pathname === itemId;
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navigate to search results page with the search query
      router.push(`/search/result?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Handle search icon click
  const handleSearchIconClick = () => {
    if (searchValue.trim()) {
      router.push(`/search/result?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  // Determine if otherNavItems should be visible
  const shouldShowOtherNavItems = !isHomepage || isScrolled;

  return (
    <header
      className="text-white sticky top-0 z-50 transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: '#2A2E33',
        transform: isScrolled ? 'translateY(0)' : 'translateY(0)',
        boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href={'/'} className="flex items-center">
            <Logo />
          </Link>

          <div className="flex flex-col items-end space-y-0">
            <div className="flex justify-between items-center gap-8">
              {/* Desktop Navigation - Always visible */}
              <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    href={`/${item.id}`}
                    key={item.id}
                    className={`px-0 py-2 text-base font-bold hover:text-gray-200 hover:bg-transparent cursor-pointer transition-colors duration-200 ${isActive(item.id) ? 'text-[#1E8025]' : 'text-white'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Search */}
              <div className="flex items-center gap-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="flex items-center gap-2 rounded-full px-4 pl-3 py-2 border border-white md:w-[200px] w-[175px] transition-all duration-300 hover:border-gray-300" style={{ backgroundColor: '#2A2E33' }}>
                    <input
                      type="search"
                      placeholder="חיפוש"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-none text-white placeholder-white text-sm focus:outline-none transition-colors duration-200 w-full"
                    />
                    <button
                      type="button"
                      onClick={handleSearchIconClick}
                      className="w-[18px] flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.75 15.75L12.4875 12.4875M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z" stroke="#DEDEDE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden transition-all duration-200 hover:bg-slate-700 border border-white"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Conditionally render otherNavItems based on page type */}
            <nav
              className={`hidden md:flex flex-row-reverse gap-4 items-center justify-start transition-all duration-500 ease-in-out ${shouldShowOtherNavItems
                ? 'opacity-100 max-h-20 translate-y-0'
                : 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
                }`}
              style={{
                overflow: 'hidden',
                marginTop: shouldShowOtherNavItems ? '0.5rem' : '0'
              }}
            >
              {otherNavItems.map((item) => {
                const active = isActive(item.id);
                return (
                  <Link
                    href={`/${item.id}`}
                    key={item.id}
                    className={`px-5 py-[6px] rounded-full text-base font-bold hover:text-gray-200 hover:bg-transparent cursor-pointer relative transition-all duration-300 transform mt-3 ${active ? 'text-[#fff]' : 'text-white'
                      }`}
                    style={{
                      background: active ? "#1E8025" : "transparent",
                      zIndex: "1"
                    }}
                  >
                    {/* Gradient border using pseudo-element - only show if not active */}
                    {!active && (
                      <div
                        className="absolute inset-0 rounded-full transition-opacity duration-300"
                        style={{
                          background: "linear-gradient(180deg, #357A5B80 0%, #C3D44A80 100%)",
                          padding: "1px",
                          zIndex: "-1"
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-[#2A2E33]"></div>
                      </div>
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation with smooth animation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden mt-3 ${isMenuOpen
            ? 'max-h-96 opacity-100 border-t border-slate-600'
            : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Navigation Items - Always show navItems */}
            {navItems.map((item) => (
              <Link
                href={`/${item.id}`}
                key={item.id}
                className={`w-full block px-4 py-2 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-slate-600 rounded ${isActive(item.id) ? 'text-[#1E8025] bg-slate-700' : 'text-white'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Conditionally show otherNavItems in mobile menu - Based on page type */}
            {shouldShowOtherNavItems && (
              <>
                <div className="border-t border-slate-600 my-2 transition-opacity duration-300"></div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {otherNavItems.map((item) => (
                    <Link
                      href={`/${item.id}`}
                      key={item.id}
                      className={`w-max border border-gray-400 rounded-full block px-4 py-2 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-slate-600 ${isActive(item.id) ? 'text-[#fff] bg-[#1E8025]' : 'text-white'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}