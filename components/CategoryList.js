// components/CategoryList.js
import { SECTION_CATEGORIES } from '@/lib/constants';

export default function CategoryList({ records }) {
  // Group records by category
  const categorySections = {};
  let totalHours = 0;
  
  // Initialize all categories with empty arrays
  Object.keys(SECTION_CATEGORIES).forEach(category => {
    categorySections[category] = [];
  });
  
  // Process records
  records.forEach(record => {
    if (record.hours > 0) {
      totalHours += record.hours;
    }
    
    // Find which category this section belongs to
    for (const [category, sections] of Object.entries(SECTION_CATEGORIES)) {
      if (sections.includes(record.section)) {
        categorySections[category].push(record);
        break;
      }
    }
  });

  // Define border colors for categories
  const borderColors = [
    'border-primary-500',
    'border-secondary-500',
    'border-success-500',
    'border-warning-500',
    'border-error-500'
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border-primary">
      <h3 className="text-xl font-semibold text-secondary-500 mb-4">Section-Wise View</h3>
      <ul className="space-y-4">
        {Object.entries(categorySections).map(([category, categoryRecords], index) => {
          // Calculate total hours for this category
          const categoryHours = categoryRecords.reduce((sum, record) => sum + record.hours, 0);
          const percentage = totalHours > 0 ? ((categoryHours / totalHours) * 100).toFixed(1) : '0.0';
          
          // Create section names string
          const sectionNames = categoryRecords.map(record => 
            `${record.section} (${record.hours.toFixed(1)}h)`
          ).join(', ');
          
          // Cycle through border colors
          const borderColorClass = borderColors[index % borderColors.length];
          
          return (
            <li 
              key={category}
              className={`p-4 bg-background-elevated rounded-sm ${borderColorClass} border-l-4 transition-transform hover:translate-x-1`}
            >
              <span className="block font-semibold text-text-primary mb-1 text-lg">
                {category}: {categoryHours.toFixed(1)}h ({percentage}%)
              </span>
              <span className="block text-text-secondary text-sm">
                {sectionNames || 'No hours recorded'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}