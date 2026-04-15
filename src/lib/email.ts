import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** @deprecated use the functions below instead */
export const resend = {
  get emails() {
    const r = getResend();
    if (!r) throw new Error("RESEND_API_KEY тохируулаагүй байна");
    return r.emails;
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@cs2intelpro.com";

export async function sendPasswordResetEmail(email: string, token: string) {
  const r = getResend();
  if (!r) { console.warn("Email skip: RESEND_API_KEY тохируулаагүй"); return; }

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/confirm?token=${token}`;

  await r.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your CS2 Intel Pro password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00ff88;">CS2 Intel Pro</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #00ff88; color: #0a0a0f; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
        <p style="color: #8892a4; margin-top: 16px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const r = getResend();
  if (!r) { console.warn("Email skip: RESEND_API_KEY тохируулаагүй"); return; }

  await r.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to CS2 Intel Pro",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00ff88;">Welcome, ${escapeHtml(name || "Player")}!</h2>
        <p>Your CS2 Intel Pro account is ready. Start exploring AI-powered match predictions and team analytics.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #00ff88; color: #0a0a0f; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendContactFormEmail(name: string, email: string, message: string) {
  const r = getResend();
  if (!r) { console.warn("Email skip: RESEND_API_KEY тохируулаагүй"); return; }

  await r.emails.send({
    from: FROM_EMAIL,
    to: FROM_EMAIL,
    replyTo: email,
    subject: `Contact Form: ${name}`,
    html: `
      <div style="font-family: sans-serif;">
        <h3>New contact form submission</h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message)}</p>
      </div>
    `,
  });
}
