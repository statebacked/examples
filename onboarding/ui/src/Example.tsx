import { Actor, ActorState, StateBackedClient } from "@statebacked/client";
import { supabaseClient } from "./hooks/useAuth";
import { useMachine } from "./hooks/useMachine";
import { useActor } from "@xstate/react";
import { ContextFrom, StateValueFrom } from "xstate";
import { onboardingMachine } from "../../statebacked/src/machines/onboarding";
import styles from "./Example.module.css";

// we previously set up our token exchange by running:
//
// create a state backed key
// smply keys create --name example-key --use production
//
// create a token provider
// smply token-providers upsert --key sbk_our-key --mapping '{"sub.$": "$.sub", "email.$": "$.email"}' --service example-onboarding
//
// create an identity provider
// smply identity-providers upsert-supabase --project tfktuqdsyacioqtgesey --secret ==supabase-jwt-secret== --mapping '{"sub.$": "$.sub", "email.$": "$.email"}'
//
// now, we can exchange our supabase access token for a state backed access token automatically
const client = new StateBackedClient({
  async identityProviderToken() {
    const session = await supabaseClient.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      throw new Error("No access token");
    }
    return token;
  },
  orgId: "org__kAqfwTKTyq-xeoQeZmNRw",
  tokenProviderService: "example-onboarding",
});

type Event = Exclude<
  Parameters<(typeof onboardingMachine)["transition"]>[1],
  string
> & { [key: string]: unknown };
type State = StateValueFrom<typeof onboardingMachine>;
type Context = ContextFrom<typeof onboardingMachine>;
type OnlyPublicContext = Pick<Context, "public">;

export default function Example({ uid }: { uid: string }) {
  const instanceName = uid;
  const actor = useMachine<Event, State, Context>(
    client,
    "onboarding-example",
    instanceName,
    () => ({ uid }),
  );

  if (!actor) {
    return <div>Loading...</div>;
  }

  return <ExampleApp actor={actor} />;
}

