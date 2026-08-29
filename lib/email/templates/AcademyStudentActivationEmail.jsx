// lib/email/templates/AcademyStudentActivationEmail.jsx

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildAcademyStudentActivationEmail(payload = {}) {
  const firstName = String(payload.first_name || "Student").trim();
  const lastName = String(payload.last_name || "").trim();
  const otherName = String(payload.other_name || "").trim();

  const fullName = [firstName, otherName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const email = String(
    payload.email || payload.student_email || payload.to_email || "—",
  ).trim();

  // ============================================================
  // STUDENT IDENTIFIER
  // ============================================================
  //
  // IMPORTANT:
  // Academy students use student_number.
  //
  // Do NOT use enrollment_number here.
  //
  const studentNumber = String(payload.student_number || "—").trim();

  // ============================================================
  // ACADEMY / LOGIN URL
  // ============================================================

  const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(
    /\/+$/,
    "",
  );

  const activationUrl = String(
    payload.activation_url ||
      payload.login_url ||
      payload.academy_url ||
      `${siteUrl}/academy`,
  ).trim();

  const academyUrl = String(payload.academy_url || `${siteUrl}/academy`).trim();

  // ============================================================
  // SUBJECT
  // ============================================================

  const subject = "Your Q-bambi Academy Student Account Is Ready";

  // ============================================================
  // SAFE HTML VALUES
  // ============================================================

  const safeName = escapeHtml(fullName || "Student");
  const safeEmail = escapeHtml(email);
  const safeStudentNumber = escapeHtml(studentNumber);
  const safeActivationUrl = escapeHtml(activationUrl);
  const safeAcademyUrl = escapeHtml(academyUrl);

  // ============================================================
  // HTML EMAIL
  // ============================================================

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
    Your Q-bambi Academy Student Account Is Ready
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
          Your student account is now active
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
          Your
          <strong>Q-bambi Academy</strong>
          student account has been successfully activated.
        </p>

        <p
          style="
            margin:0 0 24px;
            font-size:16px;
            line-height:1.7;
          "
        >
          You can now access your academy account and
          manage your student information, programme
          details, payment information and other
          available academy services.
        </p>

        <!-- ACCOUNT INFORMATION -->

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
            <strong>Student Number:</strong>
            ${safeStudentNumber}
          </p>

          <p
            style="
              margin:0;
              font-size:15px;
            "
          >
            <strong>Account Email:</strong>
            ${safeEmail}
          </p>

        </div>

        <!-- LOGIN -->

        <h2
          style="
            margin:30px 0 12px;
            font-size:20px;
          "
        >
          Access Your Academy Account
        </h2>

        <p
          style="
            margin:0 0 24px;
            font-size:15px;
            line-height:1.7;
          "
        >
          Click the button below to access your
          Q-bambi Academy student account.
        </p>

        <div
          style="
            text-align:center;
            margin:32px 0;
          "
        >

          <a
            href="${safeActivationUrl}"
            style="
              display:inline-block;
              padding:14px 30px;
              background:#b48a5a;
              color:#ffffff;
              text-decoration:none;
              border-radius:10px;
              font-weight:bold;
              font-size:15px;
            "
          >
            Access My Academy Account
          </a>

        </div>

        <!-- ACADEMY -->

        <div
          style="
            margin:30px 0;
            padding:22px;
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
              line-height:1.7;
            "
          >
            You can also visit the Q-bambi Academy
            homepage to explore available programmes
            and academy information.
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

        <!-- SUPPORT -->

        <p
          style="
            margin:28px 0 0;
            font-size:15px;
            line-height:1.6;
          "
        >
          If you did not request or expect this account,
          please contact Q-bambi Academy support immediately.
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

  // ============================================================
  // PLAIN TEXT EMAIL
  // ============================================================

  const text = `
Q-bambi Academy

Dear ${fullName || "Student"},

Your Q-bambi Academy student account has been successfully activated.

You can now access your academy account and manage your student information, programme details, payment information and other available academy services.

ACCOUNT INFORMATION

Student Number: ${studentNumber}
Account Email: ${email}

ACCESS YOUR ACADEMY ACCOUNT

Click the link below to access your Q-bambi Academy student account:

${activationUrl}

VISIT Q-BAMBI ACADEMY

${academyUrl}

If you did not request or expect this account, please contact Q-bambi Academy support immediately.

Kind regards,

Q-bambi Academy
`;

  return {
    subject,
    html,
    text,
  };
}

export default buildAcademyStudentActivationEmail;
