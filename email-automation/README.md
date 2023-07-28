# Let's make an email flow!

Did you know that MailChimp actually considers **if statements** a premium feature?
You can make an email flow on their base plan as long as you don't include any conditions
but you'll need to upgrade to unlock the power of **if**.

With [StateBacked.dev](https://statebacked.dev), [Stately](https://stately.ai/), and
[Resend](https://resend.com/), you can build your own email automations, with as many
conditionals as you need to represent exactly the logic you need, in just a few minutes.

[![Video walkthrough](https://img.youtube.com/vi/F_uazfnwr-A/0.jpg)](https://youtu.be/F_uazfnwr-A)

## Overview

Let's imagine we have an app that allows users to create documents that they can share or publish
and create organizations they can invite members to and choose a plan for.
And let's say that we want to send contextual, relevant emails over the course of the first 2
weeks after users sign up to help them onboard to the service.

In this example, we'll implement a simple state machine that you can visually explore and we'll
show you how to launch instances of it in the State Backed cloud.

Our imaginary app would create an instance of this state machine for each user that signed up
and would send events to that instance whenever a user took an action that we care about.
The state machine would handle the rest--keeping track of the user's state, persisting it
safely, waking up at the scheduled times to send just the right email, and keeping an audit/debug
trail of every step it took.

## Details

Your logic is what _actually_ matters and, with this stack, that's all you focus on.

First, check out the state machine we built, entirely visually, in the [Stately editor](https://stately.ai/registry/editor/412c119a-b389-4ba1-b3fd-67a618616eab?machineId=0281361a-9034-4334-82aa-cbf9cc185b54&mode=Design).

We exported that machine to [`src/machines/email-automation.ts`](./src/machines/email-automation.ts).

Then, we implemented our `sendEmail` service using [Resend](https://www.resend.com).
You'll need to update the resend API key [here](./src/emails/index.ts) before deploying.

Finally, we deploy our state machine to State Backed.

The first time you deploy, run:

```bash
npm run create-machine
# or: npx smply machines create --machine email-automation --node ./src/index.ts
```

Once your machine `email-automation` machine is created, you can run `npm run publish-machine-version` to publish new versions of the machine.

You can add a `migrations/migration.ts` file before publishing a new version to create a [migration](https://docs.statebacked.dev/docs/concepts/migrations)
from your current machine version to the new version.
This will let you upgrade existing machine instances to your new version whenever you'd like.

To launch an instance of your email-automation machine, run:

```bash
npm run smply -- instances create --machine email-automation --instance test-automation --auth-context '{"sub": "test-automation"}' --context '{"userEmail": "adam@statebacked.dev"}'
```

And you can send it events with:

```bash
npm run smply -- instances send-event --machine email-automation --instance test-automation --auth-context '{"sub": "test-automation"}' --event 'createdDocument'
```

Obviously, you'd want to create instances and send events via the State Backed API in a real application.
You can use the [client SDK](https://www.npmjs.com/package/@statebacked/client) and the server-side
[token generator](https://www.npmjs.com/package/@statebacked/token) to integrate with State Backed super quickly.
