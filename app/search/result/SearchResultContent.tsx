'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InterestPage from '@/components/InterestPage';
import { ChevronLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SearchResultContent() {
    const [searchValue, setSearchValue] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get the search query from URL parameters
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchValue(decodeURIComponent(query));
        }
    }, [searchParams]);

    // Handle search in the results page
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            // Update the URL with the new search query
            router.push(`/search/result?q=${encodeURIComponent(searchValue.trim())}`);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
        }
    };

    return (
        <div className="">
            <div className="container mx-auto px-5 py-[52px] relative w-full overflow-hidden z-10">
                {/* Header */}
                <div className="px-[60px]">
                    <h1 className="text-5xl font-extrabold text-[#484C56]">תוצאות חיפוש</h1>
                    <div className="w-[92px] h-1 bg-[#276E4E] my-5"></div>
                </div>

                <div className="flex flex-col gap-[35px] bg-[#FDFBF6] rounded-[40px] border border-[#DEDEDE]/70 px-[60px] py-[50px]">
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full px-4 py-2 border border-[#484C56] w-[430px]" style={{ backgroundColor: 'transparent' }}>
                        <input
                            type="search"
                            placeholder="חיפוש"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="bg-transparent border-none placeholder-[#484C56] text-lg focus:outline-none flex-1"
                        />
                        <button
                            type="submit"
                            className="w-[20px] flex items-center justify-center cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.75 15.75L12.4875 12.4875M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z" stroke="#484C56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </form>

                    {/* Search Results */}
                    <div className="flex flex-col gap-5">
                        {/* Display the search term in the results */}
                        {searchValue && (
                            <div className="mb-4">
                                <p className="text-[#484C56] text-lg">
                                    תוצאות חיפוש עבור: <strong>"{searchValue}"</strong>
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between items-start border border-[#E9C863] bg-white rounded-[20px] p-[30px] pb-[60px]">
                            <div className="flex flex-col gap-4">
                                <h2 className='text-[#276E4E] text-[26px] font-extrabold'>תחזית משק האנרגיה</h2>
                                <p className='text-[#484C56] text-xl font-normal'>יתרונות וחסרונות של <strong>משק האנרגיה</strong> פה יהיה כתוב כל מה שיש בטול טיפ עד לגרף ואז  שלוש נקודות </p>
                            </div>
                            <Link className='text-[#358BFF] text-sm font-bold flex items-center gap-2 w-max' href={''}>מעבר לעמוד <ChevronLeft /></Link>
                        </div>
                        <div className="flex justify-between items-start border border-[#E9C863] bg-white rounded-[20px] p-[30px] pb-[60px]">
                            <div className="flex flex-col gap-4">
                                <h2 className='text-[#276E4E] text-[26px] font-extrabold'>משק אנרגיות מתחדשות</h2>
                                <p className='text-[#484C56] text-xl font-normal'>יתרונות וחסרונות של <strong>משק האנרגיה</strong> פה יהיה כתוב כל מה שיש בטול טיפ עד לגרף ואז  שלוש נקודות </p>
                            </div>
                            <Link className='text-[#358BFF] text-sm font-bold flex items-center gap-2 w-max' href={''}>מעבר לעמוד <ChevronLeft /></Link>
                        </div>
                        <div className="flex justify-between items-start border border-[#E9C863] bg-white rounded-[20px] p-[30px] pb-[60px]">
                            <div className="flex flex-col gap-4">
                                <h2 className='text-[#276E4E] text-[26px] font-extrabold'>אנרגיות מתחדשות - ייצור בפועל</h2>
                                <p className='text-[#484C56] text-xl font-normal'>יתרונות וחסרונות של <strong>משק האנרגיה</strong> פה יהיה כתוב כל מה שיש בטול טיפ עד לגרף ואז  שלוש נקודות </p>
                            </div>
                            <Link className='text-[#358BFF] text-sm font-bold flex items-center gap-2 w-max' href={''}>מעבר לעמוד <ChevronLeft /></Link>
                        </div>
                    </div>
                </div>
            </div>

            <InterestPage />
        </div>
    );
}