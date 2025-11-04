import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { invalidateBillingCache } from "@/lib/cache-invalidation";

/**
 * POST - Clear billing cache for current user
 * This forces a fresh fetch from Stripe
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await invalidateBillingCache(userId);

    return NextResponse.json({ success: true, message: "Billing cache cleared" });
  } catch (error) {
    console.error("Error clearing billing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
