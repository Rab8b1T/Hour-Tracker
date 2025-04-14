'use client';

import { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { SECTION_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';

// Register required Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

export default function PieChart({ records, title = 'Distribution by Category' }) {
  const chartRef = useRef(null);

  // Group records by category
  const categoryData = {};
  
  records.forEach(record => {
    // Find which category this section belongs to
    for (const [category, sections] of Object.entries(SECTION_CATEGORIES)) {
      if (sections.includes(record.section)) {
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        categoryData[category] += record.hours;
        break;
      }
    }
  });
  
  // Prepare chart data
  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);
  const totalHours = data.reduce((sum, val) => sum + val, 0);
  
  const backgroundColors = labels.map(label => CATEGORY_COLORS[label] || 'rgba(201, 203, 207, 0.8)');
  
  // Create border for white sections (Sleep) to make it visible
  const borderColors = labels.map(label => {
    return label === 'Sleep' ? 'rgba(100, 100, 100, 1)' : CATEGORY_COLORS[label] || 'rgba(201, 203, 207, 1)';
  });

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Hours',
      data: data,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: function(context) {
            return context.text === 'Nothing' ? '#ffffff' : '#f0f0f0';
          },
          font: {
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#f0f0f0'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / totalHours) * 100).toFixed(1);
            return `${label}: ${value.toFixed(1)}h (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-full min-h-[300px]">
      <Pie
        ref={chartRef}
        data={chartData}
        options={chartOptions}
        aria-label={title}
      />
    </div>
  );
}