'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatReadableDate } from '@/lib/dateUtils';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState('');
  const [apiStatus, setApiStatus] = useState({ isChecking: true, isConnected: true });

  useEffect(() => {
    // Set current date
    setCurrentDate(formatReadableDate(new Date()));
    
    // Check API connection
    const checkApiConnection = async () => {
      try {
        const response = await fetch('/api/hours', { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' } 
        });
        
        setApiStatus({
          isChecking: false,
          isConnected: response.ok
        });
      } catch (error) {
        console.error('API connection error:', error);
        setApiStatus({
          isChecking: false,
          isConnected: false
        });
      }
    };
    
    checkApiConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-text-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center pt-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Hour Management
            </h1>
            <div className="inline-block px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-lg text-orange-400 font-medium border border-gray-700 shadow-lg">
              {currentDate}
            </div>
          </div>
          
          {/* API Status Indicator */}
          {apiStatus.isChecking ? (
            <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm text-warning-400 p-4 mb-8 rounded-md text-center animate-pulse">
              Checking API connection...
            </div>
          ) : !apiStatus.isConnected ? (
            <div className="w-full max-w-md bg-error-900/80 backdrop-blur-sm text-white p-4 mb-8 rounded-md">
              <h3 className="font-bold text-lg mb-2">API Connection Error</h3>
              <p className="mb-2">Unable to connect to the backend API. This could be due to:</p>
              <ul className="list-disc pl-5 mb-2 text-left">
                <li>Server is starting up (wait a few seconds and refresh)</li>
                <li>Database connection issues</li>
                <li>Network connectivity problems</li>
              </ul>
              <button 
                onClick={() => window.location.reload()}
                className="bg-error-700 hover:bg-error-600 text-white px-4 py-2 rounded-md mt-2 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Record Hours Card */}
            <Link href="/record" className="text-inherit no-underline">
              <div className="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 p-8 h-52 rounded-lg flex flex-col justify-center items-center text-center transition-all transform hover:-translate-y-2 hover:shadow-xl border border-gray-700/50 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-blue-700"></div>
                <div className="text-5xl mb-5 text-blue-500 transform transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Record Hour</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>

            {/* View Hours Card */}
            <Link href="/view" className="text-inherit no-underline">
              <div className="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 p-8 h-52 rounded-lg flex flex-col justify-center items-center text-center transition-all transform hover:-translate-y-2 hover:shadow-xl border border-gray-700/50 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-orange-700"></div>
                <div className="text-5xl mb-5 text-orange-500 transform transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">View Hours</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>

            {/* Analytics Card */}
            <Link href="/analytics" className="text-inherit no-underline">
              <div className="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 p-8 h-52 rounded-lg flex flex-col justify-center items-center text-center transition-all transform hover:-translate-y-2 hover:shadow-xl border border-gray-700/50 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-green-500 to-green-700"></div>
                <div className="text-5xl mb-5 text-green-500 transform transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">View Analytics</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>

            {/* Goals Card */}
            <Link href="/goals" className="text-inherit no-underline">
              <div className="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 p-8 h-52 rounded-lg flex flex-col justify-center items-center text-center transition-all transform hover:-translate-y-2 hover:shadow-xl border border-gray-700/50 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-yellow-500 to-yellow-700"></div>
                <div className="text-5xl mb-5 text-yellow-500 transform transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Goals View</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}