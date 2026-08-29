// lib/email/templates/AcademyRejectionEmail.jsx

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildAcademyRejectionEmail(payload = {}) {
  const firstName = payload.first_name || "Student";
  const lastName = payload.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const email = payload.email || payload.to_email || "—";

  // IMPORTANT:
  // This is the academy enrollment number.
  const enrollmentNumber = payload.enrollment_number || "—";

  const rejectionReason =
    payload.rejection_reason ||
    payload.reason ||
    "After reviewing your application, we are unable to approve your enrollment at this time.";

  const academyUrl = String(
    payload.academy_url || `${process.env.NEXT_PUBLIC_SITE_URL || ""}/academy`,
  ).trim();

  const subject = "Update Regarding Your Q-bambi Academy Enrollment";

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeEnrollmentNumber = escapeHtml(enrollmentNumber);
  const safeRejectionReason = escapeHtml(rejectionReason);
  const safeAcademyUrl = escapeHtml(academyUrl);

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
    Update Regarding Your Q-bambi Academy Enrollment
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
          Q-bambi Academy
        </h1>

        <p
          style="
            margin:10px 0 0;
            color:#737373;
            font-size:15px;
          "
        >
          Update regarding your enrollment application
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
          Thank you for your interest in
          <strong>Q-bambi Academy</strong>
          and for taking the time to submit an
          enrollment application.
        </p>

        <p
          style="
            margin:0 0 24px;
            font-size:16px;
            line-height:1.7;
          "
        >
          After reviewing your application, we regret
          to inform you that your enrollment application
          has not been approved at this time.
        </p>

        <!-- APPLICATION INFORMATION -->

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

        <!-- REASON -->

        <h2
          style="
            margin:30px 0 12px;
            font-size:20px;
            color:#262626;
          "
        >
          Reason
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
              margin:0;
              font-size:15px;
              line-height:1.7;
              color:#444444;
            "
          >
            ${safeRejectionReason}
          </p>

        </div>

        <!-- ACADEMY LINK -->

        <div
          style="
            margin:30px 0;
            padding:22px;
            border-radius:12px;
            background:#faf7f1;
            text-align:center;
          "
        >

          <p
            style="
              margin:0 0 14px;
              font-size:15px;
              line-height:1.7;
            "
          >
            We encourage you to continue exploring
            Q-bambi Academy and our available training
            programmes.
          </p>

          <a
            href="${safeAcademyUrl}"
            style="
              display:inline-block;
              padding:13px 24px;
              background:#b48a5a;
              color:#ffffff;
              text-decoration:none;
              border-radius:10px;
              font-weight:bold;
              font-size:14px;
            "
          >
            Visit Q-bambi Academy
          </a>

        </div>

        <p
          style="
            margin:0 0 18px;
            font-size:15px;
            line-height:1.7;
          "
        >
          If you believe this decision was made in error
          or you would like further clarification, please
          contact Q-bambi Academy support.
        </p>

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
Q-bambi Academy

Dear ${fullName},

Thank you for your interest in Q-bambi Academy and for taking the time to submit an enrollment application.

After reviewing your application, we regret to inform you that your enrollment application has not been approved at this time.

APPLICATION INFORMATION

Enrollment Number: ${enrollmentNumber}
Email: ${email}

REASON

${rejectionReason}

VISIT Q-BAMBI ACADEMY

We encourage you to continue exploring Q-bambi Academy and our available training programmes.

${academyUrl}

If you believe this decision was made in error or you would like further clarification, please contact Q-bambi Academy support.

Kind regards,

Q-bambi Academy
`;

  return {
    subject,
    html,
    text,
  };
}

export default buildAcademyRejectionEmail;
