import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all campaigns
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

    const campaigns = await prisma.loyaltyCampaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST - Create new campaign
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
    const { name, type, subject, bodyContent, status } = body;

    if (!name || !type || !subject || !bodyContent) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, subject, bodyContent' },
        { status: 400 }
      );
    }

    const campaign = await prisma.loyaltyCampaign.create({
      data: {
        userId,
        name,
        type,
        subject,
        body: bodyContent,
        status: status || 'draft',
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

// PATCH - Update campaign
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user || user.plan === 'free') {
      return NextResponse.json({ error: 'Upgrade to Pro or Business to access loyalty features' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, type, subject, bodyContent, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // Verify campaign belongs to user
    const existingCampaign = await prisma.loyaltyCampaign.findFirst({
      where: { id, userId },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const updated = await prisma.loyaltyCampaign.update({
      where: { id },
      data: {
        name: name || existingCampaign.name,
        type: type || existingCampaign.type,
        subject: subject || existingCampaign.subject,
        body: bodyContent || existingCampaign.body,
        status: status || existingCampaign.status,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updated,
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // Verify campaign belongs to user
    const campaign = await prisma.loyaltyCampaign.findFirst({
      where: { id, userId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    await prisma.loyaltyCampaign.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
