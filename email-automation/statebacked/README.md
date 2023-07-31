# This directory is the *entire* backend for our email automation feature

You'll notice that it is **entirely** composed of business logic.
No data handling, server configuration, or route configs.
0 accidental complexity.

## Overview

The heart of the backend is the state machine, which was designed visually in the Stately editor,
[here](https://stately.ai/registry/editor/412c119a-b389-4ba1-b3fd-67a618616eab?machineId=0281361a-9034-4334-82aa-cbf9cc185b54&mode=Design),
and then exported to [src/machines/email-automation.ts](./src/machines/email-automation.ts).

In our [index.ts](./src/index.ts), we export our machine (as a default export) and our two authorization functions.

For this example, we chose to authorize based on the name of the machine instance.
This is typically an appropriate choice for user-based machines but more complex requirements are easily handled by inspecting machine context as part of authorization.

## Typescript

We generate types for our machine using `npm run typegen` and export the type for our state values, which we can use in our UI
to inspect our state in a type-safe way.
