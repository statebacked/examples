import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
import StateBackedLogo from "../components/StateBackedLogo";
import SampleApp from "@/components/SampleApp";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div>
            Note: you will receive a few emails after logging in as part of the
            demo.
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="animate-in flex flex-col gap-14 opacity-0 max-w-4xl px-3 py-16 lg:py-24 text-foreground">
        <div className="flex flex-col items-center">
          <div className="flex gap-8 justify-center items-center">
            <Link href="https://statebacked.dev/" target="_blank">
              <div className="flex flex-row gap-2 items-center text-3xl font-bold">
                <StateBackedLogo /> State Backed
              </div>
            </Link>
          </div>
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center my-12">
            The fastest way to launch a stateful backend
          </p>
          <Link href="https://docs.statebacked.dev">
            <div className="bg-btn-background py-3 px-6 rounded-lg font-mono text-sm text-foreground">
              Instant backend from any XState state machine
            </div>
          </Link>
        </div>
        <div className="flex gap-8 justify-center items-center">
          <Link href="https://github.com/statebacked/examples/tree/main/email-automation">
            <div className="bg-foreground py-3 px-6 rounded-lg font-mono text-sm text-background">
              Check out the example on GitHub
            </div>
          </Link>
        </div>

        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <details>
          <summary>View state machine</summary>
          <iframe
            width="100%"
            height="1000px"
            src="https://stately.ai/registry/editor/embed/412c119a-b389-4ba1-b3fd-67a618616eab?machineId=0281361a-9034-4334-82aa-cbf9cc185b54&mode=Design"
          ></iframe>
        </details>

        {user && user.email ? (
          <SampleApp userId={user.id} email={user.email} />
        ) : null}

        <p>
          In this example, we will create an email automation backend. We built
          our logic{" "}
          <a
            className="underline"
            href="https://stately.ai/registry/editor/412c119a-b389-4ba1-b3fd-67a618616eab?machineId=0281361a-9034-4334-82aa-cbf9cc185b54&mode=Design"
          >
            visually
          </a>{" "}
          as a state machine and can deploy our machine as a serverless, durable
          backend in one command with State Backed.
        </p>
        <p>
          Take a look at the{" "}
          <a
            className="underline"
            href="https://github.com/statebacked/examples/tree/main/email-automation/statebacked"
          >
            statebacked
          </a>{" "}
          directory on GitHub to see the entire backend for this example. You'll
          notice that the only code we wrote was the state machine that
          represents our business logic. No accidental complexity, no
          configuration, no persistence handling, no boilerplate.
        </p>
        <p>
          You can see the simple frontend interactions with our backend in{" "}
          <a
            className="underline"
            href="https://github.com/statebacked/examples/tree/main/email-automation/ui/components/SampleApp.tsx"
          >
            SampleApp.tsx
          </a>
          . We retrieve a State Backed token from backend and then create, get,
          and send events to our state machine instance. Our UI is a simple
          function of the state machine's current state.
        </p>
        <p>
          This example requires long-running timers (we send emails after a
          multi-day delay, though, for example purposes, we have shortened days
          to minutes and minutes to seconds). For that, we just rely on the
          durable timers provided by State Backed by way of standard XState
          delay support.
        </p>
        <p>
          Typically, you would have to create at least two separate sets of
          infrastructure to support an email automation flow: one set of
          services to handle the email sending logic and another set of services
          to capture and update the user state logic. Here, we handle both quite
          naturally in the same state machine and don't need to worry about any
          of the underlying infrastructure.
        </p>
        <div className="flex gap-8 justify-center items-center">
          <Link href="/login">
            <div className="bg-foreground py-3 px-6 rounded-lg font-mono text-sm text-background">
              Log in to run the example yourself (note: you will receive a few
              emails)
            </div>
          </Link>
        </div>

        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <p>
          You can deploy your own state machine backend in less than 5 minutes
          with{" "}
          <a
            className="underline"
            href="https://docs.statebacked.dev/docs/intro"
          >
            State Backed
          </a>
          . 1,000 events and 10,000 reads free every month.
        </p>

        <div className="flex justify-center text-center text-xs">
          <p>
            Powered by{" "}
            <Link
              href="https://statebacked.dev/"
              target="_blank"
              className="font-bold"
            >
              State Backed
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
