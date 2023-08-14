import { createMachine, assign } from "xstate";

export const onboardingMachine = createMachine(
  {
    id: "State Backed onboarding machine example",
    context: {
      uid: "",
      public: { addExampleRequirements: false, applyTemplate: false },
    },
    description:
      "This machine governs an onboarding flow where, first, we walk the user through a guided tour of a key aspect of the product and then, we show contextual help until they hide it. We don't want to show the contextual help during the guided onboarding.\n\nCheck out [docs.statebacked.dev](https://docs.statebacked.dev) for more info.",
    initial: "Guided Onboarding",
    states: {
      "Guided Onboarding": {
        tags: "show-onboarding",
        initial: "Intro",
        states: {
          Intro: {
            tags: "fullscreen",
            on: {
              Next: {
                target: "What's a PRD",
              },
            },
          },
          "What's a PRD": {
            tags: "fullscreen",
            on: {
              Next: {
                target: "Requirements blocks",
              },
            },
          },
          "Requirements blocks": {
            tags: "right",
            on: {
              "Add requirement block": {
                target: "Name flow",
              },
            },
          },
          "Name flow": {
            tags: "right",
            on: {
              "Name flow": {
                target: "Try adding requirements",
              },
            },
          },
          "Try adding requirements": {
            tags: "right",
            on: {
              "Analyzed requirement": {
                target: "Explain analysis",
              },
              "Add example requirements": {
                actions: assign({
                  public: (ctx) => ({
                    ...ctx.public,
                    addExampleRequirements: true,
                  }),
                }),
                internal: true,
              },
            },
          },
          "Explain analysis": {
            tags: "bottom",
            on: {
              Next: {
                target: "Explain layers",
              },
            },
          },
          "Explain layers": {
            tags: "bottom",
            on: {
              "Added layer": {
                target: "Template selection",
              },
            },
          },
          "Template selection": {
            tags: "bottom",
            on: {
              "Skip template": {
                target: "Done",
              },
              "Apply template": {
                target: "Done",
                actions: assign({
                  public: (ctx) => ({ ...ctx.public, applyTemplate: true }),
                }),
              },
            },
          },
          Done: {
            type: "final",
          },
        },
        onDone: {
          target: "Contextual help",
        },
      },
      "Contextual help": {
        states: {
          Walkthrough: {
            description:
              "Whether we should show the contextual help for the walkthrough.",
            initial: "Visible",
            states: {
              Visible: {
                tags: "walkthrough-help",
                on: {
                  "Hide walkthrough help": {
                    target: "Hidden",
                  },
                },
              },
              Hidden: {
                type: "final",
              },
            },
          },
          Requirements: {
            description:
              "Whether we should show the contextual help for the requirements blocks.",
            initial: "Visible",
            states: {
              Visible: {
                tags: "requirements-help",
                on: {
                  "Hide requirements help": {
                    target: "Hidden",
                  },
                },
              },
              Hidden: {
                type: "final",
              },
            },
          },
        },
        type: "parallel",
        onDone: {
          target: "Complete",
        },
      },
      Complete: {
        description:
          "Once a user has completed onboarding and has dismissed the contextual help, we don't show it any more.\n\nWe don't mark this state as final in case customer support needs to reset their state.",
        on: {
          "Customer support: Reset to guided onboarding": {
            target: "Guided Onboarding",
          },
          "Customer support: Reset to contextual help": {
            target: "Contextual help",
          },
        },
      },
    },
    schema: {
      events: {} as
        | { type: "Next" }
        | { type: "Add requirement block" }
        | { type: "Name flow" }
        | { type: "Analyzed requirement" }
        | { type: "Add example requirements" }
        | { type: "Added layer" }
        | { type: "Skip template" }
        | { type: "Apply template" }
        | { type: "Hide walkthrough help" }
        | { type: "Hide requirements help" }
        | { type: "Customer support: Reset to guided onboarding" }
        | { type: "Customer support: Reset to contextual help" },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import("./onboarding.typegen").Typegen0,
  },
  {
    actions: {},
    services: {},
    guards: {},
    delays: {},
  }
);
