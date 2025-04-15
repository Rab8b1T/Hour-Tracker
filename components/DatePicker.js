// components/DatePicker.js
import { useState, useEffect } from 'react';
import { formatReadableDate } from '@/lib/dateUtils';

export default function DatePicker({ 
  initialDate, 
  onChange, 
  label = "Select Date:",
  max = null, // We'll make this optional and not pass it in most cases
  allowFutureDates = true // New prop to control future date selection
}) {
  const [date, setDate] = useState(initialDate);

  // Update date when initialDate prop changes
  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  const handleChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    onChange(newDate);
  };

  // Only apply max date if allowFutureDates is false
  const maxDate = !allowFutureDates ? max : null;

  return (
    <div className="bg-background-elevated p-4 rounded-md border border-border-primary mb-6">
      <div className="flex flex-col md:flex-row md:items-center">
        <label htmlFor="date-input" className="font-semibold text-primary-500 mr-4 mb-2 md:mb-0">
          {label}
        </label>
        <input
          type="date"
          id="date-input"
          value={date}
          onChange={handleChange}
          max={maxDate}
          className="bg-background-card text-text-primary p-2 rounded border border-border-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25 outline-none transition-all max-w-[200px]"
        />
      </div>
      <div className="mt-2 text-secondary-400 font-medium">
        {formatReadableDate(date)}
      </div>
    </div>
  );
}