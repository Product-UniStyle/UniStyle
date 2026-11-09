import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendStaffCredentials({ to, firstName, role, password, panelUrl }) {
  const transporter = createTransport();

  const roleLabel = role === 'admin' ? 'Admin' : 'Editor';
  const name = firstName || to;
  const loginUrl = panelUrl || `${process.env.CLIENT_URL}/admin/login`;

  await transporter.sendMail({
    from: `"UniStyle Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your UniStyle ${roleLabel} account is ready`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="margin-bottom:4px">Welcome to UniStyle, ${name}!</h2>
        <p style="color:#666;margin-top:0">Your <strong>${roleLabel}</strong> account has been created.</p>

        <div style="background:#f5f5f5;border-radius:6px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px 0"><strong>Email:</strong> ${to}</p>
          <p style="margin:0"><strong>Password:</strong> ${password}</p>
        </div>

        <a href="${loginUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 24px;border-radius:4px;font-size:14px">
          Sign in to the panel
        </a>

        <p style="color:#999;font-size:12px;margin-top:24px">
          Please change your password after your first login.<br>
          If you did not expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}

export async function sendDeliveryOtp({ to, firstName, otp, orderId }) {
  const transporter = createTransport();
  const name = firstName || 'there';

  await transporter.sendMail({
    from: `"UniStyle" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your delivery verification code for order #${orderId.slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="margin-bottom:4px">Hi ${name},</h2>
        <p style="color:#666;margin-top:0">Share this code with the delivery staff to confirm you received order #${orderId.slice(-6).toUpperCase()}.</p>

        <div style="background:#f5f5f5;border-radius:6px;padding:20px;margin:24px 0;text-align:center">
          <span style="font-size:28px;font-weight:bold;letter-spacing:6px">${otp}</span>
        </div>

        <p style="color:#999;font-size:12px;margin-top:24px">
          This code expires in 10 minutes. Never share it with anyone except the delivery staff in front of you.
        </p>
      </div>
    `,
  });
}
