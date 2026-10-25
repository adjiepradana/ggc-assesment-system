import nodemailer from "nodemailer";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Go Great Career <onboarding@resend.dev>";

/**
 * Reusable Gmail SMTP Transporter for Go Great Career (GGC)
 * Configured with SSL/TLS on port 465.
 */
export const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Dispatches an email using Resend transactional ESP if available,
 * falling back to Nodemailer SMTP, and finally dev logging if unconfigured.
 */
async function dispatchEmail({
  to,
  subject,
  html,
  text,
  logContext,
  localFallbackUrl,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  logContext: string;
  localFallbackUrl: string;
}): Promise<SendEmailResult> {
  // 1. Primary: Resend ESP
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        html,
        text,
      });

      if (!error && data?.id) {
        console.log(`✉️ [Resend] ${logContext} sent to ${to}. ID: ${data.id}`);
        return { success: true, messageId: data.id };
      }
      console.warn(
        `⚠️ [Resend] Sending failed (${error?.message}). Falling back to Nodemailer...`
      );
    } catch (err: any) {
      console.warn(
        `⚠️ [Resend] Exception (${err?.message}). Falling back to Nodemailer...`
      );
    }
  }

  // 2. Secondary Fallback: Nodemailer SMTP
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const senderEmail = process.env.EMAIL_USER;
      const info = await mailTransporter.sendMail({
        from: `"Go Great Career" <${senderEmail}>`,
        to,
        replyTo: senderEmail,
        subject,
        text,
        html,
        headers: {
          "X-Auto-Response-Suppress": "OOF, AutoReply",
          "X-Priority": "3",
        },
      });
      console.log(`✉️ [Nodemailer] ${logContext} sent to ${to}. ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error(`❌ [Nodemailer] Failed to send ${logContext}:`, smtpErr);
      return {
        success: false,
        error: smtpErr?.message || "Failed to send email via SMTP.",
      };
    }
  }

  // 3. Dev / Mock Fallback if neither ESP nor SMTP credentials are provided
  console.warn(
    `⚠️ [Mail] RESEND_API_KEY and SMTP credentials not set. Simulated ${logContext} for ${to}. Action Link:`,
    localFallbackUrl
  );
  return {
    success: true,
    messageId: "mock-local-dev-id",
  };
}

/**
 * Resolves the application base URL with intelligent fallbacks:
 * 1. Explicit customBaseUrl passed from the HTTP request context
 * 2. NEXTAUTH_URL if set and not pointing to localhost
 * 3. VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL if hosted on Vercel
 * 4. NEXTAUTH_URL as-is or http://localhost:3000
 */
export function resolveBaseUrl(customBaseUrl?: string): string {
  if (customBaseUrl && customBaseUrl.startsWith("http")) {
    return customBaseUrl.replace(/\/$/, "");
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && !nextAuthUrl.includes("localhost")) {
    return nextAuthUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return (nextAuthUrl || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Sends a luxury-styled account verification email to a newly registered student.
 *
 * @param toEmail - Destination student email address
 * @param studentName - Full name of the student
 * @param token - Secure random email verification token
 * @param customBaseUrl - Optional request origin URL to guarantee correct domain in email links
 */
export async function sendVerificationEmail(
  toEmail: string,
  studentName: string,
  token: string,
  customBaseUrl?: string
): Promise<SendEmailResult> {
  const baseUrl = resolveBaseUrl(customBaseUrl);
  const verificationUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`;
  const senderEmail = process.env.EMAIL_USER || "gogreatcareer@gmail.com";

  // Escape HTML characters to prevent XSS injection in email clients
  const sanitizedName = studentName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const emailSubject = "Aktivasi Akun Go Great Career Anda";

  const plainTextContent = `
Halo ${studentName},

Selamat datang di Go Great Career (GGC)!
Terima kasih telah mendaftar di platform evaluasi studi kami: GGC Study Fit Assessment.

Untuk mengaktifkan akun dan mulai mengerjakan instrumen asesmen multi-matriks 84 butir pertanyaan, silakan lakukan verifikasi email Anda melalui tautan di bawah ini:

${verificationUrl}

Tautan ini berlaku selama 24 jam. Jika Anda tidak merasa mendaftar di Go Great Career, Anda dapat mengabaikan email ini dengan aman.

Salam sukses,
Tim Asesmen & Talenta Go Great Career
https://gogreatcareer.com
  `.trim();

  // Luxury HTML Email Template with Forest Emerald (#0B4632) & Champagne Gold (#C5A869)
  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1E293B;">
  <!-- Preheader preview text for mail clients -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Silakan klik tautan di dalam email ini untuk menyelesaikan verifikasi dan mulai asesmen Go Great Career Anda.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F8F5; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (max 600px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(11, 70, 50, 0.08), 0 8px 10px -6px rgba(11, 70, 50, 0.05); border: 1px solid #E2EBE5;">
          
          <!-- Luxury Header Banner (Forest Emerald #0B4632) -->
          <tr>
            <td style="background: linear-gradient(135deg, #072F22 0%, #0B4632 60%, #135E44 100%); background-color: #0B4632; padding: 42px 32px 36px 32px; text-align: center;">
              
              <!-- Gold Brand Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 16px auto;">
                <tr>
                  <td style="background-color: rgba(197, 168, 105, 0.18); border: 1px solid #C5A869; padding: 6px 16px; border-radius: 9999px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; color: #F5E8C7; letter-spacing: 2px; text-transform: uppercase;">
                      STUDY FIT ASSESSMENT
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Brand Title -->
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.25;">
                GO GREAT CAREER
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #C8E3D5; font-weight: 500; letter-spacing: 0.5px;">
                Multi-Matrix Scientific Talent & Study Matching Engine
              </p>
            </td>
          </tr>

          <!-- Gold Accent Separator Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #E6D5A8 0%, #C5A869 50%, #9A7D3E 100%); background-color: #C5A869; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 40px 36px 32px 36px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0B4632; letter-spacing: -0.3px;">
                Halo, ${sanitizedName}! 👋
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                Selamat datang di platform evaluasi studi resmi <strong>Go Great Career</strong>. Pembayaran tiket asesmen Anda telah berhasil dikonfirmasi dan akun Anda telah aktif.
              </p>

              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                Satu langkah terakhir diperlukan: mohon lakukan <strong>verifikasi alamat email</strong> Anda untuk mengaktifkan sesi asesmen dan mengakses instrumen diagnostik 84 butir pertanyaan multi-matriks kami.
              </p>

              <!-- Value Highlight Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAF9; border: 1px solid #E2ECE6; border-radius: 16px; margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 12px; font-weight: 800; color: #0B4632; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      ✦ Yang Menanti Anda di Platform GGC:
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="24" valign="top" style="font-size: 14px; line-height: 22px; color: #C5A869;">✔</td>
                        <td style="font-size: 13px; line-height: 22px; color: #475569; padding-bottom: 6px;">
                          <strong>84 Pertanyaan Multi-Matriks:</strong> Mengukur Bakat, Minat, Karakter, dan Nilai Studi Anda.
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="font-size: 14px; line-height: 22px; color: #C5A869;">✔</td>
                        <td style="font-size: 13px; line-height: 22px; color: #475569; padding-bottom: 6px;">
                          <strong>Top 5 Jurusan & Kampus:</strong> Rekomendasi PTN/PTS terbaik berserta kalkulasi Study Fit Score.
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="font-size: 14px; line-height: 22px; color: #C5A869;">✔</td>
                        <td style="font-size: 13px; line-height: 22px; color: #475569;">
                          <strong>Laporan Eksekutif & Sertifikat:</strong> Kartu persona visual & laporan komprehensif resmi.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call-to-Action Luxury Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #0B4632 0%, #156247 100%); background-color: #0B4632; box-shadow: 0 6px 18px rgba(11, 70, 50, 0.28); border: 1.5px solid #C5A869;">
                          <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 38px; font-size: 15px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 14px; letter-spacing: 0.4px;">
                            Verifikasi Email & Mulai Asesmen &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8F9FA; border-left: 3px solid #C5A869; border-radius: 4px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #64748B;">
                      Tombol di atas tidak dapat diklik? Salin dan buka tautan berikut di peramban (browser) Anda:
                    </p>
                    <p style="margin: 0; font-size: 11px; line-height: 1.5; word-break: break-all; color: #0B4632; font-family: monospace;">
                      <a href="${verificationUrl}" target="_blank" style="color: #0B4632; text-decoration: underline;">
                        ${verificationUrl}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Expiration & Security Notice -->
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8; text-align: center;">
                🔒 Tautan verifikasi ini berlaku selama <strong>24 jam</strong>. Jangan membagikan tautan ini kepada siapa pun demi keamanan akun Anda.
              </p>

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #F8FAF9; border-top: 1px solid #E2ECE6; padding: 28px 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #0B4632;">
                Go Great Career (GGC)
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; line-height: 1.5; color: #64748B;">
                Inovasi Asesmen Keselarasan Rumpun Studi & Prospek Karier Generasi Emas Indonesia.
              </p>
              <p style="margin: 0; font-size: 10px; color: #94A3B8; line-height: 1.4;">
                © ${new Date().getFullYear()} Go Great Career. Hak cipta dilindungi undang-undang.<br>
                Email ini dikirim secara otomatis oleh sistem. Jika Anda tidak pernah mendaftar, silakan abaikan email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return dispatchEmail({
    to: toEmail,
    subject: emailSubject,
    html: htmlContent,
    text: plainTextContent,
    logContext: "Verification email",
    localFallbackUrl: verificationUrl,
  });
}

/**
 * Sends a luxury-styled password reset email to a student.
 *
 * @param toEmail - Destination user email address
 * @param userName - Full name of the user
 * @param token - Secure random password reset token
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  token: string,
  customBaseUrl?: string
): Promise<SendEmailResult> {
  const baseUrl = resolveBaseUrl(customBaseUrl);
  const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const senderEmail = process.env.EMAIL_USER || "gogreatcareer@gmail.com";

  const sanitizedName = userName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const emailSubject = "Instruksi Reset Password Akun Go Great Career";

  const plainTextContent = `
Halo ${userName},

Kami menerima permintaan untuk mengatur ulang kata sandi akun Go Great Career Anda.

Silakan klik tautan di bawah ini untuk membuat kata sandi baru:
${resetUrl}

Tautan ini hanya berlaku selama 1 jam. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini dengan aman. Kata sandi lama Anda tidak akan berubah.

Salam,
Tim Go Great Career
https://gogreatcareer.com
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1E293B;">
  <!-- Preheader preview text for mail clients -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Permintaan reset password akun Go Great Career Anda. Tautan pemulihan berlaku selama 1 jam.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F8F5; padding: 40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(11, 70, 50, 0.08); border: 1px solid #E2EBE5;">
          
          <!-- Luxury Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #072F22 0%, #0B4632 60%, #135E44 100%); background-color: #0B4632; padding: 38px 32px 32px 32px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 14px auto;">
                <tr>
                  <td style="background-color: rgba(197, 168, 105, 0.18); border: 1px solid #C5A869; padding: 6px 16px; border-radius: 9999px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; color: #F5E8C7; letter-spacing: 2px; text-transform: uppercase;">
                      🔒 PEMULIHAN KEAMANAN AKUN
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                GO GREAT CAREER
              </h1>
            </td>
          </tr>

          <!-- Gold Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #E6D5A8 0%, #C5A869 50%, #9A7D3E 100%); background-color: #C5A869; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 38px 36px 32px 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 19px; font-weight: 800; color: #0B4632;">
                Halo, ${sanitizedName}! 👋
              </h2>

              <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.65; color: #334155;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun <strong>Go Great Career</strong> yang terhubung dengan alamat email ini.
              </p>

              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.65; color: #334155;">
                Silakan klik tombol di bawah ini untuk membuat kata sandi baru akun Anda:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #0B4632 0%, #156247 100%); background-color: #0B4632; box-shadow: 0 6px 18px rgba(11, 70, 50, 0.28); border: 1.5px solid #C5A869;">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 14px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 14px; letter-spacing: 0.3px;">
                            Atur Ulang Kata Sandi &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8F9FA; border-left: 3px solid #C5A869; border-radius: 4px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #64748B;">
                      Atau salin tautan berikut ke peramban (browser) Anda:
                    </p>
                    <p style="margin: 0; font-size: 11px; line-height: 1.5; word-break: break-all; color: #0B4632; font-family: monospace;">
                      <a href="${resetUrl}" target="_blank" style="color: #0B4632; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Expiration Warning -->
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8; text-align: center;">
                🔒 Tautan ini hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini dengan aman.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAF9; border-top: 1px solid #E2ECE6; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0B4632;">
                Go Great Career (GGC)
              </p>
              <p style="margin: 0; font-size: 10px; color: #94A3B8; line-height: 1.4;">
                © ${new Date().getFullYear()} Go Great Career. Hak cipta dilindungi undang-undang.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return dispatchEmail({
    to: toEmail,
    subject: emailSubject,
    html: htmlContent,
    text: plainTextContent,
    logContext: "Password reset email",
    localFallbackUrl: resetUrl,
  });
}
