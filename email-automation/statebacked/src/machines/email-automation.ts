import { createMachine, assign, DoneEvent, StateValueFrom } from "xstate";
import * as duration from "../duration";
import { EmailType, sendEmail as _sendEmail } from "../emails";

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
      isSupporter: false,
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
    initial: "run",
    states: {
      run: {
        states: {
          userState: {
            description:
              "Track the state of the user across each dimension we care about",
            entry: assign({ isSupporter: false }),
            initial: "newUser",
            states: {
              newUser: {
                states: {
                  documentActivity: {
                    description: "Track what users have done with documents",
                    initial: "noDocuments",
                    states: {
                      noDocuments: {
                        description: "User has not yet created a document",
                        entry: assign({
                          documentShared: false,
                          documentCreated: false,
                          documentPublished: false,
                        }),
                        on: {
                          createdDocument: {
                            target: "createdDocument",
                          },
                        },
                      },
                      createdDocument: {
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
                                  publishedDocument: {
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
                        onDone: {
                          target: "completedDocument",
                        },
                      },
                      completedDocument: {
                        type: "final",
                      },
                    },
                    on: {
                      reset: {
                        target: ".noDocuments",
                        internal: true,
                      },
                    },
                  },
                  organizationActivity: {
                    description: "Track what users have done with documents",
                    initial: "noOrganization",
                    states: {
                      noOrganization: {
                        description: "User has not yet created an organization",
                        entry: assign({
                          orgCreated: false,
                          orgPlanStatus: null,
                          orgInvitationSent: false,
                        }),
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
                                  acceptedInvitation: {
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
                                        "#email-automation.run.userState.newUser.organizationActivity.createdOrganization.planStatus.trialAlmostOver",
                                      actions: [],
                                    },
                                    {
                                      internal: false,
                                    },
                                  ],
                                },
                              },
                              trialAlmostOver: {
                                entry: assign({
                                  orgPlanStatus: "trial-ending",
                                }),
                                after: {
                                  freeTrialWarningRemainderPeriod: [
                                    {
                                      target:
                                        "#email-automation.run.userState.newUser.organizationActivity.createdOrganization.planStatus.trialEnded",
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
                              upgradedPlan: {
                                target: ".paidPlan",
                                internal: true,
                              },
                            },
                          },
                        },
                        type: "parallel",
                        onDone: {
                          target: "completedOrganization",
                        },
                      },
                      completedOrganization: {
                        type: "final",
                      },
                    },
                    on: {
                      reset: {
                        target: ".noOrganization",
                        internal: true,
                      },
                    },
                  },
                },
                type: "parallel",
                onDone: {
                  target: "userIsSupporter",
                },
              },
              userIsSupporter: {
                entry: assign({ isSupporter: () => true }),
                type: "final",
              },
            },
          },
          emailSender: {
            initial: "start",
            states: {
              start: {
                entry: assign({ sentEmails: [] }),
                after: {
                  welcomeEmailDelay: [
                    {
                      target:
                        "#email-automation.run.emailSender.sendWelcomeEmail",
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
                  onDone: [
                    {
                      target: "welcomeSent",
                      actions: {
                        type: "appendToSentEmails",
                        params: {},
                      },
                    },
                  ],
                },
              },
              welcomeSent: {
                after: {
                  "1 day": [
                    {
                      target: "#email-automation.run.emailSender.sendEmail1",
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
                  onDone: [
                    {
                      target: "email1Sent",
                      actions: {
                        type: "appendToSentEmails",
                        params: {},
                      },
                    },
                  ],
                },
              },
              email1Sent: {
                after: {
                  "1 day": [
                    {
                      target: "#email-automation.run.emailSender.sendEmail2",
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
                  onDone: [
                    {
                      target: "email2Sent",
                      actions: {
                        type: "appendToSentEmails",
                        params: {},
                      },
                    },
                  ],
                },
              },
              email2Sent: {
                after: {
                  "2 days": [
                    {
                      target: "#email-automation.run.emailSender.sendEmail3",
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
                  onDone: [
                    {
                      target: "email3Sent",
                      actions: {
                        type: "appendToSentEmails",
                        params: {},
                      },
                    },
                  ],
                },
              },
              email3Sent: {
                after: {
                  "3 days": [
                    {
                      target: "#email-automation.run.emailSender.sendEmail4",
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
                  onDone: [
                    {
                      target: "email4Sent",
                      actions: {
                        type: "appendToSentEmails",
                        params: {},
                      },
                    },
                  ],
                },
              },
              email4Sent: {
                after: {
                  "3 days": [
                    {
                      target: "#email-automation.run.emailSender.sendEmail5",
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
                  onDone: [
                    {
                      target: "email5Sent",
                      actions: {
                        type: "appendToSentEmails",
                        params: {},
                      },
                    },
                  ],
                },
              },
              email5Sent: {
                after: {
                  "4 days": [
                    {
                      target: "#email-automation.run.emailSender.sendEmail6",
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
                      actions: {
                        type: "appendToSentEmails",
                        params: {},
                      },
                    },
                  ],
                },
              },
              Complete: {
                type: "final",
              },
            },
            on: {
              reset: {
                target: ".start",
                internal: true,
              },
            },
          },
        },
        on: {
          reset: {
            target: ".userState.newUser",
            internal: true,
          },
        },
        type: "parallel",
        onDone: {
          target: "complete",
        },
      },
      complete: {},
    },
    on: {
      reset: {
        target: ".run",
        internal: true,
      },
    },
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
        isSupporter: boolean;
      },
      events: {} as
        | { type: "createdDocument" }
        | { type: "sharedDocument" }
        | { type: "publishedDocument" }
        | { type: "invitedUser" }
        | { type: "createdOrganization" }
        | { type: "acceptedInvitation" }
        | { type: "upgradedPlan" }
        | { type: "reset" },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import("./email-automation.typegen").Typegen0,
  },
  {
    actions: {
      appendToSentEmails: assign({
        sentEmails: (ctx, evt) => {
          const doneEvent = evt as DoneEvent;
          return ctx.sentEmails.concat(doneEvent.data ? [doneEvent.data] : []);
        },
      }),
    },
    services: {
      sendEmail: async (context, _event, meta) => {
        if (meta.data?.welcome) {
          return sendEmail(context.userEmail, "welcome");
        }

        const sentEmails = new Set(context.sentEmails);

        if (context.isSupporter && !sentEmails.has("ask-for-testimonial")) {
          return sendEmail(context.userEmail, "ask-for-testimonial");
        }

        if (
          context.orgPlanStatus === "trial-ending" &&
          !sentEmails.has("warn-about-impending-trial-end")
        ) {
          return sendEmail(context.userEmail, "warn-about-impending-trial-end");
        }

        if (
          context.orgPlanStatus === "trial-ended" &&
          !sentEmails.has("reengage-user")
        ) {
          return sendEmail(context.userEmail, "reengage-user");
        }

        if (!context.documentCreated && !sentEmails.has("create-document")) {
          return sendEmail(context.userEmail, "create-document");
        }

        if (context.documentCreated) {
          if (!context.documentShared && !sentEmails.has("share-document")) {
            return sendEmail(context.userEmail, "share-document");
          }

          if (
            !context.documentPublished &&
            !sentEmails.has("publish-document")
          ) {
            return sendEmail(context.userEmail, "publish-document");
          }
        }

        if (!context.orgCreated && !sentEmails.has("create-organization")) {
          return sendEmail(context.userEmail, "create-organization");
        }

        if (context.orgCreated) {
          if (
            !context.orgInvitationSent &&
            !sentEmails.has("invite-teammates")
          ) {
            return sendEmail(context.userEmail, "invite-teammates");
          }

          if (
            context.orgInvitationSent &&
            !context.orgInvitationAccepted &&
            !sentEmails.has("follow-up-with-teammates")
          ) {
            return sendEmail(context.userEmail, "follow-up-with-teammates");
          }

          if (
            context.orgPlanStatus === "free" &&
            !sentEmails.has("upgrade-to-paid-plan")
          ) {
            return sendEmail(context.userEmail, "upgrade-to-paid-plan");
          }
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

async function sendEmail(
  emailAddress: string,
  emailType: EmailType
): Promise<EmailType> {
  await _sendEmail(emailAddress, emailType);
  return emailType;
}

// some useful machinery for passing around states in a type-safe way

export type StateValue = SimplifiedStateValue<
  StateValueFrom<typeof emailAutomationMachine>
>;

type ExtractStrings<T> = Extract<T, string>;
type ExtractObjects<T> = Extract<T, Record<string, unknown>>;
type ObjectKeys<T> = T extends Record<string, unknown> ? keyof T : never;

type RemoveMatchingKeys<T> = Exclude<
  ExtractStrings<T>,
  ObjectKeys<ExtractObjects<T>> | `${string}.${string}`
>;

type Simplified<T> = {
  [K in keyof T]: SimplifiedStateValue<T[K]>;
};

type SimplifiedStateValue<T> =
  | RemoveMatchingKeys<T>
  | Simplified<ExtractObjects<T>>;

export type NestedState<T, K extends readonly string[]> = K["length"] extends 0
  ? T
  : K extends [infer F, ...infer R]
  ? F extends keyof ExtractObjects<T>
    ? NestedState<ExtractObjects<T>[F], Extract<R, string[]>>
    : never
  : never;
