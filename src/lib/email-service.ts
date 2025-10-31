import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  businessName: string;
  bookingDetails: {
    serviceName: string;
    date: string;
    time: string;
    location?: string;
    price: number;
  };
  invoiceUrl?: string;
}

interface SendLoyaltyEmailParams {
  to: string;
  clientName: string;
  businessName: string;
  pointsEarned: number;
  totalPoints: number;
  pointsRedeemed?: number;
}

/**
 * Send booking invoice email
 */
export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<boolean> {
  try {
    const { to, clientName, businessName, bookingDetails, invoiceUrl } = params;

    const mailOptions = {
      from: `"${businessName}" <${process.env.SMTP_USER}>`,
      to,
      subject: `Your Booking Confirmation - ${businessName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EAB8D8 0%, #BBA8F5 50%, #91C4F2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 20px; font-weight: bold; color: #E9B5D8; }
            .button { display: inline-block; background: linear-gradient(135deg, #EAB8D8 0%, #BBA8F5 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${clientName}</strong>,</p>
              <p>Thank you for booking with <strong>${businessName}</strong>!</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                  <span>Service:</span>
                  <strong>${bookingDetails.serviceName}</strong>
                </div>
                <div class="detail-row">
                  <span>Date:</span>
                  <strong>${bookingDetails.date}</strong>
                </div>
                <div class="detail-row">
                  <span>Time:</span>
                  <strong>${bookingDetails.time}</strong>
                </div>
                ${bookingDetails.location ? `
                <div class="detail-row">
                  <span>Location:</span>
                  <strong>${bookingDetails.location}</strong>
                </div>
                ` : ''}
                <div class="detail-row total">
                  <span>Total:</span>
                  <strong>£${bookingDetails.price.toFixed(2)}</strong>
                </div>
              </div>

              ${invoiceUrl ? `
                <p style="text-align: center;">
                  <a href="${invoiceUrl}" class="button">View Invoice</a>
                </p>
              ` : ''}

              <p style="margin-top: 30px;">
                If you need to make any changes, please contact us directly.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated email from ${businessName}</p>
              <p>Powered by GlamBooking</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Failed to send invoice email:", error);
    return false;
  }
}

/**
 * Send loyalty points notification email
 */
export async function sendLoyaltyPointsEmail(params: SendLoyaltyEmailParams): Promise<boolean> {
  try {
    const { to, clientName, businessName, pointsEarned, totalPoints, pointsRedeemed } = params;

    const mailOptions = {
      from: `"${businessName}" <${process.env.SMTP_USER}>`,
      to,
      subject: `You Earned Loyalty Points! 🎉 - ${businessName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EAB8D8 0%, #BBA8F5 50%, #91C4F2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .points-card { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .points-number { font-size: 48px; font-weight: bold; color: #E9B5D8; margin: 10px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #EAB8D8 0%, #BBA8F5 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💜 Loyalty Rewards!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${clientName}</strong>,</p>
              <p>Thank you for choosing <strong>${businessName}</strong>!</p>
              
              <div class="points-card">
                <h3>You Earned Points! 🎉</h3>
                <div class="points-number">+${pointsEarned}</div>
                <p style="color: #666;">points added to your account</p>
                
                ${pointsRedeemed ? `
                  <p style="margin-top: 20px; color: #E9B5D8; font-weight: bold;">
                    You redeemed ${pointsRedeemed} points on this booking!
                  </p>
                ` : ''}
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                
                <h3>Total Points Balance</h3>
                <div class="points-number" style="font-size: 36px;">${totalPoints}</div>
                <p style="color: #666;">points available</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                Create an account to track your points and get exclusive rewards!
              </p>
              
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard" class="button">View Your Dashboard</a>
              </p>
            </div>
            <div class="footer">
              <p>Keep booking to earn more points and unlock rewards!</p>
              <p>Powered by GlamBooking</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Loyalty points email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Failed to send loyalty points email:", error);
    return false;
  }
}

/**
 * Send welcome bonus email for first-time customers
 */
export async function sendWelcomeBonusEmail(
  to: string,
  clientName: string,
  businessName: string,
  welcomePoints: number
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"${businessName}" <${process.env.SMTP_USER}>`,
      to,
      subject: `Welcome to ${businessName}! 🎁`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EAB8D8 0%, #BBA8F5 50%, #91C4F2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .bonus-card { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #E9B5D8; }
            .points-number { font-size: 48px; font-weight: bold; color: #E9B5D8; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Welcome Gift Inside!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${clientName}</strong>,</p>
              <p>Welcome to <strong>${businessName}</strong>! We're thrilled to have you.</p>
              
              <div class="bonus-card">
                <h3>🎉 First Booking Bonus!</h3>
                <div class="points-number">${welcomePoints}</div>
                <p style="color: #666;">bonus points credited to your account</p>
                <p style="margin-top: 20px; color: #E9B5D8; font-weight: bold;">
                  Start earning rewards with every visit!
                </p>
              </div>

              <p>Your loyalty means everything to us. Earn points with each booking and redeem them for discounts on future services.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing ${businessName}</p>
              <p>Powered by GlamBooking</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome bonus email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Failed to send welcome bonus email:", error);
    return false;
  }
}
