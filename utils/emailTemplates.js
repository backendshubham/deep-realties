function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function otpEmailTemplate(params) {
  const brandName = 'DeepRealties';
  const supportEmail = 'deeprealties@gmail.com';
  const otp = escapeHtml(params.otp);
  const expiresMinutes = escapeHtml(params.expiresMinutes);

  // Lightweight, Gmail-friendly HTML (no external CSS)
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${brandName} Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e9ecf3;">
        <div style="padding:20px 24px;background:#0f172a;color:#ffffff;">
          <div style="font-size:18px;font-weight:700;letter-spacing:.2px;">${brandName}</div>
          <div style="font-size:12px;opacity:.9;margin-top:4px;">Verify your email to activate your account</div>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 12px;color:#0f172a;font-size:14px;line-height:22px;">
            Use the OTP below to verify your email address:
          </p>

          <div style="margin:18px 0;padding:16px;border:1px dashed #cbd5e1;border-radius:12px;text-align:center;background:#f8fafc;">
            <div style="font-size:28px;letter-spacing:10px;font-weight:700;color:#0f172a;">${otp}</div>
          </div>

          <p style="margin:0 0 12px;color:#334155;font-size:13px;line-height:20px;">
            This OTP will expire in <b>${expiresMinutes} minutes</b>.
          </p>
          <p style="margin:0;color:#64748b;font-size:12px;line-height:18px;">
            If you didn’t request this, you can ignore this email.
          </p>
        </div>

        <div style="padding:16px 24px;border-top:1px solid #e9ecf3;background:#fbfcff;">
          <div style="font-size:12px;color:#64748b;line-height:18px;">
            Need help? Contact us at <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">${supportEmail}</a>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:12px;color:#94a3b8;font-size:11px;line-height:16px;">
        © ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
}

module.exports = {
  otpEmailTemplate
};


