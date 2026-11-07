import React from "react";
import { Trophy, RotateCcw, Home, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function GameOverModal({
  result, // "1-0" | "0-1" | "1/2-1/2"
  reason, // "Checkmate" | "Resignation" | "Timeout" | "Stalemate" | etc.
  winnerName,
  userColor,
  mode,
  pointsChange = null,
  onPlayAgain,
  onClose,
  onExit
}) {
  const isWhiteWin = result === "1-0";
  const isBlackWin = result === "0-1";
  const isDraw = result === "1/2-1/2";

  let title = "Game Over";
  let badgeClass = "badge-neutral";

  if (isDraw) {
    title = "Draw";
    badgeClass = "badge-draw";
  } else if ((isWhiteWin && userColor === "w") || (isBlackWin && userColor === "b")) {
    title = "Victory!";
    badgeClass = "badge-win";
  } else if (mode === "local") {
    title = `${isWhiteWin ? "White" : "Black"} Wins!`;
    badgeClass = "badge-win";
  } else {
    title = "Defeat";
    badgeClass = "badge-loss";
  }

  return (
    <div className="modal-backdrop">
      <motion.div
        className="game-over-card"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <div className={`game-over-icon ${badgeClass}`}>
          <Trophy size={38} />
        </div>

        <span className="game-over-tag">{reason || "Match Concluded"}</span>
        <h2 className="game-over-title">{title}</h2>

        <div className="score-banner">
          <span className="score-num">{result || "—"}</span>
        </div>

        {pointsChange && (
          <div className="rating-change-pill">
            <Award size={16} />
            <span>Arena Points: {pointsChange > 0 ? `+${pointsChange}` : pointsChange}</span>
          </div>
        )}

        <p className="game-over-desc">
          {winnerName ? `${winnerName} won by ${reason || "victory"}.` : reason || "Well played match!"}
        </p>

        <div className="game-over-actions">
          <button type="button" className="btn btn-primary btn-wide" onClick={onPlayAgain}>
            <RotateCcw size={16} /> Play Again
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Review Board
          </button>
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            <Home size={16} /> Lobby
          </button>
        </div>
      </motion.div>
    </div>
  );
}

