import { useState, useEffect } from 'react';
import { formatDateForInput, getWeekEnd, formatWeekRange } from '@/lib/dateUtils';

export default function WeekPicker({ initialStartDate, onChange }) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(() => {
    const end = getWeekEnd(initialStartDate);
    return formatDateForInput(end);
  });

  // Update dates when initialStartDate prop changes
  useEffect(() => {
    setStartDate(initialStartDate);
    const end = getWeekEnd(initialStartDate);
    setEndDate(formatDateForInput(end));
  }, [initialStartDate]);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Calculate new end date (7 days after start)
    const end = getWeekEnd(newStartDate);
    setEndDate(formatDateForInput(end));
    
    onChange(newStartDate);
  };

  return (
    <div className="bg-background-elevated p-4 rounded-md border border-border-primary mb-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <label htmlFor="week-start-input" className="font-semibold text-primary-500 mr-4 mb-2 md:mb-0">
            Start Date:
          </label>
          <input
            type="date"
            id="week-start-input"
            value={startDate}
            onChange={handleStartDateChange}
            className="bg-background-card text-text-primary p-2 rounded border border-border-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25 outline-none transition-all max-w-[200px]"
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-center">
          <label htmlFor="week-end-input" className="font-semibold text-primary-500 mr-4 mb-2 md:mb-0">
            End Date:
          </label>
          <input
            type="date"
            id="week-end-input"
            value={endDate}
            disabled
            className="bg-background-card text-text-tertiary p-2 rounded border border-border-primary opacity-70 max-w-[200px]"
          />
        </div>
      </div>
      
      <div className="mt-4 pt-2 border-t border-border-primary">
        <span className="text-secondary-400 font-medium italic">
          {formatWeekRange(startDate)} (7 days)
        </span>
      </div>
    </div>
  );
}