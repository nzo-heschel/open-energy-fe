"use client";

import React, { useState, useEffect } from "react";
// import { useDebounce } from "use-debounce";

interface TooltipInfoProps {
    //   title?: string;
    content: string;
    delay?: number;
}

const TooltipInfo: React.FC<TooltipInfoProps> = ({
    //   title = "Renewable energy generation mix",
    content,
    delay = 500,
}) => {
    //   const [text, setText] = useState(content);
    //   const [debouncedText] = useDebounce(text, delay);

    //   useEffect(() => {
    //     setText(content);
    //   }, [content]);

    return (
        <div className="relative w-fit mx-auto text-gray-800 mt-3">
            <div className="relative bg-white rounded-[20px] md:p-[30px] p-5 w-[388px] shadow-[10.37px_5.18px_60px_0px_rgba(0,0,0,0.05),0px_3px_30px_0px_rgba(153,191,65,0.16)]">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rotate-45"></div>
                <p className="text-[#656565] text-sm font-normal">
                    {content}
                </p>
            </div>
        </div>
    );
};

export default TooltipInfo;
