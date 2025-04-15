import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hour from '@/models/Hour';
import { createDateRange } from '@/lib/dateUtils';

// GET /api/hours - Get all hour records
export async function GET() {
  try {
    await connectDB();
    const hours = await Hour.find().sort({ date: -1 });
    
    return NextResponse.json(hours);
  } catch (error) {
    console.error('Error in GET /api/hours:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/hours - Create or update hour record
export async function POST(request) {
  try {
    const body = await request.json();
    const { date, records } = body;
    
    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Invalid request data', message: 'Date and records array are required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create consistent date range for lookup
    const { startDate, endDate } = createDateRange(date);
    
    // Find if record already exists for this date
    let hourRecord = await Hour.findOne({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    if (hourRecord) {
      console.log(`Updating existing record for date ${date}`);
      
      // Clear existing records and replace with new ones
      hourRecord.records = [];
      
      // Add all new records
      for (const newRecord of records) {
        hourRecord.records.push(newRecord);
      }
      
      // Update "Nothing" category automatically
      const totalHoursExcludingNothing = hourRecord.records.reduce((total, record) => {
        return record.section !== 'Nothing' ? total + record.hours : total;
      }, 0);
      
      const remainingHours = Math.max(0, 24 - totalHoursExcludingNothing);
      
      // Remove any existing "Nothing" record
      hourRecord.records = hourRecord.records.filter(r => r.section !== 'Nothing');
      
      // Add new "Nothing" record if there are remaining hours
      if (remainingHours > 0) {
        hourRecord.records.push({
          section: 'Nothing',
          hours: remainingHours
        });
      }
      
      await hourRecord.save();
      console.log(`Updated record saved successfully for date ${date}`);
    } else {
      console.log(`Creating new record for date ${date}`);
      // Create new record - unchanged from your original code
      const totalHoursExcludingNothing = records.reduce((total, record) => {
        return record.section !== 'Nothing' ? total + record.hours : total;
      }, 0);
      
      const remainingHours = Math.max(0, 24 - totalHoursExcludingNothing);
      
      let allRecords = [...records];
      
      // Add "Nothing" category if not already included
      if (!records.some(r => r.section === 'Nothing') && remainingHours > 0) {
        allRecords.push({
          section: 'Nothing',
          hours: remainingHours
        });
      }
      
      hourRecord = new Hour({
        date: startDate,
        records: allRecords
      });
      
      await hourRecord.save();
      console.log(`New record saved successfully for date ${date}`);
    }
    
    return NextResponse.json(hourRecord);
  } catch (error) {
    console.error(`Error in POST /api/hours:`, error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}