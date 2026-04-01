const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateInvoice = (order, user) => {
  return new Promise((resolve, reject) => {

    // 1) Create the PDF document
    const doc = new PDFDocument({ margin: 50 });

    // 2) Ensure invoices directory exists
    const invoiceDir = path.join(__dirname, '../../public/invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // 3) Pipe output to a file
    const filePath = path.join(invoiceDir, `invoice-${order.id}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ========== HEADER ==========
    doc
      .fontSize(26)
      .text('INVOICE', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .text(`Invoice #: INV-${order.id}`, { align: 'right' })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' })
      .moveDown(1);

    // ========== CUSTOMER INFO ==========
    doc
      .fontSize(12)
      .text('Bill To:', { underline: true })
      .fontSize(10)
      .text(user.name)
      .text(user.email)
      .text(order.shippingAddress || 'N/A')
      .moveDown(1);

    // ========== TABLE HEADER ==========
    const tableTop = doc.y;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Product', 50, tableTop);
    doc.text('Qty', 280, tableTop, { width: 50, align: 'center' });
    doc.text('Price', 350, tableTop, { width: 80, align: 'right' });
    doc.text('Subtotal', 450, tableTop, { width: 80, align: 'right' });

    // Draw header line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(530, tableTop + 15)
      .stroke();

    // ========== TABLE ROWS ==========
    doc.font('Helvetica');
    let y = tableTop + 25;

    for (const item of order.items) {
      doc.text(item.productName, 50, y, { width: 220 });
      doc.text(String(item.quantity), 280, y, { width: 50, align: 'center' });
      doc.text(`$${item.unitPrice.toFixed(2)}`, 350, y, { width: 80, align: 'right' });
      doc.text(`$${item.subtotal.toFixed(2)}`, 450, y, { width: 80, align: 'right' });
      y += 20;
    }

    // Draw bottom line
    doc.moveTo(50, y).lineTo(530, y).stroke();

    // ========== TOTALS ==========
    y += 15;
    doc.font('Helvetica');
    doc.text(`Shipping:`, 350, y, { width: 80, align: 'right' });
    doc.text(`$${order.shippingCost.toFixed(2)}`, 450, y, { width: 80, align: 'right' });

    y += 20;
    doc.font('Helvetica-Bold');
    doc.text(`Total:`, 350, y, { width: 80, align: 'right' });
    doc.text(`$${order.totalAmount.toFixed(2)}`, 450, y, { width: 80, align: 'right' });

    // ========== FOOTER ==========
    y += 40;
    doc
      .font('Helvetica')
      .fontSize(8)
      .text('Thank you for your purchase!', 50, y, { align: 'center' })
      .text('This is a computer-generated invoice.', { align: 'center' });

    // 4) Finalize the PDF
    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = generateInvoice;
