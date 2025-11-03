import { Suspense } from 'react';
import SearchResultContent from './SearchResultContent';

export default function SearchResult() {
    return (
        <Suspense fallback={<SearchResultSkeleton />}>
            <SearchResultContent />
        </Suspense>
    );
}

// Skeleton loading component
function SearchResultSkeleton() {
    return (
        <div className="">
            <div className="container mx-auto px-5 py-[52px] relative w-full overflow-hidden z-10">
                <div className="px-[60px]">
                    <h1 className="text-5xl font-extrabold text-[#484C56]">תוצאות חיפוש</h1>
                    <div className="w-[92px] h-1 bg-[#276E4E] my-5"></div>
                </div>
                <div className="flex flex-col gap-[35px] bg-[#FDFBF6] rounded-[40px] border border-[#DEDEDE]/70 px-[60px] py-[50px]">
                    {/* Skeleton for search input */}
                    <div className="flex items-center gap-2 rounded-full px-4 py-2 border border-[#484C56] w-[430px] animate-pulse">
                        <div className="h-6 bg-gray-300 rounded flex-1"></div>
                        <div className="w-[20px] h-[20px] bg-gray-300 rounded"></div>
                    </div>
                    {/* Skeleton for results */}
                    <div className="flex flex-col gap-5">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex justify-between items-start border border-[#E9C863] bg-white rounded-[20px] p-[30px] pb-[60px] animate-pulse">
                                <div className="flex flex-col gap-4 flex-1">
                                    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                </div>
                                <div className="h-6 bg-gray-300 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}