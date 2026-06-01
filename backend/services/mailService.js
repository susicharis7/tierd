const nodemailer = require("nodemailer");

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are missing in backend/.env");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

function renderTwoFactorEmail(code, ttlMinutes) {
  return {
    subject: "Your Tierd security code",
    text: [
      "Your Tierd verification code:",
      "",
      code,
      "",
      `This code expires in ${ttlMinutes} minutes.`,
      "If you didn't request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:520px">
        <h2 style="margin:0 0 12px">Tierd verification code</h2>
        <p style="margin:0 0 14px">Use this code to continue your sign-in:</p>
        <p style="font-size:30px;letter-spacing:4px;font-weight:700;margin:0 0 14px">${code}</p>
        <p style="margin:0 0 10px">This code expires in ${ttlMinutes} minutes.</p>
        <p style="margin:0;color:#666">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  };
}

async function sendEmail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM;
  if (!from) {
    throw new Error("SMTP_FROM is missing in backend/.env");
  }

  const transporter = getTransporter();
  await transporter.sendMail({ from, to, subject, text, html });
}

async function sendTwoFactorCodeEmail({ to, code, ttlMinutes }) {
  const template = renderTwoFactorEmail(code, ttlMinutes);
  await sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

module.exports = {
  sendTwoFactorCodeEmail,
};
