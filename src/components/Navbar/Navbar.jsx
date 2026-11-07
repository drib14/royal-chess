import React from "react";
import { Crown, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar({ page, setPage, user, onAuth, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand" onClick={() => setPage("home")}>
        <Crown size={24} className="brand-mark-icon gold" />
        <span>
          ROYAL<span className="gold">ARENA</span>
        </span>
      </div>

      <nav>
        <button
          type="button"
          className={page === "home" ? "nav active" : "nav"}
          onClick={() => setPage("home")}
        >
          Play
        </button>
        <button
          type="button"
          className={page === "leaderboard" ? "nav active" : "nav"}
          onClick={() => setPage("leaderboard")}
        >
          Leaderboard
        </button>
        <button
          type="button"
          className={page === "tournaments" ? "nav active" : "nav"}
          onClick={() => setPage("tournaments")}
        >
          Tournaments
        </button>
      </nav>

      <div className="top-actions">
        {user ? (
          <>
            <div className="user-points-badge" title="Your Arena Points">
              <Crown size={14} className="gold" />
              <span>{user.points || 0}</span>
            </div>
            <div className="avatar-pill" title={`${user.username} (${user.role})`}>
              <span className="avatar-letter">{user.username?.[0]?.toUpperCase()}</span>
              <span className="avatar-username">{user.username}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <div className="guest-actions-group">
            <span className="guest-tag">Guest</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={onAuth}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

