// Sends emails through Hostinger SMTP (support@craftora.dev).
import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// Branded wrapper so every email looks like Craftora.
function wrap(title, bodyHtml) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #202b58;">
    <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #3430a8; margin-bottom: 24px;">Craftora</div>
    <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">${title}</h1>
    ${bodyHtml}
    <hr style="border: none; border-top: 1px solid #dce1f0; margin: 28px 0 16px;">
    <p style="font-size: 12px; color: #64708a; margin: 0;">Craftora, free online tools that just work. If you did not request this email, you can safely ignore it.</p>
  </div>`;
}

export async function sendOtpEmail(to, code, purpose) {
  const title = purpose === 'reset' ? 'Reset your password' : 'Confirm your email';
  const intro = purpose === 'reset'
    ? 'Use this code to reset your Craftora password. It expires in 15 minutes.'
    : 'Welcome to Craftora. Use this code to confirm your email address. It expires in 15 minutes.';
  const html = wrap(title, `
    <p style="font-size: 14px; line-height: 1.6; color: #64708a; margin: 0 0 20px;">${intro}</p>
    <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #202b58; background: #f1f0ff; border-radius: 12px; padding: 16px; text-align: center;">${code}</div>
  `);
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: purpose === 'reset' ? 'Your Craftora password reset code' : 'Your Craftora confirmation code',
    html,
  });
}

// Verify SMTP works (used by a test route).
export async function verifySmtp() {
  await getTransporter().verify();
  return true;
}
