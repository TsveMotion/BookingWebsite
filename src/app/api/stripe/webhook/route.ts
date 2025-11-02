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

  // Log webhook event
  try {
    await prisma.webhookEvent.create({
      data: {
        type: event.type,
        stripeEventId: event.id,
        payload: event as any,
      },
    });
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
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
                stripeSubscriptionId: subscription.id,
                subscriptionPlan: subscription.id, // Keep for backward compatibility
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
          // Extract plan info from subscription price
          const priceId = subscription.items.data[0]?.price.id;
          const priceNickname = subscription.items.data[0]?.price.nickname;
          const interval = subscription.items.data[0]?.price.recurring?.interval;
          
          // Determine plan from price ID or nickname
          let planName = 'free';
          let displayName = 'Free';
          
          if (priceId) {
            const isMonthly = interval === 'month';
            const isYearly = interval === 'year';
            
            if (priceId.includes(process.env.STRIPE_PRO_MONTHLY_PRICE_ID!) || 
                priceId.includes(process.env.STRIPE_PRO_YEARLY_PRICE_ID!) ||
                priceNickname?.toLowerCase().includes('pro')) {
              planName = 'pro';
              displayName = isYearly ? 'Pro Plan (Yearly)' : 'Pro Plan (Monthly)';
            } else if (priceId.includes(process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!) || 
                       priceId.includes(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!) ||
                       priceNickname?.toLowerCase().includes('business')) {
              planName = 'business';
              displayName = isYearly ? 'Business Plan (Yearly)' : 'Business Plan (Monthly)';
            }
          }

          console.log('📊 Updating subscription for user:', user.id, 'Plan:', planName, 'Status:', subscription.status);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: subscription.id,
              subscriptionPlan: subscription.id, // Keep for backward compatibility
              subscriptionStatus: subscription.status,
              plan: subscription.status === 'active' || subscription.status === 'trialing' ? planName : user.plan,
            },
          });

          console.log('✅ Subscription updated successfully');
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
              stripeSubscriptionId: null,
              subscriptionPlan: null, // Keep for backward compatibility
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
        const type = session.metadata?.type;
        const userId = session.metadata?.userId;
        const creditAmount = session.metadata?.creditAmount;

        // Handle Subscription Checkout (mode: 'subscription')
        if (session.mode === 'subscription' && session.customer) {
          console.log('🎉 Subscription checkout completed for customer:', session.customer);
          
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
          
          // Get subscription from session
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
          
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;
            const priceNickname = subscription.items.data[0]?.price.nickname;
            const interval = subscription.items.data[0]?.price.recurring?.interval;
            
            // Determine plan
            let planName = 'free';
            let displayName = 'Free';
            
            if (priceId) {
              const isYearly = interval === 'year';
              
              if (priceId.includes(process.env.STRIPE_PRO_MONTHLY_PRICE_ID!) || 
                  priceId.includes(process.env.STRIPE_PRO_YEARLY_PRICE_ID!) ||
                  priceNickname?.toLowerCase().includes('pro')) {
                planName = 'pro';
                displayName = isYearly ? 'Pro Plan (Yearly)' : 'Pro Plan (Monthly)';
              } else if (priceId.includes(process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!) || 
                         priceId.includes(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!) ||
                         priceNickname?.toLowerCase().includes('business')) {
                planName = 'business';
                displayName = isYearly ? 'Business Plan (Yearly)' : 'Business Plan (Monthly)';
              }
            }
            
            // Set SMS credits
            let smsCredits = 0;
            if (planName === 'pro') smsCredits = 250;
            if (planName === 'business') smsCredits = 1000;
            
            console.log('📊 Setting plan to:', displayName);
            
            // Update user
            await prisma.user.update({
              where: { stripeCustomerId: customerId },
              data: {
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                plan: planName,
                smsCredits: smsCredits,
                smsCreditsUsed: 0,
                smsCreditsRenewDate: new Date(),
              },
            });
            
            console.log(`✅ Subscription activated: ${displayName} with ${smsCredits} SMS credits`);
          }
          
          break;
        }

        // Handle SMS Credits Purchase
        if (type === 'sms_credits' && userId && creditAmount) {
          console.log('💳 SMS Credits purchase completed for user:', userId);
          
          const credits = parseInt(creditAmount);
          
          // Update user's SMS credits
          await prisma.user.update({
            where: { id: userId },
            data: {
              smsCredits: { increment: credits },
            },
          });

          // Update purchase record
          await prisma.smsPurchase.updateMany({
            where: {
              userId,
              stripePaymentId: session.id,
            },
            data: {
              status: 'completed',
            },
          });

          console.log(`✅ Added ${credits} SMS credits to user ${userId}`);
          break;
        }

        // Handle Booking Payment
        if (!bookingId) {
          console.log('⚠️ Checkout completed but no specific handler matched');
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

          // Update user earnings (0% commission as per requirements)
          const platformFee = 0; // No commission charged
          const businessEarnings = booking.totalAmount;

          await prisma.user.update({
            where: { id: booking.userId },
            data: {
              totalEarnings: { increment: businessEarnings },
            },
          });

          console.log('💰 User earnings updated +£', businessEarnings.toFixed(2));

          // Create Stripe Transfer to salon's connected account
          if (booking.user.stripeAccountId) {
            try {
              const amountInPence = Math.round(booking.totalAmount * 100);
              const platformFeeInPence = 0; // No platform commission
              const stripeFeeInPence = Math.round(amountInPence * 0.029 + 30); // Stripe fee: 2.9% + 30p
              const netAmountInPence = amountInPence - stripeFeeInPence;

              console.log('💸 Creating transfer to connected account:', booking.user.stripeAccountId);
              console.log(`   Amount: £${booking.totalAmount} | Platform Fee: £0.00 | Stripe Fee: £${(stripeFeeInPence / 100).toFixed(2)} | Net: £${(netAmountInPence / 100).toFixed(2)}`);

              const transfer = await stripe.transfers.create({
                amount: netAmountInPence,
                currency: 'gbp',
                destination: booking.user.stripeAccountId,
                description: `Booking payment for ${booking.service.name} - ${booking.client.name}`,
                metadata: {
                  bookingId: booking.id,
                  userId: booking.userId,
                  clientName: booking.client.name,
                },
              });

              // Record payout in database
              await prisma.payout.create({
                data: {
                  userId: booking.userId,
                  amount: amountInPence,
                  currency: 'gbp',
                  status: 'processing',
                  stripeTransferId: transfer.id,
                  bookingId: booking.id,
                  platformFee: platformFeeInPence,
                  stripeFee: stripeFeeInPence,
                  netAmount: netAmountInPence,
                  metadata: {
                    serviceName: booking.service.name,
                    clientName: booking.client.name,
                    bookingDate: booking.startTime.toISOString(),
                  },
                },
              });

              console.log('✅ Transfer created and payout recorded:', transfer.id);
            } catch (transferError) {
              console.error('❌ Failed to create transfer:', transferError);
              // Continue with booking confirmation even if transfer fails
            }
          } else {
            console.warn('⚠️ No Stripe account connected for user:', booking.userId);
          }

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

          // Update user earnings (0% commission)
          const platformFee = 0; // No commission
          const businessEarnings = booking.totalAmount;

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


      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        console.log('💰 Payout paid:', payout.id);

        try {
          await prisma.payout.updateMany({
            where: { stripePayoutId: payout.id },
            data: {
              status: 'paid',
              payoutDate: new Date(payout.arrival_date * 1000),
            },
          });
          console.log('✅ Payout marked as paid in database');
        } catch (error) {
          console.error('❌ Failed to update payout status:', error);
        }
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        console.log('❌ Payout failed:', payout.id);

        try {
          await prisma.payout.updateMany({
            where: { stripePayoutId: payout.id },
            data: {
              status: 'failed',
              failureReason: payout.failure_message || 'Unknown error',
            },
          });
          console.log('✅ Payout marked as failed in database');
        } catch (error) {
          console.error('❌ Failed to update payout status:', error);
        }
        break;
      }

      case 'transfer.created':
      case 'transfer.paid': {
        const transfer = event.data.object as Stripe.Transfer;
        console.log('💸 Transfer event:', event.type, transfer.id);

        try {
          await prisma.payout.updateMany({
            where: { stripeTransferId: transfer.id },
            data: {
              status: event.type === 'transfer.paid' ? 'paid' : 'processing',
              payoutDate: event.type === 'transfer.paid' ? new Date() : undefined,
            },
          });
          console.log('✅ Transfer status updated in database');
        } catch (error) {
          console.error('❌ Failed to update transfer status:', error);
        }
        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer;
        console.log('❌ Transfer failed:', transfer.id);

        try {
          await prisma.payout.updateMany({
            where: { stripeTransferId: transfer.id },
            data: {
              status: 'failed',
              failureReason: transfer.failure_message || 'Transfer failed',
            },
          });
          console.log('✅ Transfer marked as failed in database');
        } catch (error) {
          console.error('❌ Failed to update transfer status:', error);
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    console.log('✅ Webhook processed successfully');
    
    // Mark webhook as processed
    try {
      await prisma.webhookEvent.updateMany({
        where: { stripeEventId: event.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });
    } catch (logError) {
      console.error('Failed to mark webhook as processed:', logError);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    
    // Log webhook error
    try {
      await prisma.webhookEvent.updateMany({
        where: { stripeEventId: event.id },
        data: {
          processed: true,
          processedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
