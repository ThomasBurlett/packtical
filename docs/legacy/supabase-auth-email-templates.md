# Supabase Auth Email Templates

Packtical uses Supabase Auth for passwordless email sign-in. Hosted Supabase projects let you customize the email subject and HTML body in the Dashboard under Authentication > Email Templates.

## Magic Link

Use this for the Supabase "Magic Link" template.

Subject:

```text
Open your Packtical packing space
```

HTML body:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Open your Packtical packing space</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f3ea; color:#24372d; font-family:'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      Your one-time Packtical sign-in link is ready.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ea; margin:0; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; border-collapse:separate; border-spacing:0;">
            <tr>
              <td style="padding:0 0 14px;">
                <span style="display:inline-block; padding:8px 12px; border-radius:999px; background:#ffffff; border:1px solid #dde1d5; color:#244d37; font-size:13px; font-weight:800; letter-spacing:0.02em;">
                  Packtical
                </span>
              </td>
            </tr>

            <tr>
              <td style="overflow:hidden; border:1px solid #d9dfd3; border-radius:24px; background:#fffef9; box-shadow:0 18px 44px rgba(31, 52, 41, 0.12);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:34px 30px 22px; background:linear-gradient(135deg, #fffef9 0%, #eef4e9 100%);">
                      <div style="width:48px; height:48px; border-radius:16px; background:#e7f1e8; border:1px solid #cbdccb; color:#2f7650; text-align:center; line-height:48px; font-size:24px; font-weight:800;">
                        ✓
                      </div>
                      <h1 style="margin:18px 0 10px; color:#183326; font-family:'Sora', 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif; font-size:32px; line-height:1.05; letter-spacing:-0.03em;">
                        Your packing space is ready.
                      </h1>
                      <p style="margin:0; color:#526259; font-size:16px; line-height:1.6;">
                        Use this one-time link to open Packtical and get back to your checklists.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:6px 30px 30px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
                        <tr>
                          <td style="border-radius:999px; background:#2f7650;">
                            <a href="{{ .ConfirmationURL }}" style="display:inline-block; padding:14px 22px; color:#ffffff; font-size:15px; font-weight:800; text-decoration:none; border-radius:999px;">
                              Sign in to Packtical
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 14px; color:#68766e; font-size:13px; line-height:1.6;">
                        This link can only be used once. If you did not request it, you can ignore this email.
                      </p>

                      <div style="margin:22px 0 0; padding:14px 16px; border-radius:16px; background:#f2f4ec; border:1px solid #e1e5d8;">
                        <p style="margin:0 0 6px; color:#516058; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;">
                          Button not working?
                        </p>
                        <p style="margin:0; color:#68766e; font-size:12px; line-height:1.6; word-break:break-word;">
                          Copy and paste this link into your browser:<br>
                          <a href="{{ .ConfirmationURL }}" style="color:#2f7650; text-decoration:underline;">{{ .ConfirmationURL }}</a>
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 4px 0; color:#7a867f; font-size:12px; line-height:1.6;">
                Packtical helps keep your prep lists and packing plans in one place.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## Notes

- Keep `{{ .ConfirmationURL }}` exactly as written. Supabase replaces it with the one-time sign-in URL.
- Supabase also exposes `{{ .Token }}` for OTP-style emails and `{{ .Email }}` for the recipient address, but this template is intentionally link-first.
- If you switch to local Supabase CLI auth later, copy this body into the local auth email template config as well.
