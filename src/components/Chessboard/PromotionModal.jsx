import React from "react";
import PieceIcon from "./PieceIcon";

export default function PromotionModal({ color = "w", pieceStyle = "Neo", onSelect, onCancel }) {
  const pieces = ["q", "r", "b", "n"];

  return (
    <div className="promotion-backdrop" onClick={onCancel}>
      <div className="promotion-dialog" onClick={(e) => e.stopPropagation()}>
        <span className="promotion-title">Promote Pawn</span>
        <div className="promotion-options">
          {pieces.map((type) => (
            <button
              key={type}
              type="button"
              className="promotion-btn"
              onClick={() => onSelect(type)}
              title={type === "q" ? "Queen" : type === "r" ? "Rook" : type === "b" ? "Bishop" : "Knight"}
            >
              <PieceIcon piece={type} color={color} style={pieceStyle} size="44px" />
              <span className="promotion-label">
                {type === "q" ? "Queen" : type === "r" ? "Rook" : type === "b" ? "Bishop" : "Knight"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

