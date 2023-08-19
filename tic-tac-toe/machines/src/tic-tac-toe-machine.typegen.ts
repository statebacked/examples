// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
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
  eventsCausingGuards: {
    isGameOver: "";
    isLegalMove: "move";
    isNewPlayer: "join";
  };
  eventsCausingServices: {};
  matchesStates:
    | "Awaiting player 2"
    | "Game over"
    | "Playing"
    | "Playing.Awaiting x move"
    | "Playing.Awaiting y move"
    | "Playing.Process x move"
    | "Playing.Process y move"
    | {
        Playing?:
          | "Awaiting x move"
          | "Awaiting y move"
          | "Process x move"
          | "Process y move";
      };
  tags: never;
}
