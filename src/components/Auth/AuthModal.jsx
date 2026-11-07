import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Lock, KeyRound } from "lucide-react";

export default function AuthModal({ onClose, onLogin, onRegister }) {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(username, email, password, adminCode || undefined);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.form
        className="modal auth-modal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <button type="button" className="modal-close" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <span className="eyebrow">ROYAL ARENA MEMBERSHIP</span>
        <h2>{tab === "login" ? "Welcome back, player." : "Create player profile."}</h2>

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === "login" ? "selected" : ""}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={tab === "register" ? "selected" : ""}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {tab === "register" && (
          <label>
            Username
            <input
              required
              minLength={3}
              maxLength={24}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. GrandmasterRex"
              pattern="^[a-zA-Z0-9_]+$"
              title="Letters, numbers, and underscores only"
            />
          </label>
        )}

        <label>
          Email Address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="player@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </label>

        {tab === "register" && (
          <div className="admin-passcode-toggle">
            {!showAdminField ? (
              <button
                type="button"
                className="admin-code-link"
                onClick={() => setShowAdminField(true)}
              >
                <KeyRound size={12} /> Have an administrator invite code?
              </button>
            ) : (
              <label>
                Admin Invite Code (Optional)
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="admin123"
                />
              </label>
            )}
          </div>
        )}

        {error && <div className="error-message-box">{error}</div>}

        <button type="submit" className="btn btn-primary btn-wide" disabled={loading}>
          {loading ? "Authenticating…" : tab === "login" ? "Sign In" : "Register Account"}
        </button>

        <p className="muted tiny">
          By signing in, you unlock pass & play, rated matchmaking, and tournament competition.
        </p>
      </motion.form>
    </div>
  );
}

