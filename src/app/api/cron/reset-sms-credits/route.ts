import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Monthly SMS Credits Reset Cron Job
 * 
 * Resets SMS credits based on plan level:
 * - Free: 0 credits
 * - Pro: 250 credits/month
 * - Business: 1000 credits/month
 * 
 * Schedule: Run on 1st of every month
 * Vercel Cron: 0 0 1 * * (midnight on 1st of month)
 * 
 * Authorization: Protect this endpoint with CRON_SECRET in production
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret in production
    const authHeader = request.headers.get("authorization");
    if (process.env.NODE_ENV === "production") {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("🔄 Starting monthly SMS credits reset...");

    // Get all users with paid plans
    const users = await prisma.user.findMany({
      where: {
        plan: {
          not: "free",
        },
      },
      select: {
        id: true,
        email: true,
        plan: true,
        businessName: true,
      },
    });

    let resetCount = 0;
    const results = [];

    for (const user of users) {
      let newCredits = 0;

      // Determine credits based on plan
      const planLower = user.plan.toLowerCase();
      if (planLower.includes("pro")) {
        newCredits = 250;
      } else if (planLower.includes("business")) {
        newCredits = 1000;
      }

      // Reset credits and usage counter
      await prisma.user.update({
        where: { id: user.id },
        data: {
          smsCredits: newCredits,
          smsCreditsUsed: 0,
          smsCreditsRenewDate: new Date(),
        },
      });

      resetCount++;
      results.push({
        userId: user.id,
        email: user.email,
        plan: user.plan,
        creditsReset: newCredits,
      });

      console.log(`✅ Reset ${newCredits} credits for ${user.businessName || user.email} (${user.plan})`);
    }

    console.log(`🎉 SMS credits reset complete! ${resetCount} users updated.`);

    return NextResponse.json({
      success: true,
      message: `Successfully reset SMS credits for ${resetCount} users`,
      resetCount,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error resetting SMS credits:", error);
    return NextResponse.json(
      {
        error: "Failed to reset SMS credits",
        message: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
