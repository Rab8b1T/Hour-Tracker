'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import DatePicker from '@/components/DatePicker';
import WeekPicker from '@/components/WeekPicker';
import { ALL_SECTIONS, getActiveSections } from '@/lib/constants';
import { getCurrentDate, getCurrentWeekStart, formatReadableDate } from '@/lib/dateUtils';

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState('day');
  const [dayDate, setDayDate] = useState(getCurrentDate());
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStart());
  
  const [dayGoals, setDayGoals] = useState({
    targets: {},
    actual: {},
    isComplete: false
  });
  
  const [weekGoals, setWeekGoals] = useState({
    targets: {},
    actual: {},
    isComplete: false
  });
  
  const [isDayLoading, setIsDayLoading] = useState(false);
  const [isWeekLoading, setIsWeekLoading] = useState(false);
  const [isSavingDay, setIsSavingDay] = useState(false);
  const [isSavingWeek, setIsSavingWeek] = useState(false);
  const [dayMessage, setDayMessage] = useState({ type: '', message: '' });
  const [weekMessage, setWeekMessage] = useState({ type: '', message: '' });
  
  const activeSections = getActiveSections();

  // Load day goals when date changes
  useEffect(() => {
    loadDayGoals(dayDate);
  }, [dayDate]);

  // Load week goals when week start date changes
  useEffect(() => {
    loadWeekGoals(weekStartDate);
  }, [weekStartDate]);

  // Load goals for a specific day
  const loadDayGoals = async (date) => {
    setIsDayLoading(true);
    setDayMessage({ type: '', message: '' });
    
    try {
      const response = await fetch(`/api/goals/day/${date}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No goals found for this date
          resetDayGoals();
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      const data = await response.json();
      
      // Process the response
      const targetMap = {};
      data.goal.targets.forEach(target => {
        targetMap[target.section] = target.targetHours;
      });
      
      const actualMap = {};
      data.actualHours.forEach(actual => {
        actualMap[actual.section] = actual.hours;
      });
      
      setDayGoals({
        targets: targetMap,
        actual: actualMap,
        isComplete: data.isComplete || false,
        progress: data.progress || 0
      });
    } catch (error) {
      console.error('Failed to load day goals:', error);
      resetDayGoals();
    } finally {
      setIsDayLoading(false);
    }
  };

  // Load goals for a specific week
  const loadWeekGoals = async (startDate) => {
    setIsWeekLoading(true);
    setWeekMessage({ type: '', message: '' });
    
    try {
      const response = await fetch(`/api/goals/week/${startDate}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No goals found for this week
          resetWeekGoals();
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      const data = await response.json();
      
      // Process the response
      const targetMap = {};
      data.goal.targets.forEach(target => {
        targetMap[target.section] = target.targetHours;
      });
      
      const actualMap = {};
      data.actualHours.forEach(actual => {
        actualMap[actual.section] = actual.hours;
      });
      
      setWeekGoals({
        targets: targetMap,
        actual: actualMap,
        isComplete: data.isComplete || false,
        progress: data.progress || 0
      });
    } catch (error) {
      console.error('Failed to load week goals:', error);
      resetWeekGoals();
    } finally {
      setIsWeekLoading(false);
    }
  };

  // Reset day goals
  const resetDayGoals = () => {
    setDayGoals({
      targets: {},
      actual: {},
      isComplete: false,
      progress: 0
    });
  };

  // Reset week goals
  const resetWeekGoals = () => {
    setWeekGoals({
      targets: {},
      actual: {},
      isComplete: false,
      progress: 0
    });
  };

  // Save day goals
  const saveDayGoals = async () => {
    setIsSavingDay(true);
    setDayMessage({ type: '', message: '' });
    
    // Collect all non-zero targets
    const targets = [];
    activeSections.forEach(section => {
      const hours = dayGoals.targets[section] || 0;
      if (hours > 0) {
        targets.push({
          section,
          targetHours: hours
        });
      }
    });
    
    if (targets.length === 0) {
      setDayMessage({ 
        type: 'error', 
        message: 'Please set at least one goal with hours greater than 0' 
      });
      setIsSavingDay(false);
      return;
    }
    
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'day',
          startDate: dayDate,
          targets
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      setDayMessage({ 
        type: 'success', 
        message: 'Day goals saved successfully!' 
      });
      
      // Reload the goals to get updated data
      loadDayGoals(dayDate);
    } catch (error) {
      console.error('Failed to save day goals:', error);
      setDayMessage({ 
        type: 'error', 
        message: `Failed to save day goals: ${error.message}` 
      });
    } finally {
      setIsSavingDay(false);
    }
  };

  // Save week goals
  const saveWeekGoals = async () => {
    setIsSavingWeek(true);
    setWeekMessage({ type: '', message: '' });
    
    // Collect all non-zero targets
    const targets = [];
    activeSections.forEach(section => {
      const hours = weekGoals.targets[section] || 0;
      if (hours > 0) {
        targets.push({
          section,
          targetHours: hours
        });
      }
    });
    
    if (targets.length === 0) {
      setWeekMessage({ 
        type: 'error', 
        message: 'Please set at least one goal with hours greater than 0' 
      });
      setIsSavingWeek(false);
      return;
    }
    
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'week',
          startDate: weekStartDate,
          targets
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      setWeekMessage({ 
        type: 'success', 
        message: 'Week goals saved successfully!' 
      });
      
      // Reload the goals to get updated data
      loadWeekGoals(weekStartDate);
    } catch (error) {
      console.error('Failed to save week goals:', error);
      setWeekMessage({ 
        type: 'error', 
        message: `Failed to save week goals: ${error.message}` 
      });
    } finally {
      setIsSavingWeek(false);
    }
  };

  // Update day goal target for a section
  const updateDayTarget = (section, hours) => {
    setDayGoals(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [section]: hours
      }
    }));
  };

  // Update week goal target for a section
  const updateWeekTarget = (section, hours) => {
    setWeekGoals(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [section]: hours
      }
    }));
  };

  return (
    <Layout title="Goals">
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
          For Date
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'week'
              ? 'bg-background-card text-text-primary border-b-2 border-primary-500'
              : 'text-text-secondary hover:bg-opacity-30 hover:bg-background-card'
          }`}
          onClick={() => setActiveTab('week')}
        >
          For Week
        </button>
      </div>

      <div className="bg-background-card p-6 rounded-md shadow-md border border-border-primary">
        {/* Day Goals Tab */}
        <div className={activeTab === 'day' ? 'block' : 'hidden'} id="day-tab">
          <DatePicker
            initialDate={dayDate}
            onChange={setDayDate}
            allowFutureDates={true}
          />

          {dayMessage.message && (
            <div className={`p-4 mb-6 rounded-md ${
              dayMessage.type === 'success' 
                ? 'bg-success-900 text-success-200 border border-success-700' 
                : 'bg-error-900 text-error-200 border border-error-700'
            }`}>
              {dayMessage.message}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-background-elevated">
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Section</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Target Hours</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Actual Hours</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Left</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSections.map((section) => {
                      const targetHours = dayGoals.targets[section] || 0;
                      const actualHours = dayGoals.actual[section] || 0;
                      const hoursLeft = Math.max(0, targetHours - actualHours);
                      const isComplete = actualHours >= targetHours;
                      const hasGoal = targetHours > 0;
                      
                      return (
                        <tr 
                          key={section} 
                          className={`border-b border-border-primary hover:bg-background-elevated/30 ${
                            hasGoal ? 'font-medium' : ''
                          }`}
                        >
                          <td className="py-3 px-4">{section}</td>
                          <td className="py-3 px-4">{targetHours > 0 ? targetHours.toFixed(1) : '-'}</td>
                          <td className="py-3 px-4">{actualHours > 0 ? actualHours.toFixed(1) : '-'}</td>
                          <td className="py-3 px-4">{targetHours > 0 ? hoursLeft.toFixed(1) : '-'}</td>
                          <td className={`py-3 px-4 ${
                            hasGoal 
                              ? isComplete 
                                ? 'text-success-500' 
                                : 'text-error-500'
                              : ''
                          }`}>
                            {hasGoal ? (isComplete ? 'Complete ✓' : 'Incomplete !') : 'No Goal Set'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-background-elevated">
                      <td colSpan="3" className="py-3 px-4 text-right font-semibold">Overall Status:</td>
                      <td colSpan="2" className={`py-3 px-4 font-semibold text-center ${
                        Object.keys(dayGoals.targets).length > 0
                          ? dayGoals.isComplete
                            ? 'text-success-500'
                            : 'text-error-500'
                          : ''
                      }`}>
                        {Object.keys(dayGoals.targets).length > 0
                          ? dayGoals.isComplete
                            ? 'Complete ✓'
                            : 'Incomplete !'
                          : 'No Goals Set'
                        }
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-background-elevated p-6 rounded-md border border-border-primary">
              <h3 className="text-xl text-center font-semibold text-secondary-500 mb-4 pb-2 border-b border-border-primary">Update Target Hours</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-1 gap-4 mb-6">
                {activeSections.map((section) => (
                  <div 
                    key={section} 
                    className="bg-background-card p-3 rounded border border-border-primary hover:border-primary-500 transition-all hover:transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <label htmlFor={`day-${section.replace(/\s+/g, '-').toLowerCase()}-hours`} className="block mb-1 text-text-secondary text-sm">
                      {section}
                    </label>
                    <input
                      type="number"
                      id={`day-${section.replace(/\s+/g, '-').toLowerCase()}-hours`}
                      value={dayGoals.targets[section] || ''}
                      onChange={(e) => updateDayTarget(section, parseFloat(e.target.value) || 0)}
                      min="0"
                      max="24"
                      step="0.5"
                      placeholder="0"
                      className="w-full p-2 bg-background-elevated rounded border border-border-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={saveDayGoals}
                disabled={isSavingDay || isDayLoading}
                className="w-full bg-success-600 hover:bg-success-500 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDay ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          </div>
        </div>

        {/* Week Goals Tab */}
        <div className={activeTab === 'week' ? 'block' : 'hidden'} id="week-tab">
          <WeekPicker
            initialStartDate={weekStartDate}
            onChange={setWeekStartDate}
          />

          {weekMessage.message && (
            <div className={`p-4 mb-6 rounded-md ${
              weekMessage.type === 'success' 
                ? 'bg-success-900 text-success-200 border border-success-700' 
                : 'bg-error-900 text-error-200 border border-error-700'
            }`}>
              {weekMessage.message}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-background-elevated">
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Section</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Target Hours</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Actual Hours</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Left</th>
                      <th className="text-left py-3 px-4 text-primary-500 font-semibold uppercase text-sm tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSections.map((section) => {
                      const targetHours = weekGoals.targets[section] || 0;
                      const actualHours = weekGoals.actual[section] || 0;
                      const hoursLeft = Math.max(0, targetHours - actualHours);
                      const isComplete = actualHours >= targetHours;
                      const hasGoal = targetHours > 0;
                      
                      return (
                        <tr 
                          key={section} 
                          className={`border-b border-border-primary hover:bg-background-elevated/30 ${
                            hasGoal ? 'font-medium' : ''
                          }`}
                        >
                          <td className="py-3 px-4">{section}</td>
                          <td className="py-3 px-4">{targetHours > 0 ? targetHours.toFixed(1) : '-'}</td>
                          <td className="py-3 px-4">{actualHours > 0 ? actualHours.toFixed(1) : '-'}</td>
                          <td className="py-3 px-4">{targetHours > 0 ? hoursLeft.toFixed(1) : '-'}</td>
                          <td className={`py-3 px-4 ${
                            hasGoal 
                              ? isComplete 
                                ? 'text-success-500' 
                                : 'text-error-500'
                              : ''
                          }`}>
                            {hasGoal ? (isComplete ? 'Complete ✓' : 'Incomplete !') : 'No Goal Set'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-background-elevated">
                      <td colSpan="3" className="py-3 px-4 text-right font-semibold">Overall Status:</td>
                      <td colSpan="2" className={`py-3 px-4 font-semibold text-center ${
                        Object.keys(weekGoals.targets).length > 0
                          ? weekGoals.isComplete
                            ? 'text-success-500'
                            : 'text-error-500'
                          : ''
                      }`}>
                        {Object.keys(weekGoals.targets).length > 0
                          ? weekGoals.isComplete
                            ? 'Complete ✓'
                            : 'Incomplete !'
                          : 'No Goals Set'
                        }
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-background-elevated p-6 rounded-md border border-border-primary">
              <h3 className="text-xl text-center font-semibold text-secondary-500 mb-4 pb-2 border-b border-border-primary">Update Target Hours</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-1 gap-4 mb-6">
                {activeSections.map((section) => (
                  <div 
                    key={section} 
                    className="bg-background-card p-3 rounded border border-border-primary hover:border-primary-500 transition-all hover:transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <label htmlFor={`week-${section.replace(/\s+/g, '-').toLowerCase()}-hours`} className="block mb-1 text-text-secondary text-sm">
                      {section}
                    </label>
                    <input
                      type="number"
                      id={`week-${section.replace(/\s+/g, '-').toLowerCase()}-hours`}
                      value={weekGoals.targets[section] || ''}
                      onChange={(e) => updateWeekTarget(section, parseFloat(e.target.value) || 0)}
                      min="0"
                      max="168"
                      step="0.5"
                      placeholder="0"
                      className="w-full p-2 bg-background-elevated rounded border border-border-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={saveWeekGoals}
                disabled={isSavingWeek || isWeekLoading}
                className="w-full bg-success-600 hover:bg-success-500 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingWeek ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}