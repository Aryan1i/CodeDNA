import nodemailer from "nodemailer";

/**
 * Generates the cyberpunk-themed HTML verification email.
 */
function getOTPHtmlTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeDNA Verification Code</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0b0f19;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .card {
          background-color: #111827;
          border: 1px solid #1f2937;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }
        /* Top accent border */
        .card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #00E5A0 0%, #00F0FF 50%, #aa44ff 100%);
        }
        .logo-area {
          margin-bottom: 24px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #00E5A0 0%, #00F0FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        h1 {
          font-size: 20px;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 16px;
          color: #ffffff;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #9ca3af;
          margin-top: 0;
          margin-bottom: 24px;
        }
        .otp-container {
          background: rgba(0, 229, 160, 0.05);
          border: 1px dashed rgba(0, 229, 160, 0.3);
          border-radius: 8px;
          padding: 16px 24px;
          margin: 28px 0;
          display: inline-block;
        }
        .otp-code {
          font-family: "Courier New", Courier, monospace;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #00E5A0;
          text-shadow: 0 0 10px rgba(0, 229, 160, 0.3);
          margin: 0;
        }
        .footer-text {
          font-size: 12px;
          color: #4b5563;
          margin-top: 32px;
          margin-bottom: 0;
          border-top: 1px solid #1f2937;
          padding-top: 16px;
        }
        .glow-line {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #1f2937 50%, transparent 100%);
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo-area">
            <h2 class="logo-text">CodeDNA</h2>
          </div>
          <h1>Verify Your Registration</h1>
          <p>Thank you for signing up for CodeDNA. Use the 6-digit verification code below to verify your account and build your telemetry-driven developer profile.</p>
          
          <div class="otp-container">
            <h2 class="otp-code">${otp}</h2>
          </div>
          
          <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">This verification code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
          
          <p class="footer-text">
            &copy; ${new Date().getFullYear()} CodeDNA. Built for telemetry-verified developer credentials.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends an OTP email to the recipient if SMTP credentials exist,
 * or logs it to the terminal if credentials are missing.
 * 
 * @param to The recipient's email address
 * @param otp The 6-digit OTP code to send
 * @returns boolean indicating whether the email was sent successfully via SMTP
 */
export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "465", 10);
  const secure = process.env.EMAIL_SECURE !== "false"; // default to true if secure is not explicitly "false"
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || (user ? `"CodeDNA Verification" <${user}>` : '"CodeDNA Verification" <noreply@codedna.com>');

  // Check if SMTP is configured. If not, log OTP code with clear bounding blocks to terminal.
  if (!user || !pass) {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE] NO SMTP CREDENTIALS CONFIGURED IN .env`);
    console.log(`[EMAIL SERVICE] Mocking OTP email delivery to: ${to}`);
    console.log(`[EMAIL SERVICE] Verification OTP code is: ${otp}`);
    console.log(`==================================================\n`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from,
      to,
      subject: `[CodeDNA] Your Verification Code: ${otp}`,
      html: getOTPHtmlTemplate(otp),
      text: `Your CodeDNA verification code is: ${otp}. This code is valid for 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Real OTP email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[EMAIL SERVICE] Error sending real email to ${to}:`, error);
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE] FALLING BACK TO TERMINAL LOGGING`);
    console.log(`[EMAIL SERVICE] Verification OTP code is: ${otp}`);
    console.log(`==================================================\n`);
    return false;
  }
}
