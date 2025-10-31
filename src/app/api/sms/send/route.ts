import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, message, clientName, bookingId } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and message are required" }, { status: 400 });
    }

    // Get user and check plan + credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        smsCredits: true,
        smsCreditsUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has Pro or Business plan
    if (user.plan === "free") {
      return NextResponse.json({ error: "SMS feature requires Pro or Business plan" }, { status: 403 });
    }

    // Check if user has credits
    const availableCredits = user.smsCredits - user.smsCreditsUsed;
    if (availableCredits <= 0) {
      return NextResponse.json({ error: "No SMS credits available. Please top up." }, { status: 403 });
    }

    // TODO: Integrate with Twilio API when ready
    // For now, we'll log and simulate
    console.log(`📱 SMS would be sent to ${phone}: ${message}`);
    
    // Simulate Twilio API call (replace with actual API when ready)
    const twilioSuccess = true; // await twilioSendSMS(phone, message);

    if (twilioSuccess) {
      // Log the SMS
      await prisma.smsLog.create({
        data: {
          userId,
          clientPhone: phone,
          clientName: clientName || null,
          message,
          status: "sent",
          provider: "twilio",
          cost: 1,
          bookingId: bookingId || null,
        },
      });

      // Increment credits used
      await prisma.user.update({
        where: { id: userId },
        data: {
          smsCreditsUsed: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        creditsRemaining: availableCredits - 1,
        message: "SMS sent successfully",
      });
    } else {
      return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
    }
  } catch (error) {
    console.error("SMS send error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}

// Helper function for Twilio (implement when API key is available)
async function twilioSendSMS(phone: string, message: string) {
  // TODO: Implement Twilio API call
  // const accountSid = process.env.TWILIO_ACCOUNT_SID;
  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
  
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: twilioNumber,
  //   to: phone
  // });
  
  return true;
}
