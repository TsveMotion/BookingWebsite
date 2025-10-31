import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

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
    const rawServiceId = params?.id;
    const serviceId = Array.isArray(rawServiceId) ? rawServiceId[0] : rawServiceId;
    const rawAddonId = params?.addonId;
    const addonId = Array.isArray(rawAddonId) ? rawAddonId[0] : rawAddonId;

    if ((typeof serviceId !== 'string' || !serviceId) || (typeof addonId !== 'string' || !addonId)) {
      return NextResponse.json({ error: 'Service ID and Addon ID required' }, { status: 400 });
    }

    // Verify service belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Delete add-on
    await prisma.serviceAddon.delete({
      where: { id: addonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service add-on:', error);
    return NextResponse.json(
      { error: 'Failed to delete add-on' },
      { status: 500 }
    );
  }
}
