import type { AllowRead, AllowWrite } from "@statebacked/machine-def";
import type { ContextFrom, EventFrom } from "xstate";
import { matchesState } from "xstate/lib/utils";
import { ticTacToeMachine } from "./tic-tac-toe-machine";

export default ticTacToeMachine;

type Context = ContextFrom<typeof ticTacToeMachine>;
type Event = EventFrom<typeof ticTacToeMachine>;
type AuthContext = { sub: string };

// users can read from any machine they're a player in or a machine that doesn't yet have a player2
export const allowRead: AllowRead<Context, AuthContext> = ({
  authContext,
  context,
}) =>
  authContext.sub === context.player1Id ||
  authContext.sub === context.player2Id ||
  !context.player2Id;

// users can send to their own machines if it's their turn
export const allowWrite: AllowWrite<Context, AuthContext, Event> = (env) => {
  // you can't lie about your id
  if (env.type === "initialization") {
    return env.authContext.sub === env.context.player1Id;
  }

  // you can't lie about your id
  if (env.event.data.type === "join") {
    return env.authContext.sub === env.event.data.playerId;
  }

  // if playing, make sure you only play your move
  if (matchesState("Playing", env.state)) {
    const playerMark = {
      [env.context.player1Id]: env.context.public.player1Mark,
      [env.context.player2Id]: env.context.public.player2Mark,
    }[env.authContext.sub];

    if (matchesState("Playing.Awaiting x move", env.state)) {
      return playerMark === "x";
    }

    if (matchesState("Playing.Awaiting y move", env.state)) {
      return playerMark === "y";
    }
  }

  // outside of game play, any player can send an event
  return [env.context.player1Id, env.context.player2Id].includes(
    env.authContext.sub
  );
};
