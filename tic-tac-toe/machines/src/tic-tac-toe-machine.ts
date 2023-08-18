import { createMachine, assign } from "xstate";
import { Board, PlayerMark, getResult } from "./game-logic";

// designed at: https://stately.ai/registry/editor/d4fab58d-2748-4950-9a22-b85b34ec27a5?machineId=d4ac7ffc-9aa0-48e2-bc79-fc2c62374b43&mode=Design
export const ticTacToeMachine = createMachine(
  {
    id: "Tic Tac Toe Machine",
    context: {
      public: {
        winners: [] as Array<"player1" | "player2" | "draw">,
        board: [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ] as Board,
        player1Mark: "x",
        player2Mark: "o",
      },
      player1Id: "",
      player2Id: "",
    },
    initial: "Awaiting player 2",
    states: {
      "Awaiting player 2": {
        on: {
          join: {
            target: "Playing",
            actions: assign({
              public: (ctx, evt) => ({
                ...ctx.public,
                player2Id: evt.playerId,
              }),
            }),
          },
        },
      },
      Playing: {
        initial: "Awaiting x move",
        states: {
          "Awaiting x move": {
            on: {
              move: {
                target: "Process x move",
                cond: "isLegalMove",
                actions: assign({
                  public: (ctx, evt) => ({
                    ...ctx.public,
                    board: updateBoard("x", ctx.public.board, evt),
                  }),
                }),
              },
            },
          },
          "Process x move": {
            always: [
              {
                target: "#Tic Tac Toe Machine.Game over",
                cond: "isGameOver",
              },
              {
                target: "Awaiting y move",
              },
            ],
          },
          "Awaiting y move": {
            on: {
              move: {
                target: "Process y move",
                cond: "isLegalMove",
                actions: assign({
                  public: (ctx, evt) => ({
                    ...ctx.public,
                    board: updateBoard("y", ctx.public.board, evt),
                  }),
                }),
              },
            },
          },
          "Process y move": {
            always: [
              {
                target: "#Tic Tac Toe Machine.Game over",
                cond: "isGameOver",
              },
              {
                target: "Awaiting x move",
              },
            ],
          },
        },
      },
      "Game over": {
        entry: assign({
          public: (ctx, evt) => {
            const winner = getResult(ctx.public.board);
            const winningPlayer =
              ctx.public.player1Mark === winner
                ? "player1"
                : ctx.public.player2Mark === winner
                ? "player2"
                : "draw";
            const winners = !!winner
              ? ctx.public.winners.concat(winningPlayer)
              : ctx.public.winners;
            return { ...ctx.public, winners };
          },
        }),
        on: {
          "Play again": {
            target: "Playing",
            actions: assign({
              public: (ctx) => ({
                ...ctx.public,
                player1Mark: ctx.public.player2Mark,
                player2Mark: ctx.public.player1Mark,
              }),
            }),
          },
        },
      },
    },
    schema: {
      events: {} as
        | { type: "move"; row: 0 | 1 | 2; column: 0 | 1 | 2 }
        | { type: "Play again" }
        | { type: "join"; playerId: string },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import("./tic-tac-toe-machine.typegen").Typegen0,
  },
  {
    actions: {},
    services: {},
    guards: {
      isGameOver: (context) => getResult(context.public.board) !== null,
      isLegalMove: (context, event) => {
        const { row, column } = event;
        return (
          row >= 0 &&
          row <= 2 &&
          column >= 0 &&
          column <= 2 &&
          context.public.board[row][column] === ""
        );
      },
    },
    delays: {},
  }
);

const updateBoard = (
  player: PlayerMark,
  board: Board,
  evt: { row: number; column: number }
) => {
  const newBoard = board.map((row) => [...row]);
  newBoard[evt.row][evt.column] = player;
  return newBoard as Board;
};
