import * as Print from 'expo-print';

export const getInvoiceHtml = (invoiceDetails) => {
  const {
    invoiceNumber,
    date,
    customerName,
    items,
    storeName,
    subtotal,
    totalDiscount,
    finalPayable,
  } = invoiceDetails;

  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.metal}</td>
      <td>${item.purity}</td>
      <td>${item.grossWeight.toFixed(3)}</td>
      <td>₹${(item.metalValue / item.netWeight).toFixed(2)}</td>
      <td>₹${item.makingCharge.toFixed(2)}</td>
      <td>₹${item.discount.toFixed(2)}</td>
      <td>₹${item.finalTotal.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          position: relative;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px;
          color: rgba(0, 0, 0, 0.1);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f2f2f2;
        }
        .footer {
          text-align: right;
          font-size: 14px;
        }
        .footer div {
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="watermark">Rough Estimate Bill</div>
      <div class="header">
        <h1>${storeName}</h1>
        <p>Invoice</p>
      </div>
      <div class="details">
        <div>
          <strong>Invoice No:</strong> ${invoiceNumber}<br>
          <strong>Date:</strong> ${date}
        </div>
        <div>
          <strong>Customer:</strong> ${customerName || 'N/A'}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Metal</th>
            <th>Purity</th>
            <th>Wt(gm)</th>
            <th>Rate</th>
            <th>MC</th>
            <th>Discount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="footer">
        <div><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</div>
        <div><strong>Discount:</strong> - ₹${totalDiscount.toFixed(2)}</div>
        <div><strong>Final Payable:</strong> ₹${finalPayable.toFixed(2)}</div>
      </div>
    </body>
  </html>
  `;
};

export const generateInvoicePdf = async (invoiceDetails) => {
  const html = getInvoiceHtml(invoiceDetails);
  try {
    const { uri } = await Print.printToFileAsync({
      html,
      width: 595, // A5 width in points (210mm)
      height: 842, // A5 height in points (297mm)
    });
    return uri;
  } catch (err) {
    console.error("Failed to generate PDF", err);
    return null;
  }
};
