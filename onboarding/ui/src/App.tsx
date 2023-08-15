import { Auth } from "@supabase/auth-ui-react";
import { supabaseClient, useAuth } from "./hooks/useAuth";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import "./App.css";
import Example from "./Example";

function App() {
  const session = useAuth();

  if (session === "loading") {
    return null;
  }

  return (
    <>
      <p>
        This example application demonstrates using a{" "}
        <a href="https://docs.statebacked.dev">State Backed</a> state machine to
        build an onboarding flow visually and quickly.
      </p>
      <p>
        We're going to mimic the onboarding flow for{" "}
        <a href="https://www.teampando.com" target="_blank">
          Team Pando
        </a>
        , an app that features a block-based PRD editor that turns product
        requirements into visualizable flows.
      </p>
      <p>
        During onboarding, we want to show a guided tour above the app and,
        after onboarding, we want to show contextual help.
      </p>
      <p>
        Check out a quick video of the Team Pando flow that we're mimicing{" "}
        <a href="https://youtu.be/eh9hrTRpSq4" target="_blank">
          here
        </a>
        . As an added bonus, we'll also add the ability for customer support
        agents to reset users to past states (in about 2 lines of code).
      </p>
      {session ? (
        <Example uid={session.user.id} />
      ) : (
        <div>
          <p>
            Log in to check out the example onboarding flow. Log in is only
            required in order to maintain your onboarding state.
          </p>
          <Auth
            supabaseClient={supabaseClient}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
          />
        </div>
      )}
    </>
  );
}

export default App;
