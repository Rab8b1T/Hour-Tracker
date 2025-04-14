import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import { createDateRange, createWeekRange } from '@/lib/dateUtils';

// GET /api/goals - Get all goals
export async function GET() {
  try {
    await connectDB();
    const goals = await Goal.find().sort({ startDate: -1 });
    
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error in GET /api/goals:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create or update a goal
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, startDate, targets } = body;
    
    if (!type || !startDate || !targets || !Array.isArray(targets)) {
      return NextResponse.json(
        { error: 'Invalid request data', message: 'Type, startDate, and targets array are required' },
        { status: 400 }
      );
    }
    
    if (type !== 'day' && type !== 'week') {
      return NextResponse.json(
        { error: 'Invalid goal type', message: 'Type must be "day" or "week"' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create consistent date range based on goal type
    let recordStartDate, recordEndDate;
    
    if (type === 'day') {
      const range = createDateRange(startDate);
      recordStartDate = range.startDate;
      recordEndDate = range.endDate;
    } else {
      const range = createWeekRange(startDate);
      recordStartDate = range.startDate;
      recordEndDate = range.endDate;
    }
    
    // Find if goal already exists for this period
    let goal = await Goal.findOne({
      type,
      startDate: {
        $gte: recordStartDate,
        $lt: new Date(recordStartDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (goal) {
      // Update existing goal
      goal.targets = targets;
      await goal.save();
    } else {
      // Create new goal
      goal = new Goal({
        type,
        startDate: recordStartDate,
        endDate: recordEndDate,
        targets
      });
      
      await goal.save();
    }
    
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error in POST /api/goals:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}