import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hour from '@/models/Hour';
import { createDateRange } from '@/lib/dateUtils';

// GET /api/hours/[date] - Get hour record for specific date
export async function GET(request, { params }) {
  try {
    const dateStr = params.date;
    
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: 'Invalid date format', message: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create date range for lookup
    const { startDate, endDate } = createDateRange(dateStr);
    
    // Find hour record for this date
    const hourRecord = await Hour.findOne({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    if (!hourRecord) {
      return NextResponse.json(
        { error: 'Not found', message: 'No records found for this date' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(hourRecord);
  } catch (error) {
    console.error(`Error in GET /api/hours/${params?.date}:`, error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}