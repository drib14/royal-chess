import React, { useState, useEffect } from "react";
import { Search, Swords, X } from "lucide-react";
import { request } from "../../api";

export default function PlayerSearchModal({ onClose, onChallenge, notify }) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setPlayers([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const d = await request(`/players/search?q=${encodeURIComponent(query.trim())}`);
        setPlayers(d.players || []);
      } catch {
        setPlayers([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal player-search-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <span className="eyebrow">ONLINE ARENA</span>
        <h2>Challenge a Player</h2>
        <p>Search for players by username and issue a direct challenge.</p>

        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Type player username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="player-search-results">
          {searching ? (
            <p className="search-hint">Searching…</p>
          ) : players.length > 0 ? (
            players.map((p) => (
              <div key={p._id || p.id} className="player-search-item">
                <div className="player-search-info">
                  <div className="avatar-small">{p.username[0]?.toUpperCase()}</div>
                  <div>
                    <b>{p.username}</b>
                    <small>Points: {p.points || 0}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onChallenge(p._id || p.id, p.username);
                    onClose();
                  }}
                >
                  <Swords size={14} /> Challenge
                </button>
              </div>
            ))
          ) : query.length >= 2 ? (
            <p className="search-hint">No matching players found.</p>
          ) : (
            <p className="search-hint">Enter at least 2 characters to search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

