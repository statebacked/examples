import {
  StateBackedClient,
  StateValue,
  errors,
  Event,
} from "@statebacked/client";
import useStateBackedToken from "./useStateBackedToken";

type StateBackedResult =
  | { type: "error"; error: Error }
  | { type: "loading"; loading: boolean }
  | { type: "ready"; client: StateBacked };

export default function useStateBacked(
  getToken: () => Promise<string>,
): StateBackedResult {
  const { token, error, loading } = useStateBackedToken(getToken);

  if (loading) {
    return { type: "loading", loading };
  }

  if (error || !token) {
    return { type: "error", error: error || new Error("no token") };
  }

  return {
    type: "ready",
    client: new StateBacked(token),
  };
}

class StateBacked {
  private client: StateBackedClient;

  constructor(token: string) {
    this.client = new StateBackedClient(token);
  }

  public async ensureMachineInstance(
    machineName: string,
    instanceName: string,
    initialContext?: Record<string, any>,
  ): Promise<MachineInstance> {
    try {
      const { state, publicContext } = await this.client.machineInstances.get(
        machineName,
        instanceName,
      );
      return new MachineInstance(
        this.client,
        machineName,
        instanceName,
        state,
        publicContext,
      );
    } catch (error) {
      if (error instanceof errors.NotFoundError) {
        // create the machine if it doesn't exist
        try {
          const { state, publicContext } =
            await this.client.machineInstances.create(machineName, {
              slug: instanceName,
              context: initialContext,
            });
          return new MachineInstance(
            this.client,
            machineName,
            instanceName,
            state,
            publicContext,
          );
        } catch (err) {
          if (err instanceof errors.ConflictError) {
            // the machine was created by another request, read it
            const { state, publicContext } =
              await this.client.machineInstances.get(machineName, instanceName);
            return new MachineInstance(
              this.client,
              machineName,
              instanceName,
              state,
              publicContext,
            );
          }

          throw err;
        }
      }

      throw error;
    }
  }
}

type PublicContext = Record<string, any> | undefined;

export class MachineInstance {
  constructor(
    private client: StateBackedClient,
    private machineName: string,
    public instanceName: string,
    public state: StateValue,
    public publicContext: PublicContext,
  ) {}

  public async sendEvent(
    event: Event,
  ): Promise<{ state: StateValue; publicContext: PublicContext }> {
    const { state, publicContext } =
      await this.client.machineInstances.sendEvent(
        this.machineName,
        this.instanceName,
        { event },
      );
    this.state = state;
    this.publicContext = publicContext;
    return { state, publicContext };
  }
}
