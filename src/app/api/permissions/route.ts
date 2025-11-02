import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserPermissions } from '@/lib/permissions';

/**
 * GET - Fetch current user's permissions
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permissions = await getUserPermissions(userId);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