function ExampleApp({
  actor,
}: {
  actor: Actor<Event, State, OnlyPublicContext>;
}) {
  const [state, send] = useActor(actor);

  const isOnboarding = state.hasTag("show-onboarding");
  const onboardingPosition = getOnboardingPosition(state);
  const editorActions = getMsg(state)?.editorActions ?? [];
  const showRequirementsHelp = state.hasTag("requirements-help");
  const showWalkthroughHelp = state.hasTag("walkthrough-help");

  return (
    <div className={styles.container}>
      <div className={styles.appContainer}>
        <header className={styles.header}>
          Our example app
          <div className={styles.shiftRight}>
            <button onClick={() => supabaseClient.auth.signOut()}>
              Log out{" "}
            </button>
          </div>
        </header>
        <div className={styles.mainContainer}>
          <div className={styles.mainLeft}>
            This is the main editor area for the app
            <div>
              {editorActions.map((action) => (
                <button key={action.text} onClick={() => send(action.click())}>
                  {action.text}
                </button>
              ))}
            </div>
            {showRequirementsHelp ? (
              <div>
                <p>Requirements help</p>
                <button
                  onClick={() => send({ type: "Hide requirements help" })}
                >
                  Hide help
                </button>
              </div>
            ) : null}
          </div>
          <div className={styles.mainRight}>
            This is where we visualize the editor state
            {showWalkthroughHelp ? (
              <div>
                <p>Walkthrough help</p>
                <button onClick={() => send({ type: "Hide walkthrough help" })}>
                  Hide help
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <footer
          className={`${styles.footer} ${
            onboardingPosition === "bottom" ? styles.showFooter : ""
          }`}
        ></footer>
        {isOnboarding ? <Onboarding state={state} send={send} /> : null}
      </div>
      <div>
        <p>Customer service portal</p>
        <button
          onClick={() =>
            send({ type: "Customer support: Reset to contextual help" })
          }
        >
          Reset to show contextual help
        </button>
        <button
          onClick={() =>
            send({ type: "Customer support: Reset to guided onboarding" })
          }
        >
          Reset to guided onboarding
        </button>
      </div>
    </div>
  );
}

function Onboarding({
  state,
  send,
}: {
  state: ActorState<State, OnlyPublicContext>;
  send: (event: Event) => void;
}) {
  const onboardingPosition = getOnboardingPosition(state);
  const msg = getMsg(state);

  if (!msg) {
    return null;
  }

  return (
    <div className={`${styles.onboarding} ${styles[onboardingPosition]}`}>
      <p>{msg.text}</p>
      <div>
        {(msg.actions ?? []).map((action) => (
          <button key={action.text} onClick={() => send(action.click())}>
            {action.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function getOnboardingPosition(state: ActorState<State, OnlyPublicContext>) {
  return state.hasTag("fullscreen")
    ? "fullscreen"
    : state.hasTag("left")
    ? "left"
    : state.hasTag("right")
    ? "right"
    : state.hasTag("bottom")
    ? "bottom"
    : "none";
}

function getMsg(state: ActorState<State, OnlyPublicContext>): {
  text: string;
  actions?: Array<{ text: string; click: () => Event }>;
  editorActions?: Array<{ text: string; click: () => Event }>;
} | null {
  if (state.matches("Guided Onboarding.Intro")) {
    return {
      text: "Team Pando turns product requirements into flows",
      actions: [
        {
          text: "Next",
          click: () => ({ type: "Next" }),
        },
      ],
    };
  }

  if (state.matches("Guided Onboarding.What's a PRD")) {
    return {
      text: "In a moment, we'll bring you to your Product Requirements Document, where you can add as many requirements and flows as you need to define your app or feature.",
      actions: [
        {
          text: "Next",
          click: () => ({ type: "Next" }),
        },
      ],
    };
  }

  if (state.matches("Guided Onboarding.Requirements blocks")) {
    return {
      text: "In our PRD editor (to the left), everything is a block. Your requirements live in Requirements Blocks. Try creating one now by typing '/Requirements'.",
      editorActions: [
        {
          text: "Create requirements block",
          click: () => ({ type: "Add requirement block" }),
        },
      ],
    };
  }

  if (state.matches("Guided Onboarding.Name flow")) {
    return {
      text: "Every requirements block specifies some requirements for a flow. Now it's time to give your flow a name.",
      editorActions: [
        {
          text: "Name flow",
          click: () => ({ type: "Name flow" }),
        },
      ],
    };
  }

  if (state.matches("Guided Onboarding.Try adding requirements")) {
    return {
      text: "Now, try writing some requirements for your flow.",
      actions: [
        {
          text: "Add example requirements",
          click: () => ({ type: "Analyzed requirement" }),
        },
      ],
      editorActions: [
        {
          text: "Add custom requirements",
          click: () => ({ type: "Analyzed requirement" }),
        },
      ],
    };
  }

  if (state.matches("Guided Onboarding.Explain analysis")) {
    return {
      text: "Nice! Team Pando analyzed your requirements and turned them into a flow.",
      actions: [
        {
          text: "Next",
          click: () => ({ type: "Next" }),
        },
      ],
    };
  }

  if (state.matches("Guided Onboarding.Explain layers")) {
    return {
      text: "Now that you have a flow defined, you can add layers of context, designs, and other information to each part of your flow.",
      editorActions: [
        {
          text: "Add layer",
          click: () => ({ type: "Added layer" }),
        },
      ],
    };
  }

  if (state.matches("Guided Onboarding.Template selection")) {
    return {
      text: "Would you like us to add your requirements to a PRD template?",
      actions: [
        {
          text: "Apply template",
          click: () => ({ type: "Apply template" }),
        },
        {
          text: "Skip",
          click: () => ({ type: "Skip template" }),
        },
      ],
    };
  }

  return null;
}
