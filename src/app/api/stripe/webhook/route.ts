import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';
import { sendEmail, bookingConfirmationEmail, bookingConfirmationWithInvoiceEmail } from '@/lib/email';
import { generateInvoicePDF } from '@/lib/invoice';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    console.log('🔔 Webhook received:', event.type);

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        // This is the CRITICAL event that fires when subscription payment succeeds
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        console.log('💳 Payment succeeded for customer:', customerId, 'subscription:', subscriptionId);

        if (subscriptionId) {
          // Get the subscription to access metadata
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            const planName = subscription.metadata?.plan || 'free';
            const billingPeriod = subscription.metadata?.billingPeriod || 'monthly';

            console.log('✅ Updating user:', user.id, 'to plan:', planName, 'status:', subscription.status);

            // Update user with subscription details
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionPlan: subscription.id,
                subscriptionStatus: subscription.status,
                plan: planName,
              },
            });

            console.log('✨ User updated successfully! Plan is now:', planName);

            // Send confirmation email only on first payment
            if (subscription.status === 'active' && user.email) {
              console.log('📧 Sending confirmation email to:', user.email);
              try {
                await sendEmail({
                  to: user.email,
                  name: user.businessName || 'there',
                  subject: `🎉 Welcome to GlamBooking ${planName.charAt(0).toUpperCase() + planName.slice(1)}!`,
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <style>
                        body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 40px 20px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; }
                        .content { padding: 40px 30px; }
                        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>🎉 Subscription Activated!</h1>
                        </div>
                        <div class="content">
                          <p>Hi ${user.businessName || 'there'},</p>
                          <p>Your <strong>${planName.charAt(0).toUpperCase() + planName.slice(1)}</strong> subscription is now active!</p>
                          <p>Billing: <strong>${billingPeriod === 'yearly' ? 'Yearly (15% savings!)' : 'Monthly'}</strong></p>
                          <p>You now have access to all premium features. Visit your dashboard to explore!</p>
                          <p style="margin-top: 30px;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a></p>
                        </div>
                        <div class="footer">
                          <p>Powered by GlamBooking.co.uk</p>
                        </div>
                      </div>
                    </body>
                    </html>
                  `,
                });
                console.log('✅ Email sent successfully');
              } catch (emailError) {
                console.error('❌ Failed to send email:', emailError);
              }
            }
          } else {
            console.warn('⚠️ User not found for customer:', customerId);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log('📝 Subscription event for customer:', customerId, 'status:', subscription.status);

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const planName = subscription.metadata?.plan || 'free';
          const billingPeriod = subscription.metadata?.billingPeriod || 'monthly';

          console.log('📊 Updating subscription for user:', user.id);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionPlan: subscription.id,
              subscriptionStatus: subscription.status,
              plan: subscription.status === 'active' ? planName : user.plan,
            },
          });

          console.log('✅ Subscription updated');
        } else {
          console.warn('⚠️ User not found for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log('❌ Subscription deleted for customer:', customerId);

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          console.log('🔄 Reverting user:', user.id, 'to free plan');
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionPlan: null,
              subscriptionStatus: 'canceled',
              plan: 'free',
            },
          });
          console.log('✅ User reverted to free plan');
        } else {
          console.warn('⚠️ User not found for customer:', customerId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log('💔 Payment failed for customer:', customerId);

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          console.log('⚠️ Marking user:', user.id, 'as past_due');
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'past_due',
            },
          });
          console.log('✅ User marked as past_due');
        } else {
          console.warn('⚠️ User not found for customer:', customerId);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (!bookingId) {
          console.warn('⚠️ No bookingId in session metadata');
          break;
        }

        console.log('🎉 Checkout session completed for booking:', bookingId);

        // Get booking with all related data
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: true,
            client: true,
            service: true,
          },
        });

        if (!booking) {
          console.error('❌ Booking not found:', bookingId);
          break;
        }

        try {
          // Generate invoice PDF
          console.log('📄 Generating invoice...');
          const pdfUrl = await generateInvoicePDF({
            bookingId: booking.id,
            invoiceNumber: `INV-${Date.now()}-${booking.id.slice(0, 6).toUpperCase()}`,
            businessName: booking.user.businessName || 'Business',
            businessAddress: booking.user.address || undefined,
            businessPhone: booking.user.phone || undefined,
            clientName: booking.client.name,
            clientEmail: booking.client.email,
            serviceName: booking.service.name,
            serviceDate: booking.startTime,
            serviceTime: booking.startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            staffName: undefined, // Will add staff lookup later
            duration: booking.service.duration,
            amount: booking.totalAmount,
          });

          // Create invoice record
          await prisma.invoice.create({
            data: {
              bookingId: booking.id,
              invoiceNumber: `INV-${Date.now()}-${booking.id.slice(0, 6).toUpperCase()}`,
              amount: booking.totalAmount,
              pdfUrl,
            },
          });

          console.log('✅ Invoice generated:', pdfUrl);

          // Update booking
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'PAID',
              status: 'confirmed',
              stripeSessionId: session.id,
              paymentIntentId: session.payment_intent as string,
            },
          });

          // Update user earnings
          const platformFee = booking.totalAmount * 0.05;
          const businessEarnings = booking.totalAmount - platformFee;

          await prisma.user.update({
            where: { id: booking.userId },
            data: {
              totalEarnings: { increment: businessEarnings },
            },
          });

          console.log('💰 User earnings updated +£', businessEarnings.toFixed(2));

          // Send confirmation email with invoice
          const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}${pdfUrl}`;
          const formattedDate = booking.startTime.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const formattedTime = booking.startTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });

          await sendEmail({
            to: booking.client.email,
            name: booking.client.name,
            subject: `🎉 Booking Confirmed - ${booking.service.name}`,
            html: bookingConfirmationWithInvoiceEmail(
              booking.client.name,
              booking.user.businessName || 'Business',
              booking.service.name,
              formattedDate,
              formattedTime,
              booking.totalAmount,
              undefined,
              invoiceUrl
            ),
          });

          console.log('📧 Confirmation email sent to:', booking.client.email);
          console.log('✅ Booking fully processed!');
        } catch (error) {
          console.error('❌ Error processing booking confirmation:', error);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('💳 Payment intent succeeded:', paymentIntent.id);

        // Find booking by payment intent or payment link
        const booking = await prisma.booking.findFirst({
          where: {
            OR: [
              { paymentIntentId: paymentIntent.id },
              { paymentLink: { contains: paymentIntent.id } },
            ],
          },
          include: { 
            user: true,
            client: true,
            service: true,
          },
        });

        if (booking) {
          console.log('📅 Processing booking payment for:', booking.id);
          
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'PAID',
              status: 'confirmed',
              paymentIntentId: paymentIntent.id,
            },
          });

          // Update user earnings
          const platformFee = booking.totalAmount * 0.05;
          const businessEarnings = booking.totalAmount - platformFee;

          await prisma.user.update({
            where: { id: booking.userId },
            data: {
              totalEarnings: {
                increment: businessEarnings,
              },
            },
          });

          console.log('✅ Booking payment confirmed and marked as PAID');

          // Send confirmation email
          if (booking.client.email) {
            console.log('📧 Sending payment confirmation to:', booking.client.email);
            const formattedDate = booking.startTime.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            const formattedTime = booking.startTime.toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });

            await sendEmail({
              to: booking.client.email,
              name: booking.client.name,
              subject: '✅ Payment Confirmed - Your Booking is Complete!',
              html: bookingConfirmationEmail(
                booking.client.name,
                booking.user.businessName || 'the business',
                booking.service.name,
                formattedDate,
                formattedTime,
                booking.totalAmount,
                false
              ),
            });
            console.log('✅ Payment confirmation email sent');
          }
        } else {
          console.log('ℹ️ No booking found for payment intent:', paymentIntent.id);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('🛒 Checkout session completed:', session.id);

        // Find booking by Stripe session ID
        const booking = await prisma.booking.findFirst({
          where: { stripeSessionId: session.id },
          include: { 
            user: true,
            client: true,
            service: true,
          },
        });

        if (booking) {
          console.log('📅 Processing booking payment:', booking.id);
          // Mark booking as paid and confirmed
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'PAID',
              status: 'confirmed',
              paymentIntentId: session.payment_intent as string,
            },
          });

          // Update user's total earnings
          const platformFee = booking.totalAmount * 0.05;
          const businessEarnings = booking.totalAmount - platformFee;

          await prisma.user.update({
            where: { id: booking.userId },
            data: {
              totalEarnings: {
                increment: businessEarnings,
              },
            },
          });

          console.log('✅ Booking payment status updated to PAID and confirmed');

          // Send confirmation email to client
          if (booking.client.email) {
            console.log('📧 Sending booking confirmation to:', booking.client.email);
            const formattedDate = booking.startTime.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            const formattedTime = booking.startTime.toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });

            await sendEmail({
              to: booking.client.email,
              name: booking.client.name,
              subject: '✨ Payment Confirmed - Booking Complete!',
              html: bookingConfirmationEmail(
                booking.client.name,
                booking.user.businessName || 'the business',
                booking.service.name,
                formattedDate,
                formattedTime,
                booking.totalAmount
              ),
            });
            console.log('✅ Booking confirmation email sent');
          }
        } else {
          console.log('ℹ️ No booking found for session:', session.id);
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
