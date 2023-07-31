import { useEffect, useReducer } from "react";
import {
  CreateMachineInstanceRequest,
  Event,
  MachineInstanceName,
  MachineName,
  StateBackedClient,
  StateValue,
} from "@statebacked/client";
import { exhaustive } from "../utils";

type Action<S extends StateValue, P extends Record<string, unknown>> =
  | { type: "error"; error: Error }
  | { type: "data"; state: StateValue; publicContext: Record<string, any> }
  | { type: "loading"; loading: boolean }
  | { type: "instance"; machineInstance: MachineInstance<S, P> };
type State<S extends StateValue, P extends Record<string, unknown>> =
  | {
      type: "data";
      machineInstance: MachineInstance<S, P>;
      state: StateValue;
      publicContext: Record<string, any>;
    }
  | { type: "error"; error: Error }
  | { type: "loading"; loading: boolean };

export type InstanceState<S, P> =
  | { type: "data"; state: S; publicContext: P }
  | { type: "error"; error: Error }
  | { type: "loading"; loading: boolean };

export default function useStateBackedMachineInstance<
  S extends StateValue = StateValue,
  P extends Record<string, unknown> = Record<string, never>,
>(
  getToken: () => Promise<string>,
  machineName: string,
  instanceName: string,
  initialContext?: Record<string, any>,
): [InstanceState<S, P>, (event: Event) => Promise<void>] {
  const [sbState, dispatch] = useReducer(
    (state: State<S, P>, action: Action<S, P>): State<S, P> => {
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

  useEffect(() => {
    (async () => {
      try {
        const client = new StateBackedClient(getToken);
        const machineInstance = await MachineInstance.getOrCreate<S, P>(
          client,
          machineName,
          instanceName,
          {
            context: initialContext,
          },
        );
        dispatch({ type: "instance", machineInstance });
      } catch (error) {
        dispatch({ type: "error", error: error as Error });
      }
    })();
  }, [machineName, instanceName]);

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
      ? ({
          type: "data",
          state: sbState.state,
          publicContext: sbState.publicContext,
        } as InstanceState<S, P>)
      : sbState,
    sendEvent,
  ];
}

export class MachineInstance<
  S extends StateValue = StateValue,
  P extends Record<string, unknown> = Record<string, never>,
> {
  private constructor(
    private client: StateBackedClient,
    public readonly machineName: MachineName,
    public readonly instanceName: MachineInstanceName,
    public state: S,
    public publicContext: P,
  ) {}

  public static async getOrCreate<
    S extends StateValue = StateValue,
    P extends Record<string, unknown> = Record<string, never>,
  >(
    client: StateBackedClient,
    machineName: MachineName,
    instanceName: MachineInstanceName,
    creationArgs:
      | Omit<CreateMachineInstanceRequest, "slug">
      | (() => Omit<CreateMachineInstanceRequest, "slug">),
  ) {
    const { state, publicContext } = await client.machineInstances.getOrCreate(
      machineName,
      instanceName,
      creationArgs,
    );
    return new MachineInstance(
      client,
      machineName,
      instanceName,
      state as S,
      publicContext as P,
    );
  }

  public async sendEvent(
    event: Event,
  ): Promise<{ state: S; publicContext: P }> {
    const { state, publicContext } =
      await this.client.machineInstances.sendEvent(
        this.machineName,
        this.instanceName,
        { event },
      );
    this.state = state as S;
    this.publicContext = publicContext as P;
    return { state: state as S, publicContext: publicContext as P };
  }
}
