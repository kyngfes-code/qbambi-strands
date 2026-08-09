import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({ email, firstName, token }) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: "oviefestus@gmail.com",
    subject: "Verify your Qbambis account",
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Verify your email</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f8f8f8;
font-family:Arial,Helvetica,sans-serif;
"
>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="padding:40px 0;"
>
<tr>
<td align="center">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:16px;
overflow:hidden;
"
>

<tr>
<td
style="
background:#000000;
padding:30px;
text-align:center;
"
>
<h1
style="
margin:0;
color:#ffffff;
font-size:28px;
"
>
Qbambi Strands
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2
style="
margin-top:0;
font-size:28px;
color:#111827;
"
>
Welcome,
${firstName} 👋
</h2>

<p
style="
font-size:16px;
line-height:28px;
color:#4b5563;
"
>
Thank you for creating your Qbambi account.
</p>

<p
style="
font-size:16px;
line-height:28px;
color:#4b5563;
"
>
Please verify your email address before signing in.
</p>

<div
style="
margin:40px 0;
text-align:center;
"
>

<a
href="${verificationUrl}"
style="
display:inline-block;
padding:16px 36px;
background:#000000;
color:#ffffff;
text-decoration:none;
border-radius:12px;
font-weight:bold;
font-size:16px;
"
>
Verify Email
</a>

</div>

<p
style="
font-size:15px;
line-height:26px;
color:#6b7280;
"
>
Or copy this link into your browser:
</p>

<p
style="
word-break:break-word;
font-size:14px;
color:#2563eb;
"
>
${verificationUrl}
</p>

<hr
style="
margin:40px 0;
border:none;
border-top:1px solid #e5e7eb;
"
/>

<p
style="
font-size:13px;
line-height:24px;
color:#9ca3af;
"
>
If you didn't create this account, you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td
style="
background:#fafafa;
padding:24px;
text-align:center;
font-size:13px;
color:#9ca3af;
"
>
© ${new Date().getFullYear()} Qbambi Strands.
All rights reserved.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
  });

  if (error) {
    console.error(error);
    throw new Error("Unable to send verification email.");
  }

  return data;
}
