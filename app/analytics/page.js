'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import DatePicker from '@/components/DatePicker';
import WeekPicker from '@/components/WeekPicker';
import CategoryList from '@/components/CategoryList';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import { getCurrentDate, getCurrentWeekStart, formatWeekRange, createWeekRange } from '@/lib/dateUtils';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('day');
  const [dayDate, setDayDate] = useState(getCurrentDate());
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStart());
  
  const [dayRecords, setDayRecords] = useState([]);
  const [weekRecords, setWeekRecords] = useState([]);
  const [weekData, setWeekData] = useState([]);
  
  const [isDayLoading, setIsDayLoading] = useState(false);
  const [isWeekLoading, setIsWeekLoading] = useState(false);
  const [dayError, setDayError] = useState('');
  const [weekError, setWeekError] = useState('');

  // Load day data when date changes
  useEffect(() => {
    loadDayData(dayDate);
  }, [dayDate]);

  // Load week data when week start date changes
  useEffect(() => {
    loadWeekData(weekStartDate);
  }, [weekStartDate]);

  // Load data for a specific day
  const loadDayData = async (date) => {
    setIsDayLoading(true);
    setDayError('');
    
    try {
      const response = await fetch(`/api/hours/${date}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No data for this date, show default "Nothing" record
          setDayRecords([{ section: 'Nothing', hours: 24 }]);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      const data = await response.json();
      setDayRecords(data.records || []);
    } catch (error) {
      console.error('Failed to load day data:', error);
      setDayError('Failed to load data. Please try again later.');
      setDayRecords([{ section: 'Nothing', hours: 24 }]);
    } finally {
      setIsDayLoading(false);
    }
  };

  // Load data for a specific week
  const loadWeekData = async (startDate) => {
    setIsWeekLoading(true);
    setWeekError('');
    
    try {
      const response = await fetch(`/api/hours/week/${startDate}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Create default week data with "Nothing" for each day
          createDefaultWeekData(startDate);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        createDefaultWeekData(startDate);
        return;
      }
      
      // Store the full week data for charts
      setWeekData(data);
      
      // Create combined records for the category view
      const combinedRecords = combineWeekRecords(data);
      setWeekRecords(combinedRecords);
    } catch (error) {
      console.error('Failed to load week data:', error);
      setWeekError('Failed to load data. Please try again later.');
      createDefaultWeekData(startDate);
    } finally {
      setIsWeekLoading(false);
    }
  };

  // Create default week data with "Nothing" for each day
  const createDefaultWeekData = (startDate) => {
    const { startDate: start, endDate: end } = createWeekRange(startDate);
    
    const defaultData = [];
    const dayCount = 7; // A week always has 7 days
    
    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      
      defaultData.push({
        date: currentDate.toISOString(),
        records: [{ section: 'Nothing', hours: 24 }]
      });
    }
    
    setWeekData(defaultData);
    setWeekRecords([{ section: 'Nothing', hours: 24 * 7 }]);
  };

  // Combine all records from the week
  const combineWeekRecords = (weekData) => {
    const sectionMap = new Map();
    
    weekData.forEach(dayData => {
      dayData.records.forEach(record => {
        const section = record.section;
        const hours = record.hours;
        
        if (sectionMap.has(section)) {
          sectionMap.set(section, sectionMap.get(section) + hours);
        } else {
          sectionMap.set(section, hours);
        }
      });
    });
    
    return Array.from(sectionMap.entries()).map(([section, hours]) => ({
      section,
      hours
    }));
  };

  return (
    <Layout title="Analytics">
      {/* Tab Navigation */}
      <div className="flex mb-8 bg-background-elevated rounded-md overflow-hidden">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'day'
              ? 'bg-background-card text-text-primary border-b-2 border-primary-500'
              : 'text-text-secondary hover:bg-opacity-30 hover:bg-background-card'
          }`}
          onClick={() => setActiveTab('day')}
        >
          Day View
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'week'
              ? 'bg-background-card text-text-primary border-b-2 border-primary-500'
              : 'text-text-secondary hover:bg-opacity-30 hover:bg-background-card'
          }`}
          onClick={() => setActiveTab('week')}
        >
          Week View
        </button>
      </div>

      {/* Day View Content */}
      <div className={activeTab === 'day' ? 'block' : 'hidden'} id="day-tab">
        <DatePicker
          initialDate={dayDate}
          onChange={setDayDate}
          max={getCurrentDate()}
        />

        <div className="bg-background-card p-6 rounded-md shadow-md border border-border-primary">
          {isDayLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading data...</p>
            </div>
          ) : dayError ? (
            <div className="text-center py-8 text-text-secondary italic bg-background-elevated rounded-md border border-dashed border-border-primary">
              <p>{dayError}</p>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse mb-8">
                <thead>
                  <tr className="bg-background-elevated">
                    <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Section</th>
                    <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Hours Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRecords
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
                        <td className="py-3 px-4">{record.hours.toFixed(1)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              
              <CategoryList records={dayRecords} />

              <div className="mt-8 pt-6 border-t border-border-primary">
                <div className="h-[350px] bg-background-elevated p-4 rounded-md">
                  <PieChart records={dayRecords} title="Time Distribution by Category" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Week View Content */}
      <div className={activeTab === 'week' ? 'block' : 'hidden'} id="week-tab">
        <WeekPicker
          initialStartDate={weekStartDate}
          onChange={setWeekStartDate}
        />

        <div className="bg-background-card p-6 rounded-md shadow-md border border-border-primary">
          {isWeekLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading data...</p>
            </div>
          ) : weekError ? (
            <div className="text-center py-8 text-text-secondary italic bg-background-elevated rounded-md border border-dashed border-border-primary">
              <p>{weekError}</p>
            </div>
          ) : (
            <>
              <div className="bg-background-elevated p-4 rounded-md border-l-4 border-primary-500 mb-6">
                <p>
                  <strong>Week Overview:</strong> {formatWeekRange(weekStartDate)} (7 days)
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  Showing data for {weekData.length} days, with {weekData.filter(d => d.records.some(r => r.section !== 'Nothing')).length} days of recorded activity.
                </p>
              </div>

              <table className="w-full border-collapse mb-8">
                <thead>
                  <tr className="bg-background-elevated">
                    <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Section</th>
                    <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Total Hours</th>
                    <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Daily Average</th>
                    <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {weekRecords
                    .sort((a, b) => {
                      // Put "Nothing" section last
                      if (a.section === 'Nothing') return 1;
                      if (b.section === 'Nothing') return -1;
                      return a.section.localeCompare(b.section);
                    })
                    .map((record) => {
                      const totalHours = weekRecords.reduce((sum, r) => sum + r.hours, 0);
                      const percentage = (record.hours / totalHours) * 100;
                      const dailyAverage = record.hours / 7;
                      
                      return (
                        <tr 
                          key={record.section} 
                          className={`border-b border-border-primary hover:bg-background-elevated/30 ${
                            record.section === 'Nothing' ? 'text-text-tertiary italic' : ''
                          }`}
                        >
                          <td className="py-3 px-4">{record.section}</td>
                          <td className="py-3 px-4">{record.hours.toFixed(1)}</td>
                          <td className="py-3 px-4">{dailyAverage.toFixed(1)}</td>
                          <td className="py-3 px-4">{percentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              
              <CategoryList records={weekRecords} />

              <div className="mt-8 pt-6 border-t border-border-primary grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[350px] bg-background-elevated p-4 rounded-md">
                  <PieChart records={weekRecords} title="Weekly Time Distribution by Category" />
                </div>
                <div className="h-[350px] bg-background-elevated p-4 rounded-md">
                  <BarChart weekData={weekData} title="Daily Activity Breakdown" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}