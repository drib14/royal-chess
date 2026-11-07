import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, Sparkles, ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";
import { unlockVariationForOneDay } from "../../utils/adUnlockManager";

export default function GoogleAdModal({ item, onClose, onUnlocked }) {
  if (!item) return null;

  // Retrieve credentials strictly from environment variables without hardcoded fallbacks
  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID;
  const slotId = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID;

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      import.meta.env.DEV);

  const AD_DURATION = 10; // Mandatory viewing countdown
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adBlocked, setAdBlocked] = useState(false);
  const [adUnfilled, setAdUnfilled] = useState(false);

  const insRef = useRef(null);
  const adPushedRef = useRef(false);

  // Dynamically ensure Google AdSense script is in <head> with the environment clientId
  useEffect(() => {
    if (!clientId) return;

    if (typeof window !== "undefined") {
      let script = document.querySelector('script[src*="adsbygoogle.js"]');
      if (!script) {
        script = document.createElement("script");
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
        document.head.appendChild(script);
      }
    }
  }, [clientId]);

  // Request actual ad from Google AdSense into the <ins> slot
  useEffect(() => {
    if (!clientId || !slotId) {
      setIsFetching(false);
      return;
    }

    const insElement = insRef.current;
    if (!insElement) return;

    // Observe changes to <ins> (AdSense injects an iframe when it fetches the ad)
    const observer = new MutationObserver(() => {
      if (insElement.querySelector("iframe")) {
        setIsFetching(false);
        setAdLoaded(true);
      }
      const status = insElement.getAttribute("data-ad-status");
      if (status === "unfilled") {
        setIsFetching(false);
        setAdUnfilled(true);
      }
    });

    observer.observe(insElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-ad-status", "data-adsbygoogle-status"]
    });

    // Push ad request to Google AdSense
    const pushTimer = setTimeout(() => {
      if (!adPushedRef.current) {
        try {
          if (typeof window !== "undefined") {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
            adPushedRef.current = true;
          }
        } catch (err) {
          console.warn("Google AdSense request notice:", err);
          setAdBlocked(true);
          setIsFetching(false);
        }
      }
    }, 120);

    // Safety timeout: detect if ad blocker prevented script/iframe
    const blockerTimeout = setTimeout(() => {
      if (!insElement.querySelector("iframe") && isFetching) {
        // If adsbygoogle is missing or script was blocked by client
        if (typeof window === "undefined" || !window.adsbygoogle) {
          setAdBlocked(true);
        }
        setIsFetching(false);
      }
    }, 3500);

    return () => {
      observer.disconnect();
      clearTimeout(pushTimer);
      clearTimeout(blockerTimeout);
    };
  }, [clientId, slotId]);

  // Countdown timer for watching the ad
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  const handleClaim = () => {
    if (!isCompleted) return;
    unlockVariationForOneDay(item.type, item.id);
    onUnlocked?.(item.type, item.id);
    onClose?.();
  };

  const progressPercent = ((AD_DURATION - countdown) / AD_DURATION) * 100;

  return (
    <div className="modal-backdrop" onClick={isCompleted ? onClose : null}>
      <motion.div
        className="google-ad-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
      >
        {/* Top bar with Google Ads branding and Close button */}
        <div className="google-ad-topbar">
          <div className="google-ad-badge">
            <span className="google-g">G</span>
            <span>Google AdSense</span>
            <span className="ad-pill">Live Ad</span>
          </div>

          <button
            type="button"
            className="google-ad-close"
            onClick={onClose}
            title={isCompleted ? "Close" : "Cancel"}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="google-ad-body">
          {/* Header Description */}
          <div className="google-ad-header-info">
            <div className="unlock-target-row">
              <span className="unlock-target-tag">24H UNLOCK PASS</span>
              <span className="unlock-target-item">{item.label}</span>
            </div>
            <p className="google-ad-subtitle">
              Watch this Google Ad to unlock <b>{item.label}</b> for 24 hours.
            </p>
          </div>

          {/* Ad Container Box hosting the actual Google AdSense unit */}
          <div className="google-ad-placement-box">
            <div className="ad-box-header">
              <span className="ad-box-status">
                {isCompleted ? (
                  <span className="ad-status-done">
                    <CheckCircle2 size={13} className="text-green" /> Ad Finished
                  </span>
                ) : (
                  <span className="ad-status-live">
                    <span className="live-dot-pulse" /> Sponsored Ad ({countdown}s)
                  </span>
                )}
              </span>
              <span className="ad-meta-id">
                {adLoaded ? "Ad Delivered" : isFetching ? "Fetching..." : "AdSense"}
              </span>
            </div>

            {/* Viewport for Google AdSense <ins> Element */}
            <div className="ad-canvas-viewport">
              {/* Fetching state spinner */}
              {isFetching && (
                <div className="ad-fetching-layer">
                  <Loader2 size={24} className="spin-loader text-gold" />
                  <span>Fetching live ad from Google AdSense...</span>
                </div>
              )}

              {/* Ad blocker or configuration notice */}
              {!clientId || !slotId ? (
                <div className="ad-blocked-layer">
                  <AlertCircle size={22} className="text-gold" />
                  <span>
                    Missing AdSense configuration in <code>.env</code>.
                  </span>
                </div>
              ) : adBlocked ? (
                <div className="ad-blocked-layer">
                  <AlertCircle size={22} className="text-gold" />
                  <span>Ad blocker detected. Please pause it to load Google AdSense.</span>
                </div>
              ) : null}

              {/* Actual Google AdSense element */}
              {clientId && slotId && (
                <ins
                  ref={insRef}
                  className="adsbygoogle"
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: "250px",
                    height: "250px"
                  }}
                  data-ad-client={clientId}
                  data-ad-slot={slotId}
                  data-ad-format="rectangle,horizontal"
                  data-full-width-responsive="true"
                  {...(isLocal ? { "data-adtest": "on" } : {})}
                />
              )}
            </div>

            {/* Progress Bar */}
            <div className="ad-progress-track">
              <div
                className="ad-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Perks list */}
          <div className="ad-reward-details">
            <div className="ad-perk-row">
              <ShieldCheck size={14} className="text-green" />
              <span>Free 24 hours full access on all game modes</span>
            </div>
            <div className="ad-perk-row">
              <ShieldCheck size={14} className="text-green" />
              <span>Instant auto-equip upon claiming reward</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="google-ad-actions">
            {isCompleted ? (
              <button
                type="button"
                className="btn btn-primary btn-wide btn-reward-claim"
                onClick={handleClaim}
              >
                <Sparkles size={16} /> Claim 24h Pass & Equip
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-wide btn-reward-locked"
                disabled
              >
                <Lock size={15} /> Watching Google Ad ({countdown}s)
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
