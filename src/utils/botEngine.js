import { Chess } from "chess.js";

// Piece values in centipawns
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (White perspective - 8x8 flattened a8 to h1)
const PST_PAWN = [
  0,  0,  0,  0,  0,  0,  0,  0,
 50, 50, 50, 50, 50, 50, 50, 50,
 10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const PST_KNIGHT = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50
];

const PST_BISHOP = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5, 10, 10,  5,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20
];

const PST_ROOK = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const PST_QUEEN = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20
];

const PST_KING_MID = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square, isWhite) {
  const file = square.charCodeAt(0) - 97; // 0..7
  const rank = 8 - parseInt(square[1], 10); // 0..7 (rank 8 is 0)
  if (isWhite) {
    return rank * 8 + file;
  }
  // Black views board mirrored vertically
  return (7 - rank) * 8 + file;
}

export function evaluatePosition(chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -50000 : 50000;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let totalScore = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      const fileChar = String.fromCharCode(97 + c);
      const rankChar = String(8 - r);
      const sq = fileChar + rankChar;
      const isW = piece.color === "w";
      const idx = getSquareIndex(sq, isW);

      let pstBonus = 0;
      if (piece.type === "p") pstBonus = PST_PAWN[idx];
      else if (piece.type === "n") pstBonus = PST_KNIGHT[idx];
      else if (piece.type === "b") pstBonus = PST_BISHOP[idx];
      else if (piece.type === "r") pstBonus = PST_ROOK[idx];
      else if (piece.type === "q") pstBonus = PST_QUEEN[idx];
      else if (piece.type === "k") pstBonus = PST_KING_MID[idx];

      const pieceScore = val + pstBonus;
      totalScore += isW ? pieceScore : -pieceScore;
    }
  }

  return totalScore;
}

// Alpha-Beta Minimax
function minimax(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || chess.isGameOver()) {
    return evaluatePosition(chess);
  }

  const moves = chess.moves({ verbose: true });
  // Move ordering: sort captures and checks first
  moves.sort((a, b) => {
    let scoreA = a.captured ? PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece] : 0;
    let scoreB = b.captured ? PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece] : 0;
    if (a.san.includes("+")) scoreA += 50;
    if (b.san.includes("+")) scoreB += 50;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      chess.move(m);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      chess.move(m);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Calculates the best computer move based on selected difficulty.
 * @param {Chess} chess - Current chess instance
 * @param {string} level - 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
 * @returns {object|null} - Best move object or null
 */
export function getComputerMove(chess, level = "Intermediate") {
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;

  const isWhite = chess.turn() === "w";

  // BEGINNER: ~600 Elo
  // Picks a random move ~50% of the time, or a random capture/check
  if (level === "Beginner") {
    if (Math.random() < 0.45) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    const captures = moves.filter((m) => m.captured);
    if (captures.length && Math.random() < 0.7) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // INTERMEDIATE: ~1200 Elo (1-2 ply search)
  if (level === "Intermediate") {
    let bestMove = moves[0];
    let bestScore = isWhite ? -Infinity : Infinity;
    // Add small randomized blunder factor
    for (const m of moves) {
      chess.move(m);
      let score = evaluatePosition(chess);
      score += (Math.random() - 0.5) * 40; // slight human noise
      chess.undo();

      if (isWhite ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
    return bestMove;
  }

  // ADVANCED: ~1600 Elo (2-3 ply alpha-beta)
  if (level === "Advanced") {
    const depth = 2;
    let bestMove = moves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const m of moves) {
      chess.move(m);
      const score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite);
      chess.undo();

      if (isWhite ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
    return bestMove;
  }

  // EXPERT / MASTER: ~2000+ Elo (3 ply search with deep move ordering)
  const depth = 3;
  let bestMove = moves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  // Sort candidate moves
  moves.sort((a, b) => {
    let scoreA = a.captured ? PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece] : 0;
    let scoreB = b.captured ? PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece] : 0;
    return scoreB - scoreA;
  });

  for (const m of moves) {
    chess.move(m);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite);
    chess.undo();

    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}

