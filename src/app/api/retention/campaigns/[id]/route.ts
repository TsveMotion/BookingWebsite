import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, type, subject, body: emailBody, status, daysInactive, discountPercent } = body;

    // Verify ownership
    const existing = await prisma.retentionCampaign.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaign = await prisma.retentionCampaign.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        type: type !== undefined ? type : undefined,
        subject: subject !== undefined ? subject : undefined,
        body: emailBody !== undefined ? emailBody : undefined,
        status: status !== undefined ? status : undefined,
        daysInactive: daysInactive !== undefined ? daysInactive : undefined,
        discountPercent: discountPercent !== undefined ? discountPercent : undefined,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.retentionCampaign.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await prisma.retentionCampaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
