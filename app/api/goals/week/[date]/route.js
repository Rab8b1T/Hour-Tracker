import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Hour from '@/models/Hour';
import { createWeekRange } from '@/lib/dateUtils';

// GET /api/goals/week/[date] - Get week goal
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
    
    // Find goal for this week
    const goal = await Goal.findOne({
      type: 'week',
      startDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Not found', message: 'No goal found for this week' },
        { status: 404 }
      );
    }
    
    // Get actual hours for comparison
    const hourRecords = await Hour.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    // Combine all hours from the week
    const sectionMap = new Map();
    
    hourRecords.forEach(record => {
      record.records.forEach(hourRecord => {
        const section = hourRecord.section;
        const hours = hourRecord.hours;
        
        if (sectionMap.has(section)) {
          sectionMap.set(section, sectionMap.get(section) + hours);
        } else {
          sectionMap.set(section, hours);
        }
      });
    });
    
    const combinedActualHours = Array.from(sectionMap.entries()).map(([section, hours]) => ({
      section,
      hours
    }));
    
    const isComplete = goal.isComplete(combinedActualHours);
    const progress = goal.getProgress(combinedActualHours);
    
    return NextResponse.json({
      goal,
      actualHours: combinedActualHours,
      isComplete,
      progress
    });
  } catch (error) {
    console.error(`Error in GET /api/goals/week/${params?.date}:`, error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}