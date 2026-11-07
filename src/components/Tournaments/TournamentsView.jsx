import React, { useState } from "react";
import { Trophy, Users, Crown, Calendar, PlusCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { request } from "../../api";

export default function TournamentsView({ tournaments = [], user, onAuth, notify, refresh }) {
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    title: "",
    description: "",
    format: "single_elimination",
    startsAt: "",
    maxPlayers: 16,
    winnerPoints: 250,
    runnerUpPoints: 100,
    status: "open"
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!adminForm.title.trim()) return notify("Please provide a tournament title.");
    if (!adminForm.startsAt) return notify("Please set a tournament start date.");

    try {
      await request("/tournaments", {
        method: "POST",
        body: JSON.stringify({
          ...adminForm,
          startsAt: new Date(adminForm.startsAt).toISOString()
        })
      });
      notify("Tournament created successfully!");
      setShowAdminForm(false);
      refresh();
    } catch (err) {
      notify(err.message || "Failed to create tournament");
    }
  };

  const handleJoin = async (id) => {
    if (!user) {
      onAuth();
      return;
    }
    try {
      await request(`/tournaments/${id}/join`, { method: "POST" });
      notify("Successfully entered the tournament!");
      refresh();
    } catch (err) {
      notify(err.message || "Failed to join tournament");
    }
  };

  return (
    <div className="content-page">
      <div className="page-heading">
        <span className="eyebrow">CHAMPIONSHIP CIRCUIT</span>
        <h1>Tournaments</h1>
        <p>Compete in official arena tournaments for massive arena point bonuses and exclusive accolades.</p>
      </div>

      {!user && (
        <div className="leaderboard-guest-callout">
          <ShieldAlert size={20} className="gold" />
          <div className="callout-content">
            <b>Sign In Required</b>
            <p>Tournament participation and prize point tracking require a registered player account.</p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onAuth}>
            Sign In / Register
          </button>
        </div>
      )}

      {user?.role === "admin" && (
        <div className="admin-actions-bar">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowAdminForm(!showAdminForm)}
          >
            <PlusCircle size={16} /> {showAdminForm ? "Close Admin Form" : "Create New Tournament"}
          </button>
        </div>
      )}

      {/* Admin Tournament Creation Form */}
      {user?.role === "admin" && showAdminForm && (
        <form className="admin-panel" onSubmit={handleCreate}>
          <span className="eyebrow">ADMINISTRATION</span>
          <h2>Create Tournament</h2>
          <div className="form-row">
            <label>
              Tournament Name
              <input
                required
                value={adminForm.title}
                onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })}
                placeholder="Royal Winter Blitz Invitational"
              />
            </label>
            <label>
              Start Date & Time
              <input
                type="datetime-local"
                required
                value={adminForm.startsAt}
                onChange={(e) => setAdminForm({ ...adminForm, startsAt: e.target.value })}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Tournament Format
              <select
                value={adminForm.format}
                onChange={(e) => setAdminForm({ ...adminForm, format: e.target.value })}
              >
                <option value="single_elimination">Single Elimination</option>
                <option value="round_robin">Round Robin</option>
                <option value="swiss">Swiss System</option>
              </select>
            </label>
            <label>
              Max Players
              <input
                type="number"
                min="2"
                max="256"
                value={adminForm.maxPlayers}
                onChange={(e) => setAdminForm({ ...adminForm, maxPlayers: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Winner Arena Points
              <input
                type="number"
                min="0"
                value={adminForm.winnerPoints}
                onChange={(e) => setAdminForm({ ...adminForm, winnerPoints: Number(e.target.value) })}
              />
            </label>
            <label>
              Runner-Up Points
              <input
                type="number"
                min="0"
                value={adminForm.runnerUpPoints}
                onChange={(e) => setAdminForm({ ...adminForm, runnerUpPoints: Number(e.target.value) })}
              />
            </label>
          </div>

          <label>
            Description
            <input
              value={adminForm.description}
              onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
              placeholder="Official weekly championship open to all verified players."
            />
          </label>

          <button type="submit" className="btn btn-primary">
            Publish Tournament
          </button>
        </form>
      )}

      {/* Tournament Cards Grid */}
      <div className="tournament-grid">
        {tournaments.length > 0 ? (
          tournaments.map((t) => {
            const isRegistered = user && t.participants?.some((p) => (p._id || p.id || p) === (user._id || user.id));
            const isFull = t.participants?.length >= t.maxPlayers;
            const isOpen = t.status === "open";

            return (
              <article className="tournament-card" key={t._id || t.id}>
                <div className="tour-top">
                  <span className={`live-tag tag-${t.status}`}>
                    {t.status.replace("_", " ").toUpperCase()}
                  </span>
                  <Trophy size={20} className="gold" />
                </div>

                <h2>{t.title}</h2>
                <p>{t.description || "Compete in the official arena circuit."}</p>

                <div className="tour-meta">
                  <span>
                    <Users size={15} /> {t.participants?.length || 0} / {t.maxPlayers} Players
                  </span>
                  <span>
                    <Crown size={15} /> {t.winnerPoints} Pts Winner
                  </span>
                </div>

                <div className="tour-date">
                  <Calendar size={13} />
                  <span>{new Date(t.startsAt).toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-wide"
                  disabled={!user ? false : isRegistered || !isOpen || isFull}
                  onClick={() => (!user ? onAuth() : handleJoin(t._id || t.id))}
                >
                  {!user ? (
                    "Sign in to Join"
                  ) : isRegistered ? (
                    <>
                      <CheckCircle size={16} /> Registered
                    </>
                  ) : isFull ? (
                    "Tournament Full"
                  ) : !isOpen ? (
                    "Closed"
                  ) : (
                    "Enter Tournament"
                  )}
                </button>
              </article>
            );
          })
        ) : (
          <div className="empty-card">
            <Trophy size={42} className="gold" />
            <h3>No Scheduled Tournaments</h3>
            <p>Check back shortly or practice vs Computer to hone your tactical skills.</p>
          </div>
        )}
      </div>
    </div>
  );
}

