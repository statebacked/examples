export type EmailType =
  | "welcome"
  | "create-document"
  | "share-document"
  | "publish-document"
  | "warn-about-impending-trial-end"
  | "reengage-user"
  | "create-organization"
  | "ask-for-testimonial"
  | "invite-teammates"
  | "follow-up-with-teammates"
  | "upgrade-to-paid-plan";

const resendKey = "re_YOUR_RESEND_KEY";

// just a safeguard since this is an exmaple
const validRecipientDomains = ["statebacked.dev"];

export const sendEmail = async (emailAddress: string, emailType: EmailType) => {
  if (
    !validRecipientDomains.some((domain) => emailAddress.endsWith(`@${domain}`))
  ) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      to: emailAddress,
      from: "test@statebacked.dev",
      subject: `[email automation] ${emailType}`,
      html: `<p>Hi ${emailAddress},</p><p>This is a test email for ${emailType}.</p>`,
    }),
  });
};
