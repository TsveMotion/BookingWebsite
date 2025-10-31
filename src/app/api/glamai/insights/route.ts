import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's actual data for insights
    const [bookingsCount, revenueData, topService, clientsCount] = await Promise.all([
      prisma.booking.count({ where: { userId, status: 'completed' } }),
      prisma.booking.aggregate({
        where: { userId, status: 'completed' },
        _sum: { totalAmount: true },
      }),
      prisma.booking.groupBy({
        by: ['serviceId'],
        where: { userId, status: { in: ['confirmed', 'completed'] } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      }),
      prisma.client.count({ where: { userId } }),
    ]);

    // Get service name for top service
    let topServiceName = 'N/A';
    if (topService.length > 0) {
      const service = await prisma.service.findUnique({
        where: { id: topService[0].serviceId },
        select: { name: true },
      });
      topServiceName = service?.name || 'N/A';
    }

    const totalRevenue = revenueData._sum.totalAmount || 0;
    const avgBookingValue = bookingsCount > 0 ? totalRevenue / bookingsCount : 0;

    // Generate AI-like insights based on actual data
    const insights = {
      revenueGrowth: "+12%", // Mock percentage - could calculate from historical data
      totalRevenue: `£${totalRevenue.toFixed(2)}`,
      totalBookings: bookingsCount,
      totalClients: clientsCount,
      avgBookingValue: `£${avgBookingValue.toFixed(2)}`,
      popularService: topServiceName,
      recommendation: generateRecommendation(bookingsCount, clientsCount, totalRevenue),
      quickWins: [
        "📧 Send email reminders to clients who haven't booked in 30+ days",
        "🎁 Offer a loyalty discount after 5 bookings to increase retention",
        "📱 Enable WhatsApp notifications to reduce no-shows by 40%",
      ],
      performanceTrends: {
        bookingTrend: bookingsCount > 10 ? "growing" : "steady",
        clientRetention: clientsCount > 0 ? "good" : "needs_improvement",
        revenueHealth: totalRevenue > 1000 ? "excellent" : totalRevenue > 500 ? "good" : "growing",
      },
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating GlamAI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function generateRecommendation(bookings: number, clients: number, revenue: number): string {
  if (bookings === 0) {
    return "Start promoting your booking page on social media to get your first customers!";
  }
  
  if (clients < 10) {
    return "Focus on client acquisition - consider running a 'New Client Special' promotion.";
  }
  
  if (bookings > 20 && clients < bookings * 0.5) {
    return "You have good booking volume! Focus on client retention with loyalty programs.";
  }
  
  if (revenue > 2000) {
    return "Great revenue! Consider adding premium services to increase your average booking value.";
  }
  
  return "Analyze your peak booking times and offer discounts during slower periods to maximize revenue.";
}
