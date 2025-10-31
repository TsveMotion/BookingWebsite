import { prisma } from "@/lib/prisma";

interface LoyaltySettings {
  enabled: boolean;
  pointsPerPound: number;
  bonusPerBooking: number;
  welcomeBonus: number;
  redemptionRate: number;
  minimumRedemption: number;
}

/**
 * Calculate loyalty points for a booking
 */
export async function calculateLoyaltyPoints(
  businessOwnerId: string,
  bookingAmount: number
): Promise<number> {
  try {
    const settings = await prisma.loyaltySettings.findUnique({
      where: { userId: businessOwnerId },
    });

    if (!settings || !settings.enabled) {
      return 0;
    }

    // Points = (amount * pointsPerPound) + bonusPerBooking
    const points = Math.floor(
      bookingAmount * settings.pointsPerPound + settings.bonusPerBooking
    );

    return points;
  } catch (error) {
    console.error("Error calculating loyalty points:", error);
    return 0;
  }
}

/**
 * Award loyalty points to a client
 */
export async function awardLoyaltyPoints(
  businessOwnerId: string,
  clientId: string,
  bookingId: string,
  points: number
): Promise<void> {
  try {
    if (points <= 0) return;

    // Get or create loyalty points record
    let loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: {
        userId_clientId: {
          userId: businessOwnerId,
          clientId: clientId,
        },
      },
    });

    if (loyaltyPoints) {
      // Update existing points
      await prisma.loyaltyPoints.update({
        where: { id: loyaltyPoints.id },
        data: {
          points: { increment: points },
          totalEarned: { increment: points },
        },
      });
    } else {
      // Check if this is first booking for welcome bonus
      const settings = await prisma.loyaltySettings.findUnique({
        where: { userId: businessOwnerId },
      });

      const welcomeBonus = settings?.welcomeBonus || 0;
      const totalPoints = points + welcomeBonus;

      // Create new loyalty record with welcome bonus
      await prisma.loyaltyPoints.create({
        data: {
          userId: businessOwnerId,
          clientId: clientId,
          points: totalPoints,
          totalEarned: totalPoints,
          totalSpent: 0,
        },
      });
    }
  } catch (error) {
    console.error("Error awarding loyalty points:", error);
  }
}

/**
 * Redeem loyalty points for discount
 */
export async function redeemLoyaltyPoints(
  businessOwnerId: string,
  clientId: string,
  pointsToRedeem: number
): Promise<{ success: boolean; discount: number; error?: string }> {
  try {
    const settings = await prisma.loyaltySettings.findUnique({
      where: { userId: businessOwnerId },
    });

    if (!settings || !settings.enabled) {
      return { success: false, discount: 0, error: "Loyalty program not enabled" };
    }

    if (pointsToRedeem < settings.minimumRedemption) {
      return {
        success: false,
        discount: 0,
        error: `Minimum ${settings.minimumRedemption} points required`,
      };
    }

    const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: {
        userId_clientId: {
          userId: businessOwnerId,
          clientId: clientId,
        },
      },
    });

    if (!loyaltyPoints || loyaltyPoints.points < pointsToRedeem) {
      return { success: false, discount: 0, error: "Insufficient points" };
    }

    // Calculate discount: points / redemptionRate = £
    // e.g., 100 points / 100 = £1
    const discount = pointsToRedeem / settings.redemptionRate;

    // Deduct points
    await prisma.loyaltyPoints.update({
      where: { id: loyaltyPoints.id },
      data: {
        points: { decrement: pointsToRedeem },
        totalSpent: { increment: pointsToRedeem },
      },
    });

    // Log redemption
    await prisma.loyaltyRedemption.create({
      data: {
        userId: businessOwnerId,
        clientId: clientId,
        clientName: "", // Will be filled by booking flow
        clientEmail: "", // Will be filled by booking flow
        pointsUsed: pointsToRedeem,
        description: `Redeemed ${pointsToRedeem} points for £${discount.toFixed(2)} discount`,
      },
    });

    return { success: true, discount };
  } catch (error) {
    console.error("Error redeeming points:", error);
    return { success: false, discount: 0, error: "Failed to redeem points" };
  }
}

/**
 * Get client's loyalty points balance
 */
export async function getClientLoyaltyPoints(
  businessOwnerId: string,
  clientId: string
): Promise<{ points: number; totalEarned: number; totalSpent: number }> {
  try {
    const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: {
        userId_clientId: {
          userId: businessOwnerId,
          clientId: clientId,
        },
      },
    });

    if (!loyaltyPoints) {
      return { points: 0, totalEarned: 0, totalSpent: 0 };
    }

    return {
      points: loyaltyPoints.points,
      totalEarned: loyaltyPoints.totalEarned,
      totalSpent: loyaltyPoints.totalSpent,
    };
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    return { points: 0, totalEarned: 0, totalSpent: 0 };
  }
}
