import {
  Actor,
  Event,
  StateBackedClient,
  StateValue,
} from "@statebacked/client";
import { useEffect, useState } from "react";

export const useMachine = <
  TEvent extends Exclude<Event, string>,
  TState extends StateValue,
  TContext extends Record<string, unknown> & {
    public: Record<string, unknown>;
  },
>(
  client: StateBackedClient,
  machineName: string,
  instanceName: string,
  getContext: () => Partial<TContext>,
) => {
  const [actor, setActor] = useState<Actor<
    TEvent,
    TState,
    Pick<TContext, "public">
  > | null>(null);

  useEffect(() => {
    client.machineInstances
      .getOrCreateActor(machineName, instanceName, () => ({
        context: getContext(),
      }))
      .then(setActor);
  }, []);

  return actor;
};
