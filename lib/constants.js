// List of all available sections
export const ALL_SECTIONS = [
    'Morning Run',
    'Exercise',
    'Cooking',
    'DSA',
    'Development',
    'Sketching',
    'Office',
    'BGMI',
    'COC',
    'Social Media',
    'Movies/Anime',
    'Sleep',
    'Competitive Programming',
    'Nothing'
  ];
  
  // Section categories
  export const SECTION_CATEGORIES = {
    Health: ['Morning Run', 'Exercise', 'Cooking'],
    'Self Progress': ['DSA', 'Development', 'Competitive Programming'],
    Entertainment: ['BGMI', 'COC', 'Social Media', 'Movies/Anime'],
    Office: ['Office'],
    Sketching: ['Sketching'],
    Sleep: ['Sleep'],
    Nothing: ['Nothing']
  };
  
  // Colors for charts
  export const CATEGORY_COLORS = {
    Health: 'rgba(0, 170, 0, 0.8)',        // Green
    'Self Progress': 'rgba(255, 215, 0, 0.8)', // Yellow
    Entertainment: 'rgba(255, 0, 0, 0.8)',     // Red
    Office: 'rgba(135, 206, 235, 0.8)',        // Sky blue
    Sketching: 'rgba(30, 144, 255, 0.8)',      // Blue
    Sleep: 'rgba(255, 255, 255, 0.8)',         // White
    Nothing: 'rgba(0, 0, 0, 0.8)'              // Black
  };
  
  // Helper function to get active sections (excluding Nothing which is calculated)
  export const getActiveSections = () => ALL_SECTIONS.filter(section => section !== 'Nothing');