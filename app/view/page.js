'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import DatePicker from '@/components/DatePicker';
import CategoryList from '@/components/CategoryList';
import { getCurrentDate, formatReadableDate } from '@/lib/dateUtils';

export default function ViewPage() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load records when date changes
  useEffect(() => {
    loadRecordsForDate(selectedDate);
  }, [selectedDate]);

  // Load records for a specific date
  const loadRecordsForDate = async (date) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/hours/${date}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setRecords([]);
          setError('No records found for this date.');
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      const data = await response.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error('Failed to load records:', error);
      setError('Failed to load records. Please try again later.');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={`View Hours for ${formatReadableDate(selectedDate)}`}>
      <DatePicker
        initialDate={selectedDate}
        onChange={setSelectedDate}
        max={getCurrentDate()}
      />

      <div className="bg-background-card p-6 rounded-md shadow-md border border-border-primary">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-text-secondary italic bg-background-elevated rounded-md border border-dashed border-border-primary">
            <p>{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-text-secondary italic bg-background-elevated rounded-md border border-dashed border-border-primary">
            <p>No data available for the selected date.</p>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="bg-background-elevated">
                  <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Section</th>
                  <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Hours</th>
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
                      className={`border-b border-border-primary hover:bg-background-elevated/30 ${
                        record.section === 'Nothing' ? 'text-text-tertiary italic' : ''
                      }`}
                    >
                      <td className="py-3 px-4">{record.section}</td>
                      <td className="py-3 px-4">{record.hours.toFixed(1)}h</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            <CategoryList records={records} />
          </>
        )}
      </div>
    </Layout>
  );
}