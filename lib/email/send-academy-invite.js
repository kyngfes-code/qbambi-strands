// /lib/email/send-academy-invite.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendAcademyInviteEmail({
  email,
  studentNumber,
  inviteUrl,
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Welcome to Qbambi Academy</title>
</head>

<body style="margin:0;padding:0;background:#f6f6f6;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">

<tr>
<td style="background:#111827;padding:30px;text-align:center;">
<h1 style="margin:0;color:white;">
Qbambi Academy
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#111827;">
Welcome to Qbambi Academy 🎉
</h2>

<p style="font-size:16px;color:#444;line-height:1.7;">
Congratulations!
</p>

<p style="font-size:16px;color:#444;line-height:1.7;">
Your enrollment has been activated and your student account has been created.
</p>

<table cellpadding="8" cellspacing="0" style="margin:30px 0;background:#f8fafc;border-radius:8px;width:100%;">
<tr>
<td><strong>Student Number</strong></td>
<td>${studentNumber}</td>
</tr>
</table>

<p style="font-size:16px;color:#444;">
Click the button below to create your password.
</p>

<div style="text-align:center;margin:40px 0;">
<a
href="${inviteUrl}"
style="
background:#111827;
color:white;
padding:14px 28px;
text-decoration:none;
border-radius:6px;
display:inline-block;
font-weight:bold;
">
Set Your Password
</a>
</div>

<p style="font-size:15px;color:#666;line-height:1.7;">
This invitation expires in <strong>7 days</strong>.
</p>

<p style="font-size:15px;color:#666;line-height:1.7;">
If the button doesn't work, copy and paste this link into your browser:
</p>

<p style="word-break:break-all;font-size:13px;color:#2563eb;">
${inviteUrl}
</p>

<hr style="margin:40px 0;border:none;border-top:1px solid #eee;">

<p style="font-size:13px;color:#888;line-height:1.7;">
If you did not expect this email, you can safely ignore it.
</p>

</td>
</tr>

<tr>
<td
style="
background:#f8fafc;
padding:20px;
text-align:center;
font-size:12px;
color:#888;
"
>
© ${new Date().getFullYear()} Qbambi Academy
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

  await transporter.sendMail({
    from: `"Qbambi Academy" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Welcome to Qbambi Academy",
    html,
  });
}
