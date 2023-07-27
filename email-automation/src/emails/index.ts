import { sendWelcomeEmail } from "./welcome";

export type EmailType =
  | "welcome"
  | "create-document"
  | "share-document"
  | "publish-document";

export const sendEmail = async (emailAddress: string, emailType: EmailType) => {
  await sendWelcomeEmail(emailAddress);
};
