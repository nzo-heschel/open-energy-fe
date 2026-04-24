"use client";

import { ChevronDown } from "lucide-react";

export interface YearMultiSelectDropdownProps {
    selectedYears: string[];
    onChange: (years: string[]) => void;
    options: string[];
    showLatestMonth?: boolean;
    onToggleLatestMonth?: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const CustomCheckbox = ({
    checked,
    indeterminate = false,
}: {
    checked: boolean;
    indeterminate?: boolean;
}) => (
    <span className="relative inline-block w-[19px] h-[19px] shrink-0" aria-hidden="true">
        <span className="absolute inset-0 box-border bg-[#DEDEDE] border-[1.5px] border-[#484C56] rounded-[2px]" />
        {indeterminate ? (
            <span className="absolute left-[36.84%] right-[36.84%] top-[36.84%] bottom-[36.84%] bg-[#484C56]" />
        ) : checked ? (
            <svg
                viewBox="0 0 20 20"
                className="absolute left-[17%] right-[17%] top-[22%] bottom-[22%] w-auto h-auto"
                fill="none"
            >
                <path
                    d="M3 10.2L7.4 14.4L16.8 4.8"
                    stroke="#484C56"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ) : null}
    </span>
);

export default function YearMultiSelectDropdown({
    selectedYears,
    onChange,
    options,
    showLatestMonth = false,
    onToggleLatestMonth,
    isOpen,
    setIsOpen,
}: YearMultiSelectDropdownProps) {
    const allSelected = !showLatestMonth && (selectedYears.length === 0 || selectedYears.length === options.length);
    const hasCustomSelection = !showLatestMonth && selectedYears.length > 0 && selectedYears.length < options.length;

    const toggleYear = (year: string) => {
        setIsOpen(true);
        if (showLatestMonth && onToggleLatestMonth) {
            onToggleLatestMonth();
        }
        if (selectedYears.includes(year)) {
            onChange(selectedYears.filter((y) => y !== year));
            return;
        }
        onChange([...selectedYears, year]);
    };

    const toggleAll = () => {
        setIsOpen(true);
        if (showLatestMonth && onToggleLatestMonth) {
            onToggleLatestMonth();
        }
        if (allSelected) {
            onChange([]);
            return;
        }
        onChange([...options]);
    };

    const buttonLabel = showLatestMonth
        ? "חודש אחרון"
        : allSelected
            ? "בחירה מרובה"
            : `${selectedYears.length} שנים`;

    return (
        <div className="relative">
            <button
                type="button"
                className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6 text-right flex items-center justify-between"
                style={{ fontFamily: 'Heebo, sans-serif' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{buttonLabel}</span>
                <ChevronDown size={14} className={`transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute z-10 mt-1 w-full min-w-[179px] h-[258px] bg-[#FAFAFC] border border-[#A1A1A1] rounded-2xl shadow-[0px_3px_30px_rgba(153,191,65,0.16)] p-[15px_10px]"
                    style={{ fontFamily: 'Heebo, sans-serif' }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start gap-[10px]">
                        <div className="w-1 h-10 bg-[#C3C3C3] rounded-[100px] mt-1" />
                        <div className="flex flex-col gap-[10px] flex-1 h-[228px] overflow-y-auto pr-1">
                            <button
                                type="button"
                                className="w-full flex flex-row-reverse justify-end items-center gap-[10px] text-right text-base font-medium text-[#59687D]"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAll();
                                }}
                            >
                                <span>הכל</span>
                                <CustomCheckbox checked={allSelected} indeterminate={hasCustomSelection} />
                            </button>

                            {options.map((year) => {
                                const checked = !showLatestMonth && (allSelected || selectedYears.includes(year));
                                return (
                                    <button
                                        key={year}
                                        type="button"
                                        className="w-full flex-row-reverse flex justify-end items-center gap-[10px] text-right text-base font-medium text-[#59687D]"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleYear(year);
                                        }}
                                    >
                                        <span>{year}</span>
                                        <CustomCheckbox checked={checked} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
