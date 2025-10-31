import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Find booking by Stripe session ID
    const booking = await prisma.booking.findFirst({
      where: { stripeSessionId: sessionId },
      include: {
        service: true,
        client: true,
        user: true,
        invoices: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get the invoice
    const invoice = booking.invoices[0];

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      pdfUrl: invoice.pdfUrl,
      booking: {
        id: booking.id,
        serviceName: booking.service.name,
        clientName: booking.client.name,
        startTime: booking.startTime,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
