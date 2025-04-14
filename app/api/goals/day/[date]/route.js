import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Hour from '@/models/Hour';
import { createDateRange } from '@/lib/dateUtils';

// GET /api/goals/day/[date] - Get day goal for specific date
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
    
    // Find goal for this date
    const goal = await Goal.findOne({
      type: 'day',
      startDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Not found', message: 'No goal found for this date' },
        { status: 404 }
      );
    }
    
    // Get actual hours for comparison
    const hourRecord = await Hour.findOne({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    const actualHours = hourRecord ? hourRecord.records : [];
    const isComplete = goal.isComplete(actualHours);
    const progress = goal.getProgress(actualHours);
    
    return NextResponse.json({
      goal,
      actualHours,
      isComplete,
      progress
    });
  } catch (error) {
    console.error(`Error in GET /api/goals/day/${params?.date}:`, error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}