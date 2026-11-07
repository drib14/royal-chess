const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

const INITIAL_PIECES = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1
};

/**
 * Calculates captured pieces and material advantage from the current chess board.
 * @param {Chess} chess
 * @returns {object} { whiteCaptured, blackCaptured, materialAdvantage }
 */
export function getCapturedPieces(chess) {
  if (!chess) return { whiteCaptured: [], blackCaptured: [], advantage: 0, leader: null };

  const currentCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type !== "k") {
        currentCounts[piece.color][piece.type]++;
      }
    }
  }

  // Captured pieces: what White has captured FROM Black, and what Black has captured FROM White
  const whiteCaptured = []; // Black pieces eaten by White
  const blackCaptured = []; // White pieces eaten by Black

  let whiteScore = 0;
  let blackScore = 0;

  // Order of display: Queens, Rooks, Bishops, Knights, Pawns
  const order = ["q", "r", "b", "n", "p"];

  order.forEach((t) => {
    // Eaten black pieces (captured by White)
    const blackLost = Math.max(0, INITIAL_PIECES[t] - currentCounts.b[t]);
    for (let i = 0; i < blackLost; i++) {
      whiteCaptured.push({ type: t, color: "b" });
      whiteScore += PIECE_VALUES[t];
    }

    // Eaten white pieces (captured by Black)
    const whiteLost = Math.max(0, INITIAL_PIECES[t] - currentCounts.w[t]);
    for (let i = 0; i < whiteLost; i++) {
      blackCaptured.push({ type: t, color: "w" });
      blackScore += PIECE_VALUES[t];
    }
  });

  const diff = whiteScore - blackScore;
  return {
    whiteCaptured,
    blackCaptured,
    diff: Math.abs(diff),
    leader: diff > 0 ? "w" : diff < 0 ? "b" : null
  };
}

/**
 * Finds the square of the king for a given color.
 */
export function getKingSquare(chess, color) {
  if (!chess) return null;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === "k" && p.color === color) {
        const file = String.fromCharCode(97 + c);
        const rank = String(8 - r);
        return file + rank;
      }
    }
  }
  return null;
}

/**
 * Formats time in seconds to mm:ss or m:ss.d
 */
export function formatClock(seconds) {
  if (seconds === null || seconds === undefined) return "—";
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

