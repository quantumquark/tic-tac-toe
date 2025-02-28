import { useState, useEffect } from 'react';
import './App.css';

type SquareValue = 'X' | 'O' | null;
type GameMode = 'single' | 'multi' | null;

const calculateWinner = (squares: SquareValue[]): SquareValue => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

// AI move calculation using minimax algorithm
const minimax = (
  squares: SquareValue[],
  depth: number,
  isMaximizing: boolean
): number => {
  const winner = calculateWinner(squares);
  
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (squares.every(square => square !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const score = minimax(squares, depth + 1, false);
        squares[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = 'X';
        const score = minimax(squares, depth + 1, true);
        squares[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

const findBestMove = (squares: SquareValue[]): number => {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) {
      squares[i] = 'O';
      const score = minimax(squares, 0, false);
      squares[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
};

const Square = ({ 
  value, 
  onClick 
}: { 
  value: SquareValue; 
  onClick: () => void;
}) => (
  <button className="square" onClick={onClick}>
    {value}
  </button>
);

const Board = ({ gameMode }: { gameMode: GameMode }) => {
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  useEffect(() => {
    if (gameMode === 'single' && !xIsNext && !calculateWinner(squares)) {
      const timer = setTimeout(() => {
        const bestMove = findBestMove(squares.slice());
        if (bestMove !== -1) {
          const newSquares = squares.slice();
          newSquares[bestMove] = 'O';
          setSquares(newSquares);
          setXIsNext(true);
        }
      }, 500); // Add a small delay to make it feel more natural

      return () => clearTimeout(timer);
    }
  }, [squares, xIsNext, gameMode]);

  const handleClick = (i: number) => {
    if (calculateWinner(squares) || squares[i] || (gameMode === 'single' && !xIsNext)) {
      return;
    }

    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(square => square !== null);
  const status = winner 
    ? `Winner: ${winner}` 
    : isDraw 
    ? "It's a draw!" 
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  const renderSquare = (i: number) => (
    <Square value={squares[i]} onClick={() => handleClick(i)} />
  );

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="game">
      <div className="status">{status}</div>
      <div className="board">
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
};

function App() {
  const [gameMode, setGameMode] = useState<GameMode>(null);

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>
      <div className="mode-selection">
        <button 
          className={`mode-button ${gameMode === 'single' ? 'active' : ''}`}
          onClick={() => setGameMode('single')}
        >
          Single Player
        </button>
        <button 
          className={`mode-button ${gameMode === 'multi' ? 'active' : ''}`}
          onClick={() => setGameMode('multi')}
        >
          Multi Player
        </button>
      </div>
      {gameMode && <Board gameMode={gameMode} />}
      {!gameMode && (
        <div className="select-mode-message">
          Please select a game mode to start playing
        </div>
      )}
    </div>
  );
}

export default App; 