import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Generate and download SMS credit purchase receipt
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchaseId = params.id;

    // Fetch SMS purchase
    const purchase = await prisma.smsPurchase.findFirst({
      where: {
        id: purchaseId,
        userId,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        businessName: true,
        name: true,
        email: true,
      },
    });

    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    // Generate HTML receipt
    const receiptDate = purchase.createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const receiptNumber = `SMS-${purchase.createdAt.getFullYear()}-${purchase.id.slice(0, 8).toUpperCase()}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SMS Credits Receipt - ${receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      line-height: 1.6;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%);
      padding: 40px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px;
    }
    .receipt-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .info-block h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .info-block p {
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }
    .purchase-details {
      background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%);
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .purchase-details h2 {
      color: white;
      font-size: 20px;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    .detail-row:last-child {
      border-bottom: none;
      margin-top: 10px;
      padding-top: 20px;
      border-top: 2px solid rgba(255, 255, 255, 0.3);
    }
    .detail-label {
      color: white;
      font-size: 16px;
      font-weight: 500;
    }
    .detail-value {
      color: white;
      font-size: 18px;
      font-weight: 700;
    }
    .total-amount {
      font-size: 32px !important;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 30px;
    }
    .footer {
      padding: 30px 40px;
      background: #f9f9f9;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
    .thank-you {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin: 30px 0;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>✨ GlamBooking</h1>
      <p>SMS Credits Purchase Receipt</p>
    </div>

    <div class="content">
      <div class="receipt-info">
        <div class="info-block">
          <h3>Receipt Number</h3>
          <p>${receiptNumber}</p>
        </div>
        <div class="info-block">
          <h3>Date</h3>
          <p>${receiptDate}</p>
        </div>
        <div class="info-block">
          <h3>Status</h3>
          <p style="color: #10b981;">✓ Paid</p>
        </div>
      </div>

      <div class="info-block" style="margin-bottom: 30px;">
        <h3>Billed To</h3>
        <p>${user?.businessName || user?.name || "Customer"}</p>
        ${user?.email ? `<p style="font-size: 14px; color: #666; font-weight: 400;">${user.email}</p>` : ''}
      </div>

      <div class="purchase-details">
        <h2>Purchase Details</h2>
        <div class="detail-row">
          <span class="detail-label">SMS & WhatsApp Credits</span>
          <span class="detail-value">${purchase.credits} messages</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unit Price</span>
          <span class="detail-value">£${(purchase.amount / purchase.credits).toFixed(4)} per message</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount</span>
          <span class="detail-value total-amount">£${purchase.amount.toFixed(2)} ${purchase.currency.toUpperCase()}</span>
        </div>
      </div>

      <div class="thank-you">
        🎉 Thank you for your purchase!
      </div>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; border-left: 4px solid #667eea;">
        <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
          <strong>💡 Credits Never Expire</strong>
        </p>
        <p style="font-size: 13px; color: #999;">
          Your SMS credits roll over every month and never expire. Use them to send booking reminders, confirmations, and promotional messages to your clients.
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>GlamBooking</strong></p>
      <p>Automated Booking Management for Beauty Professionals</p>
      <p style="margin-top: 15px; font-size: 12px;">
        For support, visit <a href="https://glambooking.co.uk" style="color: #667eea;">glambooking.co.uk</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    if (download) {
      // Return as downloadable HTML file
      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="GlamBooking-SMS-Receipt-${receiptNumber}.html"`,
        },
      });
    } else {
      // Display in browser
      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }
  } catch (error) {
    console.error("Error generating SMS receipt:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
