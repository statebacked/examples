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

export const sendEmail = async (emailAddress: string, emailType: EmailType) => {
  console.log("send email", { emailAddress, emailType });
};
