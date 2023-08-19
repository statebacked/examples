import "./App.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import TicTacToe from "./TicTacToe";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateGame />} />
        <Route path="/game/:gameId" element={<TicTacToe />} />
      </Routes>
    </BrowserRouter>
  );
}

function CreateGame() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>
        Create a new Tic Tac Toe game and share the link with a friend to play
        against them!
      </h1>
      <h2>
        Powered by <a href="https://statebacked.dev">State Backed</a>
      </h2>
      <button
        onClick={() => {
          navigate(`/game/${crypto.randomUUID()}`);
        }}
      >
        Create Game
      </button>
    </div>
  );
}

export default App;
