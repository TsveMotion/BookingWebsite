import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, retentionCampaignEmail } from "@/lib/email";

export async function GET(request: Request) {
  try {
    // Verify CRON secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Running retention campaigns CRON job...");

    // Get all active campaigns
    const activeCampaigns = await prisma.retentionCampaign.findMany({
      where: { status: "active" },
    });

    let totalSent = 0;
    const results: any[] = [];

    for (const campaign of activeCampaigns) {
      try {
        let eligibleClients: any[] = [];

        // Get business owner info
        const owner = await prisma.user.findUnique({
          where: { id: campaign.userId },
          select: { businessName: true },
        });

        const businessName = owner?.businessName || "Your Salon";

        // Find eligible clients based on campaign type
        if (campaign.type === "missed_you") {
          const daysInactive = campaign.daysInactive || 60;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

          // Find clients with no recent bookings
          const allClients = await prisma.client.findMany({
            where: { userId: campaign.userId },
            include: {
              bookings: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          });

          eligibleClients = allClients.filter((client) => {
            if (client.bookings.length === 0) return false;
            const lastBooking = client.bookings[0];
            return lastBooking.createdAt < cutoffDate;
          });
        } else if (campaign.type === "welcome") {
          // Find clients who joined recently (last 7 days) and haven't been sent this campaign
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const newClients = await prisma.client.findMany({
            where: {
              userId: campaign.userId,
              createdAt: { gte: sevenDaysAgo },
            },
          });

          // Filter out clients who already received this campaign
          const sentLogs = await prisma.campaignLog.findMany({
            where: {
              campaignId: campaign.id,
              clientId: { in: newClients.map((c) => c.id) },
            },
          });

          const sentClientIds = new Set(sentLogs.map((log) => log.clientId));
          eligibleClients = newClients.filter(
            (client) => !sentClientIds.has(client.id)
          );
        } else if (campaign.type === "birthday") {
          // Find clients with birthdays this week
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);

          const allClients = await prisma.client.findMany({
            where: {
              userId: campaign.userId,
              birthday: { not: null },
            },
          });

          eligibleClients = allClients.filter((client) => {
            if (!client.birthday) return false;
            const birthday = new Date(client.birthday);
            const thisYearBirthday = new Date(
              today.getFullYear(),
              birthday.getMonth(),
              birthday.getDate()
            );
            return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
          });
        }

        // Send emails to eligible clients
        for (const client of eligibleClients) {
          try {
            const emailHtml = retentionCampaignEmail(
              client.name,
              businessName,
              campaign.subject,
              campaign.body,
              campaign.discountPercent || undefined
            );

            await sendEmail({
              to: client.email,
              subject: campaign.subject,
              html: emailHtml,
              name: client.name,
            });

            // Log the send
            await prisma.campaignLog.create({
              data: {
                campaignId: campaign.id,
                clientId: client.id,
                status: "sent",
              },
            });

            totalSent++;
          } catch (error) {
            console.error(`Failed to send to ${client.email}:`, error);
            
            // Log failed send
            await prisma.campaignLog.create({
              data: {
                campaignId: campaign.id,
                clientId: client.id,
                status: "failed",
              },
            });
          }
        }

        // Update campaign stats
        await prisma.retentionCampaign.update({
          where: { id: campaign.id },
          data: {
            sentCount: { increment: eligibleClients.length },
            lastSent: new Date(),
          },
        });

        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          sent: eligibleClients.length,
        });
      } catch (error) {
        console.error(`Error processing campaign ${campaign.id}:`, error);
        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          error: String(error),
        });
      }
    }

    console.log(`CRON job completed. Total emails sent: ${totalSent}`);

    return NextResponse.json({
      success: true,
      totalSent,
      campaignsProcessed: activeCampaigns.length,
      results,
    });
  } catch (error) {
    console.error("CRON job error:", error);
    return NextResponse.json(
      { error: "Failed to run retention campaigns" },
      { status: 500 }
    );
  }
}
