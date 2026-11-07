import React from "react";
import CapturedPieces from "./CapturedPieces";
import { formatClock } from "../../utils/chessHelpers";
import { Bot, User as UserIcon } from "lucide-react";

export default function PlayerBar({
  name = "Player",
  points = 0,
  color = "w",
  isTurn = false,
  isThinking = false,
  isComputer = false,
  time = null,
  timed = false,
  captured = [],
  hasAdvantage = false,
  advantageDiff = 0,
  pieceStyle = "Neo"
}) {
  const isWhite = color === "w";
  const isLowTime = timed && time !== null && time <= 20;

  return (
    <div className={`player-bar-card ${isTurn ? "active-turn" : ""}`}>
      <div className="player-info-left">
        <div className={`player-avatar-badge ${isWhite ? "white-player" : "black-player"}`}>
          {isComputer ? <Bot size={20} /> : <UserIcon size={19} />}
        </div>
        <div className="player-meta-text">
          <div className="player-name-row">
            <span
              className={`color-indicator-circle ${isWhite ? "circle-white" : "circle-black"}`}
              title={isWhite ? "White Pieces" : "Black Pieces"}
            />
            <b className="player-name">{name}</b>
            {!isComputer && (
              <span className="player-points-tag">{points || 0} pts</span>
            )}
            {isThinking && (
              <span className="thinking-indicator">
                <span className="dot-pulse" /> Thinking…
              </span>
            )}
          </div>
          <CapturedPieces
            captured={captured}
            hasAdvantage={hasAdvantage}
            advantageDiff={advantageDiff}
            pieceStyle={pieceStyle}
          />
        </div>
      </div>

      {timed && (
        <div className={`digital-clock ${isTurn ? "clock-active" : ""} ${isLowTime ? "clock-low" : ""}`}>
          <span className="clock-digits">{formatClock(time)}</span>
        </div>
      )}
    </div>
  );
}
