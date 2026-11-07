import React from "react";
import PieceIcon from "../Chessboard/PieceIcon";

export default function CapturedPieces({ captured = [], hasAdvantage = false, advantageDiff = 0, pieceStyle = "Neo" }) {
  if (!captured.length && !hasAdvantage) {
    return <div className="captured-tray empty" />;
  }

  // Count captured pieces by type
  const counts = { q: 0, r: 0, b: 0, n: 0, p: 0 };
  let pieceColor = "w";
  captured.forEach((p) => {
    counts[p.type] = (counts[p.type] || 0) + 1;
    pieceColor = p.color;
  });

  const order = ["q", "r", "b", "n", "p"];

  return (
    <div className="captured-tray">
      <div className="captured-pieces-list">
        {order.map((t) => {
          const count = counts[t];
          if (!count) return null;
          return (
            <div key={t} className="captured-group" title={`${count} captured ${t}`}>
              <PieceIcon piece={t} color={pieceColor} style={pieceStyle} size="18px" />
              {count > 1 && <span className="captured-count">{count}</span>}
            </div>
          );
        })}
      </div>
      {hasAdvantage && advantageDiff > 0 && <span className="advantage-pill">+{advantageDiff}</span>}
    </div>
  );
}

