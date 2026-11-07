import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Lobby/Home";
import GameView from "./components/Game/GameView";
import LeaderboardView from "./components/Leaderboard/LeaderboardView";
import TournamentsView from "./components/Tournaments/TournamentsView";
import AuthModal from "./components/Auth/AuthModal";
import PlayerSearchModal from "./components/Lobby/PlayerSearchModal";
import { request, getToken } from "./api";
import { PRESETS } from "./constants/presets";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [settings, setSettings] = useState({
    board: "Green",
    piece: "Neo",
    sound: true,
    coords: true
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameConfig, setGameConfig] = useState({
    mode: "computer",
    level: "Intermediate",
    color: "w",
    timed: false,
    preset: PRESETS[2],
    board: "Green",
    piece: "Neo"
  });
  const [gameKey, setGameKey] = useState(0);
  const [challengeReceived, setChallengeReceived] = useState(null);

  const socketRef = useRef(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  // Fetch authenticated user on load
  useEffect(() => {
    if (!getToken()) return;
    request("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => {
        localStorage.removeItem("royal_token");
        setUser(null);
      });
  }, []);

  // Fetch leaderboard and tournaments when viewing those tabs
  const loadTournaments = () => {
    request("/tournaments")
      .then((d) => setTournaments(d.tournaments || []))
      .catch(() => {});
  };

  const loadLeaderboard = () => {
    request("/players/leaderboard")
      .then((d) => setLeaderboard(d.players || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (page === "leaderboard") loadLeaderboard();
    if (page === "tournaments") loadTournaments();
  }, [page]);

  // Socket connection when user is authenticated
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      auth: { token: getToken() }
    });
    socketRef.current = socket;

    socket.on("challenge:received", (data) => {
      setChallengeReceived(data);
    });

    socket.on("challenge:sent", () => {
      notify("Direct challenge sent to player!");
    });

    socket.on("challenge:error", (e) => {
      notify(e.message || "Challenge failed");
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Start game
  const startGame = (config) => {
    setGameConfig(config);
    setPage("game");
    setGameKey((k) => k + 1);
  };

  // Auth actions
  const login = async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("royal_token", data.token);
    setUser(data.user);
    setAuthOpen(false);
    notify(`Welcome back, ${data.user.username}!`);
  };

  const register = async (username, email, password, adminCode) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, adminCode })
    });
    localStorage.setItem("royal_token", data.token);
    setUser(data.user);
    setAuthOpen(false);
    notify(`Welcome to Royal Arena, ${data.user.username}!`);
  };

  const logout = () => {
    localStorage.removeItem("royal_token");
    setUser(null);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    // If currently in an online game or restricted mode, exit to lobby
    if (page === "game" && gameConfig.mode !== "computer") {
      setPage("home");
    }
    notify("Signed out successfully");
  };

  const handleSendChallenge = (targetUserId, targetUsername) => {
    if (!socketRef.current) {
      notify("Online connection unavailable.");
      return;
    }
    socketRef.current.emit("challenge:send", { targetUserId });
  };

  const handleAcceptChallenge = () => {
    if (!challengeReceived || !socketRef.current) return;
    socketRef.current.emit("challenge:accept", {
      challengeId: challengeReceived.challengeId
    });
    setChallengeReceived(null);
    startGame({
      ...gameConfig,
      mode: "online"
    });
  };

  return (
    <div className="app-shell">
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        onAuth={() => setAuthOpen(true)}
        onLogout={logout}
      />

      <main>
        {page === "home" && (
          <Home
            onStart={startGame}
            settings={settings}
            setSettings={setSettings}
            onAuth={() => setAuthOpen(true)}
            user={user}
            onOpenChallengeSearch={() => setSearchOpen(true)}
          />
        )}

        {page === "game" && (
          <GameView
            key={gameKey}
            config={gameConfig}
            user={user}
            socket={socketRef.current}
            notify={notify}
            onExit={() => setPage("home")}
            settings={settings}
            setSettings={setSettings}
          />
        )}

        {page === "leaderboard" && (
          <LeaderboardView
            players={leaderboard}
            user={user}
            onAuth={() => setAuthOpen(true)}
          />
        )}

        {page === "tournaments" && (
          <TournamentsView
            tournaments={tournaments}
            user={user}
            onAuth={() => setAuthOpen(true)}
            notify={notify}
            refresh={loadTournaments}
          />
        )}
      </main>

      <footer>
        ROYAL ARENA <span>·</span> CHESS.COM CLONE & TOURNAMENT ENGINE <span>·</span> THINK. MOVE. CONQUER.
      </footer>

      {/* Floating Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {authOpen && (
          <AuthModal
            onClose={() => setAuthOpen(false)}
            onLogin={login}
            onRegister={register}
          />
        )}
      </AnimatePresence>

      {/* Direct Player Challenge Search */}
      <AnimatePresence>
        {searchOpen && (
          <PlayerSearchModal
            onClose={() => setSearchOpen(false)}
            onChallenge={handleSendChallenge}
            notify={notify}
          />
        )}
      </AnimatePresence>

      {/* Received Challenge Modal */}
      <AnimatePresence>
        {challengeReceived && (
          <div className="modal-backdrop">
            <div className="modal challenge-modal">
              <span className="eyebrow">DIRECT CHALLENGE RECEIVED</span>
              <h2>Challenge from {challengeReceived.from?.username}</h2>
              <p>Points: {challengeReceived.from?.points || 0} · Ready to battle?</p>
              <div className="confirm-btn-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAcceptChallenge}
                >
                  Accept Challenge
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setChallengeReceived(null)}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
