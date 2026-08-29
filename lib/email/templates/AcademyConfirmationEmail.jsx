// lib/email/templates/AcademyConfirmationEmail.jsx

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNaira(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildAcademyConfirmationEmail(payload = {}) {
  const firstName = payload.first_name || "Student";
  const lastName = payload.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const email = payload.email || payload.to_email || "—";

  // IMPORTANT:
  // Academy uses enrollment_number, not student_number.
  const enrollmentNumber = payload.enrollment_number || "—";

  const inviteUrl = String(payload.invite_url || "").trim();

  const academyUrl = String(
    payload.academy_url || `${process.env.NEXT_PUBLIC_SITE_URL || ""}/academy`,
  ).trim();

  const paymentPlan = payload.payment_plan || "Academy Payment Plan";

  const paymentDescription =
    payload.payment_description ||
    "Required payment to secure your place in the programme.";

  const initialPaymentAmount =
    payload.initial_payment_amount ?? payload.amount_required ?? 0;

  const formattedAmount = formatNaira(initialPaymentAmount);

  if (!inviteUrl) {
    throw new Error("Academy confirmation email is missing invite_url.");
  }

  const subject = "Your Q-bambi Academy Enrollment Has Been Confirmed";

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeEnrollmentNumber = escapeHtml(enrollmentNumber);
  const safeInviteUrl = escapeHtml(inviteUrl);
  const safeAcademyUrl = escapeHtml(academyUrl);
  const safePaymentPlan = escapeHtml(paymentPlan);
  const safePaymentDescription = escapeHtml(paymentDescription);
  const safeAmount = escapeHtml(formattedAmount);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Your Q-bambi Academy Enrollment Has Been Confirmed
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#262626;
  "
>

  <div
    style="
      width:100%;
      padding:40px 0;
      background:#f5f5f5;
    "
  >

    <div
      style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:14px;
        overflow:hidden;
      "
    >

      <!-- HEADER -->

      <div
        style="
          padding:34px 28px;
          text-align:center;
          background:#faf7f1;
        "
      >

        <h1
          style="
            margin:0;
            font-size:28px;
            line-height:1.3;
            color:#262626;
          "
        >
          Welcome to Q-bambi Academy
        </h1>

        <p
          style="
            margin:10px 0 0;
            color:#737373;
            font-size:15px;
          "
        >
          Your academy enrollment has been confirmed.
        </p>

      </div>

      <!-- CONTENT -->

      <div style="padding:32px 28px;">

        <p
          style="
            margin:0 0 18px;
            font-size:16px;
          "
        >
          Dear ${safeName},
        </p>

        <p
          style="
            margin:0 0 18px;
            font-size:16px;
            line-height:1.7;
          "
        >
          We are pleased to let you know that your application
          to <strong>Q-bambi Academy</strong> has been approved.
        </p>

        <p
          style="
            margin:0 0 24px;
            font-size:16px;
            line-height:1.7;
          "
        >
          Your academy enrollment has been confirmed.
          Please keep your enrollment number for future
          reference when communicating with Q-bambi Academy.
        </p>

        <!-- ENROLLMENT INFORMATION -->

        <div
          style="
            margin:24px 0;
            padding:20px;
            border-radius:12px;
            background:#faf7f1;
          "
        >

          <p
            style="
              margin:0 0 10px;
              font-size:15px;
            "
          >
            <strong>Enrollment Number:</strong>
            ${safeEnrollmentNumber}
          </p>

          <p
            style="
              margin:0;
              font-size:15px;
            "
          >
            <strong>Email:</strong>
            ${safeEmail}
          </p>

        </div>

        <!-- PAYMENT -->

        <h2
          style="
            margin:30px 0 14px;
            font-size:20px;
            color:#262626;
          "
        >
          Your Payment Details
        </h2>

        <div
          style="
            margin:16px 0 26px;
            padding:22px;
            border-radius:12px;
            border:1px solid #e5e5e5;
            background:#ffffff;
          "
        >

          <p
            style="
              margin:0 0 14px;
              font-size:15px;
            "
          >
            <strong>Payment Plan:</strong>
            ${safePaymentPlan}
          </p>

          <p
            style="
              margin:0 0 8px;
              font-size:15px;
            "
          >
            <strong>Amount Required Now:</strong>
          </p>

          <p
            style="
              margin:0 0 14px;
              font-size:28px;
              font-weight:bold;
              color:#b48a5a;
            "
          >
            ${safeAmount}
          </p>

          <p
            style="
              margin:0;
              color:#737373;
              font-size:14px;
              line-height:1.6;
            "
          >
            ${safePaymentDescription}
          </p>

        </div>

        <!-- ACCOUNT -->

        <h2
          style="
            margin:30px 0 10px;
            font-size:20px;
          "
        >
          Set Up Your Student Account
        </h2>

        <p
          style="
            margin:0 0 18px;
            font-size:15px;
            line-height:1.7;
          "
        >
          Your Q-bambi Academy student account has been
          created using the email address you provided
          during enrollment.
        </p>

        <p
          style="
            margin:0 0 24px;
            font-size:15px;
            line-height:1.7;
          "
        >
          Click the button below to create your password
          and access your academy account.
        </p>

        <!-- BUTTON -->

        <div
          style="
            text-align:center;
            margin:32px 0;
          "
        >

          <a
            href="${safeInviteUrl}"
            style="
              display:inline-block;
              padding:14px 28px;
              background:#b48a5a;
              color:#ffffff;
              text-decoration:none;
              border-radius:10px;
              font-weight:bold;
              font-size:15px;
            "
          >
            Set My Password
          </a>

        </div>

        <p
          style="
            margin:0 0 20px;
            font-size:14px;
            color:#737373;
            line-height:1.6;
          "
        >
          This account setup link is temporary and
          expires in 7 days.
        </p>

        <!-- ACADEMY LINK -->

        <div
          style="
            margin:30px 0;
            padding:20px;
            border-radius:12px;
            background:#fafafa;
            border:1px solid #eeeeee;
            text-align:center;
          "
        >

          <p
            style="
              margin:0 0 14px;
              font-size:15px;
              line-height:1.6;
            "
          >
            Visit Q-bambi Academy to learn more about
            your programme and available training.
          </p>

          <a
            href="${safeAcademyUrl}"
            style="
              display:inline-block;
              padding:12px 22px;
              border:1px solid #b48a5a;
              color:#b48a5a;
              text-decoration:none;
              border-radius:9px;
              font-weight:bold;
              font-size:14px;
            "
          >
            Visit Q-bambi Academy
          </a>

        </div>

        <p
          style="
            margin:28px 0 0;
            font-size:15px;
            line-height:1.6;
          "
        >
          Kind regards,<br />
          <strong>Q-bambi Academy</strong>
        </p>

      </div>

      <!-- FOOTER -->

      <div
        style="
          padding:20px 28px;
          background:#fafafa;
          border-top:1px solid #eeeeee;
          text-align:center;
        "
      >

        <p
          style="
            margin:0;
            font-size:12px;
            color:#999999;
          "
        >
          This is an automated message from Q-bambi Academy.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
`;

  const text = `
Welcome to Q-bambi Academy

Dear ${fullName},

We are pleased to let you know that your application to Q-bambi Academy has been approved.

Your academy enrollment has been confirmed.

ENROLLMENT INFORMATION

Enrollment Number: ${enrollmentNumber}
Email: ${email}

YOUR PAYMENT DETAILS

Payment Plan: ${paymentPlan}
Amount Required Now: ${formattedAmount}

${paymentDescription}

SET UP YOUR STUDENT ACCOUNT

Your Q-bambi Academy student account has been created using the email address you provided during enrollment.

Click the link below to create your password and access your academy account:

${inviteUrl}

This account setup link is temporary and expires in 7 days.

VISIT Q-BAMBI ACADEMY

${academyUrl}

Kind regards,

Q-bambi Academy
`;

  return {
    subject,
    html,
    text,
  };
}

export default buildAcademyConfirmationEmail;
