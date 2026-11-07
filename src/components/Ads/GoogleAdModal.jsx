import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Play, CheckCircle2, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { unlockVariationForOneDay } from "../../utils/adUnlockManager";

export default function GoogleAdModal({ item, onClose, onUnlocked }) {
  if (!item) return null;

  const [adState, setAdState] = useState("ready"); // "ready" | "playing" | "rewarded"
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (adState === "playing") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setAdState("rewarded");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [adState]);

  const handleStartAd = () => {
    setAdState("playing");
    setCountdown(5);
  };

  const handleClaimReward = () => {
    unlockVariationForOneDay(item.type, item.id);
    onUnlocked?.(item.type, item.id);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={adState === "playing" ? null : onClose}>
      <motion.div
        className="google-ad-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Google Ad Topbar */}
        <div className="google-ad-topbar">
          <div className="google-ad-badge">
            <span className="google-g">G</span>
            <span>Google Ads</span>
            <span className="ad-pill">Ad</span>
          </div>
          {adState !== "playing" && (
            <button type="button" className="google-ad-close" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="google-ad-body">
          {adState === "ready" && (
            <div className="ad-prompt-card">
              <div className="ad-prompt-icon">
                <Sparkles size={28} className="gold" />
              </div>
              <span className="eyebrow">REWARDED VARIATION PASS</span>
              <h2>Unlock {item.label}</h2>
              <p>
                Watch a short 5-second sponsored Google Ad to unlock this premium {item.type === "board" ? "board theme" : "piece set"} for <b>24 hours (1 full day)</b>.
              </p>

              <div className="ad-reward-details">
                <div className="ad-perk-row">
                  <ShieldCheck size={16} className="text-green" />
                  <span>Free 24h instant access on all your matches</span>
                </div>
                <div className="ad-perk-row">
                  <ShieldCheck size={16} className="text-green" />
                  <span>No login required · Stored on this device</span>
                </div>
              </div>

              <button type="button" className="btn btn-primary btn-wide" onClick={handleStartAd}>
                <Play size={16} fill="currentColor" /> Watch Google Ad (5s)
              </button>
            </div>
          )}

          {adState === "playing" && (
            <div className="ad-player-card">
              <div className="ad-screen">
                <div className="ad-sponsored-banner">
                  <span className="sponsor-tag">Sponsored · Google Ads Showcase</span>
                  <span className="ad-countdown">Reward in {countdown}s</span>
                </div>

                <div className="ad-creative-content">
                  <div className="ad-logo-mock">♟</div>
                  <h3>Royal Arena Grand Championship</h3>
                  <p>Elevate your strategy. Play, compete, and climb the arena ranks.</p>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="ad-learn-more"
                  >
                    Learn More <ExternalLink size={12} />
                  </a>
                </div>

                {/* Progress bar */}
                <div className="ad-progress-track">
                  <div
                    className="ad-progress-fill"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
              <small className="ad-note">Please watch until the countdown completes to claim your 24h pass.</small>
            </div>
          )}

          {adState === "rewarded" && (
            <div className="ad-rewarded-card">
              <div className="ad-success-icon">
                <CheckCircle2 size={38} className="text-green" />
              </div>
              <span className="live-tag">● REWARD EARNED</span>
              <h2>Access Granted!</h2>
              <p>
                You have unlocked <b>{item.label}</b> for the next <b>24 hours</b>.
              </p>

              <button type="button" className="btn btn-primary btn-wide" onClick={handleClaimReward}>
                Apply & Use for 24 Hours
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

