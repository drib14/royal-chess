import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Swords, X, Crown, User as UserIcon, Shield, Sparkles } from "lucide-react";
import { sounds } from "../../utils/sound";

const CANDIDATE_PLAYERS = [
  { username: "ApexTactics", points: 340, avatarColor: "#3b82f6" },
  { username: "QueenGambit_X", points: 520, avatarColor: "#ec4899" },
  { username: "ShadowBishop", points: 780, avatarColor: "#8b5cf6" },
  { username: "IronKnight", points: 290, avatarColor: "#f59e0b" },
  { username: "GrandmasterRex", points: 860, avatarColor: "#ef4444" },
  { username: "ValkyrieChess", points: 410, avatarColor: "#10b981" },
  { username: "TitanPawn", points: 630, avatarColor: "#6366f1" },
  { username: "DeepMind_Pro", points: 940, avatarColor: "#d9b66e" },
  { username: "BlitzStorm", points: 470, avatarColor: "#06b6d4" },
  { username: "RoyalShield", points: 310, avatarColor: "#84cc16" }
];

export default function OnlineRoulette({ user, timeControl, onMatchFound, onCancel }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matched, setMatched] = useState(false);
  const [matchedPlayer, setMatchedPlayer] = useState(null);
  const [countdown, setCountdown] = useState(3);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let step = 0;
    const totalSteps = 24 + Math.floor(Math.random() * 8); // 24-32 ticks
    let delay = 60; // Initial rapid spin

    const spin = () => {
      if (!isMountedRef.current) return;
      step++;
      setCurrentIndex((prev) => (prev + 1) % CANDIDATE_PLAYERS.length);
      sounds.play("rouletteTick");

      if (step < totalSteps) {
        // Easing deceleration: slow down as we near totalSteps
        if (step > totalSteps - 12) {
          delay += 35;
        } else if (step > totalSteps - 6) {
          delay += 75;
        }
        setTimeout(spin, delay);
      } else {
        // Match locked!
        const finalOpponent = CANDIDATE_PLAYERS[step % CANDIDATE_PLAYERS.length];
        setMatchedPlayer(finalOpponent);
        setMatched(true);
        sounds.play("matchFound");
      }
    };

    const initialTimer = setTimeout(spin, 200);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimer);
    };
  }, []);

  // Post-match countdown before entering match
  useEffect(() => {
    let countTimer;
    if (matched && matchedPlayer) {
      countTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countTimer);
            onMatchFound?.(matchedPlayer);
            return 0;
          }
          return prev - 1;
        });
      }, 900);
    }
    return () => clearInterval(countTimer);
  }, [matched, matchedPlayer]);

  const activeCandidate = matchedPlayer || CANDIDATE_PLAYERS[currentIndex];

  return (
    <div className="modal-backdrop roulette-backdrop">
      <motion.div
        className="roulette-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Top Header */}
        <div className="roulette-header">
          <div className="roulette-status-badge">
            <span className={`status-pulse-dot ${matched ? "pulse-ready" : "pulse-searching"}`} />
            <span>{matched ? "MATCH FOUND! PREPARING BOARD" : "MATCHMAKING IN ARENA…"}</span>
          </div>
          <span className="roulette-time-tag">Time Control: {timeControl?.name || "Casual"}</span>
        </div>

        {/* 8 Ball Pool Clash Arena: Player Left vs Roulette Right */}
        <div className="roulette-clash-grid">
          {/* LEFT: You */}
          <div className="roulette-player-card self-card">
            <div className="roulette-avatar self-avatar">
              <span className="avatar-letter">{user?.username?.[0]?.toUpperCase() || "Y"}</span>
              <div className="avatar-glow-ring" />
            </div>
            <h3 className="roulette-username">{user?.username || "You"}</h3>
            <div className="roulette-points">
              <Crown size={14} className="gold" />
              <span>{user?.points || 0} pts</span>
            </div>
            <span className="roulette-badge self-badge">READY</span>
          </div>

          {/* CENTER: VS Clash Emblem */}
          <div className="roulette-vs-center">
            <div className={`vs-circle ${matched ? "vs-clash" : ""}`}>
              <Swords size={28} className={matched ? "gold" : "text-slate"} />
            </div>
            <span className="vs-text">VS</span>
          </div>

          {/* RIGHT: Opponent Roulette Wheel */}
          <div className={`roulette-player-card opponent-card ${matched ? "opponent-locked" : ""}`}>
            <div
              className="roulette-avatar opp-avatar"
              style={{ borderColor: activeCandidate.avatarColor }}
            >
              <span className="avatar-letter" style={{ color: activeCandidate.avatarColor }}>
                {activeCandidate.username[0]?.toUpperCase()}
              </span>
              <div
                className="avatar-glow-ring"
                style={{
                  boxShadow: `0 0 20px ${activeCandidate.avatarColor}66`
                }}
              />
            </div>

            <div className="roulette-spinning-name-box">
              <h3 className={`roulette-username ${matched ? "name-locked" : "name-spinning"}`}>
                {activeCandidate.username}
              </h3>
            </div>

            <div className="roulette-points">
              <Crown size={14} className="gold" />
              <span>{activeCandidate.points} pts</span>
            </div>

            <span className={`roulette-badge ${matched ? "opp-badge-locked" : "opp-badge-spinning"}`}>
              {matched ? `OPPONENT FOUND (${countdown}s)` : "SPINNING…"}
            </span>
          </div>
        </div>

        {/* Cancel Button */}
        {!matched && (
          <div className="roulette-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
              <X size={15} /> Cancel Matchmaking
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

