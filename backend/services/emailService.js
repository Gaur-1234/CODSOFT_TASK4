const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendApplicationEmail = async ({
  to,
  candidateName,
  jobTitle,
  company,
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Job Board <noreply@gaurautomation.com>",
      to: [to],
      subject: `Application Submitted - ${jobTitle}`,
      html: `
        <h2>Application Submitted Successfully</h2>

        <p>Hello ${candidateName},</p>

        <p>
          Your application for
          <strong>${jobTitle}</strong>
          at
          <strong>${company}</strong>
          has been submitted successfully.
        </p>

        <p>
          Your current application status is:
          <strong>Applied</strong>
        </p>

        <p>Good luck with your application!</p>

        <p>
          Regards,<br>
          Job Board Team
        </p>
      `,
    });

    if (error) {
      console.error("Email sending failed:", error);
      return null;
    }

    console.log("Email sent successfully:", data.id);

    return data;
  } catch (error) {
    console.error("Email service error:", error);
    return null;
  }
};

const sendStatusUpdateEmail = async ({
  to,
  candidateName,
  jobTitle,
  status,
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Job Board <noreply@gaurautomation.com>",
      to: [to],
      subject: `Application Status Updated - ${jobTitle}`,
      html: `
        <h2>Application Status Updated</h2>

        <p>Hello ${candidateName},</p>

        <p>
          The status of your application for
          <strong>${jobTitle}</strong>
          has been updated.
        </p>

        <p>
          Your new application status is:
          <strong>${status}</strong>
        </p>

        <p>
          Please check your Job Board account for more details.
        </p>

        <p>
          Regards,<br>
          Job Board Team
        </p>
      `,
    });

    if (error) {
      console.error("Status email sending failed:", error);
      return null;
    }

    console.log("Status email sent successfully:", data.id);

    return data;
  } catch (error) {
    console.error("Status email service error:", error);
    return null;
  }
};

module.exports = {
  sendApplicationEmail,
  sendStatusUpdateEmail,
};