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
    | "Playing.Awaiting o move"
    | "Playing.Awaiting x move"
    | "Playing.Process o move"
    | "Playing.Process x move"
    | "Set player 1 ID"
    | "Set player 2 ID"
    | {
        Playing?:
          | "Awaiting o move"
          | "Awaiting x move"
          | "Process o move"
          | "Process x move";
      };
  tags: never;
}
