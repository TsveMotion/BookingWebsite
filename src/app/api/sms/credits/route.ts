import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        smsCredits: true,
        smsCreditsUsed: true,
        smsCreditsRenewDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate monthly allowance based on plan
    let monthlyAllowance = 0;
    if (user.plan === "pro") monthlyAllowance = 250;
    if (user.plan === "business") monthlyAllowance = 1000;

    // Check if credits need renewal
    const now = new Date();
    const renewDate = user.smsCreditsRenewDate;
    let needsRenewal = false;

    if (!renewDate || renewDate < now) {
      needsRenewal = true;
    }

    // If renewal needed, add monthly allowance to existing purchased credits
    if (needsRenewal && monthlyAllowance > 0) {
      const nextRenewDate = new Date();
      nextRenewDate.setMonth(nextRenewDate.getMonth() + 1);

      // Keep any purchased credits and add monthly allowance
      const newTotal = (user.smsCredits || 0) + monthlyAllowance;

      await prisma.user.update({
        where: { id: userId },
        data: {
          smsCredits: newTotal,
          smsCreditsUsed: 0,
          smsCreditsRenewDate: nextRenewDate,
        },
      });

      return NextResponse.json({
        total: newTotal,
        used: 0,
        remaining: newTotal,
        monthlyAllowance,
        renewDate: nextRenewDate,
      });
    }

    return NextResponse.json({
      total: user.smsCredits,
      used: user.smsCreditsUsed,
      remaining: user.smsCredits - user.smsCreditsUsed,
      monthlyAllowance,
      renewDate: user.smsCreditsRenewDate,
    });
  } catch (error) {
    console.error("SMS credits fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch SMS credits" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { credits } = body; // Number of credits to add

    if (!credits || credits <= 0) {
      return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });
    }

    // Add credits to user account
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        smsCredits: {
          increment: credits,
        },
      },
      select: {
        smsCredits: true,
        smsCreditsUsed: true,
      },
    });

    return NextResponse.json({
      success: true,
      total: user.smsCredits,
      used: user.smsCreditsUsed,
      remaining: user.smsCredits - user.smsCreditsUsed,
    });
  } catch (error) {
    console.error("SMS credits add error:", error);
    return NextResponse.json({ error: "Failed to add SMS credits" }, { status: 500 });
  }
}
