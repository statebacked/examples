import { createMachine, assign } from "xstate";
import * as duration from "../duration";
import { EmailType, sendEmail } from "../emails";

// machine designed and visualizable here: https://stately.ai/registry/editor/412c119a-b389-4ba1-b3fd-67a618616eab?machineId=0281361a-9034-4334-82aa-cbf9cc185b54

/**
 * # Goal
 * We want to construct a 2-week series of emails to guide users through using our product.
 *
 * The emails should be contextually relevant and direct users to the next step they should take while being closely tailored to what they've done in the app.
 *
 * # A bit about the app:
 * - Our app will allow users to create documents that they can share with collaborators or publish to the web.
 * - Our app will also allow users to create organizations and invite other users to join
 * - Organizations can select different plan levels
 *
 * # Organization
 * We'll have 2 parallel states: `userState` to track what the user has done and `emailSender` to send emails on a schedule.
 *
 * Child states within `userState` will update our context to record what the user has done and the `sendEmail` service in `emailSender` will choose which emails to send based on what the user has done so far.
 */
export const emailAutomationMachine = createMachine(
  {
    id: "email-automation",
    context: {
      documentCreated: false,
      documentShared: false,
      documentPublished: false,
      orgCreated: false,
      orgInvitationSent: false,
      orgInvitationAccepted: false,
      orgPlanStatus: null,
      userEmail: "",
      sentEmails: [],
    },
    description: `
# Goal
We want to construct a 2-week series of emails to guide users through using our product.

The emails should be contextually relevant and direct users to the next step they should take while being closely tailored to what they've done in the app.

# A bit about the app:
- Our app will allow users to create documents that they can share with collaborators or publish to the web.
- Our app will also allow users to create organizations and invite other users to join
- Organizations can select different plan levels

# Organization
We'll have 2 parallel states: \`userState\` to track what the user has done and \`emailSender\` to send emails on a schedule.

Child states within \`userState\` will update our context to record what the user has done and the \`sendEmail\` service in \`emailSender\` will choose which emails to send based on what the user has done so far.
      `,
    states: {
      userState: {
        description:
          "Track the state of the user across each dimension we care about",
        states: {
          documentActivity: {
            description: "Track what users have done with documents",
            initial: "noDocuments",
            states: {
              noDocuments: {
                description: "User has not yet created a document",
                on: {
                  createdADocument: {
                    target: "createdADocument",
                  },
                },
              },
              createdADocument: {
                description: "User has created a document",
                entry: assign({ documentCreated: true }),
                states: {
                  sharingStatus: {
                    description:
                      "Track whether the user has shared the document yet",
                    initial: "private",
                    states: {
                      private: {
                        on: {
                          sharedDocument: {
                            target: "shared",
                          },
                        },
                      },
                      shared: {
                        entry: assign({ documentShared: true }),
                        type: "final",
                      },
                    },
                  },
                  publishingStatus: {
                    description:
                      "Track whether the user has published the document yet",
                    initial: "private",
                    states: {
                      private: {
                        on: {
                          published: {
                            target: "published",
                          },
                        },
                      },
                      published: {
                        entry: assign({ documentPublished: true }),
                        type: "final",
                      },
                    },
                  },
                },
                type: "parallel",
              },
            },
          },
          organizationActivity: {
            description: "Track what users have done with documents",
            initial: "noOrganization",
            states: {
              noOrganization: {
                description: "User has not yet created an organization",
                on: {
                  createdOrganization: {
                    target: "createdOrganization",
                  },
                },
              },
              createdOrganization: {
                description: "User has created an organization",
                entry: assign({ orgCreated: true }),
                states: {
                  invitationStatus: {
                    description:
                      "Track whether the user has invited teammates yet",
                    initial: "noInvites",
                    states: {
                      noInvites: {
                        on: {
                          invitedUser: {
                            target: "invited",
                          },
                        },
                      },
                      invited: {
                        entry: assign({ orgInvitationSent: true }),
                        on: {
                          accepted: {
                            target: "invitationAccepted",
                          },
                        },
                      },
                      invitationAccepted: {
                        entry: assign({ orgInvitationAccepted: true }),
                        type: "final",
                      },
                    },
                  },
                  planStatus: {
                    description:
                      "Track what plan an organization is subscribed to",
                    initial: "freeTrial",
                    states: {
                      freeTrial: {
                        entry: assign({ orgPlanStatus: "free" }),
                        after: {
                          freeTrialWarningPeriod: [
                            {
                              target:
                                "#email-automation.userState.organizationActivity.createdOrganization.planStatus.trialAlmostOver",
                              actions: [],
                            },
                            {
                              internal: false,
                            },
                          ],
                        },
                      },
                      trialAlmostOver: {
                        entry: assign({ orgPlanStatus: "trial-ending" }),
                        after: {
                          freeTrialWarningRemainderPeriod: [
                            {
                              target:
                                "#email-automation.userState.organizationActivity.createdOrganization.planStatus.trialEnded",
                              actions: [],
                            },
                            {
                              internal: false,
                            },
                          ],
                        },
                      },
                      trialEnded: {
                        entry: assign({ orgPlanStatus: "trial-ended" }),
                      },
                      paidPlan: {
                        entry: assign({ orgPlanStatus: "paid" }),
                        type: "final",
                      },
                    },
                    on: {
                      upgrade: {
                        target: ".paidPlan",
                        internal: true,
                      },
                    },
                  },
                },
                type: "parallel",
              },
            },
          },
        },
        type: "parallel",
      },
      emailSender: {
        initial: "start",
        states: {
          start: {
            after: {
              welcomeEmailDelay: [
                {
                  target: "#email-automation.emailSender.sendWelcomeEmail",
                  actions: [],
                },
                {
                  internal: false,
                },
              ],
            },
          },
          sendWelcomeEmail: {
            invoke: {
              src: "sendEmail",
              id: "sendWelcomeEmail",
              data: {
                welcome: true,
              },
            },
            after: {
              "1 day": [
                {
                  target: "#email-automation.emailSender.sendEmail1",
                  actions: [],
                },
                {
                  internal: false,
                },
              ],
            },
          },
          sendEmail1: {
            invoke: {
              src: "sendEmail",
              id: "sendEmail1",
            },
            after: {
              "1 day": [
                {
                  target: "#email-automation.emailSender.sendEmail2",
                  actions: [],
                },
                {
                  internal: false,
                },
              ],
            },
          },
          sendEmail2: {
            invoke: {
              src: "sendEmail",
              id: "sendEmail2",
            },
            after: {
              "2 days": [
                {
                  target: "#email-automation.emailSender.sendEmail3",
                  actions: [],
                },
                {
                  internal: false,
                },
              ],
            },
          },
          sendEmail3: {
            invoke: {
              src: "sendEmail",
              id: "sendEmail3",
            },
            after: {
              "3 days": [
                {
                  target: "#email-automation.emailSender.sendEmail4",
                  actions: [],
                },
                {
                  internal: false,
                },
              ],
            },
          },
          sendEmail4: {
            invoke: {
              src: "sendEmail",
              id: "sendEmail4",
            },
            after: {
              "3 days": [
                {
                  target: "#email-automation.emailSender.sendEmail5",
                  actions: [],
                },
                {
                  internal: false,
                },
              ],
            },
          },
          sendEmail5: {
            invoke: {
              src: "sendEmail",
              id: "sendEmail5",
            },
            after: {
              "4 days": [
                {
                  target: "#email-automation.emailSender.sendEmail6",
                  actions: [],
                },
                {
                  internal: false,
                },
              ],
            },
          },
          sendEmail6: {
            invoke: {
              src: "sendEmail",
              id: "sendEmail6",
              onDone: [
                {
                  target: "Complete",
                },
              ],
            },
          },
          Complete: {
            type: "final",
          },
        },
      },
    },
    type: "parallel",
    schema: {
      context: {} as {
        documentCreated: boolean;
        documentShared: boolean;
        documentPublished: boolean;
        orgCreated: boolean;
        orgInvitationSent: boolean;
        orgInvitationAccepted: boolean;
        orgPlanStatus: null | "free" | "trial-ending" | "trial-ended" | "paid";
        userEmail: string;
        sentEmails: Array<EmailType>;
      },
      events: {} as
        | { type: "createdADocument" }
        | { type: "sharedDocument" }
        | { type: "published" }
        | { type: "invitedUser" }
        | { type: "createdOrganization" }
        | { type: "accepted" }
        | { type: "upgrade" },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {},
    services: {
      sendEmail: async (context, _event, meta) => {
        if (meta.data.welcome) {
          return sendEmail(context.userEmail, "welcome");
        }

        const sentEmails = new Set(context.sentEmails);

        if (!context.documentCreated && !sentEmails.has("create-document")) {
          sentEmails.add("create-document");
          return sendEmail(context.userEmail, "create-document");
        }
      },
    },
    guards: {},
    delays: {
      freeTrialWarningRemainderPeriod: duration.days(2),
      welcomeEmailDelay: (context, event) => duration.minutes(10),
      "1 day": (context, event) => duration.days(1),
      freeTrialWarningPeriod: duration.days(12),
      "2 days": duration.days(2),
      "3 days": duration.days(3),
      "4 days": duration.days(4),
    },
  }
);
