import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.appPassword,
  },
});

export async function sendResetEmail(email, resetToken) {
  try {
    const resetLink = `${config.appUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: config.email.user,
      to: email,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%; background-color: #f4f4f5;">
            <tr>
              <td style="padding: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #9333EA; padding: 30px 40px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">${config.brandName}</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px; font-size: 20px;">Password Reset Request</h2>
                      <p style="color: #4b5563; margin-bottom: 24px;">We received a request to reset your password. Click the button below to create a new password:</p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetLink}" 
                               style="display: inline-block; padding: 14px 32px; background-color: #9333EA; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; transition: background-color 0.3s ease;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #4b5563; margin-bottom: 12px;">This password reset link will expire in 1 hour.</p>
                      <p style="color: #4b5563; margin-bottom: 24px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                      
                      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px; font-size: 14px; color: #6b7280;">
                        <p style="margin: 0;">For security reasons, this link can only be used once. If you need to reset your password again, please request a new link.</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; font-size: 14px; color: #6b7280;">
                      <p style="margin: 0;">© 2024 ${config.brandName}. All rights reserved.</p>
                      <p style="margin: 8px 0 0;">This is an automated email, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send reset email");
  }
}
