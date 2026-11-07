import React from "react";
import { Trophy, Medal, Crown, ShieldAlert } from "lucide-react";

export default function LeaderboardView({ players = [], user, onAuth }) {
  return (
    <div className="content-page">
      <div className="page-heading">
        <span className="eyebrow">GLOBAL RANKINGS</span>
        <h1>Arena Leaderboard</h1>
        <p>Compete in rated matches, build your win streak, and claim your place among the masters.</p>
      </div>

      {!user && (
        <div className="leaderboard-guest-callout">
          <ShieldAlert size={20} className="gold" />
          <div className="callout-content">
            <b>Playing as Guest</b>
            <p>Sign in to earn arena points, record your wins, and compete for top ranks on the leaderboard.</p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onAuth}>
            Sign In / Register
          </button>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <span>RANK & PLAYER</span>
          <span>W / L / D</span>
          <span>WIN RATE</span>
          <span>ARENA POINTS</span>
        </div>

        {players.length > 0 ? (
          players.map((p, idx) => {
            const totalGames = (p.wins || 0) + (p.losses || 0) + (p.draws || 0);
            const winRate = totalGames > 0 ? Math.round(((p.wins || 0) / totalGames) * 100) : 0;
            const isCurrentUser = user && user.username === p.username;

            return (
              <div key={p._id || p.id || idx} className={`leader-row ${isCurrentUser ? "current-user-row" : ""}`}>
                <div className="rank-player">
                  <div className="rank-badge-col">
                    {idx === 0 ? (
                      <Crown size={18} className="gold" />
                    ) : idx === 1 ? (
                      <Medal size={18} style={{ color: "#cbd5e1" }} />
                    ) : idx === 2 ? (
                      <Medal size={18} style={{ color: "#d97706" }} />
                    ) : (
                      <strong className="rank-num">{String(idx + 1).padStart(2, "0")}</strong>
                    )}
                  </div>
                  <div className="player-avatar-mini">{p.username?.[0]?.toUpperCase()}</div>
                  <div className="player-names-col">
                    <b>{p.username}</b>
                    {isCurrentUser && <span className="you-pill">You</span>}
                  </div>
                </div>

                <div className="record-col">
                  <span className="stat-win">{p.wins || 0}W</span>
                  <span className="stat-sep">/</span>
                  <span className="stat-loss">{p.losses || 0}L</span>
                  <span className="stat-sep">/</span>
                  <span className="stat-draw">{p.draws || 0}D</span>
                </div>

                <div className="winrate-col">
                  <span>{winRate}%</span>
                </div>

                <div className="rating-col">
                  <strong className="gold rating-val">{p.points || 0} pts</strong>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <Trophy size={36} className="gold" />
            <p>No rated players yet. Be the first to win a match and lead the arena!</p>
          </div>
        )}
      </div>
    </div>
  );
}

