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

    const { tags } = await request.json();

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

    // Update tags
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: { tags: tags || [] },
    });

    return NextResponse.json({
      success: true,
      tags: updatedClient.tags,
    });
  } catch (error) {
    console.error('Error updating client tags:', error);
    return NextResponse.json(
      { error: 'Failed to update tags' },
      { status: 500 }
    );
  }
}
