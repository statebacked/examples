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
          <div />
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
        <div className="flex flex-col items-center mb-4 lg:mb-12">
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
          <div className="bg-foreground py-3 px-6 rounded-lg font-mono text-sm text-background">
            Instant backend from any XState state machine
          </div>
        </div>

        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        {user && user.email ? (
          <SampleApp userId={user.id} email={user.email} />
        ) : null}

        <p>
          In this example, we will create an email automation backend. We can
          build our logic visually and deploy our machine as a backend in one
          command.
        </p>
        <ul className="list-disc">
          <li>
            Take a look at our email automation logic{" "}
            <a
              className="underline"
              href="https://stately.ai/registry/editor/412c119a-b389-4ba1-b3fd-67a618616eab?machineId=0281361a-9034-4334-82aa-cbf9cc185b54&mode=Design"
              target="_blank"
            >
              here
            </a>
            .
          </li>
          <li>
            We export the state machine to{" "}
            <span className="decoration-red-50">
              statebacked/src/machines/email-automation.ts
            </span>
          </li>
          <li>
            Then, we upload the machine to State Backed by running{" "}
            <pre>npm run create-machine</pre> or publish new versions with{" "}
            <pre>npm run publish-machine-version</pre>
          </li>
          <li>
            When publishing new versions, you can optionally create migrations
            to upgrade existing machines by creating a migration file at{" "}
            <pre>statebacked/migrations/migration.ts</pre>
          </li>
        </ul>

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
