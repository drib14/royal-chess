import React, { useState, useEffect } from "react";
import { Bot, Users, Swords, Play, Trophy, Clock3, Lock, ShieldAlert, Sparkles, Video, CheckCircle2 } from "lucide-react";
import { THEMES } from "../../constants/themes";
import { PIECE_STYLES } from "../../constants/pieces";
import { PRESETS } from "../../constants/presets";
import PieceIcon from "../Chessboard/PieceIcon";
import GoogleAdModal from "../Ads/GoogleAdModal";
import OnlineRoulette from "../Matchmaking/OnlineRoulette";
import { isVariationUnlocked, getRemainingTimeString } from "../../utils/adUnlockManager";

export default function Home({ onStart, settings, setSettings, onAuth, user, onOpenChallengeSearch }) {
  const [mode, setMode] = useState("computer");
  const [level, setLevel] = useState("Intermediate");
  const [color, setColor] = useState("w");
  const [timed, setTimed] = useState(false);
  const [presetIndex, setPresetIndex] = useState(2); // Blitz 3+0
  const [board, setBoard] = useState(settings?.board || "Green");
  const [piece, setPiece] = useState(settings?.piece || "Neo");
  const [adModalItem, setAdModalItem] = useState(null); // { type, id, label }
  const [showRoulette, setShowRoulette] = useState(false);
  const [, setUnlockTick] = useState(0);

  // Listen to unlock events across app
  useEffect(() => {
    const handleUnlock = () => setUnlockTick((t) => t + 1);
    window.addEventListener("royal_unlock_change", handleUnlock);
    return () => window.removeEventListener("royal_unlock_change", handleUnlock);
  }, []);

  const currentPreset = PRESETS[presetIndex] || PRESETS[0];

  const handleModeSelect = (selectedMode) => {
    if (selectedMode !== "computer" && !user) {
      onAuth?.();
      return;
    }
    setMode(selectedMode);
  };

  const handleBoardChange = (newBoardId) => {
    const unlocked = isVariationUnlocked("board", newBoardId);
    if (!unlocked) {
      setAdModalItem({
        type: "board",
        id: newBoardId,
        label: THEMES[newBoardId]?.label || newBoardId
      });
      return;
    }
    setBoard(newBoardId);
    setSettings?.({ ...settings, board: newBoardId });
  };

  const handlePieceChange = (newPieceId) => {
    const unlocked = isVariationUnlocked("piece", newPieceId);
    if (!unlocked) {
      const pObj = PIECE_STYLES.find((s) => s.id === newPieceId);
      setAdModalItem({
        type: "piece",
        id: newPieceId,
        label: pObj?.label || newPieceId
      });
      return;
    }
    setPiece(newPieceId);
    setSettings?.({ ...settings, piece: newPieceId });
  };

  const handleStartGame = () => {
    if (mode !== "computer" && !user) {
      onAuth?.();
      return;
    }

    // Pass & Play launches the 8 Ball Pool style online player roulette
    if (mode === "local") {
      setShowRoulette(true);
      return;
    }

    launchMatch();
  };

  const launchMatch = (matchedOpponent = null) => {
    let finalColor = color;
    if (color === "random") {
      finalColor = Math.random() > 0.5 ? "w" : "b";
    }

    const activeBoard = isVariationUnlocked("board", board) ? board : "Green";
    const activePiece = isVariationUnlocked("piece", piece) ? piece : "Neo";

    onStart({
      mode,
      level,
      color: finalColor,
      timed,
      preset: currentPreset,
      board: activeBoard,
      piece: activePiece,
      opponent: matchedOpponent
    });
  };

  const isCurrentBoardUnlocked = isVariationUnlocked("board", board);
  const isCurrentPieceUnlocked = isVariationUnlocked("piece", piece);

  return (
    <div className="home-grid">
      {/* Hero Banner */}
      <section className="hero">
        <div className="eyebrow">
          <span className="pulse" /> ROYAL ARENA CHESS
        </div>
        <h1>
          Master every square.<br />
          <em>Rule the arena.</em>
        </h1>
        <p>
          Experience authentic tournament play, dynamic visual themes, crafted piece sets, and challenging AI opponents inspired by the chess.com standard.
        </p>

        <div className="hero-stats">
          <div>
            <b>0</b>
            <span>Base Arena Pts</span>
          </div>
          <div>
            <b>14</b>
            <span>Board Themes</span>
          </div>
          <div>
            <b>7</b>
            <span>Piece Sets</span>
          </div>
        </div>

        {!user && (
          <div className="guest-banner">
            <ShieldAlert size={18} className="gold" />
            <div>
              <b>Guest Mode Active</b>
              <p>Practice vs Computer is fully unlocked. Sign in to play pass-and-play, ranked online matches, and enter tournaments.</p>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={onAuth}>
              Sign In
            </button>
          </div>
        )}
      </section>

      {/* Match Setup Card */}
      <section className="setup-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">MATCH CONFIGURATION</span>
            <h2>Game Setup</h2>
          </div>
          <span className="live-tag">● READY TO PLAY</span>
        </div>

        {/* Game Mode Selection */}
        <div className="mode-selection-label">Select Game Mode</div>
        <div className="mode-grid">
          {/* VS COMPUTER */}
          <button
            type="button"
            className={`mode-card ${mode === "computer" ? "selected" : ""}`}
            onClick={() => handleModeSelect("computer")}
          >
            <div className="mode-header">
              <Bot size={22} />
              <span className="unlocked-badge">Free</span>
            </div>
            <b>Vs Computer</b>
            <small>Practice against adaptive AI</small>
          </button>

          {/* PASS & PLAY ROULETTE */}
          <button
            type="button"
            className={`mode-card ${mode === "local" ? "selected" : ""} ${!user ? "mode-locked" : ""}`}
            onClick={() => handleModeSelect("local")}
            title={!user ? "Sign in required to play Pass & Play Roulette" : "Player roulette matchmaking"}
          >
            <div className="mode-header">
              <Users size={22} />
              {!user && (
                <span className="lock-badge">
                  <Lock size={11} /> Locked
                </span>
              )}
            </div>
            <b>Pass & Play Roulette</b>
            <small>{user ? "Online player roulette wheel" : "Sign in to unlock"}</small>
          </button>

          {/* ONLINE ARENA */}
          <button
            type="button"
            className={`mode-card ${mode === "online" ? "selected" : ""} ${!user ? "mode-locked" : ""}`}
            onClick={() => handleModeSelect("online")}
            title={!user ? "Sign in required for online matchmaking" : "Find an opponent online"}
          >
            <div className="mode-header">
              <Swords size={22} />
              {!user && (
                <span className="lock-badge">
                  <Lock size={11} /> Locked
                </span>
              )}
            </div>
            <b>Online Points Match</b>
            <small>{user ? "Quick match & challenges" : "Sign in to unlock"}</small>
          </button>
        </div>

        {/* Form Options: Bot Difficulty is strictly disabled for non-bot modes */}
        <div className="form-row">
          <label className={mode !== "computer" ? "field-disabled" : ""}>
            <div className="label-title-row">
              <span>Bot Difficulty</span>
              {mode !== "computer" && <span className="field-disabled-tag">Disabled (Only for Bots)</span>}
            </div>
            <select
              value={level}
              disabled={mode !== "computer"}
              onChange={(e) => setLevel(e.target.value)}
              title={mode !== "computer" ? "Bot difficulty is only applicable when playing Vs Computer" : "Select difficulty"}
            >
              <option value="Beginner">Beginner (Novice)</option>
              <option value="Intermediate">Intermediate (Standard)</option>
              <option value="Advanced">Advanced (Tactical)</option>
              <option value="Expert">Expert (Grandmaster)</option>
            </select>
          </label>

          <label>
            Play As
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="w">White (First Move)</option>
              <option value="b">Black</option>
              <option value="random">Random Color</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Time Control
            <select
              value={timed ? presetIndex : "none"}
              onChange={(e) => {
                if (e.target.value === "none") {
                  setTimed(false);
                } else {
                  setTimed(true);
                  setPresetIndex(Number(e.target.value));
                }
              }}
            >
              <option value="none">Untimed (Casual Practice)</option>
              {PRESETS.map((p, i) => (
                <option key={p.name} value={i}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </label>

          <div className="empty-field-slot" />
        </div>

        {/* Board & Piece Variations with Previews and Google Ad Unlocks */}
        <div className="form-row">
          <label>
            <div className="label-with-ad-row">
              <span className="label-text-with-lock">
                Board Theme
                {!isCurrentBoardUnlocked && <Lock size={12} className="lock-icon-gold" />}
              </span>
              {!isCurrentBoardUnlocked && (
                <button
                  type="button"
                  className="unlock-ad-pill"
                  onClick={() =>
                    setAdModalItem({
                      type: "board",
                      id: board,
                      label: THEMES[board]?.label || board
                    })
                  }
                >
                  <Lock size={11} /> Watch Ad (24h)
                </button>
              )}
            </div>
            <div className="theme-select-wrapper">
              <select value={board} onChange={(e) => handleBoardChange(e.target.value)}>
                {Object.keys(THEMES).map((key) => {
                  const unlocked = isVariationUnlocked("board", key);
                  const rem = getRemainingTimeString("board", key);
                  return (
                    <option key={key} value={key}>
                      {THEMES[key].label} {!unlocked ? " (Locked)" : rem ? ` (${rem})` : ""}
                    </option>
                  );
                })}
              </select>
              {/* Mini Color Swatch */}
              <div className="theme-mini-swatch" title="Theme Preview">
                <span style={{ background: THEMES[board]?.light || "#eeeed2" }} />
                <span style={{ background: THEMES[board]?.dark || "#769656" }} />
              </div>
            </div>
          </label>

          <label>
            <div className="label-with-ad-row">
              <span className="label-text-with-lock">
                Piece Style
                {!isCurrentPieceUnlocked && <Lock size={12} className="lock-icon-gold" />}
              </span>
              {!isCurrentPieceUnlocked && (
                <button
                  type="button"
                  className="unlock-ad-pill"
                  onClick={() => {
                    const pObj = PIECE_STYLES.find((s) => s.id === piece);
                    setAdModalItem({
                      type: "piece",
                      id: piece,
                      label: pObj?.label || piece
                    });
                  }}
                >
                  <Lock size={11} /> Watch Ad (24h)
                </button>
              )}
            </div>
            <div className="piece-select-wrapper">
              <select value={piece} onChange={(e) => handlePieceChange(e.target.value)}>
                {PIECE_STYLES.map((s) => {
                  const unlocked = isVariationUnlocked("piece", s.id);
                  const rem = getRemainingTimeString("piece", s.id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.label} {!unlocked ? " (Locked)" : rem ? ` (${rem})` : ""}
                    </option>
                  );
                })}
              </select>
              <div className="piece-mini-preview" title="Piece Preview">
                <PieceIcon piece="n" color="w" style={piece} size="24px" />
                <PieceIcon piece="n" color="b" style={piece} size="24px" />
              </div>
            </div>
          </label>
        </div>

        {/* Start Action */}
        <div className="setup-actions">
          <button type="button" className="btn btn-primary btn-wide" onClick={handleStartGame}>
            <Play size={18} fill="currentColor" />
            {mode === "computer"
              ? "Start vs Computer"
              : !user
              ? "Sign in to Play"
              : mode === "online"
              ? "Find Quick Match"
              : "Spin Roulette & Play"}
          </button>

          {user && mode === "online" && (
            <button
              type="button"
              className="btn btn-outline"
              title="Challenge a specific player"
              onClick={onOpenChallengeSearch}
            >
              <Swords size={18} /> Direct Challenge
            </button>
          )}
        </div>
      </section>

      {/* Feature Strip */}
      <section className="feature-strip">
        <div>
          <Trophy />
          <b>Authentic Chess Engine</b>
          <span>Minimax with Alpha-Beta pruning and calibrated tactical tiers.</span>
        </div>
        <div>
          <Clock3 />
          <b>Precision Time Controls</b>
          <span>Official Bullet, Blitz, Rapid, and Classical increments.</span>
        </div>
        <div>
          <Sparkles />
          <b>Chess.com Highlighting</b>
          <span>Target rings for captures, smooth move dots, and check indicators.</span>
        </div>
      </section>

      {/* 8 Ball Pool Style Online Player Roulette */}
      {showRoulette && (
        <OnlineRoulette
          user={user}
          timeControl={timed ? currentPreset : null}
          onMatchFound={(opponent) => {
            setShowRoulette(false);
            launchMatch(opponent);
          }}
          onCancel={() => setShowRoulette(false)}
        />
      )}

      {/* Google Ad Rewarded Modal */}
      {adModalItem && (
        <GoogleAdModal
          item={adModalItem}
          onClose={() => setAdModalItem(null)}
          onUnlocked={(type, id) => {
            if (type === "board") {
              setBoard(id);
              setSettings?.({ ...settings, board: id });
            } else {
              setPiece(id);
              setSettings?.({ ...settings, piece: id });
            }
          }}
        />
      )}
    </div>
  );
}
