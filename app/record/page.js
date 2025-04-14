'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import DatePicker from '@/components/DatePicker';
import { ALL_SECTIONS, getActiveSections } from '@/lib/constants';
import { getCurrentDate, formatReadableDate } from '@/lib/dateUtils';

export default function RecordPage() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const activeSections = getActiveSections();

  // Load records when date changes
  useEffect(() => {
    loadRecordsForDate(selectedDate);
  }, [selectedDate]);

  // Load records for a specific date
  const loadRecordsForDate = async (date) => {
    setIsLoading(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      const response = await fetch(`/api/hours/${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      } else {
        // If 404, pre-populate with default values
        if (response.status === 404) {
          prepopulateAllSections();
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Failed to load records:', error);
      prepopulateAllSections();
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-populate all sections with 0 hours
  const prepopulateAllSections = () => {
    const newRecords = activeSections.map(section => ({
      section,
      hours: 0
    }));
    
    // Add "Nothing" with 24 hours
    newRecords.push({
      section: 'Nothing',
      hours: 24
    });
    
    setRecords(newRecords);
  };

  // Update hours for a section
  const updateHours = (section, hours) => {
    // Validate hours (0-24)
    const validHours = Math.min(Math.max(0, hours), 24);
    
    // Update the section's hours
    const updatedRecords = records.map(record => {
      if (record.section === section) {
        return { ...record, hours: validHours };
      }
      return record;
    });
    
    // Update "Nothing" hours based on all other sections
    const totalAssignedHours = updatedRecords
      .filter(record => record.section !== 'Nothing')
      .reduce((sum, record) => sum + record.hours, 0);
    
    const nothingHours = Math.max(0, 24 - totalAssignedHours);
    
    const finalRecords = updatedRecords.map(record => {
      if (record.section === 'Nothing') {
        return { ...record, hours: nothingHours };
      }
      return record;
    });
    
    setRecords(finalRecords);
  };

  // Submit hour record
  const submitRecord = async () => {
    setIsLoading(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      // Filter out "Nothing" section and zero-hour records
      const recordsToSubmit = records
        .filter(record => record.section !== 'Nothing' && record.hours > 0);
      
      const response = await fetch('/api/hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          records: recordsToSubmit
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const savedRecord = await response.json();
      
      // Update records with the saved data (including calculated "Nothing")
      setRecords(savedRecord.records);
      
      setStatusMessage({
        type: 'success',
        message: 'Record saved successfully!'
      });
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Failed to save record:', error);
      setStatusMessage({
        type: 'error',
        message: `Failed to save record: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress percentages - UPDATED with proper 24-hour tracking
  const calculateDayProgress = () => {
    return Math.min(100, (records
      .filter(record => record.section !== 'Nothing')
      .reduce((sum, record) => sum + record.hours, 0) / 24) * 100);
  };

  const calculate24HourProgress = () => {
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    
    // Set both dates to midnight for comparison
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    // Compare dates
    if (selectedDateObj < today) {
      // Past day - 100% complete
      return 100;
    } else if (selectedDateObj > today) {
      // Future day - 0% complete
      return 0;
    } else {
      // Current day - calculate percentage passed
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      
      // Calculate milliseconds passed since midnight
      const msPassed = now.getTime() - midnight.getTime();
      const msInDay = 24 * 60 * 60 * 1000;
      
      return Math.min(100, (msPassed / msInDay) * 100);
    }
  };

  const dayProgressPercentage = calculateDayProgress();
  const hourProgressPercentage = calculate24HourProgress();

  return (
    <Layout title={`Record Hours for ${formatReadableDate(selectedDate)}`}>
      <DatePicker
        initialDate={selectedDate}
        onChange={setSelectedDate}
        max={getCurrentDate()}
      />

      <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 mb-8">
        {statusMessage.message && (
          <div className={`p-4 mb-6 rounded-md ${
            statusMessage.type === 'success' 
              ? 'bg-green-900/70 text-green-200 border border-green-700' 
              : 'bg-red-900/70 text-red-200 border border-red-700'
          }`}>
            <div className="flex items-center">
              {statusMessage.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {statusMessage.message}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse enhanced-table mb-6">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-blue-400 font-semibold uppercase text-sm tracking-wider rounded-tl-md">Section</th>
                    <th className="text-left py-3 px-4 text-blue-400 font-semibold uppercase text-sm tracking-wider rounded-tr-md">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records
                    .sort((a, b) => {
                      // Put "Nothing" section last
                      if (a.section === 'Nothing') return 1;
                      if (b.section === 'Nothing') return -1;
                      return a.section.localeCompare(b.section);
                    })
                    .map((record) => (
                      <tr 
                        key={record.section} 
                        className={`border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors ${
                          record.section === 'Nothing' ? 'text-gray-400 italic' : ''
                        }`}
                      >
                        <td className="py-3 px-4">{record.section}</td>
                        <td className="py-3 px-4">
                          {record.section === 'Nothing' ? (
                            <span className="bg-gray-700/50 px-3 py-1 rounded text-gray-300">{record.hours.toFixed(1)}h</span>
                          ) : (
                            <input
                              type="number"
                              value={record.hours}
                              onChange={(e) => updateHours(record.section, parseFloat(e.target.value) || 0)}
                              min="0"
                              max="24"
                              step="0.5"
                              className="w-24 bg-gray-700/50 text-center p-2 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25 outline-none transition-all"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={submitRecord}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-md font-medium transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Saving...' : 'Save Record'}
            </button>
          </>
        )}
      </div>

      {/* Enhanced Progress Bar Section */}
      <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-semibold mb-6 text-orange-400 border-b border-gray-700/50 pb-3">Day Progress</h2>
        
        <div className="mb-6 space-y-1">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Day Progress (excluding "Nothing")</span>
            <span className="font-medium text-blue-400">{dayProgressPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${dayProgressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 italic mt-1">Shows how much of your day has been allocated to activities</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">24 Hour Progress</span>
            <span className="font-medium text-blue-400">{hourProgressPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${hourProgressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 italic mt-1">
            {new Date(selectedDate).toDateString() === new Date().toDateString() 
              ? "Shows how much of today has passed (updates in real-time)" 
              : new Date(selectedDate) < new Date().setHours(0, 0, 0, 0)
                ? "Past day - 100% complete"
                : "Future day - 0% complete"
            }
          </p>
        </div>
      </div>
    </Layout>
  );
}