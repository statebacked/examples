import type {
  AllowRead,
  AllowWrite,
  AnonymousAuthContext,
} from "@statebacked/machine";
import type { ContextFrom, EventFrom, StateValueFrom } from "xstate";
import { matchesState } from "xstate/lib/utils";
import { ticTacToeMachine } from "./tic-tac-toe-machine";

export default ticTacToeMachine;

type Context = ContextFrom<typeof ticTacToeMachine>;
type Event = EventFrom<typeof ticTacToeMachine>;
type State = StateValueFrom<typeof ticTacToeMachine>;

// users can read from any machine they're a player in or a machine that doesn't yet have a player2
export const allowRead: AllowRead<Context, AnonymousAuthContext> = ({
  authContext,
  context,
}) =>
  authContext.sid === context.player1Id ||
  authContext.sid === context.player2Id ||
  !context.player2Id;

// users can send to their own machines if it's their turn
export const allowWrite: AllowWrite<
  Context,
  AnonymousAuthContext,
  Event,
  State
> = (env) => {
  // you can't lie about your id
  if (env.type === "initialization") {
    return env.authContext.sid === env.context.player1Id;
  }

  // you can't lie about your id
  if (env.event.type === "join") {
    return env.authContext.sid === env.event.playerId;
  }

  // if playing, make sure you only play your move
  if (matchesState("Playing", env.state)) {
    const playerMark = {
      [env.context.player1Id]: env.context.public.player1Mark,
      [env.context.player2Id]: env.context.public.player2Mark,
    }[env.authContext.sid];

    if (matchesState("Playing.Awaiting x move", env.state)) {
      return playerMark === "x";
    }

    if (matchesState("Playing.Awaiting o move", env.state)) {
      return playerMark === "o";
    }
  }

  // outside of game play, any player can send an event
  return [env.context.player1Id, env.context.player2Id].includes(
    env.authContext.sid
  );
};
