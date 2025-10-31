import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const rawId = params?.id;
    const clientId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof clientId !== 'string' || !clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const { notes } = await request.json();

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

    // Update notes
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: { notes },
    });

    return NextResponse.json({
      success: true,
      notes: updatedClient.notes,
    });
  } catch (error) {
    console.error('Error updating client notes:', error);
    return NextResponse.json(
      { error: 'Failed to update notes' },
      { status: 500 }
    );
  }
}
