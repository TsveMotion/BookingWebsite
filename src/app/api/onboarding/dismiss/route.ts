import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleteShown: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error dismissing onboarding banner:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss banner' },
      { status: 500 }
    );
  }
}
