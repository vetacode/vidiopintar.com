import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserPlanService } from '@/lib/user-plan-service';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usageStats = await UserPlanService.getUserUsageStats(user.id);
    
    return NextResponse.json(usageStats);
  } catch (error) {
    console.error('Failed to fetch usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}