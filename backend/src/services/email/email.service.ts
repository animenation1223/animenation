import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  if (!resend) {
    console.log('[Email Service] RESEND_API_KEY not configured. Skipping email send.');
    console.log('[Email Service] Would send to:', to);
    console.log('[Email Service] Subject:', subject);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'AnimeNation <noreply@animenation.in>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email Service] Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[Email Service] Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error);
    throw error;
  }
}

export function generatePasswordResetHtml(name: string, resetLink: string) {
  const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - AnimeNation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #0a0a0a;
          color: #ffffff;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -1px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #ffffff;
        }
        .message {
          color: #a1a1aa;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: scale(1.05);
        }
        .security-note {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
          color: #a1a1aa;
          font-size: 14px;
        }
        .security-note strong {
          color: #8b5cf6;
        }
        .footer {
          background: rgba(0, 0, 0, 0.3);
          padding: 30px;
          text-align: center;
          color: #71717a;
          font-size: 14px;
        }
        .footer a {
          color: #8b5cf6;
          text-decoration: none;
        }
        .link {
          color: #8b5cf6;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">AnimeNation</h1>
        </div>
        <div class="content">
          <p class="greeting">Hi ${name || 'Otaku'},</p>
          <p class="message">
            We received a request to reset your password for your AnimeNation account. 
            If you didn't make this request, you can safely ignore this email.
          </p>
          <div class="button-container">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p class="message">
            Or copy and paste this link into your browser:
          </p>
          <p class="message link">${resetLink}</p>
          <div class="security-note">
            <strong>🔒 Security Notice:</strong><br>
            This link will expire in 30 minutes for your security. 
            If you didn't request this password reset, please contact our support team immediately.
          </div>
        </div>
        <div class="footer">
          <p>
            © 2026 AnimeNation. All rights reserved.<br>
            <a href="${frontendUrl}">Visit our store</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
