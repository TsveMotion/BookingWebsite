import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, bookingReminderEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // Optional: Add authentication header check for cron jobs
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all bookings scheduled for tomorrow
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
      include: {
        client: true,
        service: true,
        user: {
          select: {
            businessName: true,
            name: true,
            address: true,
            emailRemindersEnabled: true,
          },
        },
      },
    });

    console.log(`📧 Found ${bookings.length} bookings to send reminders for`);

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    for (const booking of bookings) {
      // Skip if owner has reminders disabled
      if (booking.user.emailRemindersEnabled === false) {
        console.log(`⏭️ Skipping booking ${booking.id} - owner has reminders disabled`);
        results.skipped++;
        continue;
      }

      // Skip if no client email
      if (!booking.client.email) {
        console.log(`⏭️ Skipping booking ${booking.id} - no client email`);
        results.skipped++;
        continue;
      }

      const businessName = booking.user.businessName || booking.user.name || "Your Business";

      const formattedDate = booking.startTime.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedTime = booking.startTime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const emailHtml = bookingReminderEmail(
        booking.client.name,
        businessName,
        booking.service?.name || "Service",
        formattedDate,
        formattedTime,
        booking.totalAmount || 0,
        booking.user.address || undefined
      );

      console.log(`📧 Sending reminder to ${booking.client.email} for booking ${booking.id}`);

      const emailResult = await sendEmail({
        to: booking.client.email,
        subject: `⏰ Reminder: Tomorrow's Appointment - ${booking.service?.name || "Your Booking"}`,
        html: emailHtml,
        name: booking.client.name,
      });

      if (emailResult.success) {
        console.log(`✅ Reminder sent successfully to ${booking.client.email}`);
        results.sent++;

        // Optional: Mark booking as reminder sent (you'd need to add a field to schema)
        // await prisma.booking.update({
        //   where: { id: booking.id },
        //   data: { reminderSent: true },
        // });
      } else {
        console.error(`❌ Failed to send reminder to ${booking.client.email}:`, emailResult.error);
        results.failed++;
      }
    }

    console.log(`📊 Reminder Results: ${results.sent} sent, ${results.failed} failed, ${results.skipped} skipped`);

    return NextResponse.json({
      success: true,
      results,
      totalBookings: bookings.length,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
