import mongoose from 'mongoose';

// Define the sections for the app
const VALID_SECTIONS = [
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
  'Nothing',
  'Sleep',
  'Competitive Programming'
];

const HourSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  records: [
    {
      section: {
        type: String,
        required: true,
        enum: VALID_SECTIONS
      },
      hours: {
        type: Number,
        required: true,
        min: 0,
        max: 24
      }
    }
  ]
}, {
  timestamps: true
});

// Get total hours spent
HourSchema.virtual('totalHours').get(function() {
  return this.records.reduce((total, record) => total + record.hours, 0);
});

// Get hours spent by category
HourSchema.virtual('categoryHours').get(function() {
  const categories = {
    Health: ['Morning Run', 'Exercise', 'Cooking'],
    'Self Progress': ['DSA', 'Development', 'Competitive Programming'],
    Entertainment: ['BGMI', 'COC', 'Social Media', 'Movies/Anime'],
    Office: ['Office'],
    Sketching: ['Sketching'],
    Sleep: ['Sleep'],
    Nothing: ['Nothing']
  };
  
  const result = {};
  
  for (const [category, sections] of Object.entries(categories)) {
    const hours = this.records
      .filter(record => sections.includes(record.section))
      .reduce((total, record) => total + record.hours, 0);
    
    result[category] = hours;
  }
  
  return result;
});

// Get remaining hours for "Nothing" category
HourSchema.methods.getRemainingHours = function() {
  const totalSpent = this.records.reduce((total, record) => {
    if (record.section !== 'Nothing') {
      return total + record.hours;
    }
    return total;
  }, 0);
  
  return Math.max(0, 24 - totalSpent);
};

export default mongoose.models.Hour || mongoose.model('Hour', HourSchema);