const nodeMailer = require('nodemailer');

const CreateTransporter = () => {
    return nodeMailer.createTransport({
        host : process.env.EMAIL_HOST , 
        port : process.env.EMAIL_PORT , 
        auth : {
            user : process.env.EMAIL_USER ,
            pass : process.env.EMAIL_PASS
        }
    });
};

const sendEmail = async ({to , subject , html}) => {
    const transporter = CreateTransporter();
    await transporter.sendMail({
        from : `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`, 
        to   , 
        subject ,
        html
    });
}



exports.sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to our store!',
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>Thank you for joining us. Start shopping now and enjoy great deals.</p>
      <p>Happy shopping!</p>
    `
  });
};

exports.sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>$${item.unitPrice}</td>
      <td>$${item.subtotal}</td>
    </tr>
  `).join('');

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed #${order.id}`,
    html: `
      <h2>Order Confirmed!</h2>
      <p>Hi ${user.name}, your order <strong>#${order.id}</strong> has been placed successfully.</p>

      <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p><strong>Shipping Cost:</strong> $${order.shippingCost}</p>
      <p><strong>Total:</strong> $${order.totalAmount}</p>
      <p>We will notify you when your order is shipped.</p>
    `
  });
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${user.name}, you requested a password reset.</p>
      <p>Click the link below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
      <a href="${resetUrl}" style="
        background: #007bff;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
        margin: 16px 0;
      ">Reset Password</a>
      <p>If you did not request this, ignore this email.</p>
    `
  });
};


