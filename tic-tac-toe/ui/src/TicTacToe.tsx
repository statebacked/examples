import { Actor, ActorState, StateBackedClient } from "@statebacked/client";
import { useMachine } from "./hooks/useMachine";
import { useActor } from "@xstate/react";
import { ContextFrom, StateValueFrom } from "xstate";
import { ticTacToeMachine } from "../../machines/src/tic-tac-toe-machine";
import { getAuth, getUserId } from "./auth";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

// we previously set up our token exchange by running:
//
// create a state backed key
// smply keys create --name example-key --use production
//
// create a token provider
// smply token-providers upsert --key sbk_our-key --mapping '{"sub.$": "$.sub", "email.$": "$.email"}' --service example-onboarding
//
// create an identity provider
// smply identity-providers upsert-supabase --project tfktuqdsyacioqtgesey --secret ==supabase-jwt-secret== --mapping '{"sub.$": "$.sub", "email.$": "$.email"}'
//
// now, we can exchange our supabase access token for a state backed access token automatically
const client = new StateBackedClient({
  async identityProviderToken() {
    const token = await getAuth();
    if (!token) {
      throw new Error("No access token");
    }
    return token;
  },
  orgId: "org_uHvZHpF4STWvMg8BKVCUTg",
  tokenProviderService: "example-tic-tac-toe",
});

type Event = Exclude<
  Parameters<(typeof ticTacToeMachine)["transition"]>[1],
  string
> & { [key: string]: unknown };
type State = StateValueFrom<typeof ticTacToeMachine>;
type Context = ContextFrom<typeof ticTacToeMachine>;
type OnlyPublicContext = Context["public"];

export default function TicTacToe() {
  const { gameId } = useParams();
  const actor = useMachine<Event, State, Context>(
    client,
    "tic-tac-toe-example",
    gameId!,
    () => ({ player1Id: getUserId() }),
  );

  useEffect(() => {
    if (!actor) {
      return;
    }

    actor.send({ type: "join", playerId: getUserId() });
  }, [actor]);

  if (!actor) {
    return <div>Loading...</div>;
  }

  return <Game actor={actor} />;
}

function Game({ actor }: { actor: Actor<Event, State, OnlyPublicContext> }) {
  const [state, send] = useActor(actor);
  const arePlaying = state.matches("Playing");
  const isGameOver = state.matches("Game over");

  return (
    <div>
      <div>
        Scoreboard:{" "}
        {state.context.public.winners.map((winner, idx) => (
          <span key={idx}>{winner}</span>
        ))}
        {arePlaying ? (
          <GameBoard state={state} send={send} />
        ) : isGameOver ? (
          <div>
            <h3>Game over!</h3>
            <button onClick={() => send({ type: "Play again" })}>
              Play again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GameBoard({
  state,
  send,
}: {
  state: ActorState<State, OnlyPublicContext>;
  send: (event: Event) => void;
}) {
  return (
    <table>
      <tbody>
        {state.context.public.board.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, cellIdx) => (
              <td key={cellIdx}>
                {cell ? (
                  <div>{cell}</div>
                ) : (
                  <button
                    onClick={() =>
                      send({ type: "move", row: rowIdx, column: cellIdx })
                    }
                  >
                    {cell}
                  </button>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
