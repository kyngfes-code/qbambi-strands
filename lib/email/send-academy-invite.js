import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAcademyInviteEmail({
  email,
  studentNumber,
  inviteUrl,
}) {
  if (!email) {
    throw new Error("Student email is required.");
  }

  if (!inviteUrl) {
    throw new Error("Academy invite URL is required.");
  }

  const html = `
    <div
      style="
        margin: 0;
        padding: 40px 20px;
        background: #f5f5f5;
        font-family: Arial, Helvetica, sans-serif;
        color: #171717;
      "
    >
      <div
        style="
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          padding: 40px;
        "
      >
        <h1
          style="
            margin: 0;
            font-size: 28px;
            color: #b48a5a;
          "
        >
          Welcome to Qbambi Academy
        </h1>

        <p style="margin-top: 8px; color: #737373;">
          Your academy enrollment has been confirmed.
        </p>

        <p>
          We are pleased to let you know that your application to
          <strong>Qbambi Academy</strong> has been approved.
        </p>

        <div
          style="
            margin: 24px 0;
            padding: 20px;
            border-radius: 12px;
            background: #faf7f1;
          "
        >
          <p style="margin: 0 0 8px;">
            <strong>Student Number:</strong>
            ${studentNumber || "—"}
          </p>

          <p style="margin: 0;">
            <strong>Username:</strong>
            ${email}
          </p>
        </div>

        <h2 style="font-size: 20px; margin-bottom: 8px;">
          Secure Your Training Spot
        </h2>

        <p>
          Your place in the programme is secured once the required payment
          has been made and the payment has been successfully verified.
        </p>

        <p>
          Please sign in to your student account to review your payment
          information and complete the required payment.
        </p>

        <h2 style="font-size: 20px; margin-bottom: 8px;">
          Set Your Password
        </h2>

        <p>
          Your account has been created using the email address you used
          during registration.
        </p>

        <p>
          Click the button below to create your password and activate your
          student account.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a
            href="${inviteUrl}"
            style="
              display: inline-block;
              padding: 14px 28px;
              background: #b48a5a;
              color: #ffffff;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
            "
          >
            Set My Password
          </a>
        </div>

        <p style="font-size: 14px; color: #737373;">
          This account setup link is temporary and should be used as soon
          as possible.
        </p>

        <p style="margin-top: 28px;">
          If you did not submit an application to Qbambi Academy, please
          contact our support team.
        </p>

        <p style="margin-top: 28px;">
          Kind regards,<br />
          <strong>Qbambi Academy</strong>
        </p>
      </div>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: "oviefestus@gmail.com",
    subject: "Your Qbambi Academy Enrollment Has Been Confirmed",
    html,
  });

  if (error) {
    console.error("Academy invite email error:", error);
    throw new Error("Unable to send academy invitation email.");
  }

  return data;
}
