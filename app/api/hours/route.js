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
      // Update existing record
      for (const newRecord of records) {
        const existingRecordIndex = hourRecord.records.findIndex(
          r => r.section === newRecord.section
        );
        
        if (existingRecordIndex !== -1) {
          hourRecord.records[existingRecordIndex].hours = newRecord.hours;
        } else {
          hourRecord.records.push(newRecord);
        }
      }
      
      // Ensure "Nothing" category is updated correctly
      const totalHoursExcludingNothing = hourRecord.records.reduce((total, record) => {
        return record.section !== 'Nothing' ? total + record.hours : total;
      }, 0);
      
      const remainingHours = Math.max(0, 24 - totalHoursExcludingNothing);
      
      const nothingRecordIndex = hourRecord.records.findIndex(
        r => r.section === 'Nothing'
      );
      
      if (nothingRecordIndex !== -1) {
        hourRecord.records[nothingRecordIndex].hours = remainingHours;
      } else if (remainingHours > 0) {
        hourRecord.records.push({
          section: 'Nothing',
          hours: remainingHours
        });
      }
      
      await hourRecord.save();
    } else {
      // Create new record
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
    }
    
    return NextResponse.json(hourRecord);
  } catch (error) {
    console.error('Error in POST /api/hours:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}