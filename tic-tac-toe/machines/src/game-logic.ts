export type PlayerMark = "x" | "o";
export type BoardMark = PlayerMark | "";
export type Board = [
  [BoardMark, BoardMark, BoardMark],
  [BoardMark, BoardMark, BoardMark],
  [BoardMark, BoardMark, BoardMark]
];

export const getResult = (board: Board): "x" | "o" | "draw" | null => {
  const rowWinner = board.find((row) => allMatch(row))?.[0];
  if (rowWinner) {
    return rowWinner;
  }

  const columns = [0, 1, 2].map((i) => board.map((row) => row[i]));
  const columnWinner = columns.find((column) => allMatch(column))?.[0];
  if (columnWinner) {
    return columnWinner;
  }

  const downDiagonal = [0, 1, 2].map((i) => board[i][i]);
  const upDiaonal = [0, 1, 2].map((i) => board[i][2 - i]);
  const diagonalWinner = allMatch(downDiagonal)
    ? downDiagonal[0]
    : allMatch(upDiaonal)
    ? upDiaonal[0]
    : null;

  if (diagonalWinner) {
    return diagonalWinner;
  }

  const boardFull = board.every((row) => row.every((cell) => !!cell));

  return boardFull ? "draw" : null;
};

const allMatch = (marks: BoardMark[]) =>
  !!marks[0] && marks.every((mark) => mark === marks[0]);
