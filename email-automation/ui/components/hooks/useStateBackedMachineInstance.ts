import { useEffect, useReducer } from "react";
import useStateBacked, { MachineInstance } from "./useStateBacked";
import { Event, StateValue } from "@statebacked/client";
import { exhaustive } from "../utils";

type Action =
  | { type: "error"; error: Error }
  | { type: "data"; state: StateValue; publicContext: Record<string, any> }
  | { type: "loading"; loading: boolean }
  | { type: "instance"; machineInstance: MachineInstance };
type State =
  | {
      type: "data";
      machineInstance: MachineInstance;
      state: StateValue;
      publicContext: Record<string, any>;
    }
  | { type: "error"; error: Error }
  | { type: "loading"; loading: boolean };

export type InstanceState =
  | { type: "data"; state: StateValue; publicContext: Record<string, any> }
  | { type: "error"; error: Error }
  | { type: "loading"; loading: boolean };

export default function useStateBackedMachineInstance(
  getToken: () => Promise<string>,
  machineName: string,
  instanceName: string,
  initialContext?: Record<string, any>,
): [InstanceState, (event: Event) => Promise<void>] {
  const [sbState, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case "loading":
          return { type: "loading", loading: action.loading };
        case "error":
          return { type: "error", error: action.error };
        case "data":
          return state.type === "data"
            ? {
                type: "data",
                machineInstance: state.machineInstance,
                state: action.state,
                publicContext: action.publicContext,
              }
            : state;
        case "instance":
          return {
            type: "data",
            machineInstance: action.machineInstance,
            state: action.machineInstance.state,
            publicContext: action.machineInstance.publicContext ?? {},
          };
        default:
          exhaustive(action);
      }
    },
    { type: "loading", loading: true },
  );

  const sb = useStateBacked(getToken);

  if (sb.type === "error" && sbState.type !== "error") {
    dispatch({ type: "error", error: sb.error });
  }

  if (sb.type === "loading" && sbState.type !== "loading") {
    dispatch({ type: "loading", loading: sb.loading });
  }

  useEffect(() => {
    (async () => {
      if (sb.type !== "ready") {
        return;
      }

      if (sbState.type === "data") {
        return;
      }

      const { client } = sb;

      try {
        const machineInstance = await client.ensureMachineInstance(
          machineName,
          instanceName,
          initialContext,
        );
        dispatch({ type: "instance", machineInstance });
      } catch (error) {
        dispatch({ type: "error", error: error as Error });
      }
    })();
  }, [sb, sbState]);

  async function sendEvent(event: Event) {
    if (sbState.type !== "data") {
      return;
    }

    const { machineInstance } = sbState;
    const { state, publicContext: maybePublicContext } =
      await machineInstance.sendEvent(event);
    const publicContext = maybePublicContext ?? {};
    dispatch({ type: "data", state, publicContext: publicContext });
  }

  return [
    sbState.type === "data"
      ? {
          type: "data",
          state: sbState.state,
          publicContext: sbState.publicContext,
        }
      : sbState,
    sendEvent,
  ];
}
