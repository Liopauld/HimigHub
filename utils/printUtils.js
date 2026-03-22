import * as Print from 'expo-print';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderBaseHtml = (title, bodyContent) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          color: #1f2937; 
          padding: 40px; 
          background-color: #f3f4f6;
          margin: 0;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .brand {
          font-size: 26px;
          font-weight: 800;
          color: #4f46e5;
          letter-spacing: -0.5px;
        }
        .report-title {
          text-align: right;
        }
        .report-title h1 {
          font-size: 24px;
          margin: 0 0 4px 0;
          color: #111827;
        }
        .report-title p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }
        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .grid-2 {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 24px;
        }
        .col { flex: 1; }
        .text-info p {
          margin: 4px 0;
          font-size: 14px;
          color: #374151;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background-color: #f9fafb;
          color: #374151;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
          font-size: 14px;
        }
        .right { text-align: right; }
        .center { text-align: center; }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          background-color: #e0e7ff;
          color: #3730a3;
        }
        .sub-text {
          font-size: 12px;
          color: #9ca3af;
          display: block;
          margin-top: 4px;
        }
        .total-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }
        .total-table { width: 300px; }
        .total-table td { padding: 8px 12px; border: none; }
        .total-table .total-row {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          border-top: 2px solid #e5e7eb;
        }
        .footer {
          margin-top: 48px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
          padding-top: 24px;
        }
        .analytics-grid {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-box {
          flex: 1;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-box h3 { margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-box p { margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #111827; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">HIMIGHUB</div>
          <div class="report-title">
            <h1>${escapeHtml(title)}</h1>
            <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        ${bodyContent}
        <div class="footer">
          <p>Thank you for choosing HIMIGHUB. Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
  </html>
`;

export const printOrderReport = async (order) => {
  const items = order?.items || order?.orderItems || [];
  const shipping = order?.shippingAddress || order?.shippingInfo || {};
  const orderId = order?._id || 'N/A';
  const status = order?.status || order?.orderStatus || 'Pending';
  const date = order?.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
  const total = Number(order?.totalPrice || 0).toFixed(2);
  const tax = Number(order?.taxPrice || 0).toFixed(2);
  const shippingPrice = Number(order?.shippingPrice || 0).toFixed(2);
  const itemsPrice = (Number(total) - Number(tax) - Number(shippingPrice)).toFixed(2);

  const bodyContent = `
    <div class="grid-2 text-info">
      <div class="col">
        <div class="section-title">Order Information</div>
        <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
        <p><strong>Status:</strong> <span class="badge">${escapeHtml(status)}</span></p>
        <p><strong>Date Placed:</strong> ${escapeHtml(date)}</p>
      </div>
      <div class="col">
        <div class="section-title">Shipping Address</div>
        <p>${escapeHtml(order?.user?.name || 'Customer')}</p>
        <p>${escapeHtml(shipping.street || shipping.address || 'No Address Provided')}</p>
        <p>${escapeHtml(shipping.city || '')} ${escapeHtml(shipping.zip || shipping.postalCode || '')}</p>
        <p>${escapeHtml(shipping.country || '')}</p>
      </div>
    </div>

    <div class="section-title" style="margin-top: 16px;">Product Details</div>
    <table>
      <thead>
        <tr>
          <th>Item Details</th>
          <th class="center">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items
          .map(
            (item) =>
              `<tr>
                <td>
                  <strong>${escapeHtml(item.name || item.product?.name || 'Unknown Product')}</strong>
                  <span class="sub-text">Product ID: ${escapeHtml(item.product || item._id || 'N/A')}</span>
                </td>
                <td class="center">${Number(item.quantity || 0)}</td>
                <td class="right">PHP ${Number(item.price || 0).toFixed(2)}</td>
                <td class="right">PHP ${Number((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
              </tr>`
          )
          .join('') : '<tr><td colspan="4" class="center">No items found.</td></tr>'}
      </tbody>
    </table>

    <div class="total-section">
      <table class="total-table">
        <tr>
          <td>Subtotal</td>
          <td class="right">PHP ${itemsPrice}</td>
        </tr>
        <tr>
          <td>Tax</td>
          <td class="right">PHP ${tax}</td>
        </tr>
        <tr>
          <td>Shipping</td>
          <td class="right">PHP ${shippingPrice}</td>
        </tr>
        <tr class="total-row">
          <td>Total</td>
          <td class="right">PHP ${total}</td>
        </tr>
      </table>
    </div>
  `;

  await Print.printAsync({ html: renderBaseHtml('Order Receipt', bodyContent) });
};

export const printAnalyticsReport = async (analyticsData) => {
  const summary = analyticsData?.summary || {};
  const topProducts = analyticsData?.topProducts || [];
  const orderStatus = analyticsData?.orderStatus || [];
  const monthlySales = analyticsData?.monthlySales || [];

  const bodyContent = `
    <div class="analytics-grid">
      <div class="stat-box">
        <h3>Total Revenue</h3>
        <p>PHP ${Number(summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <div class="stat-box">
        <h3>Total Orders</h3>
        <p>${Number(summary.totalOrders || 0).toLocaleString()}</p>
      </div>
      <div class="stat-box">
        <h3>Active Users</h3>
        <p>${Number(summary.activeUsers || 0).toLocaleString()}</p>
      </div>
      <div class="stat-box">
        <h3>Total Products</h3>
        <p>${Number(summary.totalProducts || 0).toLocaleString()}</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="col text-info">
        <div class="section-title">Order Status Overview</div>
        <table>
          <thead><tr><th>Status</th><th class="right">Count</th></tr></thead>
          <tbody>
            ${orderStatus.length > 0 ? orderStatus
              .map((s) => `<tr><td><span class="badge" style="background:#f3f4f6; color:#374151;">${escapeHtml(s.status)}</span></td><td class="right"><strong>${Number(s.count || 0)}</strong></td></tr>`)
              .join('') : '<tr><td colspan="2" class="center">No data available</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="col text-info">
        <div class="section-title">Monthly Revenue Trend</div>
        <table>
          <thead><tr><th>Month</th><th class="right">Revenue</th></tr></thead>
          <tbody>
            ${monthlySales.length > 0 ? monthlySales
              .map((m) => `<tr><td>${escapeHtml(m.label)}</td><td class="right"><strong>PHP ${Number(m.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td></tr>`)
              .join('') : '<tr><td colspan="2" class="center">No data available</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div class="section-title" style="margin-top: 24px;">Top Performing Products</div>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th class="right">Units Sold</th>
          <th class="right">Estimated Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${topProducts.length > 0 ? topProducts
          .map((p) => {
            const avgPrice = p.price ? Number(p.price) : 0;
            const rev = avgPrice * (p.sold || 0);
            return `<tr>
              <td><strong>${escapeHtml(p.name)}</strong></td>
              <td class="right">${Number(p.sold || 0).toLocaleString()}</td>
              <td class="right">${rev > 0 ? 'PHP ' + rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
            </tr>`;
          })
          .join('') : '<tr><td colspan="3" class="center">No data available</td></tr>'}
      </tbody>
    </table>
  `;

  await Print.printAsync({ html: renderBaseHtml('Analytics Report', bodyContent) });
};
