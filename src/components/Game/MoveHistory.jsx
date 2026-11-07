import React, { useEffect, useRef } from "react";
import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from "lucide-react";

export default function MoveHistory({
  history = [],
  currentMoveIndex = -1,
  onSelectMove,
  onFirst,
  onPrev,
  onNext,
  onLast
}) {
  const containerRef = useRef(null);

  // Group into pairs: White move, Black move
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      round: Math.floor(i / 2) + 1,
      white: history[i],
      whiteIdx: i,
      black: history[i + 1] || null,
      blackIdx: i + 1
    });
  }

  // Scroll to bottom when history grows
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div className="move-history-container">
      <div className="move-history-scroll" ref={containerRef}>
        {movePairs.length === 0 ? (
          <div className="move-history-empty">Moves will appear here as the game progresses.</div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.round} className="move-pair-row">
              <span className="move-round-num">{pair.round}.</span>
              <button
                type="button"
                className={`move-san-btn ${currentMoveIndex === pair.whiteIdx ? "active-move" : ""}`}
                onClick={() => onSelectMove(pair.whiteIdx)}
              >
                {pair.white?.san}
              </button>
              {pair.black ? (
                <button
                  type="button"
                  className={`move-san-btn ${currentMoveIndex === pair.blackIdx ? "active-move" : ""}`}
                  onClick={() => onSelectMove(pair.blackIdx)}
                >
                  {pair.black.san}
                </button>
              ) : (
                <span className="move-placeholder" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="move-nav-controls">
        <button
          type="button"
          className="move-nav-btn"
          title="Start"
          disabled={currentMoveIndex <= -1}
          onClick={onFirst}
        >
          <ChevronFirst size={16} />
        </button>
        <button
          type="button"
          className="move-nav-btn"
          title="Previous"
          disabled={currentMoveIndex <= -1}
          onClick={onPrev}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className="move-nav-btn"
          title="Next"
          disabled={currentMoveIndex >= history.length - 1}
          onClick={onNext}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className="move-nav-btn"
          title="Latest"
          disabled={currentMoveIndex >= history.length - 1}
          onClick={onLast}
        >
          <ChevronLast size={16} />
        </button>
      </div>
    </div>
  );
}

