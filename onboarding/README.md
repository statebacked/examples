# Let's make an onboarding flow!

Onboarding flows change all the time, impact all parts of your app, and are **absolutely, critically important**.

With [StateBacked.dev](https://statebacked.dev), you can build your onboarding logic
visually in [Stately](https://stately.ai/) or directly in XState, deploy to State Backed
in one command, and then interact with instances of your persistent onboarding state machine
*exactly* as you would a local state machine.

## Live example

Check out the live, running example [here](https://examples-onboarding.vercel.app/).

## Overview

Team Pando is a modern PRD editor that turns natural language product requirements into visualizable
state machines that you can attach designs and important context to to keep the whole team aligned.

Like many apps, Team Pando has a guided onboarding flow and contextual help.

You can see a quick video of the Team Pando onboarding flow [here](https://youtu.be/eh9hrTRpSq4).

In this example, we'll implement a simple state machine to mimic the Team Pando onboarding and help
flow and show you how to launch instances of it in the State Backed cloud.

Instead of building bespoke backend endpoints and distributing the logic to determine what to show
the user all over the place, we have a single state machine that's incredibly simple to understand
(check it out [here](https://stately.ai/registry/editor/0885219e-36eb-4df0-938d-0ba06f338c2f?mode=design&machineId=baf70852-5205-431f-b545-7e76b8d78a54))
and all persistence, consistency, scaling, and infrastructure is taken care of by State Backed.

## Running locally

1. Check out the repo
2. Install the State Backed CLI: `npm install --global smply`
3. Create a State Backed key by running `smply keys create` and copy the key ID and key secret into ui/.env.local
4. Create a free [Supabase](https://supabase.com/) project (we use Supabase for authentication) and copy your project ID and anon key into `ui/src/hooks/useAuth.ts`.
5. Create a token exchange configuration that allows you to exchange a Supabase token for a State Backed token securely and without running *any* server-side code yourself. Run `smply identity-providers upsert-supabase --project <project> --secret <Supabase JWT secret> --mapping '{"sub.$": "$.sub"}'` and `smply token-providers upsert --key sbk_<key id from above> --service example-onboarding --mapping '{"sub.$": "$.sub"}'`
6. Deploy the email automation machine to your State Backed account: `npm run create-machine` (this just runs `smply machines create --machine email-automation --node ./statebacked/src/index.ts`)
7. Start your app from the `ui` directory by running `npm run dev`
8. Play around with the example at http://localhost:5173

## Details

Your logic is what _actually_ matters and, with this stack, that's all you focus on.

First, check out the state machine we built, entirely visually, in the [Stately editor](https://stately.ai/registry/editor/0885219e-36eb-4df0-938d-0ba06f338c2f?mode=design&machineId=baf70852-5205-431f-b545-7e76b8d78a54).

We exported that machine to [`statebacked/src/machines/onboarding.ts`](./statebacked/src/machines/onboarding.ts).

Then, we wrote our authorization logic in [`statebacked/src/index.ts`](./statebacked/src/index.ts).

Finally, we deployed our state machine to State Backed.

The first time you deploy, run:

```bash
npm run create-machine
# or: npx smply machines create --machine onboarding-example --node ./statebacked/src/index.ts
```

Once your `onboarding-exmaple` machine is created, you can run `npm run publish-machine-version` to publish new versions of the machine.

You can add a `migrations/migration.ts` file before publishing a new version to create a [migration](https://docs.statebacked.dev/docs/concepts/migrations)
from your current machine version to the new version.
This will let you upgrade existing machine instances to your new version whenever you'd like.

To launch an instance of your onboarding-example machine, run:

```bash
npm run smply -- instances create --machine onboarding-example --instance test-123 --auth-context '{"sub": "test-123"}' --context '{"uid": "test-123"}'
```

And you can send it events with:

```bash
npm run smply -- instances send-event --machine onboarding-example --instance test-123 --auth-context '{"sub": "test-123"}' --event 'Next'
```

Obviously, you'd want to create instances and send events via the State Backed API in a real application.
You can use the [client SDK](https://www.npmjs.com/package/@statebacked/client) 
to integrate with State Backed super quickly.

## UI

In [`ui/src/hooks/useMachine.ts`](./ui/src/hooks/useMachine.ts), we create a local Actor that represents our remote machine instance.

Then, in [`ui/src/Example.tsx`](./ui/src/Example.tsx), we use the regular `useActor` hook from XState to read our remote machine state, send it events, and render our UI as a function of that state.

Quickest. Backend. Integration. Ever.
