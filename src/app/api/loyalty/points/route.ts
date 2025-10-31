import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch loyalty points for all clients
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user || user.plan === 'free') {
      return NextResponse.json({ error: 'Upgrade to Pro or Business to access loyalty features' }, { status: 403 });
    }

    const loyaltyPoints = await prisma.loyaltyPoints.findMany({
      where: { userId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { points: 'desc' },
    });

    return NextResponse.json(loyaltyPoints);
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty points' },
      { status: 500 }
    );
  }
}

// POST - Award or redeem points
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user || user.plan === 'free') {
      return NextResponse.json({ error: 'Upgrade to Pro or Business to access loyalty features' }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, points, action, description } = body;

    if (!clientId || !points || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, points, action' },
        { status: 400 }
      );
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get or create loyalty points record
    let loyaltyRecord = await prisma.loyaltyPoints.findUnique({
      where: {
        userId_clientId: {
          userId,
          clientId,
        },
      },
    });

    if (!loyaltyRecord) {
      loyaltyRecord = await prisma.loyaltyPoints.create({
        data: {
          userId,
          clientId,
          points: 0,
          totalEarned: 0,
          totalSpent: 0,
        },
      });
    }

    if (action === 'award') {
      // Award points
      const updated = await prisma.loyaltyPoints.update({
        where: { id: loyaltyRecord.id },
        data: {
          points: { increment: points },
          totalEarned: { increment: points },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Awarded ${points} points to ${client.name}`,
        points: updated.points,
      });
    } else if (action === 'redeem') {
      // Redeem points
      if (loyaltyRecord.points < points) {
        return NextResponse.json(
          { error: 'Insufficient points' },
          { status: 400 }
        );
      }

      const updated = await prisma.loyaltyPoints.update({
        where: { id: loyaltyRecord.id },
        data: {
          points: { decrement: points },
          totalSpent: { increment: points },
        },
      });

      // Log redemption
      await prisma.loyaltyRedemption.create({
        data: {
          userId,
          clientId,
          clientName: client.name,
          clientEmail: client.email,
          pointsUsed: points,
          description: description || 'Points redeemed',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Redeemed ${points} points for ${client.name}`,
        points: updated.points,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "award" or "redeem"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error managing loyalty points:', error);
    return NextResponse.json(
      { error: 'Failed to manage loyalty points' },
      { status: 500 }
    );
  }
}
