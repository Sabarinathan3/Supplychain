const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

class QRService {
  // Generate QR code for product
  async generateProductQR(product) {
    const qrData = JSON.stringify({
      id: product.id,
      sku: product.sku,
      name: product.name,
      type: 'product',
    });

    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code string
  async generateQRString(data) {
    try {
      const qrCodeString = await QRCode.toString(data, { type: 'terminal' });
      return qrCodeString;
    } catch (error) {
      throw new Error('Failed to generate QR code string');
    }
  }

  // Parse QR code data
  parseQRData(qrString) {
    try {
      return JSON.parse(qrString);
    } catch (error) {
      // If not JSON, return as is (might be just SKU)
      return { sku: qrString };
    }
  }

  // Generate unique code
  generateUniqueCode(prefix = 'QR') {
    return `${prefix}-${uuidv4().slice(0, 8).toUpperCase()}`;
  }
}

module.exports = new QRService();
