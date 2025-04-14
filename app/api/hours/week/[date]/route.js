import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hour from '@/models/Hour';
import { createWeekRange } from '@/lib/dateUtils';

// GET /api/hours/week/[date] - Get hour records for a week
export async function GET(request, { params }) {
  try {
    const startDateStr = params.date;
    
    if (!startDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
      return NextResponse.json(
        { error: 'Invalid date format', message: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create week range for lookup
    const { startDate, endDate } = createWeekRange(startDateStr);
    
    // Find hour records for this week
    const hourRecords = await Hour.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    return NextResponse.json(hourRecords);
  } catch (error) {
    console.error(`Error in GET /api/hours/week/${params?.date}:`, error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}