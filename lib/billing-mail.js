// Billing emails, sent from noreply@craftora.dev with the same SMTP settings as Craftora Sign.
import nodemailer from 'nodemailer';

const SITE = 'https://craftora.dev';
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SIGN_MAIL_JSON === '1') return (transporter = nodemailer.createTransport({ jsonTransport: true }));
  const useNoreply = !!process.env.NOREPLY_SMTP_PASS;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: {
      user: useNoreply ? (process.env.NOREPLY_SMTP_USER || 'noreply@craftora.dev') : process.env.SMTP_USER,
      pass: useNoreply ? process.env.NOREPLY_SMTP_PASS : process.env.SMTP_PASS,
    },
  });
  return transporter;
}

const from = () => (process.env.NOREPLY_SMTP_PASS ? `"Craftora" <${process.env.NOREPLY_SMTP_USER || 'noreply@craftora.dev'}>` : process.env.SMTP_FROM);

export async function sendRenewReminder({ email, plan, plan_expires_at }) {
  const name = plan === 'business' ? 'Business' : 'Pro';
  const date = new Date(plan_expires_at).toLocaleDateString('en-US', { dateStyle: 'long' });
  const html = `
  <div style="background:#f4f5fb;padding:24px 12px;">
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;color:#202b58;">
    <div style="font-size:20px;font-weight:800;color:#3430a8;margin-bottom:22px;">Craftora</div>
    <h1 style="font-size:20px;line-height:1.35;font-weight:700;margin:0 0 14px;">Your ${name} plan ends on ${date}</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">Thanks for supporting Craftora. Your ${name} plan was a one-time purchase, so it will not renew on its own. After ${date} your account goes back to the free plan and its daily limits. Your files and history stay as they are.</p>
    <a href="${SITE}/pricing" style="display:inline-block;background:#3430a8;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:10px;">Keep ${name}</a>
    <hr style="border:none;border-top:1px solid #dce1f0;margin:28px 0 14px;">
    <p style="font-size:12px;line-height:1.6;color:#64708a;margin:0;">You are getting this because you bought a Craftora plan with this email address. Questions? Reply to support@craftora.dev.</p>
  </div></div>`;
  return getTransporter().sendMail({
    from: from(),
    to: email,
    subject: `Your Craftora ${name} plan ends on ${date}`,
    html,
    text: `Your Craftora ${name} plan ends on ${date}. It was a one-time purchase and will not renew on its own. Keep ${name}: ${SITE}/pricing`,
  });
}
