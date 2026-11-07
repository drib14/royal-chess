import React, { useState, useEffect, useRef, useMemo } from "react";
import { Chess } from "chess.js";
import Chessboard from "../Chessboard/Chessboard";
import EvalBar from "../Chessboard/EvalBar";
import PlayerBar from "./PlayerBar";
import MoveHistory from "./MoveHistory";
import GameOverModal from "./GameOverModal";
import GoogleAdModal from "../Ads/GoogleAdModal";
import { THEMES } from "../../constants/themes";
import { PIECE_STYLES } from "../../constants/pieces";
import { sounds } from "../../utils/sound";
import { getComputerMove } from "../../utils/botEngine";
import { getCapturedPieces } from "../../utils/chessHelpers";
import { isVariationUnlocked, getRemainingTimeString } from "../../utils/adUnlockManager";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Flag,
  Handshake,
  ArrowLeft,
  Palette,
  Undo2,
  BarChart2,
  Video
} from "lucide-react";

export default function GameView({
  config,
  user,
  socket,
  notify,
  onExit,
  settings,
  setSettings
}) {
  const [chess, setChess] = useState(() => new Chess());
  const [fen, setFen] = useState(() => new Chess().fen());
  const [history, setHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  // Review history state
  const [viewMoveIndex, setViewMoveIndex] = useState(-1);
  const [displayChess, setDisplayChess] = useState(() => new Chess());

  // Clocks
  const baseSeconds = config.timed && config.preset ? config.preset.base * 60 : 0;
  const incSeconds = config.timed && config.preset ? config.preset.inc : 0;
  const [whiteTime, setWhiteTime] = useState(baseSeconds);
  const [blackTime, setBlackTime] = useState(baseSeconds);

  // Status & Outcomes
  const [gameEnded, setGameEnded] = useState(false);
  const [endResult, setEndResult] = useState(null); // "1-0", "0-1", "1/2-1/2"
  const [endReason, setEndReason] = useState("");
  const [winnerName, setWinnerName] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [pointsChange, setPointsChange] = useState(null);

  // Dialogs
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [drawOfferedByOpponent, setDrawOfferedByOpponent] = useState(false);
  const [drawOfferPending, setDrawOfferPending] = useState(false);
  const [adModalItem, setAdModalItem] = useState(null);

  // Online Room State
  const [room, setRoom] = useState(null);
  const [onlineOpponent, setOnlineOpponent] = useState(null);
  const [onlineColor, setOnlineColor] = useState("w");
  const [waitingForOpponent, setWaitingForOpponent] = useState(config.mode === "online");

  // Bot State
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Sound, Eval bar & Board customizer
  const [soundEnabled, setSoundEnabled] = useState(settings?.sound ?? true);
  const [showEvalBar, setShowEvalBar] = useState(true);
  const [boardTheme, setBoardTheme] = useState(config.board || settings?.board || "Green");
  const [pieceStyle, setPieceStyle] = useState(config.piece || settings?.piece || "Neo");

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      if (e.key === "ArrowLeft") jumpPrev();
      if (e.key === "ArrowRight") jumpNext();
      if (e.key === "ArrowUp") jumpToFirst();
      if (e.key === "ArrowDown") jumpToLast();
      if (e.key === "f" || e.key === "F") setOrientation((o) => (o === "w" ? "b" : "w"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMoveIndex, history.length]);

  // Determine user orientation and allowed colors
  const initialOrientation = useMemo(() => {
    if (config.mode === "computer") {
      return config.color === "b" ? "b" : "w";
    }
    return "w";
  }, [config.mode, config.color]);

  const [orientation, setOrientation] = useState(initialOrientation);

  const userColor = useMemo(() => {
    if (config.mode === "computer") return config.color === "b" ? "b" : "w";
    if (config.mode === "online") return onlineColor;
    return null; // Both in local
  }, [config.mode, config.color, onlineColor]);

  // Sync sounds state
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Online Socket Listeners
  useEffect(() => {
    if (config.mode !== "online" || !socket) return;

    socket.emit("quickmatch:join", { timeControl: config.timed ? config.preset : null });

    const handleReady = (data) => {
      setRoom(data.room);
      const me = data.players.find((p) => p.username === user?.username);
      const opp = data.players.find((p) => p.username !== user?.username);
      const myColor = me?.color || "w";

      setOnlineColor(myColor);
      setOrientation(myColor);
      setOnlineOpponent(opp || { username: "Opponent", points: 0 });
      setWaitingForOpponent(false);
      notify("Match found! Game on.");
      sounds.play("move");
    };

    const handleState = (data) => {
      const next = new Chess(data.fen);
      setChess(next);
      setFen(data.fen);
      setHistory(next.history({ verbose: true }));
      setViewMoveIndex(-1);
      setDisplayChess(next);

      if (data.move) {
        setLastMove({ from: data.move.from, to: data.move.to });
        if (data.move.captured) {
          sounds.play("capture");
        } else if (data.move.san.includes("+") || data.move.san.includes("#")) {
          sounds.play("check");
        } else if (data.move.san.includes("O-O")) {
          sounds.play("castle");
        } else {
          sounds.play("move");
        }
      }

      if (data.gameOver) {
        setGameEnded(true);
        setEndResult(data.result);
        setEndReason(data.endReason || "Checkmate");
        setShowEndModal(true);
        sounds.play("gameEnd");
      }
    };

    const handleEnded = (data) => {
      setGameEnded(true);
      setEndResult(data.result);
      setEndReason(data.endReason);
      setWinnerName(data.winner);
      setShowEndModal(true);
      sounds.play("gameEnd");
    };

    const handleDrawOffered = (data) => {
      setDrawOfferedByOpponent(true);
      notify(`${data.from} offered a draw.`);
    };

    const handleDrawDeclined = () => {
      setDrawOfferPending(false);
      notify("Draw offer declined.");
    };

    const handleError = (data) => {
      notify(data.message || "Game error");
    };

    socket.on("game:ready", handleReady);
    socket.on("game:state", handleState);
    socket.on("game:ended", handleEnded);
    socket.on("game:draw_offered", handleDrawOffered);
    socket.on("game:draw_declined", handleDrawDeclined);
    socket.on("game:error", handleError);

    return () => {
      socket.off("game:ready", handleReady);
      socket.off("game:state", handleState);
      socket.off("game:ended", handleEnded);
      socket.off("game:draw_offered", handleDrawOffered);
      socket.off("game:draw_declined", handleDrawDeclined);
      socket.off("game:error", handleError);
    };
  }, [config.mode, socket, user]);

  // Clocks countdown
  useEffect(() => {
    if (!config.timed || gameEnded || waitingForOpponent) return;

    const interval = setInterval(() => {
      if (chess.turn() === "w") {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleTimeout("w");
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleTimeout("b");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.timed, gameEnded, waitingForOpponent, fen]);

  // Timeout handler
  const handleTimeout = (color) => {
    setGameEnded(true);
    const winResult = color === "w" ? "0-1" : "1-0";
    setEndResult(winResult);
    setEndReason(`${color === "w" ? "White" : "Black"} ran out of time`);
    setWinnerName(color === "w" ? (config.mode === "computer" && userColor === "w" ? `Computer (${config.level})` : "Black") : "White");
    setShowEndModal(true);
    sounds.play("gameEnd");

    if (config.mode === "online" && room) {
      socket?.emit("game:timeout", { room, timedOutColor: color });
    }
  };

  // Computer Bot Turn Trigger
  useEffect(() => {
    if (config.mode !== "computer" || gameEnded || chess.isGameOver()) return;

    const humanColor = config.color === "b" ? "b" : "w";
    const botColor = humanColor === "w" ? "b" : "w";

    if (chess.turn() === botColor) {
      setIsBotThinking(true);
      const delay = 450 + Math.random() * 450;
      const timer = setTimeout(() => {
        executeBotMove();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [fen, config.mode, config.color, gameEnded]);

  const executeBotMove = () => {
    try {
      const bestMove = getComputerMove(chess, config.level);
      if (!bestMove) return;

      const moveResult = chess.move(bestMove);
      if (moveResult) {
        setIsBotThinking(false);
        handlePostMove(moveResult);
      }
    } catch {
      setIsBotThinking(false);
    }
  };

  // Execute Move
  const handleMove = (from, to, promotion = "q") => {
    if (gameEnded) return;

    if (viewMoveIndex !== -1) {
      setViewMoveIndex(-1);
      setDisplayChess(chess);
    }

    try {
      const moveResult = chess.move({ from, to, promotion });
      if (!moveResult) return;

      if (config.mode === "online" && room) {
        socket?.emit("game:move", { room, from, to, promotion });
      }

      handlePostMove(moveResult);
    } catch {
      // Handled silently
    }
  };

  const handlePostMove = (moveResult) => {
    const next = new Chess(chess.fen());
    setChess(next);
    setFen(next.fen());
    const hist = next.history({ verbose: true });
    setHistory(hist);
    setLastMove({ from: moveResult.from, to: moveResult.to });
    setViewMoveIndex(-1);
    setDisplayChess(next);

    if (config.timed && incSeconds > 0) {
      if (moveResult.color === "w") {
        setWhiteTime((t) => t + incSeconds);
      } else {
        setBlackTime((t) => t + incSeconds);
      }
    }

    if (moveResult.captured) {
      sounds.play("capture");
    } else if (moveResult.san.includes("+") || moveResult.san.includes("#")) {
      sounds.play("check");
    } else if (moveResult.san.includes("O-O")) {
      sounds.play("castle");
    } else if (moveResult.flags.includes("p") || moveResult.flags.includes("cp")) {
      sounds.play("promote");
    } else {
      sounds.play("move");
    }

    if (next.isGameOver()) {
      setGameEnded(true);
      let res = "1/2-1/2";
      let rsn = "Draw";
      let winner = null;

      if (next.isCheckmate()) {
        res = next.turn() === "w" ? "0-1" : "1-0";
        rsn = "Checkmate";
        winner = res === "1-0" ? "White" : "Black";
      } else if (next.isStalemate()) {
        rsn = "Stalemate";
      } else if (next.isThreefoldRepetition()) {
        rsn = "Threefold Repetition";
      } else if (next.isInsufficientMaterial()) {
        rsn = "Insufficient Material";
      }

      setEndResult(res);
      setEndReason(rsn);
      setWinnerName(winner);
      setShowEndModal(true);
      sounds.play("gameEnd");
    }
  };

  // Undo Move (Takeback in Vs Computer)
  const handleUndoMove = () => {
    if (config.mode !== "computer" || gameEnded || history.length === 0) return;
    const humanColor = config.color === "b" ? "b" : "w";
    const undoCount = chess.turn() === humanColor ? 2 : 1;
    for (let i = 0; i < undoCount; i++) {
      chess.undo();
    }
    const next = new Chess(chess.fen());
    setChess(next);
    setDisplayChess(next);
    setFen(next.fen());
    const hist = next.history({ verbose: true });
    setHistory(hist);
    if (hist.length > 0) {
      setLastMove({ from: hist[hist.length - 1].from, to: hist[hist.length - 1].to });
    } else {
      setLastMove(null);
    }
    setViewMoveIndex(-1);
    sounds.play("move");
    notify("Move undone.");
  };

  // Move History Navigation (Inspection)
  const jumpToMove = (index) => {
    if (index < 0 || index >= history.length) return;
    const temp = new Chess();
    for (let i = 0; i <= index; i++) {
      temp.move(history[i]);
    }
    setDisplayChess(temp);
    setViewMoveIndex(index);
    if (index >= 0) {
      setLastMove({ from: history[index].from, to: history[index].to });
    }
  };

  const jumpToFirst = () => {
    setDisplayChess(new Chess());
    setViewMoveIndex(-2);
    setLastMove(null);
  };

  const jumpToLast = () => {
    setDisplayChess(chess);
    setViewMoveIndex(-1);
    if (history.length) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    }
  };

  const jumpPrev = () => {
    const cur = viewMoveIndex === -1 ? history.length - 1 : viewMoveIndex;
    if (cur > 0) {
      jumpToMove(cur - 1);
    } else if (cur === 0) {
      jumpToFirst();
    }
  };

  const jumpNext = () => {
    if (viewMoveIndex === -2) {
      jumpToMove(0);
    } else if (viewMoveIndex >= 0 && viewMoveIndex < history.length - 1) {
      jumpToMove(viewMoveIndex + 1);
    } else {
      jumpToLast();
    }
  };

  // Resignation
  const handleResign = () => {
    if (gameEnded) return;
    setGameEnded(true);
    const winResult = userColor === "w" ? "0-1" : "1-0";
    setEndResult(winResult);
    setEndReason("Resignation");
    setWinnerName(userColor === "w" ? "Black" : "White");
    setShowResignConfirm(false);
    setShowEndModal(true);
    sounds.play("gameEnd");

    if (config.mode === "online" && room) {
      socket?.emit("game:resign", { room });
    }
  };

  // Draw Offer
  const handleOfferDraw = () => {
    if (config.mode === "online" && room) {
      setDrawOfferPending(true);
      socket?.emit("game:draw_offer", { room });
      notify("Draw offer sent.");
    } else {
      setGameEnded(true);
      setEndResult("1/2-1/2");
      setEndReason("Draw by agreement");
      setShowEndModal(true);
      sounds.play("gameEnd");
    }
  };

  const handleAcceptDraw = () => {
    setDrawOfferedByOpponent(false);
    setGameEnded(true);
    setEndResult("1/2-1/2");
    setEndReason("Draw by mutual agreement");
    setShowEndModal(true);
    sounds.play("gameEnd");
    if (config.mode === "online" && room) {
      socket?.emit("game:draw_accept", { room });
    }
  };

  const handleDeclineDraw = () => {
    setDrawOfferedByOpponent(false);
    if (config.mode === "online" && room) {
      socket?.emit("game:draw_decline", { room });
    }
  };

  // Rematch / Play Again
  const handlePlayAgain = () => {
    const fresh = new Chess();
    setChess(fresh);
    setDisplayChess(fresh);
    setFen(fresh.fen());
    setHistory([]);
    setLastMove(null);
    setViewMoveIndex(-1);
    setWhiteTime(baseSeconds);
    setBlackTime(baseSeconds);
    setGameEnded(false);
    setEndResult(null);
    setEndReason("");
    setWinnerName(null);
    setShowEndModal(false);

    if (config.mode === "online") {
      setWaitingForOpponent(true);
      socket?.emit("quickmatch:join", { timeControl: config.timed ? config.preset : null });
    }
  };

  // Captured pieces and advantages
  const activeChessForBoard = viewMoveIndex === -1 ? chess : displayChess;
  const capturedData = useMemo(() => getCapturedPieces(activeChessForBoard), [activeChessForBoard]);

  // Theme configuration
  const currentTheme = THEMES[boardTheme] || THEMES.Green;

  // Determine who is top and bottom
  const isBottomWhite = orientation === "w";
  const topColor = isBottomWhite ? "b" : "w";
  const bottomColor = isBottomWhite ? "w" : "b";

  const topName = useMemo(() => {
    if (config.mode === "computer") {
      return `Computer · ${config.level}`;
    }
    if (config.mode === "online") {
      return onlineOpponent?.username || "Opponent";
    }
    if (config.opponent) {
      return config.opponent.username;
    }
    return isBottomWhite ? "Black" : "White";
  }, [config.mode, config.level, onlineOpponent, config.opponent, isBottomWhite]);

  const topPoints = config.mode === "online" ? onlineOpponent?.points || 0 : (config.opponent?.points || 0);
  const bottomName = user?.username || (config.mode === "local" ? (isBottomWhite ? "White" : "Black") : "You");
  const bottomPoints = user?.points || 0;

  return (
    <div className="game-view-container">
      {/* Top action header */}
      <div className="game-header-bar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}>
          <ArrowLeft size={16} /> Lobby
        </button>

        <div className="game-type-badge">
          <span className="game-mode-tag">
            {config.mode === "computer" ? "VS COMPUTER" : config.mode === "online" ? "ONLINE ARENA" : "LOCAL PASS & PLAY"}
          </span>
          <span className="dot-sep">·</span>
          <span className="game-time-tag">{config.timed ? config.preset?.name : "UNTIMED"}</span>
        </div>

        <div className="game-header-actions">
          <button
            type="button"
            className={`icon-btn ${showEvalBar ? "active-icon-btn" : ""}`}
            title={showEvalBar ? "Hide advantage bar" : "Show advantage bar"}
            onClick={() => setShowEvalBar(!showEvalBar)}
          >
            <BarChart2 size={18} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="game-arena-grid">
        {/* Left Column: Top Player, Chessboard (with EvalBar), Bottom Player */}
        <div className="board-column-wrapper">
          {/* Top Player Bar */}
          <PlayerBar
            name={topName}
            points={topPoints}
            color={topColor}
            isTurn={chess.turn() === topColor && !gameEnded}
            isThinking={config.mode === "computer" && chess.turn() === topColor && isBotThinking}
            isComputer={config.mode === "computer"}
            time={topColor === "w" ? whiteTime : blackTime}
            timed={config.timed}
            captured={topColor === "w" ? capturedData.whiteCaptured : capturedData.blackCaptured}
            hasAdvantage={capturedData.leader === topColor}
            advantageDiff={capturedData.diff}
            pieceStyle={pieceStyle}
          />

          {/* Board row with optional EvalBar */}
          <div className="board-eval-row">
            {showEvalBar && !waitingForOpponent && (
              <EvalBar chess={activeChessForBoard} orientation={orientation} />
            )}

            {waitingForOpponent ? (
              <div className="board-waiting-overlay">
                <div className="waiting-spinner" />
                <h3>Searching for opponent…</h3>
                <p>Time Control: {config.timed ? config.preset?.name : "Casual"}</p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    socket?.emit("quickmatch:cancel");
                    onExit();
                  }}
                >
                  Cancel Matchmaking
                </button>
              </div>
            ) : (
              <Chessboard
                chess={activeChessForBoard}
                theme={currentTheme}
                pieceStyle={pieceStyle}
                orientation={orientation}
                interactive={!gameEnded && viewMoveIndex === -1 && !waitingForOpponent}
                allowedColor={userColor}
                lastMove={lastMove}
                onMove={handleMove}
                showCoords={settings?.coords ?? true}
              />
            )}
          </div>

          {/* Bottom Player Bar (Self / Local) */}
          <PlayerBar
            name={bottomName}
            points={bottomPoints}
            color={bottomColor}
            isTurn={chess.turn() === bottomColor && !gameEnded}
            isThinking={false}
            isComputer={false}
            time={bottomColor === "w" ? whiteTime : blackTime}
            timed={config.timed}
            captured={bottomColor === "w" ? capturedData.whiteCaptured : capturedData.blackCaptured}
            hasAdvantage={capturedData.leader === bottomColor}
            advantageDiff={capturedData.diff}
            pieceStyle={pieceStyle}
          />
        </div>

        {/* Right Column: Game Controls, Move History, Customization */}
        <aside className="game-sidebar-panel">
          {/* Status & Review indicator */}
          <div className="sidebar-section-card">
            <div className="match-status-row">
              <span className={`status-orb ${gameEnded ? "orb-ended" : "orb-live"}`} />
              <b>
                {viewMoveIndex !== -1
                  ? `Viewing move #${viewMoveIndex + 1}`
                  : gameEnded
                  ? `Game Over · ${endReason}`
                  : `${chess.turn() === "w" ? "White" : "Black"} to move`}
              </b>
            </div>

            {viewMoveIndex !== -1 && (
              <button type="button" className="btn btn-primary btn-sm btn-wide" onClick={jumpToLast}>
                Return to Live Board
              </button>
            )}

            {/* Quick in-game actions */}
            <div className="game-action-buttons">
              <button
                type="button"
                className="action-pill-btn"
                onClick={() => setOrientation((o) => (o === "w" ? "b" : "w"))}
                title="Flip board view (HotKey: F)"
              >
                <RotateCcw size={15} /> Flip
              </button>

              {config.mode === "computer" && (
                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={handleUndoMove}
                  disabled={gameEnded || history.length === 0}
                  title="Takeback move"
                >
                  <Undo2 size={15} /> Undo
                </button>
              )}

              <button
                type="button"
                className="action-pill-btn"
                onClick={handleOfferDraw}
                disabled={gameEnded || drawOfferPending}
                title="Offer a draw"
              >
                <Handshake size={15} /> Draw
              </button>

              <button
                type="button"
                className="action-pill-btn resign-pill"
                onClick={() => setShowResignConfirm(true)}
                disabled={gameEnded}
                title="Resign game"
              >
                <Flag size={15} /> Resign
              </button>
            </div>
          </div>

          {/* Draw offer notification banner */}
          {drawOfferedByOpponent && (
            <div className="draw-offer-banner">
              <span>Opponent has offered a draw. Accept?</span>
              <div className="banner-btns">
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAcceptDraw}>
                  Accept
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleDeclineDraw}>
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Move History Table */}
          <div className="sidebar-section-card history-card">
            <div className="card-title-row">
              <span className="card-eyebrow">MOVE NOTATION</span>
            </div>
            <MoveHistory
              history={history}
              currentMoveIndex={viewMoveIndex === -1 ? history.length - 1 : viewMoveIndex}
              onSelectMove={jumpToMove}
              onFirst={jumpToFirst}
              onPrev={jumpPrev}
              onNext={jumpNext}
              onLast={jumpToLast}
            />
          </div>

          {/* Live Customization Card (Board & Piece variations with Ad unlock) */}
          <div className="sidebar-section-card theme-selector-card">
            <div className="card-title-row">
              <Palette size={14} />
              <span className="card-eyebrow">VARIATION THEMES</span>
            </div>

            <div className="customizer-row">
              <label>Board</label>
              <select
                value={boardTheme}
                onChange={(e) => {
                  const bId = e.target.value;
                  if (!isVariationUnlocked("board", bId)) {
                    setAdModalItem({
                      type: "board",
                      id: bId,
                      label: THEMES[bId]?.label || bId
                    });
                    return;
                  }
                  setBoardTheme(bId);
                  setSettings?.({ ...settings, board: bId });
                }}
              >
                {Object.keys(THEMES).map((k) => {
                  const unlocked = isVariationUnlocked("board", k);
                  const tag = unlocked ? "" : " (Locked)";
                  return (
                    <option key={k} value={k}>
                      {THEMES[k].label}{tag}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="customizer-row">
              <label>Piece</label>
              <select
                value={pieceStyle}
                onChange={(e) => {
                  const pId = e.target.value;
                  if (!isVariationUnlocked("piece", pId)) {
                    const pObj = PIECE_STYLES.find((s) => s.id === pId);
                    setAdModalItem({
                      type: "piece",
                      id: pId,
                      label: pObj?.label || pId
                    });
                    return;
                  }
                  setPieceStyle(pId);
                  setSettings?.({ ...settings, piece: pId });
                }}
              >
                {PIECE_STYLES.map((s) => {
                  const unlocked = isVariationUnlocked("piece", s.id);
                  const tag = unlocked ? "" : " (Locked)";
                  return (
                    <option key={s.id} value={s.id}>
                      {s.label}{tag}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </aside>
      </div>

      {/* Resignation Confirmation Modal */}
      {showResignConfirm && (
        <div className="modal-backdrop" onClick={() => setShowResignConfirm(false)}>
          <div className="modal-confirm-card" onClick={(e) => e.stopPropagation()}>
            <Flag size={32} className="text-gold" />
            <h3>Resign Game?</h3>
            <p>Are you sure you want to resign? This will count as a defeat.</p>
            <div className="confirm-btn-row">
              <button type="button" className="btn btn-outline" onClick={() => setShowResignConfirm(false)}>
                Continue Playing
              </button>
              <button type="button" className="btn btn-danger" onClick={handleResign}>
                Confirm Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showEndModal && (
        <GameOverModal
          result={endResult}
          reason={endReason}
          winnerName={winnerName}
          userColor={userColor}
          mode={config.mode}
          pointsChange={pointsChange}
          onPlayAgain={handlePlayAgain}
          onClose={() => setShowEndModal(false)}
          onExit={onExit}
        />
      )}

      {/* Google Ad Rewarded Modal */}
      {adModalItem && (
        <GoogleAdModal
          item={adModalItem}
          onClose={() => setAdModalItem(null)}
          onUnlocked={(type, id) => {
            if (type === "board") {
              setBoardTheme(id);
              setSettings?.({ ...settings, board: id });
            } else {
              setPieceStyle(id);
              setSettings?.({ ...settings, piece: id });
            }
          }}
        />
      )}
    </div>
  );
}
