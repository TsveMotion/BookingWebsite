import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  bookingId: string;
  invoiceNumber: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  serviceDate: Date;
  serviceTime: string;
  staffName?: string;
  duration: number;
  amount: number;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  try {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Helper function to draw text
    const drawText = (
      text: string,
      x: number,
      y: number,
      size: number = 12,
      bold: boolean = false
    ) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: bold ? fontBold : font,
        color: rgb(0, 0, 0),
      });
    };

    // Header - Business Name
    drawText(data.businessName, 50, yPosition, 24, true);
    yPosition -= 20;

    // Business Details
    if (data.businessAddress) {
      drawText(data.businessAddress, 50, yPosition, 10);
      yPosition -= 15;
    }
    if (data.businessPhone) {
      drawText(data.businessPhone, 50, yPosition, 10);
      yPosition -= 15;
    }

    // Invoice Number and Date
    const invoiceDate = new Date().toLocaleDateString('en-GB');
    drawText('INVOICE', width - 150, height - 50, 18, true);
    drawText(`#${data.invoiceNumber.slice(0, 8).toUpperCase()}`, width - 150, height - 75, 12);
    drawText(`Date: ${invoiceDate}`, width - 150, height - 95, 10);

    yPosition -= 30;

    // Line separator
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    yPosition -= 30;

    // Bill To Section
    drawText('BILLED TO:', 50, yPosition, 12, true);
    yPosition -= 20;
    drawText(data.clientName, 50, yPosition, 11);
    yPosition -= 15;
    drawText(data.clientEmail, 50, yPosition, 10);
    yPosition -= 40;

    // Service Details Section
    drawText('SERVICE DETAILS:', 50, yPosition, 12, true);
    yPosition -= 25;

    // Table Header
    drawText('Description', 50, yPosition, 11, true);
    drawText('Date/Time', 250, yPosition, 11, true);
    drawText('Amount', width - 150, yPosition, 11, true);
    yPosition -= 20;

    // Line under header
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPosition -= 20;

    // Service Row
    drawText(data.serviceName, 50, yPosition, 10);
    const formattedDate = data.serviceDate.toLocaleDateString('en-GB');
    drawText(`${formattedDate}`, 250, yPosition, 10);
    drawText(`£${data.amount.toFixed(2)}`, width - 150, yPosition, 10);
    yPosition -= 15;

    if (data.staffName) {
      drawText(`Staff: ${data.staffName}`, 50, yPosition, 9);
      yPosition -= 12;
    }
    drawText(`Duration: ${data.duration} minutes`, 50, yPosition, 9);
    yPosition -= 40;

    // Line separator
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    yPosition -= 25;

    // Total
    drawText('TOTAL', width - 250, yPosition, 14, true);
    drawText(`£${data.amount.toFixed(2)}`, width - 150, yPosition, 14, true);
    yPosition -= 40;

    // Payment Status
    drawText('Payment Status: PAID ✓', 50, yPosition, 11);
    drawText('Thank you for your business!', 50, yPosition - 30, 10);

    // Footer
    const footerY = 50;
    drawText('Powered by GlamBooking.co.uk', 50, footerY, 8);
    drawText('Professional Booking & Payment Solutions', 50, footerY - 12, 7);

    // Serialize PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Ensure invoices directory exists
    const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Save PDF to file
    const filename = `${data.bookingId}.pdf`;
    const filePath = path.join(invoicesDir, filename);
    fs.writeFileSync(filePath, pdfBytes);

    // Return public URL
    return `/invoices/${filename}`;
  } catch (error) {
    console.error('Invoice generation error:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}
