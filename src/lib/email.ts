import axios from 'axios';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  name?: string;
}

export async function sendEmail({ to, subject, html, name }: EmailOptions) {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { 
          name: 'GlamBooking', 
          email: 'glambooking@glambooking.co.uk' 
        },
        to: [{ email: to, name }],
        subject,
        htmlContent: html,
      },
      { 
        headers: { 
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        } 
      }
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Brevo email error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export function bookingConfirmationEmail(
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
          
          <center>
            <a href="https://glambooking.co.uk" class="button">View Booking Details</a>
          </center>
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

export function paymentLinkEmail(
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
        .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(233, 181, 216, 0.4); }
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

export function waitlistConfirmationEmail(name: string, email: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; text-align: center; }
        .icon { font-size: 64px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 Welcome to GlamAI Waitlist!</h1>
        </div>
        <div class="content">
          <div class="icon">✨</div>
          <h2>You're on the list, ${name}!</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Thank you for your interest in <strong>GlamAI</strong> — our intelligent assistant that will revolutionize how you manage your beauty business.
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            We're working hard to bring you AI-powered insights, automated scheduling recommendations, and personalized growth strategies. 
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            We'll notify you at <strong>${email}</strong> as soon as GlamAI is ready for early access.
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

export function teamInvitationEmail(
  businessName: string,
  role: string,
  inviteToken: string,
  appUrl: string
) {
  const inviteLink = `${appUrl}/invite/${inviteToken}`;
  
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
        .role-badge { display: inline-block; background: rgba(233, 181, 216, 0.2); color: #E9B5D8; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; font-size: 16px; box-shadow: 0 4px 12px rgba(233, 181, 216, 0.3); }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .info-box { background: #f8f4fc; border-radius: 8px; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👥 You've Been Invited!</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #333;">Hi there,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            You've been invited to join <strong>${businessName}</strong> on GlamBooking as a <span class="role-badge">${role}</span>
          </p>
          
          <div class="info-box">
            <p style="margin: 0; color: #666; line-height: 1.6;">
              <strong>What is GlamBooking?</strong><br>
              GlamBooking is the UK's #1 beauty business platform. Manage bookings, clients, services, and grow your business with powerful tools designed specifically for beauty professionals.
            </p>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Click the button below to create your account and get started:
          </p>
          
          <center>
            <a href="${inviteLink}" class="button">Accept Invitation</a>
          </center>

          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            This invitation link will expire in 7 days.
          </p>
        </div>
        <div class="footer">
          <p><strong>GlamBooking</strong> — The #1 Beauty Business Platform 💅</p>
          <p>Powered by GlamBooking.co.uk</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingStatusChangeEmail(
  clientName: string,
  businessName: string,
  serviceName: string,
  date: string,
  time: string,
  oldStatus: string,
  newStatus: string
) {
  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    completed: '🎉',
    cancelled: '❌',
    'no-show': '⚠️',
  };

  const statusColors: Record<string, string> = {
    pending: '#ffc107',
    confirmed: '#28a745',
    completed: '#17a2b8',
    cancelled: '#dc3545',
    'no-show': '#ff6b6b',
  };

  const emoji = statusEmojis[newStatus] || '📅';
  const color = statusColors[newStatus] || '#E9B5D8';

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
        .status-badge { display: inline-block; background: ${color}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; text-transform: uppercase; }
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
          <h1>${emoji} Booking Status Update</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>Your booking with <strong>${businessName}</strong> has been updated.</p>
          
          <center>
            <span class="status-badge">${newStatus}</span>
          </center>

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
          </div>

          <p>${newStatus === 'confirmed' ? 'Your booking is confirmed! We look forward to seeing you.' : newStatus === 'cancelled' ? 'Your booking has been cancelled. If this was a mistake, please contact us.' : 'If you have any questions, please contact the business directly.'}</p>
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

export function bookingReminderEmail(
  clientName: string,
  businessName: string,
  serviceName: string,
  date: string,
  time: string,
  price: number,
  businessAddress?: string
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
        .reminder-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .highlight { color: #E9B5D8; font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Appointment Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>This is a friendly reminder that you have an appointment <strong class="highlight">tomorrow</strong> with <strong>${businessName}</strong>!</p>
          
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
            ${businessAddress ? `
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${businessAddress}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Total:</span>
              <span class="value">£${price.toFixed(2)}</span>
            </div>
          </div>

          <div class="reminder-box">
            <strong>💡 Helpful Tips:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please arrive <strong>5-10 minutes early</strong> to check in</li>
              <li>Bring any necessary items or products</li>
              <li>If you need to cancel, please contact us ASAP</li>
            </ul>
          </div>

          <p>We're excited to see you tomorrow! If you have any questions, please contact the business directly.</p>
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

export function teamWelcomeEmail(name: string, businessName: string, appUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; text-align: center; }
        .icon { font-size: 64px; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; font-size: 16px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to GlamBooking!</h1>
        </div>
        <div class="content">
          <div class="icon">✨</div>
          <h2>Welcome aboard, ${name}!</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            You've successfully joined <strong>${businessName}</strong> on GlamBooking.
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Log in now to start managing bookings, clients, and services with your team.
          </p>
          
          <a href="${appUrl}/sign-in" class="button">Log In to Dashboard</a>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            Need help getting started? Check out our <a href="${appUrl}/docs" style="color: #E9B5D8;">documentation</a> or contact support.
          </p>
        </div>
        <div class="footer">
          <p><strong>GlamBooking</strong> — The #1 Beauty Business Platform 💅</p>
          <p>Powered by GlamBooking.co.uk</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingConfirmationWithInvoiceEmail(
  clientName: string,
  businessName: string,
  serviceName: string,
  date: string,
  time: string,
  price: number,
  staffName: string | undefined,
  invoiceUrl: string
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
        .success-badge { background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>Your payment has been successfully processed and your booking with <strong>${businessName}</strong> is confirmed!</p>
          
          <center>
            <span class="success-badge">✓ PAID</span>
          </center>

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
            ${staffName ? `
            <div class="detail-row">
              <span class="label">Specialist:</span>
              <span class="value">${staffName}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Total Paid:</span>
              <span class="value" style="color: #28a745; font-size: 18px;">£${price.toFixed(2)}</span>
            </div>
          </div>

          <p>📄 <strong>Your invoice is ready!</strong> Click the button below to view or download your invoice.</p>
          
          <center>
            <a href="${invoiceUrl}" class="button">📥 Download Invoice</a>
          </center>

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

export function retentionCampaignEmail(
  clientName: string,
  businessName: string,
  subject: string,
  body: string,
  discountPercent?: number
) {
  // Replace variables in the template
  let emailBody = body
    .replace(/\{clientName\}/g, clientName)
    .replace(/\{businessName\}/g, businessName);

  // Replace discount variable
  if (discountPercent && discountPercent > 0) {
    emailBody = emailBody.replace(
      /\{discount\}/g,
      `Enjoy ${discountPercent}% off your next booking!`
    );
  } else {
    emailBody = emailBody.replace(/\{discount\}/g, '');
  }

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
        .message { font-size: 16px; color: #333; line-height: 1.8; white-space: pre-line; }
        .discount-box { background: linear-gradient(135deg, rgba(233, 181, 216, 0.2), rgba(201, 165, 214, 0.2)); border: 2px solid #E9B5D8; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        .discount-text { font-size: 24px; font-weight: bold; color: #E9B5D8; margin: 10px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; font-size: 16px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💌 ${subject}</h1>
        </div>
        <div class="content">
          <div class="message">${emailBody}</div>
          
          ${discountPercent && discountPercent > 0 ? `
          <div class="discount-box">
            <p style="margin: 0; color: #666; font-size: 14px;">SPECIAL OFFER</p>
            <p class="discount-text">${discountPercent}% OFF</p>
            <p style="margin: 0; color: #666; font-size: 14px;">Your Next Visit</p>
          </div>
          ` : ''}
          
          <center>
            <a href="https://glambooking.co.uk" class="button">Book Now</a>
          </center>
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
