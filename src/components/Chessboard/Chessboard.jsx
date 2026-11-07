import React, { useState, useMemo } from "react";
import PieceIcon from "./PieceIcon";
import PromotionModal from "./PromotionModal";
import { getKingSquare } from "../../utils/chessHelpers";

export default function Chessboard({
  chess,
  theme,
  pieceStyle = "Neo",
  orientation = "w",
  interactive = true,
  allowedColor = null, // "w", "b", or null (both allowed, e.g. local play)
  lastMove = null, // { from: 'e2', to: 'e4' }
  onMove,
  showCoords = true
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [draggedSquare, setDraggedSquare] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null); // { from, to, color }

  // Turn check
  const currentTurn = chess.turn();
  const isTurnAllowed = allowedColor === null || allowedColor === currentTurn;

  // King square in check
  const checkedKingSquare = useMemo(() => {
    if (chess.isCheck()) {
      return getKingSquare(chess, currentTurn);
    }
    return null;
  }, [chess, currentTurn]);

  // Compute legal moves from the selected square
  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    try {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      return moves.map((m) => ({
        to: m.to,
        isCapture: Boolean(m.captured) || m.flags.includes("e"), // capture or en-passant
        isPromotion: m.flags.includes("p") || m.flags.includes("cp")
      }));
    } catch {
      return [];
    }
  }, [chess, selectedSquare]);

  const legalSquareMap = useMemo(() => {
    const map = new Map();
    legalMoves.forEach((m) => map.set(m.to, m));
    return map;
  }, [legalMoves]);

  // Generate 64 squares in correct orientation order
  const files = orientation === "w" ? ["a", "b", "c", "d", "e", "f", "g", "h"] : ["h", "g", "f", "e", "d", "c", "b", "a"];
  const ranks = orientation === "w" ? ["8", "7", "6", "5", "4", "3", "2", "1"] : ["1", "2", "3", "4", "5", "6", "7", "8"];

  const squares = [];
  for (const rank of ranks) {
    for (const file of files) {
      squares.push(file + rank);
    }
  }

  // Handle move execution (with pawn promotion check)
  const handleAttemptMove = (from, to) => {
    if (!interactive || !isTurnAllowed) return;

    const piece = chess.get(from);
    if (!piece) return;

    // Check if move is pawn promotion
    const isPawn = piece.type === "p";
    const isPromoRank = (piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1");

    if (isPawn && isPromoRank) {
      setPendingPromotion({ from, to, color: piece.color });
      return;
    }

    onMove?.(from, to, "q");
    setSelectedSquare(null);
  };

  const handleSelectPromotion = (promoType) => {
    if (pendingPromotion) {
      onMove?.(pendingPromotion.from, pendingPromotion.to, promoType);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  // Square Click Handler
  const handleSquareClick = (sq) => {
    if (!interactive) return;

    const pieceAt = chess.get(sq);

    // If already selected and clicking a legal move destination
    if (selectedSquare && legalSquareMap.has(sq)) {
      handleAttemptMove(selectedSquare, sq);
      return;
    }

    // Clicking a piece of the current turn's color
    if (pieceAt && pieceAt.color === currentTurn) {
      if (allowedColor && pieceAt.color !== allowedColor) {
        // Not this player's color
        return;
      }
      if (selectedSquare === sq) {
        // Deselect
        setSelectedSquare(null);
      } else {
        setSelectedSquare(sq);
      }
    } else {
      // Clicked on empty or opponent piece without a valid move
      setSelectedSquare(null);
    }
  };

  // Drag and Drop
  const handleDragStart = (e, sq) => {
    if (!interactive || !isTurnAllowed) {
      e.preventDefault();
      return;
    }
    const piece = chess.get(sq);
    if (!piece || piece.color !== currentTurn) {
      e.preventDefault();
      return;
    }
    if (allowedColor && piece.color !== allowedColor) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(sq);
    setSelectedSquare(sq);
    e.dataTransfer.setData("text/plain", sq);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, sq) => {
    if (draggedSquare && legalSquareMap.has(sq)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e, sq) => {
    e.preventDefault();
    if (draggedSquare && legalSquareMap.has(sq)) {
      handleAttemptMove(draggedSquare, sq);
    }
    setDraggedSquare(null);
  };

  return (
    <div
      className="chessboard-wrapper"
      style={{
        "--light-sq": theme.light,
        "--dark-sq": theme.dark,
        "--board-border": theme.border,
        "--highlight-tint": theme.highlight,
        "--last-move-tint": theme.lastMove
      }}
    >
      <div className="chessboard-grid">
        {squares.map((sq) => {
          const file = sq[0];
          const rank = sq[1];
          const fileIdx = file.charCodeAt(0) - 97;
          const rankIdx = parseInt(rank, 10);
          const isLight = (fileIdx + rankIdx) % 2 !== 0;

          const piece = chess.get(sq);
          const isSelected = selectedSquare === sq;
          const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);
          const isCheckedKing = checkedKingSquare === sq;
          const moveData = legalSquareMap.get(sq);
          const isLegalMove = Boolean(moveData);
          const isCapture = moveData?.isCapture;

          // Rank / File label display:
          // Files on bottom row; Ranks on left column
          const isBottomRank = orientation === "w" ? rank === "1" : rank === "8";
          const isLeftFile = orientation === "w" ? file === "a" : file === "h";

          return (
            <div
              key={sq}
              className={`chess-square ${isLight ? "light" : "dark"} ${isSelected ? "selected" : ""} ${
                isLastMove ? "last-move" : ""
              } ${isCheckedKing ? "in-check" : ""}`}
              onClick={() => handleSquareClick(sq)}
              onDragOver={(e) => handleDragOver(e, sq)}
              onDrop={(e) => handleDrop(e, sq)}
              data-square={sq}
            >
              {/* Piece Rendering */}
              {piece && (
                <div
                  className={`piece-container ${piece.color === currentTurn && isTurnAllowed ? "movable" : ""}`}
                  draggable={interactive && isTurnAllowed && piece.color === currentTurn && (!allowedColor || piece.color === allowedColor)}
                  onDragStart={(e) => handleDragStart(e, sq)}
                >
                  <PieceIcon piece={piece.type} color={piece.color} style={pieceStyle} />
                </div>
              )}

              {/* Legal Move Highlighting: Empty square dot vs Eating Chess Piece hollow ring */}
              {isLegalMove && (
                <div className={`legal-marker ${isCapture ? "capture-ring" : "move-dot"}`} title={isCapture ? `Capture on ${sq}` : `Move to ${sq}`} />
              )}

              {/* Square Coordinate Indicators */}
              {showCoords && isLeftFile && <span className={`coord rank-coord ${isLight ? "dark-text" : "light-text"}`}>{rank}</span>}
              {showCoords && isBottomRank && <span className={`coord file-coord ${isLight ? "dark-text" : "light-text"}`}>{file}</span>}
            </div>
          );
        })}
      </div>

      {/* Pawn Promotion Dialog */}
      {pendingPromotion && (
        <PromotionModal
          color={pendingPromotion.color}
          pieceStyle={pieceStyle}
          onSelect={handleSelectPromotion}
          onCancel={() => setPendingPromotion(null)}
        />
      )}
    </div>
  );
}

