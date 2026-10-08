// Emails for Craftora Sign, sent from noreply@craftora.dev.
import nodemailer from 'nodemailer';

const SITE = process.env.AUTH_URL || 'https://craftora.dev';
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SIGN_MAIL_JSON === '1') {
    transporter = nodemailer.createTransport({ jsonTransport: true }); // test mode
    return transporter;
  }
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

function fromAddress() {
  if (process.env.NOREPLY_SMTP_PASS) return `"Craftora Sign" <${process.env.NOREPLY_SMTP_USER || 'noreply@craftora.dev'}>`;
  return process.env.SMTP_FROM;
}

export function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function button(href, label) {
  return `<a href="${href}" style="display:inline-block;background:#3430a8;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:10px;">${esc(label)}</a>`;
}

function wrap(title, bodyHtml, footerExtra = '') {
  return `
  <div style="background:#f4f5fb;padding:24px 12px;">
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;color:#202b58;">
    <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#3430a8;margin-bottom:22px;">Craftora <span style="color:#64708a;font-weight:600;">Sign</span></div>
    <h1 style="font-size:20px;line-height:1.35;font-weight:700;margin:0 0 14px;">${title}</h1>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #dce1f0;margin:28px 0 14px;">
    <p style="font-size:12px;line-height:1.6;color:#64708a;margin:0;">Sent with Craftora Sign, free electronic signatures at <a href="${SITE}/document-signer" style="color:#3430a8;">craftora.dev</a>. ${footerExtra}</p>
  </div></div>`;
}

async function send(opts) {
  const info = await getTransporter().sendMail({ from: fromAddress(), ...opts });
  if (process.env.SIGN_MAIL_JSON === '1') console.log('[mail]', opts.to, '|', opts.subject);
  return info;
}

export async function sendInviteEmail(doc, signer) {
  const link = `${SITE}/sign/${signer.token}`;
  const expires = doc.expires_at ? new Date(doc.expires_at).toUTCString().slice(0, 16) : '';
  const report = `Not expecting this? <a href="mailto:support@craftora.dev?subject=${encodeURIComponent('Report document ' + doc.id)}" style="color:#64708a;">Report this email</a>.`;
  const html = wrap(`${esc(doc.sender_name || doc.sender_email)} sent you a document to sign`, `
    <p style="font-size:15px;line-height:1.6;margin:0 0 6px;"><strong>${esc(doc.title)}</strong></p>
    <p style="font-size:13px;color:#64708a;margin:0 0 18px;">From ${esc(doc.sender_name)} (${esc(doc.sender_email)})</p>
    ${doc.message ? `<div style="font-size:14px;line-height:1.6;background:#f1f0ff;border-radius:10px;padding:14px 16px;margin:0 0 20px;white-space:pre-wrap;">${esc(doc.message)}</div>` : ''}
    <p style="margin:0 0 22px;">${button(link, 'Review and sign')}</p>
    <p style="font-size:12px;line-height:1.6;color:#64708a;margin:0;">This link is private to you (${esc(signer.email)}). Do not forward it.${expires ? ` It expires on ${esc(expires)}.` : ''}</p>
  `, report);
  await send({ to: `"${String(signer.name).replace(/"/g, '')}" <${signer.email}>`, replyTo: doc.sender_email, subject: `Please sign: ${doc.title}`, html });
}

export async function sendReminderEmail(doc, signer) {
  const link = `${SITE}/sign/${signer.token}`;
  const html = wrap(`Reminder: ${esc(doc.title)} is waiting for your signature`, `
    <p style="font-size:14px;line-height:1.6;color:#64708a;margin:0 0 20px;">${esc(doc.sender_name || doc.sender_email)} is still waiting for you to sign this document.</p>
    <p style="margin:0 0 22px;">${button(link, 'Review and sign')}</p>
  `);
  await send({ to: signer.email, replyTo: doc.sender_email, subject: `Reminder: please sign ${doc.title}`, html });
}

export async function sendSignedNotice(doc, signer, signers) {
  const done = signers.filter((s) => s.status === 'signed').length;
  const html = wrap(`${esc(signer.name)} signed ${esc(doc.title)}`, `
    <p style="font-size:14px;line-height:1.6;color:#64708a;margin:0 0 20px;">${done} of ${signers.length} signers have signed.</p>
    <p style="margin:0;">${button(`${SITE}/account/documents/${doc.id}`, 'View document')}</p>
  `);
  await send({ to: doc.sender_email, subject: `${signer.name} signed: ${doc.title}`, html });
}

export async function sendDeclinedNotice(doc, signer, reason) {
  const html = wrap(`${esc(signer.name)} declined to sign ${esc(doc.title)}`, `
    ${reason ? `<div style="font-size:14px;line-height:1.6;background:#fff1f1;border-radius:10px;padding:14px 16px;margin:0 0 20px;">${esc(reason)}</div>` : ''}
    <p style="margin:0;">${button(`${SITE}/account/documents/${doc.id}`, 'View document')}</p>
  `);
  await send({ to: doc.sender_email, subject: `Declined: ${doc.title}`, html });
}

export async function sendCompletedEmail(doc, signers, pdfBytes) {
  const attach = pdfBytes && pdfBytes.length < 10 * 1024 * 1024
    ? [{ filename: `${doc.title.replace(/[^\w\- ]+/g, '').trim() || 'document'} (signed).pdf`, content: pdfBytes, contentType: 'application/pdf' }]
    : [];
  const recipients = [{ email: doc.sender_email, link: `${SITE}/account/documents/${doc.id}` }, ...signers.filter((s) => s.email.toLowerCase() !== doc.sender_email.toLowerCase()).map((s) => ({ email: s.email, link: `${SITE}/sign/${s.token}` }))];
  for (const r of recipients) {
    const html = wrap(`${esc(doc.title)} is complete`, `
      <p style="font-size:14px;line-height:1.6;color:#64708a;margin:0 0 20px;">Everyone has signed. ${attach.length ? 'The signed PDF with its certificate of completion is attached.' : 'Download the signed PDF with its certificate of completion below.'}</p>
      <p style="margin:0 0 18px;">${button(r.link, 'Download signed PDF')}</p>
      <p style="font-size:12px;color:#64708a;margin:0;">Check that a copy is authentic at <a href="${SITE}/verify-document" style="color:#3430a8;">craftora.dev/verify-document</a>.</p>
    `);
    await send({ to: r.email, subject: `Completed: ${doc.title}`, html, attachments: attach });
  }
}
