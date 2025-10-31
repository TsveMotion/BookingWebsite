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
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Role ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, permissions } = body;

    // Verify role belongs to user
    const role = await prisma.customRole.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updatedRole = await prisma.customRole.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        permissions: permissions !== undefined ? permissions : undefined,
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Role ID required' }, { status: 400 });
    }

    // Verify role belongs to user
    const role = await prisma.customRole.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    await prisma.customRole.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
