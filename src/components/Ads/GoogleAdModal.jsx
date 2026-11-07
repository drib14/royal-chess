import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Play, CheckCircle2, Sparkles, ExternalLink, ShieldCheck, Crown, AlertCircle } from "lucide-react";
import { unlockVariationForOneDay } from "../../utils/adUnlockManager";

export default function GoogleAdModal({ item, onClose, onUnlocked }) {
  if (!item) return null;

  const [adState, setAdState] = useState("ready"); // "ready" | "playing" | "rewarded"
  const [countdown, setCountdown] = useState(5);
  const adRef = useRef(null);
  const adPushedRef = useRef(false);

  // Environment or configured Google Ad credentials
  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || "ca-pub-royal-arena";
  const slotId = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID || "";

  useEffect(() => {
    let timer;
    if (adState === "playing") {
      // Initialize real Google Ads tag if available on window
      if (!adPushedRef.current) {
        try {
          if (typeof window !== "undefined" && window.adsbygoogle) {
            window.adsbygoogle.push({});
            adPushedRef.current = true;
          }
        } catch (err) {
          console.warn("Google AdSense load notice:", err);
        }
      }

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
            <button type="button" className="google-ad-close" onClick={onClose} title="Close">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="google-ad-body">
          {adState === "ready" && (
            <div className="ad-prompt-card">
              <div className="ad-prompt-icon">
                <Crown size={28} className="gold" />
              </div>
              <span className="eyebrow">REWARDED VARIANT PASS</span>
              <h2>Unlock {item.label}</h2>
              <p>
                Watch a short 5-second sponsored Google Ad to unlock this premium {item.type === "board" ? "board theme" : "piece set"} for <b>24 hours (1 full day)</b>.
              </p>

              <div className="ad-reward-details">
                <div className="ad-perk-row">
                  <ShieldCheck size={16} className="text-green" />
                  <span>Free 24h instant access on all matches</span>
                </div>
                <div className="ad-perk-row">
                  <ShieldCheck size={16} className="text-green" />
                  <span>No login required · Stored on your device</span>
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
                  <span className="sponsor-tag">Sponsored · Google Ads</span>
                  <span className="ad-countdown">Reward in {countdown}s</span>
                </div>

                {/* Actual Google AdSense Placement */}
                <div className="ad-container-slot" ref={adRef}>
                  {slotId ? (
                    <ins
                      className="adsbygoogle"
                      style={{ display: "block", width: "100%", height: "180px" }}
                      data-ad-client={clientId}
                      data-ad-slot={slotId}
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                  ) : (
                    /* Fallback creative showcase when slot is pending user credentials */
                    <div className="ad-creative-content">
                      <div className="ad-logo-mock">
                        <Crown size={34} className="gold" />
                      </div>
                      <h3>Royal Arena Grand Championship</h3>
                      <p>Experience real-time competitive chess with master tactical bots and official time controls.</p>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="ad-learn-more"
                      >
                        Sponsored by Google Ads <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
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
