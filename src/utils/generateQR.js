const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateQR = async (order) => {
  // 1) Ensure QR directory exists
  const qrDir = path.join(__dirname, '../../public/qrcodes');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  // 2) Data encoded in the QR code
  const qrData = JSON.stringify({
    orderId   : order.id,
    total     : order.totalAmount,
    status    : order.status,
    createdAt : order.createdAt
  });

  // 3) Generate and save as PNG
  const filePath = path.join(qrDir, `order-${order.id}.png`);

  await QRCode.toFile(filePath, qrData, {
    width: 300,
    margin: 2,
    color: {
      dark  : '#000000',
      light : '#ffffff'
    }
  });

  return filePath;
};

module.exports = generateQR;
