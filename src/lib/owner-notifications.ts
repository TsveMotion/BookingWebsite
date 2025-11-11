import { sendEmail } from './resend-email';

/**
 * Send notification to business owner when a new booking is created
 */
export async function notifyOwnerNewBooking(
  ownerEmail: string,
  ownerName: string,
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  amount: number,
  paymentStatus: string
) {
  const subject = `🎉 New Booking: ${clientName} - ${serviceName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .booking-details { background: #f8f4fc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0d4f0; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 600; }
        .value { color: #333; font-weight: bold; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
        .status-paid { background: #28a745; color: white; }
        .status-pending { background: #ffc107; color: #000; }
        .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Booking Alert!</h1>
        </div>
        <div class="content">
          <p>Hi ${ownerName},</p>
          <p>Great news! You have a new booking from <strong>${clientName}</strong>.</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Client:</span>
              <span class="value">${clientName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">£${amount.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value">
                <span class="status-badge ${paymentStatus === 'PAID' ? 'status-paid' : 'status-pending'}">
                  ${paymentStatus}
                </span>
              </span>
            </div>
          </div>

          <p>Log in to your dashboard to view full details and manage this booking.</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings" class="button">View Booking</a>
          </center>
        </div>
        <div class="footer">
          <p>GlamBooking Dashboard Notifications</p>
          <p>Powered by GlamBooking.co.uk</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: ownerEmail,
    subject,
    html,
  });
}

/**
 * Send notification to business owner when payment is received
 */
export async function notifyOwnerPaymentReceived(
  ownerEmail: string,
  ownerName: string,
  clientName: string,
  serviceName: string,
  amount: number,
  date: string
) {
  const subject = `💰 Payment Received: £${amount.toFixed(2)} from ${clientName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .amount-box { background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(32, 201, 151, 0.1)); border: 2px solid #28a745; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
        .amount { font-size: 48px; font-weight: bold; color: #28a745; margin: 10px 0; }
        .booking-details { background: #f8f4fc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0d4f0; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 600; }
        .value { color: #333; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Received!</h1>
        </div>
        <div class="content">
          <p>Hi ${ownerName},</p>
          <p>Excellent! You've received a payment from <strong>${clientName}</strong>.</p>
          
          <div class="amount-box">
            <p style="margin: 0; color: #666; font-size: 14px;">PAYMENT RECEIVED</p>
            <p class="amount">£${amount.toFixed(2)}</p>
            <p style="margin: 0; color: #666; font-size: 14px;">✓ Successfully Processed</p>
          </div>

          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Client:</span>
              <span class="value">${clientName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Booking Date:</span>
              <span class="value">${date}</span>
            </div>
          </div>

          <p>The funds will be transferred to your connected Stripe account according to your payout schedule.</p>
        </div>
        <div class="footer">
          <p>GlamBooking Payment Notifications</p>
          <p>Powered by GlamBooking.co.uk</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: ownerEmail,
    subject,
    html,
  });
}

/**
 * Send notification to business owner when a subscription is created/upgraded
 */
export async function notifyOwnerSubscriptionChange(
  ownerEmail: string,
  ownerName: string,
  plan: string,
  amount: number,
  billingPeriod: string
) {
  const subject = `🎉 Subscription ${plan === 'free' ? 'Started' : 'Upgraded'}: ${plan.toUpperCase()} Plan`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; text-align: center; }
        .plan-badge { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 20px 40px; border-radius: 12px; font-weight: bold; font-size: 24px; margin: 20px 0; text-transform: uppercase; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Subscription Active!</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #333;">Hi ${ownerName},</p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Your subscription is now active! Welcome to the <strong>${plan.toUpperCase()}</strong> plan.
          </p>
          
          <div class="plan-badge">${plan.toUpperCase()} PLAN</div>

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            ${billingPeriod === 'yearly' ? 'Annual' : 'Monthly'} Billing: <strong>£${amount.toFixed(2)}</strong>
          </p>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            You now have access to all ${plan} features. Start growing your business today!
          </p>
        </div>
        <div class="footer">
          <p>GlamBooking Subscription Notifications</p>
          <p>Powered by GlamBooking.co.uk</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: ownerEmail,
    subject,
    html,
  });
}
