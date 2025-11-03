'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LineChart from '@/components/Charts/LineChart';
import PieChart from '@/components/Charts/PieChart';
import NewsletterPopup from '@/components/NewsletterPopup';
import { Download, Info, BarChart3, ChevronLeft, ChevronRight, ExternalLink, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import topleft from '@/public/images/Ellipse 89.png'
import image1 from '@/public/Frame 427319915.png'
import image2 from '@/public/Frame 427319913.png'
import image3 from '@/public/Frame 427319914.png'
import download from '@/public/images/download_2.png'
import api from '@/public/images/API.png'
import InterestPage from '../InterestPage';
import Link from 'next/link';
import SMP from '../SMP';
import Electritiy from '../Electritiy';
import { ElectricityLineGraph, ElectricityScatterGraph } from '../Graph/ElectricityScatterGraph';
import PrivateConsumersChart from '../Charts/PrivateConsumersChart';
import Market from '../Market';
import DashboardCharts from '../Charts/DashboardChart';
import DashChart from '../DashChart';
import RejectionChart from '../RejectionChart';


export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'market' | 'smp'>();
  const [smpDetails, setSmpDetails] = useState(false)
  const [marketDetails, setMarketDetails] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('יומי');
  const [showMore, setShowMore] = useState(true)

  const handleChange = () => {
    setShowMore(!showMore)
  }

  const handleSMP = (() => {
    setSmpDetails(!smpDetails)
    setActiveTab('smp');
  })
  const handleMarket = (() => {
    setMarketDetails(!marketDetails)
    setActiveTab('market');
  })
  // Data for electricity consumption line chart - matching Figma design
  const electricityData = {
    dates: ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24'],
    series: [
      {
        name: 'אחר',
        data: [1000, 800, 600, 500, 400, 300, 200, 150, 200, 400, 600, 800, 1000],
        color: '#64748b'
      },
      {
        name: 'אנרגיות מתחדשות',
        data: [0, 0, 0, 200, 800, 1200, 1600, 1800, 1600, 1200, 800, 200, 0],
        color: '#10b981'
      },
      {
        name: 'אנרגיות פוסיליות',
        data: [7500, 7000, 6500, 6000, 5500, 5000, 4500, 4000, 4500, 5500, 6500, 7000, 7500],
        color: '#f59e0b'
      }
    ]
  };

  // Data for energy sources pie chart - matching Figma design
  const energySourcesData = [
    { name: 'אנרגיות פוסיליות', value: 48, color: '#CEA073' },
    { name: 'אנרגיות מתחדשות', value: 98, color: '#2F7A4F' },
    { name: 'אחר', value: 34, color: '#648AA3' },
  ];


  return (
    <div className="">
      <Image src={topleft} width={600} height={600} className='md:w-[800px] md:h-[500px] w-[300px] h-[200px] absolute md:top-0 left-0 z-10' alt='image' />
      <NewsletterPopup />
      <div className="container mx-auto px-5 py-[52px] space-y-[52px] relative w-full overflow-hidden" >
        {/* Hero Section */}
        <section className="bg-[#FDFBF6] border border-[#DEDEDE]/70 md:rounded-[40px] rounded-[20px] overflow-hidden min-h-[500px]">
          {/* Geometric shapes */}
          <div className="relative z-10 min-h-[500px] md:grid md:grid-cols-2 grid-cols-1 flex flex-col-reverse lg:gap-[0px]">
            {/* Right side - Content */}
            <div className="max-w-2xl text-right md:p-[60px] p-6 md:pb-[30px]">
              <h1 className="md:text-[45px] text-3xl font-extrabold text-[#484C56] leading-tight">
                כל החשמל במקום אחד
              </h1>
              <div className="w-[46px] h-1 bg-[#276E4E] md:my-[18px] my-3 mr-0"></div>

              <p className="md:text-xl text-base text-slate-700 leading-relaxed mb-12 max-w-lg mr-0">
                מצב החשמל העולמי בזמן אמת. קבלו
                נתונים עדכניים ותובנות חמות על הדרך
                שלנו לעולם ירוק יותר.
              </p>

              <div className="md:mt-20 mt-10">
                <h3 className="md:text-2xl text-lg font-bold text-[#276E4E] md:mb-4 mb-2">מה מעניין אותך?</h3>

                <div className="flex flex-wrap md:gap-3 gap-2 space-x-0 space-y-0">
                  <Link href={'#electricity-sector'}>
                    <Button variant="outline" className="w-max flex items-center gap-2 justify-between md:px-3 px-2 h-10 border-[#DEDEDE] hover:bg-white/90 text-slate-700 rounded-full bg-transparent">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.92371 15.0982H10.5456C10.5456 17.5576 11.2482 19.7714 12.3458 21.3384C12.893 22.122 13.5397 22.7407 14.2331 23.1604C14.9296 23.5802 15.6727 23.8041 16.4531 23.8041C17.2335 23.8041 17.9766 23.5802 18.6731 23.1604C19.7147 22.5324 20.6443 21.4473 21.3066 20.0481C21.9689 18.649 22.3637 16.942 22.3606 15.0982C22.3637 12.6886 21.3937 10.3069 20.1282 8.55329C19.5001 7.67649 18.7975 6.96139 18.1352 6.47946C17.8056 6.23694 17.4854 6.05661 17.1962 5.93846C16.907 5.82031 16.6521 5.76743 16.45 5.76743C16.2728 5.76743 16.0302 5.81719 15.7504 5.93535C15.2623 6.14055 14.6684 6.54784 14.0745 7.11683C13.1822 7.96876 12.2898 9.17517 11.6307 10.565C10.9684 11.9548 10.5424 13.5187 10.5424 15.0982H9.92371H9.30187C9.30498 12.3497 10.4181 9.75657 11.8234 7.82574C12.5292 6.85877 13.3097 6.05658 14.0932 5.47826C14.485 5.1891 14.8767 4.95592 15.2716 4.79113C15.6633 4.62634 16.0582 4.52686 16.4531 4.52686C16.8604 4.52686 17.2677 4.62634 17.6719 4.78802C18.3777 5.07718 19.0773 5.57154 19.7551 6.21826C20.7687 7.18834 21.7201 8.50666 22.4321 10.0333C23.141 11.5599 23.6074 13.2949 23.6074 15.0951C23.6074 17.7877 22.8488 20.2378 21.5833 22.0473C20.949 22.9521 20.1873 23.6983 19.3198 24.2207C18.4523 24.7462 17.4791 25.0446 16.4562 25.0446C15.4333 25.0446 14.4601 24.7462 13.5926 24.2207C12.2929 23.4341 11.2265 22.1531 10.4803 20.5736C9.73405 18.9941 9.30497 17.113 9.30497 15.092H9.92371V15.0982Z" fill="#59687D" />
                        <path d="M17.0762 5.1487V27.8088C17.0762 28.1508 16.7963 28.4306 16.4543 28.4306C16.1123 28.4306 15.8325 28.1508 15.8325 27.8088V5.1487C15.8325 4.80669 16.1123 4.52686 16.4543 4.52686C16.7963 4.52686 17.0762 4.80669 17.0762 5.1487Z" fill="#59687D" />
                        <path d="M16.0089 19.6937L22.4264 13.1519L23.3125 14.0225L16.8982 20.5642" fill="#59687D" />
                        <path d="M16.0097 13.2079L20.6518 8.44458L21.541 9.31518L16.8989 14.0754" fill="#59687D" />
                      </svg>
                      <span className="font-medium">משק החשמל</span>
                    </Button>
                  </Link>

                  <Link href={'/renewable-energy'}>
                    <Button variant="outline" className="w-max flex items-center gap-2 justify-between md:px-3 px-2 h-10 border-[#DEDEDE] hover:bg-white/90 text-slate-700 rounded-full bg-transparent">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.4271 24.6307V24.0089H7.15237L10.0002 10.3791H21.8113L24.8177 24.7582L25.4271 24.6307V24.0089V24.6307L26.0365 24.5033L22.9275 9.62982C22.8684 9.34068 22.6134 9.1355 22.3181 9.1355H9.49657C9.20122 9.1355 8.94938 9.34068 8.8872 9.62982L5.7782 24.5033C5.74089 24.6867 5.78754 24.8764 5.90568 25.0225C6.02382 25.1686 6.20103 25.2525 6.38757 25.2525H25.4271C25.6136 25.2525 25.7908 25.1686 25.909 25.0225C26.0271 24.8764 26.0738 24.6867 26.0365 24.5033L25.4271 24.6307Z" fill="#59687D" />
                        <path d="M13.0874 9.73877L11.8438 24.55L13.0811 24.6526L14.3247 9.84135" fill="#59687D" />
                        <path d="M17.4922 9.84135L18.7358 24.6526L19.9732 24.55L18.7296 9.73877" fill="#59687D" />
                        <path d="M24.4552 19.1934H7.25V20.437H24.4552" fill="#59687D" />
                        <path d="M23.2059 13.6091H8.5625V14.8527H23.2059" fill="#59687D" />
                        <path d="M18.2744 27.3665V26.7447H14.1674V25.2524H17.6526V27.3665H18.2744V26.7447V27.3665H18.8962V24.6306C18.8962 24.4658 18.8309 24.3073 18.7128 24.1922C18.5978 24.0772 18.4361 24.0088 18.2744 24.0088H13.5456C13.3809 24.0088 13.2223 24.0741 13.1073 24.1922C12.9922 24.3073 12.9238 24.4689 12.9238 24.6306V27.3665C12.9238 27.5313 12.9891 27.6899 13.1073 27.8049C13.2223 27.9199 13.384 27.9883 13.5456 27.9883H18.2744C18.4392 27.9883 18.5978 27.923 18.7128 27.8049C18.8278 27.6899 18.8962 27.5282 18.8962 27.3665H18.2744Z" fill="#59687D" />
                        <path d="M20.2858 26.7449H11.5339C11.1919 26.7449 10.9121 27.0247 10.9121 27.3667C10.9121 27.7087 11.1919 27.9885 11.5339 27.9885H20.2858C20.6277 27.9885 20.9076 27.7087 20.9076 27.3667C20.9076 27.0247 20.6277 26.7449 20.2858 26.7449Z" fill="#59687D" />
                        <path d="M27.2936 4.91043H26.9827C26.9827 5.2462 26.8459 5.54778 26.6252 5.77163C26.4044 5.99237 26.1029 6.12917 25.764 6.12917C25.4282 6.12917 25.1267 5.99237 24.9028 5.77163C24.6821 5.55089 24.5453 5.24931 24.5453 4.91043C24.5453 4.57466 24.6821 4.27308 24.9028 4.04923C25.1235 3.82849 25.4251 3.6917 25.764 3.6917C26.0998 3.6917 26.4013 3.82849 26.6252 4.04923C26.8459 4.26997 26.9827 4.57155 26.9827 4.91043H27.2936H27.6045C27.6045 3.89689 26.7807 3.073 25.7671 3.073C24.7505 3.073 23.9297 3.89689 23.9297 4.91043C23.9297 5.92707 24.7536 6.74786 25.7671 6.74786C26.7838 6.74786 27.6045 5.92396 27.6045 4.91043H27.2936Z" fill="#59687D" />
                        <path d="M25.457 1.47789V2.34843C25.457 2.51942 25.5969 2.65933 25.7679 2.65933C25.9389 2.65933 26.0788 2.51942 26.0788 2.34843V1.47789C26.0788 1.3069 25.9389 1.16699 25.7679 1.16699C25.5969 1.16699 25.457 1.3069 25.457 1.47789Z" fill="#59687D" />
                        <path d="M25.457 7.47228V8.34281C25.457 8.51381 25.5969 8.65371 25.7679 8.65371C25.9389 8.65371 26.0788 8.51381 26.0788 8.34281V7.47228C26.0788 7.30128 25.9389 7.16138 25.7679 7.16138C25.5969 7.16138 25.457 7.29817 25.457 7.47228Z" fill="#59687D" />
                        <path d="M27.9721 2.26159L27.3566 2.87717C27.2353 2.99842 27.2353 3.1943 27.3566 3.31555C27.4778 3.4368 27.6737 3.4368 27.7949 3.31555L28.4105 2.69997C28.5318 2.57872 28.5318 2.38284 28.4105 2.26159C28.2924 2.14034 28.0934 2.14034 27.9721 2.26159Z" fill="#59687D" />
                        <path d="M23.7339 6.49914L23.1183 7.11472C22.997 7.23597 22.997 7.43185 23.1183 7.5531C23.2395 7.67435 23.4354 7.67435 23.5566 7.5531L24.1722 6.93752C24.2935 6.81627 24.2935 6.62039 24.1722 6.49914C24.0541 6.37789 23.8551 6.37789 23.7339 6.49914Z" fill="#59687D" />
                        <path d="M29.1951 4.59937H28.3246C28.1536 4.59937 28.0137 4.73927 28.0137 4.91027C28.0137 5.08126 28.1536 5.22117 28.3246 5.22117H29.1951C29.3661 5.22117 29.506 5.08126 29.506 4.91027C29.506 4.73927 29.3692 4.59937 29.1951 4.59937Z" fill="#59687D" />
                        <path d="M23.2049 4.59937H22.3343C22.1633 4.59937 22.0234 4.73927 22.0234 4.91027C22.0234 5.08126 22.1633 5.22117 22.3343 5.22117H23.2049C23.3758 5.22117 23.5158 5.08126 23.5158 4.91027C23.5158 4.73927 23.3758 4.59937 23.2049 4.59937Z" fill="#59687D" />
                        <path d="M28.4144 7.11472L27.7988 6.49914C27.6776 6.37789 27.4817 6.37789 27.3605 6.49914C27.2392 6.62039 27.2392 6.81627 27.3605 6.93752L27.976 7.5531C28.0973 7.67435 28.2932 7.67435 28.4144 7.5531C28.5357 7.43495 28.5357 7.23597 28.4144 7.11472Z" fill="#59687D" />
                        <path d="M24.1761 2.87717L23.5605 2.26159C23.4393 2.14034 23.2434 2.14034 23.1222 2.26159C23.0009 2.38284 23.0009 2.57872 23.1222 2.69997L23.7378 3.31555C23.859 3.4368 24.0549 3.4368 24.1761 3.31555C24.2974 3.1943 24.2974 2.99842 24.1761 2.87717Z" fill="#59687D" />
                      </svg>
                      <span className="font-medium">אנרגיות מתחדשות</span>
                    </Button>
                  </Link>

                  <Link href={'/emissions'}>
                    <Button variant="outline" className="w-max flex items-center gap-2 justify-between md:px-3 px-2 h-10 border-[#DEDEDE] hover:bg-white/90 text-slate-700 rounded-full bg-transparent">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.3613 8.39575C19.5871 8.39575 22.2738 10.6909 22.877 13.7502L23.0029 14.3889L23.6523 14.4338C25.8154 14.5836 27.5117 16.3614 27.5117 18.5461C27.5117 20.8367 25.6519 22.6965 23.3613 22.6965H10.3613C7.52077 22.6965 5.21094 20.3867 5.21094 17.5461C5.21094 14.8945 7.21956 12.7055 9.80078 12.4309L10.2549 12.3831L10.4648 11.9788C11.5745 9.84827 13.801 8.39575 16.3613 8.39575Z" stroke="#59687D" strokeWidth="1.7" />
                      </svg>
                      <span className="font-medium">פליטות CO2</span>
                    </Button>
                  </Link>

                  <Link href={'climate'}>
                    <Button variant="outline" className="w-max flex items-center gap-2 justify-between md:px-3 px-2 h-10 border-[#DEDEDE] hover:bg-white/90 text-slate-700 rounded-full bg-transparent">
                      <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.93688 13.1062C11.0153 13.1062 11.9657 13.6374 12.5481 14.4566C12.7529 14.7446 13.1529 14.8118 13.4409 14.607C13.7289 14.4022 13.7961 14.0022 13.5913 13.7142C12.7817 12.5718 11.4441 11.8262 9.93688 11.8262C9.58488 11.8262 9.29688 12.1142 9.29688 12.4662C9.29688 12.8214 9.58168 13.1062 9.93688 13.1062Z" fill="#59687D" />
                        <path d="M18.8679 16.3062C18.8679 15.4198 19.2263 14.6262 19.8055 14.0438C20.3879 13.4646 21.1815 13.1062 22.0679 13.1062C22.4199 13.1062 22.7079 12.8182 22.7079 12.4662C22.7079 12.1142 22.4199 11.8262 22.0679 11.8262C19.5943 11.8262 17.5879 13.8326 17.5879 16.3062C17.5879 16.6582 17.8759 16.9462 18.2279 16.9462C18.5831 16.9462 18.8679 16.6614 18.8679 16.3062Z" fill="#59687D" />
                        <path d="M25.9063 16.306H26.5463C26.5463 15.0964 26.0631 13.9956 25.2823 13.1924C24.5015 12.3892 23.4199 11.874 22.2199 11.8356L22.1975 12.4756L22.8375 12.5204C22.8471 12.3892 22.8599 12.2388 22.8599 12.0628C22.8599 8.45962 19.9383 5.54126 16.3383 5.54126C12.7351 5.54126 9.81668 8.46282 9.81668 12.0628C9.81668 12.2484 9.82948 12.4148 9.84229 12.562L10.4791 12.514L10.5687 11.8804C10.3735 11.8516 10.1623 11.8324 9.93508 11.8324C7.46148 11.8324 5.45508 13.8388 5.45508 16.3124C5.45508 18.786 7.46148 20.7924 9.93508 20.7924H22.0663C24.5399 20.7924 26.5463 18.786 26.5463 16.3124H25.9063H25.2663C25.2663 17.1988 24.9079 17.9957 24.3287 18.5749C23.7463 19.1541 22.9527 19.5124 22.0663 19.5124H9.93508C9.04868 19.5124 8.25188 19.1541 7.67268 18.5749C7.09348 17.9925 6.73508 17.1988 6.73508 16.3124C6.73508 15.426 7.09348 14.6324 7.67268 14.05C8.25508 13.4708 9.04868 13.1124 9.93508 13.1124C10.0791 13.1124 10.2295 13.1252 10.3895 13.1476C10.5815 13.1764 10.7735 13.1157 10.9175 12.9813C11.0615 12.8469 11.1319 12.6612 11.1191 12.466C11.1063 12.3156 11.0967 12.1812 11.0967 12.0628C11.0967 10.6132 11.6823 9.30764 12.6327 8.35724C13.5831 7.40684 14.8887 6.82126 16.3383 6.82126C17.7879 6.82126 19.0935 7.40684 20.0471 8.35724C20.9975 9.30764 21.5831 10.6132 21.5831 12.0628C21.5831 12.1684 21.5735 12.29 21.5639 12.434C21.5511 12.6068 21.6119 12.7764 21.7271 12.9076C21.8423 13.0356 22.0055 13.1124 22.1815 13.1188C23.0391 13.1476 23.8103 13.5124 24.3703 14.0884C24.9303 14.6644 25.2695 15.4452 25.2727 16.3124H25.9063V16.306Z" fill="#59687D" />
                        <path d="M9.28285 23.0262L8.98526 24.143C8.89246 24.4854 9.09725 24.8343 9.43645 24.9271C9.77885 25.0199 10.1277 24.8151 10.2205 24.4759L10.518 23.3591C10.6108 23.0167 10.4061 22.6679 10.0669 22.5751C9.72446 22.4823 9.37565 22.6838 9.28285 23.0262Z" fill="#59687D" />
                        <path d="M21.4176 23.0262L21.12 24.143C21.0272 24.4854 21.232 24.8343 21.5712 24.9271C21.9136 25.0199 22.2624 24.8151 22.3552 24.4759L22.6528 23.3591C22.7456 23.0167 22.5408 22.6679 22.2016 22.5751C21.8592 22.4823 21.5072 22.6838 21.4176 23.0262Z" fill="#59687D" />
                        <path d="M15.7856 19.9508L12.7808 24.3636C12.6464 24.5588 12.6336 24.8148 12.7456 25.0228C12.8576 25.2308 13.0752 25.362 13.312 25.362H16.3488L14.5024 28.4372C14.32 28.7412 14.4192 29.1348 14.72 29.314C15.0208 29.4932 15.4176 29.3973 15.5968 29.0965L18.0288 25.0517C18.1472 24.8533 18.1504 24.6069 18.0384 24.4053C17.9264 24.2037 17.712 24.0788 17.4816 24.0788H14.5216L16.8448 20.6676C17.0432 20.3764 16.9696 19.9765 16.6752 19.7781C16.384 19.5829 15.984 19.6596 15.7856 19.9508Z" fill="#59687D" />
                        <path d="M8.21059 27.0228L7.91299 28.1397C7.82019 28.4821 8.025 28.8308 8.3642 28.9236C8.7066 29.0164 9.05538 28.8116 9.14818 28.4724L9.4458 27.3556C9.5386 27.0132 9.33379 26.6645 8.99459 26.5717C8.65539 26.4789 8.30339 26.6804 8.21059 27.0228Z" fill="#59687D" />
                        <path d="M20.3454 27.0228L20.0478 28.1397C19.955 28.4821 20.1598 28.8308 20.499 28.9236C20.8414 29.0164 21.1902 28.8116 21.283 28.4724L21.5806 27.3556C21.6734 27.0132 21.4686 26.6645 21.1294 26.5717C20.787 26.4789 20.4382 26.6804 20.3454 27.0228Z" fill="#59687D" />
                      </svg>
                      <span className="font-medium">אקלים</span>
                    </Button>
                  </Link>

                  <Link href={'/predictions'}>
                    <Button variant="outline" className="w-max flex items-center gap-2 justify-between md:px-3 px-2 h-10 border-[#DEDEDE] hover:bg-white/90 text-slate-700 rounded-full bg-transparent">
                      <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_4503_10964)">
                          <path d="M24.2459 28.5843H9.41579C9.1448 28.5843 8.92578 28.3652 8.92578 28.0943C8.92578 27.8233 9.1448 27.6042 9.41579 27.6042H24.2459C24.5169 27.6042 24.7359 27.8233 24.7359 28.0943C24.7359 28.3652 24.5169 28.5843 24.2459 28.5843Z" fill="#59687D" />
                          <path d="M29.4573 15.8442C29.4926 15.7329 29.4889 15.6104 29.4351 15.4972L25.6635 7.54013C25.5837 7.37308 25.4167 7.27285 25.231 7.271C25.0473 7.27285 24.8821 7.38236 24.8079 7.55126L21.2869 15.5083C21.2553 15.5807 21.2423 15.6549 21.2479 15.7292C21.1755 15.8127 21.1328 15.9203 21.1328 16.0391C21.1328 18.3444 23.0093 20.2209 25.3164 20.2209C27.6235 20.2209 29.5 18.3444 29.5 16.0391C29.5 15.9705 29.4852 15.9036 29.4573 15.8442ZM25.2533 8.87094L28.4272 15.5677H22.291L25.2533 8.87094ZM25.3164 19.2798C23.6886 19.2798 22.3374 18.0752 22.1091 16.5087H28.5237C28.2954 18.0752 26.9442 19.2798 25.3164 19.2798Z" fill="#59687D" />
                          <path d="M11.8245 15.7662C11.8598 15.6567 11.8561 15.5323 11.8023 15.421L8.0307 7.4621C7.95089 7.29505 7.78941 7.18925 7.59823 7.19297C7.41448 7.19482 7.24929 7.30433 7.17504 7.47323L3.65405 15.4321C3.6225 15.5026 3.60951 15.5787 3.61508 15.6511C3.54269 15.7347 3.5 15.8423 3.5 15.9611C3.5 18.2682 5.3765 20.1447 7.68361 20.1447C9.99072 20.1447 11.8672 18.2682 11.8672 15.9611C11.8672 15.8924 11.8524 15.8256 11.8245 15.7662ZM7.6205 8.79291L10.7944 15.4897H4.6582L7.6205 8.79291ZM7.68361 19.2018C6.05583 19.2018 4.7046 17.9972 4.4763 16.4325H10.8909C10.6626 17.9972 9.31139 19.2018 7.68361 19.2018Z" fill="#59687D" />
                          <path d="M27.2659 6.24631C27.2659 6.50245 27.0581 6.71033 26.8019 6.71033H18.5424C18.4254 7.27644 18.0412 7.74603 17.5271 7.97804V25.6182C17.5271 25.6646 17.5234 25.7092 17.5141 25.7537H22.0337C22.3028 25.7537 22.5218 25.9728 22.5218 26.2437C22.5218 26.5147 22.3028 26.7337 22.0337 26.7337H11.7936C11.5227 26.7337 11.3036 26.5147 11.3036 26.2437C11.3036 25.9728 11.5227 25.7537 11.7936 25.7537H16.0515C16.0422 25.7092 16.0385 25.6646 16.0385 25.6182V7.97989C15.5244 7.74603 15.1383 7.27644 15.0214 6.71033H6.66715C6.40915 6.71033 6.20312 6.50245 6.20312 6.24631C6.20312 5.99017 6.40915 5.78229 6.66715 5.78229H15.0752C15.3109 5.06399 15.9865 4.54614 16.7828 4.54614C17.5791 4.54614 18.2528 5.06399 18.4904 5.78229H26.8019C27.0581 5.78229 27.2659 5.99017 27.2659 6.24631Z" fill="#59687D" />
                        </g>
                        <defs>
                          <clipPath id="clip0_4503_10964">
                            <rect width="26" height="24.0381" fill="white" transform="translate(3.5 4.54614)" />
                          </clipPath>
                        </defs>
                      </svg>
                      <span className="font-medium">תחזיות והשוואות</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Left side - Images */}
            <div className="flex justify-between gap-4 relative md:p-[30px] p-6 md:pr-0 w-full">
              <div className="w-full">
                <Image src={image3} width={192} height={308} className='md:w-[192px] w-full md:h-[308px]' alt='image' />
              </div>
              <div className="w-full">
                <Image src={image2} width={192} height={308} className='md:w-[192px] w-full md:h-[308px] md:mt-40 mt-20' alt='image' />
              </div>
              <div className="w-full">
                <Image src={image1} width={192} height={308} className='md:w-[192px] w-full md:h-[308px]' alt='image' />
              </div>
              {/* Center larger oval image */}
              {/* Top right circular image */}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div id='electricity-sector' className="md:space-y-[52px] space-y-8 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:px-[60px] px-6 md:py-[50px] py-6 md:rounded-[40px] rounded-[20px]">
          <div>
            <h2 className="md:text-3xl text-2xl font-bold text-[#276E4E]">משק החשמל בישראל</h2>
            <div className="w-[46px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
            <div className="flex flex-col gap-2 max-w-[1043px] w-full md:text-xl text-base">
              <p className="text-[#484C56] max-w-full leading-[120%]">
                משק החשמל בישראל מורכב ממספר גורמים מרכזיים: משרד האנרגיה, האחראי על קביעת מדיניות האנרגיה, רשות החשמל, המפקחת על השוק וקובעת את התעריפים, וחברת נגה – ניהול מערכת החשמל, המנהלת את אספקת החשמל ושומרת על איזון בין ביקוש לייצור בזמן אמת.
              </p>
              {!showMore && (
                <>
                  <p className="text-[#484C56] max-w-full leading-[120%]">
                    הרפורמה במשק החשמל, שהחלה בשנת 2018, נועדה לפתוח את השוק לתחרות ולהפחית את תלות הצרכנים בחברת החשמל, שבעבר שלטה בייצור, הולכה וחלוקה. הרפורמה עודדה כניסת מספקי חשמל פרטיים והפרידה בין ניהול המערכת לבין פעילות הייצור של חברת החשמל.
                  </p>
                  <p className="text-[#484C56] max-w-full leading-[120%]">
                    כיום, חלק משמעותי מייצור החשמל נעשה על ידי יצרנים פרטיים, עם דגש גובר על אנרגיות מתחדשות. צרכנים יכולים לבחור את מספק החשמל שלהם, והמעבר בין מספקים הפך פשוט ונגיש יותר. בחלק זה ניתן לעקוב אחר תהליכים מרכזיים במשק החשמל, כולל תמהיל הייצור, מחירי החשמל, וביצועי שוק הספקים הפרטיים.
                  </p>
                </>
              )}
            </div>
            <Button variant="link" className="text-[#358BFF] mt-2 mr-0 p-0" onClick={handleChange}>
              {showMore ? (
                <span>
                  קרא עוד…
                </span>
              ) : (
                <span>
                  קרא פחות…
                </span>
              )}
            </Button>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Sources Pie Chart */}
            <Card className="bg-white border border-orange-200 rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="md:text-lg text-base text-right flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold">
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                          <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                          <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                        </g>
                      </svg>
                      תמהיל יצור אנרגיה
                    </CardTitle>
                    <div className="flex items-start md:gap-4 gap-2">
                      <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                      <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                    </div>
                  </div>
                  <div className="md:text-sm text-xs text-slate-600 mr-[90px]">פרק זמן:</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="-mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">מיון לפי:</span>
                    <div className="relative w-[202px]">
                      <select
                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                      >
                        <option>יומי</option>
                        <option>שבועי</option>
                        <option>חודשי</option>
                      </select>

                      {/* Custom dropdown arrow */}
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">
                        <ChevronDown size={14} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-[400px]">
                  <PieChart
                    data={energySourcesData}
                    height={300}
                    innerRadius="40%"
                    showLabels={false}
                  />
                  {/* Center text */}
                  <div className="absolute -top-[25%] inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 text-center">סה"כ</div>
                      <div className="md:text-base text-sm font-bold">MW 5,734</div>
                    </div>
                  </div>
                  {/* Label with percentage */}
                  {/* <div className="absolute top-16 right-16 bg-orange-100 px-2 py-1 rounded text-xs">
                    38% | אנרגיות פוסיליות
                  </div> */}
                </div>

                <div className="-mt-10 flex justify-start">
                  <Button variant="link" className="text-blue-600 text-sm">
                    הצג נתונים <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Electricity Consumption Line Chart */}
            <Card className="bg-white border border-orange-200 rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-5 justify-between">
                    <CardTitle className="md:text-lg text-sm text-right flex flex-row-reverse items-center gap-2 text-[#484C56] font-extrabold">
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                          <path d="M10.5 0.545898C4.98 0.545898 0.5 5.0259 0.5 10.5459C0.5 16.0659 4.98 20.5459 10.5 20.5459C16.02 20.5459 20.5 16.0659 20.5 10.5459C20.5 5.0259 16.02 0.545898 10.5 0.545898ZM10.5 18.5459C6.09 18.5459 2.5 14.9559 2.5 10.5459C2.5 6.1359 6.09 2.5459 10.5 2.5459C14.91 2.5459 18.5 6.1359 18.5 10.5459C18.5 14.9559 14.91 18.5459 10.5 18.5459Z" fill="#A1A1A1" />
                          <path d="M9.5 5.5459H11.5V7.5459H9.5V5.5459ZM9.5 9.5459H11.5V15.5459H9.5V9.5459Z" fill="#A1A1A1" />
                        </g>
                      </svg>
                      משק החשמל בישראל - נתב על
                    </CardTitle>
                    <div className="flex items-start md:gap-4 gap-2">
                      <Image src={api} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                      <Image src={download} width={32} height={32} className='w-[32px] h-[32px]' alt='image' />
                    </div>
                  </div>
                  <div className="md:text-sm text-xs text-slate-600 mr-[90px]">פרק זמן:</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 -mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">מיון לפי:</span>
                    <div className="relative w-[202px]">
                      <select
                        className="w-full border rounded-full px-3 py-1 text-xs h-8 appearance-none bg-white pr-6"
                      >
                        <option>יומי</option>
                        <option>שבועי</option>
                        <option>חודשי</option>
                      </select>

                      {/* Custom dropdown arrow */}
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">
                        <ChevronDown size={14} />
                      </span>
                    </div>
                  </div>
                </div>
                <LineChart
                  data={electricityData}
                  yAxisLabel="[MW]"
                  height={300}
                />
                {/* Legend */}
                <div className="mt-4 flex justify-start">
                  <Button variant="link" className="text-blue-600 text-sm">
                    הצג נתונים <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>


        {/* Bottom Section - Additional Data Links */}
        <div className="bg-[#FDFBF6] border border-[#DEDEDE]/70 md:rounded-[40px] rounded-[20px] pb-5 md:px-[60px] px-5 space-y-[30px]">
          <div className="flex flex-col gap-2 my-[30px]">
            <h3 className="md:text-lg text-base font-extrabold text-[#276E4E]">לנתונים נוספים</h3>
            <div className="flex items-center md:gap-6 gap-3">
              <button
                onClick={handleMarket}
                className={`text-[#59687D] font-bold border py-[6px] px-6 rounded-full md:text-base text-sm transition-all ${activeTab === 'market'
                  ? 'bg-[#1E8025] border-[#1E8025] text-white'
                  : 'bg-white border-[#DEDEDE] hover:bg-gray-50'
                  }`}
              >
                שוק חשמל תחרותי
              </button>

              <button
                onClick={handleSMP}
                className={`text-[#59687D] font-bold border py-[6px] px-6 rounded-full md:text-base text-sm transition-all ${activeTab === 'smp'
                  ? 'bg-[#1E8025] border-[#1E8025] text-white'
                  : 'bg-white border-[#DEDEDE] hover:bg-gray-50'
                  }`}
              >
                SMP
              </button>
            </div>

            <div className="md:mt-[60px] mt-10">
              {activeTab === 'smp' && (
                <div className='flex flex-col gap-6'>
                  <SMP />
                  <Electritiy />
                </div>
              )}

              {activeTab === 'market' && (
                <div className="flex flex-col gap-6">
                  <Market />
                  <div className="flex flex-col">
                    <DashChart />
                    <RejectionChart />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InterestPage />
    </div >
  );
}