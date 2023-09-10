import { Actor, ActorState, StateBackedClient } from "@statebacked/client";
import { useStateBackedMachine } from "@statebacked/react";
import { useActor } from "@xstate/react";
import { ContextFrom, StateValueFrom } from "xstate";
import { ticTacToeMachine } from "../../statebacked/src/tic-tac-toe-machine";
import { getAuth, getUserId } from "./auth";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./TicTacToe.module.css";

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
  const { actor } = useStateBackedMachine<Event, State, Context>(client, {
    machineName: "tic-tac-toe-example",
    instanceName: gameId!,
    getInitialContext() {
      return { player1Id: getUserId() };
    },
  });
  const [hashedUserId, setHashedUserId] = useState("");

  useEffect(() => {
    crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(getUserId()))
      .then((hash) => {
        setHashedUserId(btoa(String.fromCharCode(...new Uint8Array(hash))));
      });

    if (!actor) {
      return;
    }

    actor.send({ type: "join", playerId: getUserId() });
  }, [actor]);

  if (!actor) {
    return <div>Loading...</div>;
  }

  return <Game actor={actor} hashedUserId={hashedUserId} />;
}

function Game({
  actor,
  hashedUserId,
}: {
  actor: Actor<Event, State, OnlyPublicContext>;
  hashedUserId: string;
}) {
  const [state, send] = useActor(actor);
  const arePlaying = state.matches("Playing");
  const isGameOver = state.matches("Game over");
  const waitingForPlayer2 = state.matches("Awaiting player 2");
  const player =
    hashedUserId === state.context.public.hashedPlayer1Id
      ? "player1"
      : "player2";
  const mark =
    player === "player1"
      ? state.context.public.player1Mark
      : state.context.public.player2Mark;

  const ownWins = state.context.public.winners.filter(
    (winner) => winner === player,
  ).length;
  const opponentWins = state.context.public.winners.filter(
    (winner) => winner !== player && winner !== "draw",
  ).length;
  const draws = state.context.public.winners.length - ownWins - opponentWins;

  const getWinner = (winner: "player1" | "player2" | "draw") => {
    if (winner === "draw") {
      return "Draw";
    }

    return winner === player ? "You won" : "You lost";
  };

  if (waitingForPlayer2) {
    return (
      <div>
        <h2>Waiting for player 2</h2>
        <p>
          Send a friend this link or open a new browser tab to play yourself:{" "}
          {window.location.href}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p>
          Wins: {ownWins} Draws: {draws} Losses: {opponentWins}
        </p>
        <p>
          You are playing as: <strong>{mark}</strong>
        </p>
        {arePlaying ? (
          <>
            {(state.matches("Playing.Awaiting x move") && mark === "x") ||
            (state.matches("Playing.Awaiting o move") && mark === "o") ? (
              <h2>Your move</h2>
            ) : (
              <h2>Waiting for your opponent's move...</h2>
            )}
            <GameBoard state={state} send={send} />
          </>
        ) : isGameOver ? (
          <div>
            <h3>{getWinner(state.context.public.winners.slice(-1)[0])}!</h3>
            <button onClick={() => send({ type: "Play again" })}>
              Play again
            </button>
            <GameBoard readonly state={state} send={send} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GameBoard({
  state,
  send,
  readonly,
}: {
  state: ActorState<State, OnlyPublicContext>;
  send: (event: Event) => void;
  readonly?: boolean;
}) {
  return (
    <table className={styles.gameBoard}>
      <tbody>
        {state.context.public.board.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, cellIdx) => (
              <td key={cellIdx}>
                {cell || readonly ? (
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
