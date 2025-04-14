'use client';

import { useEffect, useRef } from 'react';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { SECTION_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';

// Register required Chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart({ weekData, title = 'Daily Activity' }) {
  const chartRef = useRef(null);

  // Prepare data for each day
  const labels = weekData.map(day => {
    const date = new Date(day.date);
    return format(date, 'EEE, MMM d');
  });
  
  // Create a dataset for each category
  const categoryDatasets = {};
  
  // Initialize datasets for each category
  for (const category of Object.keys(SECTION_CATEGORIES)) {
    categoryDatasets[category] = Array(labels.length).fill(0);
  }
  
  // Fill in data for each day
  weekData.forEach((day, dayIndex) => {
    day.records.forEach(record => {
      // Find which category this section belongs to
      for (const [category, sections] of Object.entries(SECTION_CATEGORIES)) {
        if (sections.includes(record.section)) {
          categoryDatasets[category][dayIndex] += record.hours;
          break;
        }
      }
    });
  });
  
  // Create datasets for Chart.js
  const datasets = Object.entries(categoryDatasets).map(([category, data]) => {
    const color = CATEGORY_COLORS[category] || 'rgba(201, 203, 207, 0.8)';
    return {
      label: category,
      data: data,
      backgroundColor: color,
      borderColor: color.replace('0.8', '1'),
      borderWidth: category === 'Sleep' ? 1 : 1
    };
  });

  const chartData = {
    labels: labels,
    datasets: datasets
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: '#f0f0f0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 24,
        title: {
          display: true,
          text: 'Hours',
          color: '#f0f0f0'
        },
        ticks: {
          color: '#f0f0f0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
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
      }
    }
  };

  return (
    <div className="h-full min-h-[300px]">
      <Bar
        ref={chartRef}
        data={chartData}
        options={chartOptions}
        aria-label={title}
      />
    </div>
  );
}