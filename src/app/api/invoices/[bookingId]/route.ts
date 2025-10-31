import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Generate and return invoice for a specific booking
 */
export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: {
        service: true,
        client: true,
        user: {
          select: {
            businessName: true,
            email: true,
            phone: true,
            address: true,
            vatNumber: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user has access to this booking
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const isBusinessOwner = booking.userId === userId;
    const isClient = booking.client.email === user?.email;

    if (!isBusinessOwner && !isClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if invoice already exists
    let invoice = await prisma.invoice.findFirst({
      where: { bookingId: booking.id },
    });

    // Create invoice if it doesn't exist
    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          invoiceNumber: `INV-${Date.now()}-${booking.id.slice(0, 8).toUpperCase()}`,
        },
      });
    }

    // Generate HTML invoice
    const invoiceDate = new Date(booking.createdAt).toLocaleDateString("en-GB");
    const serviceDate = new Date(booking.startTime).toLocaleDateString("en-GB");
    const serviceTime = new Date(booking.startTime).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const subtotal = booking.totalAmount;
    const vatRate = 0.2; // 20% VAT
    const vatAmount = subtotal * vatRate;
    const total = subtotal;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #E9B5D8;
    }
    .company-info h1 {
      margin: 0 0 10px 0;
      color: #E9B5D8;
      font-size: 28px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-weight: bold;
      color: #E9B5D8;
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #E9B5D8;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .total-row {
      font-weight: bold;
      background: #f9f9f9;
    }
    .total-amount {
      font-size: 24px;
      color: #E9B5D8;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-paid {
      background: #d4edda;
      color: #155724;
    }
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    .print-button {
      background: linear-gradient(135deg, #EAB8D8 0%, #BBA8F5 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .print-button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <button onclick="window.print()" class="print-button no-print">🖨️ Print Invoice</button>
  
  <div class="header">
    <div class="company-info">
      <h1>${booking.user.businessName || "Business"}</h1>
      ${booking.user.address ? `<p>${booking.user.address}</p>` : ""}
      ${booking.user.phone ? `<p>Tel: ${booking.user.phone}</p>` : ""}
      ${booking.user.email ? `<p>Email: ${booking.user.email}</p>` : ""}
      ${booking.user.vatNumber ? `<p>VAT: ${booking.user.vatNumber}</p>` : ""}
    </div>
    <div class="invoice-info">
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <p>Date: ${invoiceDate}</p>
      <span class="status-badge ${booking.paymentStatus === "PAID" ? "status-paid" : "status-pending"}">
        ${booking.paymentStatus}
      </span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To</div>
    <p>
      <strong>${booking.client.name}</strong><br>
      ${booking.client.email}<br>
      ${booking.client.phone || ""}
    </p>
  </div>

  <div class="section">
    <div class="section-title">Service Details</div>
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Date & Time</th>
          <th>Duration</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${booking.service.name}</strong></td>
          <td>${serviceDate} at ${serviceTime}</td>
          <td>${booking.service.duration} minutes</td>
          <td>£${booking.service.price.toFixed(2)}</td>
        </tr>
        ${booking.notes ? `
        <tr>
          <td colspan="4" style="color: #666; font-size: 14px;">
            <strong>Notes:</strong> ${booking.notes}
          </td>
        </tr>
        ` : ""}
      </tbody>
    </table>
  </div>

  <div class="section">
    <table>
      <tr>
        <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
        <td>£${subtotal.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
        <td class="total-amount">£${total.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  ${booking.paymentStatus === "PAID" ? `
  <div class="section">
    <div class="section-title">Payment Information</div>
    <p>✅ Payment received - Thank you!</p>
    <p style="color: #666; font-size: 14px;">
      Payment Method: Card<br>
      Transaction ID: ${booking.paymentIntentId || "N/A"}
    </p>
  </div>
  ` : `
  <div class="section">
    <div class="section-title">Payment Information</div>
    <p>⏳ Payment pending</p>
  </div>
  `}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Powered by <strong>GlamBooking</strong> - Beauty Business Management Platform</p>
    <p>This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
