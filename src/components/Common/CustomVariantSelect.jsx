import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Lock, Check, Clock } from "lucide-react";
import PieceIcon from "../Chessboard/PieceIcon";
import { isVariationUnlocked, getRemainingTimeString } from "../../utils/adUnlockManager";

export default function CustomVariantSelect({
  label,
  type = "board", // "board" | "piece"
  value,
  options = [],
  onChange,
  onSelectLocked,
  disabled = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [unlockTick, setUnlockTick] = useState(0);
  const containerRef = useRef(null);

  // Re-render when an item is unlocked via Google Ad
  useEffect(() => {
    const handleUnlockChange = () => setUnlockTick((t) => t + 1);
    window.addEventListener("royal_unlock_change", handleUnlockChange);
    return () => window.removeEventListener("royal_unlock_change", handleUnlockChange);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentOption = options.find((opt) => opt.id === value) || options[0];
  const isCurrentUnlocked = currentOption ? isVariationUnlocked(type, currentOption.id) : true;
  const currentRemaining = currentOption ? getRemainingTimeString(type, currentOption.id) : null;

  const handleOptionClick = (opt) => {
    const unlocked = isVariationUnlocked(type, opt.id);
    if (!unlocked) {
      setIsOpen(false);
      onSelectLocked?.({
        type,
        id: opt.id,
        label: opt.label
      });
      return;
    }
    onChange?.(opt.id);
    setIsOpen(false);
  };

  return (
    <div className={`custom-variant-select-container ${className}`} ref={containerRef}>
      {label && (
        <div className="custom-select-label-row">
          <span className="custom-select-label-text">{label}</span>
          {!isCurrentUnlocked && (
            <span className="custom-select-badge-locked" title="Unlocked with 24h Pass">
              <Lock size={11} /> Locked
            </span>
          )}
          {currentRemaining && (
            <span className="custom-select-badge-time">
              <Clock size={11} /> {currentRemaining}
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        className={`custom-variant-select-trigger ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-left-content">
          {/* Swatch / Piece Preview */}
          {type === "board" ? (
            <div className="custom-board-swatch" title={currentOption?.label}>
              <span style={{ background: currentOption?.light || "#eeeed2" }} />
              <span style={{ background: currentOption?.dark || "#769656" }} />
            </div>
          ) : (
            <div className="custom-piece-swatch" title={currentOption?.label}>
              <PieceIcon piece="n" color="w" style={value} size="18px" />
              <PieceIcon piece="n" color="b" style={value} size="18px" />
            </div>
          )}

          <div className="trigger-label-group">
            <span className="trigger-label-name">{currentOption?.label || value}</span>
            {currentOption?.desc && <span className="trigger-label-desc">{currentOption.desc}</span>}
          </div>
        </div>

        <div className="trigger-right-content">
          {!isCurrentUnlocked && <Lock size={13} className="lock-icon-gold" />}
          <ChevronDown size={16} className={`chevron-indicator ${isOpen ? "rotated" : ""}`} />
        </div>
      </button>

      {/* Dropdown Menu Options */}
      {isOpen && (
        <div className="custom-variant-dropdown-menu" role="listbox">
          <div className="dropdown-scroll-container">
            {options.map((opt) => {
              const isSelected = opt.id === value;
              const unlocked = isVariationUnlocked(type, opt.id);
              const remaining = getRemainingTimeString(type, opt.id);

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`custom-variant-option ${isSelected ? "selected" : ""} ${!unlocked ? "is-locked" : ""}`}
                  onClick={() => handleOptionClick(opt)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="option-left">
                    {type === "board" ? (
                      <div className="option-board-swatch">
                        <span style={{ background: opt.light }} />
                        <span style={{ background: opt.dark }} />
                      </div>
                    ) : (
                      <div className="option-piece-swatch">
                        <PieceIcon piece="n" color="w" style={opt.id} size="18px" />
                      </div>
                    )}

                    <div className="option-text-group">
                      <span className="option-label">{opt.label}</span>
                      {opt.desc && <span className="option-subtext">{opt.desc}</span>}
                    </div>
                  </div>

                  <div className="option-right">
                    {!unlocked ? (
                      <span className="option-lock-pill" title="Click to watch ad and unlock for 24h">
                        <Lock size={13} className="lock-icon-gold" />
                      </span>
                    ) : remaining ? (
                      <span className="option-time-tag">
                        <Clock size={11} /> {remaining}
                      </span>
                    ) : isSelected ? (
                      <Check size={15} className="option-check-icon" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

