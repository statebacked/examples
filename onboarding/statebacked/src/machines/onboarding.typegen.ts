// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {};
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | "Complete"
    | "Contextual help"
    | "Contextual help.Requirements"
    | "Contextual help.Requirements.Hidden"
    | "Contextual help.Requirements.Visible"
    | "Contextual help.Walkthrough"
    | "Contextual help.Walkthrough.Hidden"
    | "Contextual help.Walkthrough.Visible"
    | "Guided Onboarding"
    | "Guided Onboarding.Done"
    | "Guided Onboarding.Explain analysis"
    | "Guided Onboarding.Explain layers"
    | "Guided Onboarding.Intro"
    | "Guided Onboarding.Name flow"
    | "Guided Onboarding.Requirements blocks"
    | "Guided Onboarding.Template selection"
    | "Guided Onboarding.Try adding requirements"
    | "Guided Onboarding.What's a PRD"
    | {
        "Contextual help"?:
          | "Requirements"
          | "Walkthrough"
          | {
              Requirements?: "Hidden" | "Visible";
              Walkthrough?: "Hidden" | "Visible";
            };
        "Guided Onboarding"?:
          | "Done"
          | "Explain analysis"
          | "Explain layers"
          | "Intro"
          | "Name flow"
          | "Requirements blocks"
          | "Template selection"
          | "Try adding requirements"
          | "What's a PRD";
      };
  tags:
    | "bottom"
    | "fullscreen"
    | "requirements-help"
    | "right"
    | "show-onboarding"
    | "walkthrough-help";
}
