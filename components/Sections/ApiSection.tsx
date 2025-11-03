'use client';

import { useState } from 'react';
import Image from 'next/image';
import topleft from '@/public/images/Ellipse 89 (1).png'
import Link from 'next/link';
import InterestPage from '../InterestPage';

interface ApiEndpoint {
  title: string;
  description: string;
  endpoint: string;
  method: string;
}

interface ApiData {
  id: number;
  name: string;
  endpoint: string;
  method: string;
  url: string;
}

export default function ApiSection() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (endpointData: ApiEndpoint) => {
    const textToCopy = `
Endpoint: ${endpointData.endpoint}
Description: ${endpointData.description}
Method: ${endpointData.method}
Authentication: Required (Bearer Token)

Headers:
- Authorization: Bearer <your-token>
- Content-Type: application/json

Parameters:
- page (optional): The page number for paginated results
- limit (optional): Number of items per page (default: 10)

Response:
- Status: 200 OK
- Body:
{
  "chart": [
    {
      "id": 1,
      "title": "Sales Data",
      "type": "bar",
      "created_at": "2023-01-01T12:00:00Z"
    },
    ...
  ]
}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopiedEndpoint(endpointData.endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiEndpoints: ApiEndpoint[] = [
    {
      title: 'מחיר שולי על פני זמן SMP',
      description: 'Fetches a list of available charts',
      endpoint: 'GET /api/charts',
      method: 'GET'
    },
    {
      title: 'מחיר שולי על פני זמן SMP',
      description: 'Fetches a list of available charts',
      endpoint: 'GET /api/charts',
      method: 'GET'
    },
    {
      title: 'מחיר שולי על פני זמן SMP',
      description: 'Fetches a list of available charts',
      endpoint: 'GET /api/charts',
      method: 'GET'
    },
    {
      title: 'מחיר שולי על פני זמן SMP',
      description: 'Fetches a list of available charts',
      endpoint: 'GET /api/charts',
      method: 'GET'
    },
    {
      title: 'מחיר שולי על פני זמן SMP',
      description: 'Fetches a list of available charts',
      endpoint: 'GET /api/charts',
      method: 'GET'
    },
  ];

  const apiData: ApiData[] = [
    {
      id: 1,
      name: "Retrieve a list of available charts",
      endpoint: "charts/",
      method: "GET",
      url: "#"
    },
    {
      id: 2,
      name: "Create a new chart",
      endpoint: "charts/",
      method: "POST",
      url: "#"
    },
    {
      id: 3,
      name: "Fetch details of a specific chart",
      endpoint: "charts/{id}/",
      method: "GET",
      url: "#"
    },
    {
      id: 4,
      name: "Update an existing chart",
      endpoint: "charts/{id}/",
      method: "PUT",
      url: "#"
    },
    {
      id: 5,
      name: "Delete a chart",
      endpoint: "charts/",
      method: "DELETE",
      url: "#"
    },
    {
      id: 6,
      name: "List available data sources",
      endpoint: "data-sources/",
      method: "GET",
      url: "#"
    },
    {
      id: 7,
      name: "Connect to a data source",
      endpoint: "data-sources/connect/",
      method: "POST",
      url: "#"
    },
  ];

  return (
    <div className="">
      <Image src={topleft} width={600} height={600} className='size-[600px] absolute top-0 left-0 z-1' alt='image' />

      <div className="container mx-auto px-5 md:py-[52px] py-10 relative w-full overflow-hidden z-10">
        {/* Header */}
        <div className="md:px-[60px] px-5">
          <h1 className="md:text-5xl text-3xl font-extrabold text-[#484C56]">API</h1>
          <div className="w-[92px] h-1 bg-[#276E4E] md:my-5 my-3"></div>
          <p className="md:text-lg text-base text-[#484C56] font-normal mb-4">
            ממש על הדברים הכי ציבור להכנסת נתונים חיכול קמוס עליכם השמש ומקודש שלמה API משותף.
          </p>
        </div>
        <div className="flex flex-col bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-5">
          <h2 className='md:text-[34px] text-2xl text-[#276E4E] font-extrabold'>כללי</h2>
          <div className="flex flex-col gap-1 items-end">
            <p className='md:text-xl text-base font-normal text-right text-[#484C56]'>Base URL: <Link className='text-[#5D6FFF]' href={''}>https://openenergy.org/api</Link></p>
            <p className='md:text-xl text-base font-normal text-right text-[#484C56]'>Authentication: Some details about authentication methods, such as API keys or tokens</p>
            <p className='md:text-xl text-base font-normal text-right text-[#484C56]'>Formats Supported: Specify data formats, e.g., JSON or XML</p>
          </div>
        </div>

        {/* API Documentation */}
        <div className="md:my-10 my-5 flex flex-col md:gap-10 gap-5">
          <div className="flex flex-col bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-5">
            <h2 className='md:text-[34px] text-2xl text-[#276E4E] font-extrabold'>רשימה של שיטות API</h2>
            <p className="md:text-lg text-base text-[#484C56] font-normal mb-4">
              נקודות הקצה והפונקציונליות שלהן.
            </p>
            <div className="relative overflow-x-auto rounded-lg max-w-[975px] w-full">
              <table className='w-full text-sm text-right rounded-lg'>
                <thead className='border border-[#C3C3C3] bg-[#DEDEDE]/70'>
                  <tr className='md:text-xl text-base font-extrabold border border-[#C3C3C3]'>
                    <th className='text-right p-3 border border-[#C3C3C3]'>שיטה</th>
                    <th className='text-right p-3 border border-[#C3C3C3]'>נקודת קצה / קוד</th>
                    <th className='text-right p-3 border border-[#C3C3C3]'>תאוּר</th>
                  </tr>
                </thead>
                <tbody>
                  {apiData.map((data) =>
                  (
                    <tr key={data.id}>
                      <td className='bg-white text-right p-3 border border-[#C3C3C3] md:text-xl text-base text-[#484C56] font-normal'>{data.method}</td>
                      <td className='bg-white text-right p-3 border border-[#C3C3C3] md:text-xl text-base text-[#484C56] font-normal'><Link href={data.url} className='text-[#5D6FFF]'>{data.endpoint}</Link></td>
                      <td className='bg-white text-right p-3 border border-[#C3C3C3] md:text-xl text-base text-[#484C56] font-normal'>{data.name}</td>
                    </tr>
                  )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col bg-[#FDFBF6] md:rounded-[40px] rounded-[20px] border border-[#DEDEDE]/70 md:px-[60px] px-5 md:py-[50px] py-5">
            <h2 className='md:text-[34px] mb-6 text-2xl text-[#276E4E] font-extrabold'>נקודות הקצה</h2>
            <div className="flex flex-col gap-6">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="max-w-[780px] text-left w-full bg-white border border-[#C3C3C3] p-5 rounded-xl">
                  <div className="border-b border-[#59687D] py-3 flex flex-row-reverse justify-between items-start md:items-center gap-3">
                    <div className="text-right">
                      <h3 className='text-[#484C56] font-extrabold md:text-xl text-base text-right flex justify-end'><span>:</span>Сhart title</h3>
                      <p className='text-[#484C56] md:text-xl text-base font-normal'>{endpoint.title}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(endpoint)}
                      className={`flex items-center gap-1 px-3 py-1 rounded border border-[#276E4E] text-[#276E4E] ${copiedEndpoint === endpoint.endpoint
                        ? 'bg-[#276E4E] text-white'
                        : 'hover:bg-[#276E4E] hover:text-white'
                        } transition-colors duration-200`}
                    >
                      {copiedEndpoint === endpoint.endpoint ? (
                        <div className="flex items-center">
                          <div><span>!</span>Copied</div>
                        </div>
                      ) : (
                        <>
                          Copy
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="py-4 md:space-y-3 space-y-1">
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <span className="text-right">Endpoint: </span>
                      <span className="py-1 rounded">{endpoint.endpoint}</span>
                    </div>
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <span className="">Description: </span>
                      <span>{endpoint.description}</span>
                    </div>
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <span className="">Authentication: </span>
                      <span>Required (Bearer Token)</span>
                    </div>
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <div className="flex justify-end"><span>:</span>Headers</div>
                      <ul className="mt-1 px-8 text-right">
                        <li className='text-right'>Authorization: Bearer {`<your-token>`}</li>
                        <li className='text-right'>Content-Type: application/json</li>
                      </ul>
                    </div>
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <div className="flex justify-end"><span>:</span>Parameters</div>
                      <ul className="mt-1 px-8">
                        <li className='text-right'>page (optional): The page number for paginated results</li>
                        <li className='text-right'>limit (optional): Number of items per page (default: 10)</li>
                      </ul>
                    </div>
                    <div className='text-[#484C56] text-right md:text-lg text-sm font-normal'>
                      <div className="flex justify-end"><span>:</span>Response</div>
                      <ul className="mt-1 px-8">
                        <li className='text-right'>Status: 200 OK</li>
                        <li className='text-right'>:Body
                          <pre className="p-3 rounded mt-2 overflow-x-auto">
                            {`{
  "chart": [
    {
      "id": 1,
      "title": "Sales Data",
      "type": "bar",
      "created_at": "2023-01-01T12:00:00Z"
    },
    ...]
}`}
                          </pre>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InterestPage />
    </div>
  );
}
