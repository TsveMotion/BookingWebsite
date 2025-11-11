import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const response = await resend.emails.send({
      from: from || 'GlamBooking <bookings@glambooking.co.uk>',
      to: [to],
      subject,
      html,
    });

    return { success: true, data: response };
  } catch (error: any) {
    console.error('Resend email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send booking confirmation email to client
 */
export async function sendBookingConfirmationEmail(
  clientEmail: string,
  clientName: string,
  bookingDetails: {
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    price: number;
    isManualPayment?: boolean;
  }
) {
  const html = bookingConfirmationTemplate(
    clientName,
    bookingDetails.businessName,
    bookingDetails.serviceName,
    bookingDetails.date,
    bookingDetails.time,
    bookingDetails.price,
    bookingDetails.isManualPayment || false
  );

  return sendEmail({
    to: clientEmail,
    subject: `✨ Booking Confirmed - ${bookingDetails.serviceName}`,
    html,
  });
}

/**
 * Send payment link email to client
 */
export async function sendPaymentLinkEmail(
  clientEmail: string,
  clientName: string,
  paymentLink: string,
  bookingDetails: {
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    price: number;
  }
) {
  const html = paymentLinkTemplate(
    clientName,
    bookingDetails.businessName,
    bookingDetails.serviceName,
    bookingDetails.date,
    bookingDetails.time,
    bookingDetails.price,
    paymentLink
  );

  return sendEmail({
    to: clientEmail,
    subject: `💳 Payment Required - ${bookingDetails.serviceName} Booking`,
    html,
  });
}

/**
 * Send manual payment instructions email
 */
export async function sendManualPaymentInstructionsEmail(
  clientEmail: string,
  clientName: string,
  bookingDetails: {
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    price: number;
  }
) {
  const html = manualPaymentTemplate(
    clientName,
    bookingDetails.businessName,
    bookingDetails.serviceName,
    bookingDetails.date,
    bookingDetails.time,
    bookingDetails.price
  );

  return sendEmail({
    to: clientEmail,
    subject: `📅 Booking Confirmed - ${bookingDetails.serviceName}`,
    html,
  });
}

// Email Templates

function bookingConfirmationTemplate(
  clientName: string,
  businessName: string,
  serviceName: string,
  date: string,
  time: string,
  price: number,
  isManualPayment: boolean = false
) {
  return `
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
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>Your booking with <strong>${businessName}</strong> has been confirmed!</p>
          
          <div class="booking-details">
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
              <span class="label">Total:</span>
              <span class="value">£${price.toFixed(2)}</span>
            </div>
          </div>

          ${isManualPayment ? `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>💵 Payment:</strong> Payment will be collected in person at your appointment.
          </div>
          ` : ''}

          <p>We're excited to see you! If you need to reschedule or have any questions, please contact the business directly.</p>
        </div>
        <div class="footer">
          <p>Powered by GlamBooking.co.uk</p>
          <p>The UK's #1 Beauty Booking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function paymentLinkTemplate(
  clientName: string,
  businessName: string,
  serviceName: string,
  date: string,
  time: string,
  price: number,
  paymentLink: string
) {
  return `
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
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; font-size: 16px; box-shadow: 0 4px 12px rgba(233, 181, 216, 0.3); }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Required</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>You have a new booking with <strong>${businessName}</strong> that requires payment to confirm.</p>
          
          <div class="booking-details">
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
              <span class="label">Total Amount:</span>
              <span class="value" style="color: #E9B5D8; font-size: 20px;">£${price.toFixed(2)}</span>
            </div>
          </div>

          <div class="alert-box">
            <strong>⏰ Action Required:</strong> Please complete your payment to confirm your booking.
          </div>

          <p>Click the button below to securely pay for your booking. You'll be redirected to our secure payment page powered by Stripe.</p>
          
          <center>
            <a href="${paymentLink}" class="button">💳 Pay Now - £${price.toFixed(2)}</a>
          </center>

          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            <strong>Secure Payment:</strong> All payments are processed securely through Stripe. We never store your card details.
          </p>
        </div>
        <div class="footer">
          <p>Powered by GlamBooking.co.uk</p>
          <p>The UK's #1 Beauty Booking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function manualPaymentTemplate(
  clientName: string,
  businessName: string,
  serviceName: string,
  date: string,
  time: string,
  price: number
) {
  return `
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
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .info-box { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; border-radius: 4px; margin: 20px 0; color: #0c5460; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Booking Confirmed</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>Your booking with <strong>${businessName}</strong> has been confirmed!</p>
          
          <div class="booking-details">
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
              <span class="label">Amount Due:</span>
              <span class="value">£${price.toFixed(2)}</span>
            </div>
          </div>

          <div class="info-box">
            <strong>💼 Payment Instructions:</strong><br>
            Payment will be collected in person at your appointment. Please bring the exact amount or a payment card.
          </div>

          <p>We're looking forward to seeing you! If you have any questions or need to reschedule, please contact us directly.</p>
        </div>
        <div class="footer">
          <p>Powered by GlamBooking.co.uk</p>
          <p>The UK's #1 Beauty Booking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
