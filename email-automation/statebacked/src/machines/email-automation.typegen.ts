// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.sendEmail1": {
      type: "done.invoke.sendEmail1";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.sendEmail2": {
      type: "done.invoke.sendEmail2";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.sendEmail3": {
      type: "done.invoke.sendEmail3";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.sendEmail4": {
      type: "done.invoke.sendEmail4";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.sendEmail5": {
      type: "done.invoke.sendEmail5";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.sendEmail6": {
      type: "done.invoke.sendEmail6";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.sendWelcomeEmail": {
      type: "done.invoke.sendWelcomeEmail";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.sendEmail1": {
      type: "error.platform.sendEmail1";
      data: unknown;
    };
    "error.platform.sendEmail2": {
      type: "error.platform.sendEmail2";
      data: unknown;
    };
    "error.platform.sendEmail3": {
      type: "error.platform.sendEmail3";
      data: unknown;
    };
    "error.platform.sendEmail4": {
      type: "error.platform.sendEmail4";
      data: unknown;
    };
    "error.platform.sendEmail5": {
      type: "error.platform.sendEmail5";
      data: unknown;
    };
    "error.platform.sendEmail6": {
      type: "error.platform.sendEmail6";
      data: unknown;
    };
    "error.platform.sendWelcomeEmail": {
      type: "error.platform.sendWelcomeEmail";
      data: unknown;
    };
    "xstate.after(1 day)#email-automation.run.emailSender.email1Sent": {
      type: "xstate.after(1 day)#email-automation.run.emailSender.email1Sent";
    };
    "xstate.after(1 day)#email-automation.run.emailSender.welcomeSent": {
      type: "xstate.after(1 day)#email-automation.run.emailSender.welcomeSent";
    };
    "xstate.after(2 days)#email-automation.run.emailSender.email2Sent": {
      type: "xstate.after(2 days)#email-automation.run.emailSender.email2Sent";
    };
    "xstate.after(3 days)#email-automation.run.emailSender.email3Sent": {
      type: "xstate.after(3 days)#email-automation.run.emailSender.email3Sent";
    };
    "xstate.after(3 days)#email-automation.run.emailSender.email4Sent": {
      type: "xstate.after(3 days)#email-automation.run.emailSender.email4Sent";
    };
    "xstate.after(4 days)#email-automation.run.emailSender.email5Sent": {
      type: "xstate.after(4 days)#email-automation.run.emailSender.email5Sent";
    };
    "xstate.after(freeTrialWarningPeriod)#email-automation.run.userState.newUser.organizationActivity.createdOrganization.planStatus.freeTrial": {
      type: "xstate.after(freeTrialWarningPeriod)#email-automation.run.userState.newUser.organizationActivity.createdOrganization.planStatus.freeTrial";
    };
    "xstate.after(freeTrialWarningRemainderPeriod)#email-automation.run.userState.newUser.organizationActivity.createdOrganization.planStatus.trialAlmostOver": {
      type: "xstate.after(freeTrialWarningRemainderPeriod)#email-automation.run.userState.newUser.organizationActivity.createdOrganization.planStatus.trialAlmostOver";
    };
    "xstate.after(welcomeEmailDelay)#email-automation.run.emailSender.start": {
      type: "xstate.after(welcomeEmailDelay)#email-automation.run.emailSender.start";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    sendEmail:
      | "done.invoke.sendEmail1"
      | "done.invoke.sendEmail2"
      | "done.invoke.sendEmail3"
      | "done.invoke.sendEmail4"
      | "done.invoke.sendEmail5"
      | "done.invoke.sendEmail6"
      | "done.invoke.sendWelcomeEmail";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {};
  eventsCausingDelays: {
    "1 day": "done.invoke.sendEmail1" | "done.invoke.sendWelcomeEmail";
    "2 days": "done.invoke.sendEmail2";
    "3 days": "done.invoke.sendEmail3" | "done.invoke.sendEmail4";
    "4 days": "done.invoke.sendEmail5";
    freeTrialWarningPeriod: "createdOrganization";
    freeTrialWarningRemainderPeriod: "xstate.after(freeTrialWarningPeriod)#email-automation.run.userState.newUser.organizationActivity.createdOrganization.planStatus.freeTrial";
    welcomeEmailDelay: "reset" | "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingServices: {
    sendEmail:
      | "xstate.after(1 day)#email-automation.run.emailSender.email1Sent"
      | "xstate.after(1 day)#email-automation.run.emailSender.welcomeSent"
      | "xstate.after(2 days)#email-automation.run.emailSender.email2Sent"
      | "xstate.after(3 days)#email-automation.run.emailSender.email3Sent"
      | "xstate.after(3 days)#email-automation.run.emailSender.email4Sent"
      | "xstate.after(4 days)#email-automation.run.emailSender.email5Sent"
      | "xstate.after(welcomeEmailDelay)#email-automation.run.emailSender.start";
  };
  matchesStates:
    | "complete"
    | "run"
    | "run.emailSender"
    | "run.emailSender.Complete"
    | "run.emailSender.email1Sent"
    | "run.emailSender.email2Sent"
    | "run.emailSender.email3Sent"
    | "run.emailSender.email4Sent"
    | "run.emailSender.email5Sent"
    | "run.emailSender.sendEmail1"
    | "run.emailSender.sendEmail2"
    | "run.emailSender.sendEmail3"
    | "run.emailSender.sendEmail4"
    | "run.emailSender.sendEmail5"
    | "run.emailSender.sendEmail6"
    | "run.emailSender.sendWelcomeEmail"
    | "run.emailSender.start"
    | "run.emailSender.welcomeSent"
    | "run.userState"
    | "run.userState.newUser"
    | "run.userState.newUser.documentActivity"
    | "run.userState.newUser.documentActivity.completedDocument"
    | "run.userState.newUser.documentActivity.createdDocument"
    | "run.userState.newUser.documentActivity.createdDocument.publishingStatus"
    | "run.userState.newUser.documentActivity.createdDocument.publishingStatus.private"
    | "run.userState.newUser.documentActivity.createdDocument.publishingStatus.published"
    | "run.userState.newUser.documentActivity.createdDocument.sharingStatus"
    | "run.userState.newUser.documentActivity.createdDocument.sharingStatus.private"
    | "run.userState.newUser.documentActivity.createdDocument.sharingStatus.shared"
    | "run.userState.newUser.documentActivity.noDocuments"
    | "run.userState.newUser.organizationActivity"
    | "run.userState.newUser.organizationActivity.completedOrganization"
    | "run.userState.newUser.organizationActivity.createdOrganization"
    | "run.userState.newUser.organizationActivity.createdOrganization.invitationStatus"
    | "run.userState.newUser.organizationActivity.createdOrganization.invitationStatus.invitationAccepted"
    | "run.userState.newUser.organizationActivity.createdOrganization.invitationStatus.invited"
    | "run.userState.newUser.organizationActivity.createdOrganization.invitationStatus.noInvites"
    | "run.userState.newUser.organizationActivity.createdOrganization.planStatus"
    | "run.userState.newUser.organizationActivity.createdOrganization.planStatus.freeTrial"
    | "run.userState.newUser.organizationActivity.createdOrganization.planStatus.paidPlan"
    | "run.userState.newUser.organizationActivity.createdOrganization.planStatus.trialAlmostOver"
    | "run.userState.newUser.organizationActivity.createdOrganization.planStatus.trialEnded"
    | "run.userState.newUser.organizationActivity.noOrganization"
    | "run.userState.userIsSupporter"
    | {
        run?:
          | "emailSender"
          | "userState"
          | {
              emailSender?:
                | "Complete"
                | "email1Sent"
                | "email2Sent"
                | "email3Sent"
                | "email4Sent"
                | "email5Sent"
                | "sendEmail1"
                | "sendEmail2"
                | "sendEmail3"
                | "sendEmail4"
                | "sendEmail5"
                | "sendEmail6"
                | "sendWelcomeEmail"
                | "start"
                | "welcomeSent";
              userState?:
                | "newUser"
                | "userIsSupporter"
                | {
                    newUser?:
                      | "documentActivity"
                      | "organizationActivity"
                      | {
                          documentActivity?:
                            | "completedDocument"
                            | "createdDocument"
                            | "noDocuments"
                            | {
                                createdDocument?:
                                  | "publishingStatus"
                                  | "sharingStatus"
                                  | {
                                      publishingStatus?:
                                        | "private"
                                        | "published";
                                      sharingStatus?: "private" | "shared";
                                    };
                              };
                          organizationActivity?:
                            | "completedOrganization"
                            | "createdOrganization"
                            | "noOrganization"
                            | {
                                createdOrganization?:
                                  | "invitationStatus"
                                  | "planStatus"
                                  | {
                                      invitationStatus?:
                                        | "invitationAccepted"
                                        | "invited"
                                        | "noInvites";
                                      planStatus?:
                                        | "freeTrial"
                                        | "paidPlan"
                                        | "trialAlmostOver"
                                        | "trialEnded";
                                    };
                              };
                        };
                  };
            };
      };
  tags: never;
}
