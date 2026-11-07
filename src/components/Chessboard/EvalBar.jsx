import React from "react";
import { evaluatePosition } from "../../utils/botEngine";

export default function EvalBar({ chess, orientation = "w" }) {
  if (!chess) return null;

  // Centipawns score from White's perspective
  const rawScore = evaluatePosition(chess);

  let displayScore = "";
  let whitePercent = 50;

  if (chess.isCheckmate()) {
    displayScore = chess.turn() === "w" ? "0-1" : "1-0";
    whitePercent = chess.turn() === "w" ? 0 : 100;
  } else if (chess.isDraw()) {
    displayScore = "0.0";
    whitePercent = 50;
  } else {
    // Sigmoid curve mapping centipawns to percentage (0% to 100%)
    // 0 = 50%, +300 cp (~3 pawns) = ~75%, -300 cp = ~25%
    const winProb = 1 / (1 + Math.pow(10, -rawScore / 400));
    whitePercent = Math.min(96, Math.max(4, Math.round(winProb * 100)));

    const pawns = (rawScore / 100).toFixed(1);
    displayScore = rawScore > 0 ? `+${pawns}` : `${pawns}`;
  }

  // Adjust for orientation: if oriented as Black, bottom of bar is Black
  const isBottomWhite = orientation === "w";
  const bottomPercent = isBottomWhite ? whitePercent : 100 - whitePercent;

  return (
    <div className="eval-bar-wrapper" title={`Evaluation: ${displayScore} (White advantage)`}>
      <div className="eval-bar-track">
        <div
          className="eval-bar-white"
          style={{
            height: `${isBottomWhite ? whitePercent : 100 - whitePercent}%`,
            order: isBottomWhite ? 2 : 1
          }}
        />
        <div
          className="eval-bar-black"
          style={{
            height: `${isBottomWhite ? 100 - whitePercent : whitePercent}%`,
            order: isBottomWhite ? 1 : 2
          }}
        />
      </div>
      <span className={`eval-score-tag ${isBottomWhite ? (whitePercent > 50 ? "tag-bottom" : "tag-top") : (whitePercent > 50 ? "tag-top" : "tag-bottom")}`}>
        {displayScore}
      </span>
    </div>
  );
}

