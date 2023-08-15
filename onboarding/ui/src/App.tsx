import { Auth } from "@supabase/auth-ui-react";
import { supabaseClient, useAuth } from "./hooks/useAuth";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import "./App.css";
import Example from "./Example";

function App() {
  const session = useAuth();

  return (
    <>
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
