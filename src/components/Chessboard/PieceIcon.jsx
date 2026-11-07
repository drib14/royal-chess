import React from "react";

// Crisp vector SVG renders for White and Black pieces across all 7 styles
export default function PieceIcon({ piece, color = "w", style = "Neo", size = "100%", className = "" }) {
  if (!piece) return null;
  const p = piece.toLowerCase();
  const isWhite = color === "w";

  // Palette configurations per piece variation style
  const getPalette = () => {
    switch (style) {
      case "Staunton":
        return {
          whiteFill: "#fffef5",
          whiteStroke: "#3e3831",
          whiteShade: "#e8dfcc",
          blackFill: "#262320",
          blackStroke: "#12100e",
          blackShade: "#453f3a",
          accent: "#c5a059"
        };
      case "Wood":
        return {
          whiteFill: "url(#wood-white-grad)",
          whiteStroke: "#634125",
          whiteShade: "#d4a974",
          blackFill: "url(#wood-black-grad)",
          blackStroke: "#2b160a",
          blackShade: "#5a341b",
          accent: "#e5b869"
        };
      case "Glass":
        return {
          whiteFill: "url(#glass-white-grad)",
          whiteStroke: "#7dd3fc",
          whiteShade: "#e0f2fe",
          blackFill: "url(#glass-black-grad)",
          blackStroke: "#c084fc",
          blackShade: "#475569",
          accent: "#38bdf8"
        };
      case "Minimal":
        return {
          whiteFill: "#ffffff",
          whiteStroke: "#0f172a",
          whiteShade: "#f1f5f9",
          blackFill: "#0f172a",
          blackStroke: "#ffffff",
          blackShade: "#334155",
          accent: "#64748b"
        };
      case "Retro8Bit":
        return {
          whiteFill: "#fef9c3",
          whiteStroke: "#422006",
          whiteShade: "#fde047",
          blackFill: "#292524",
          blackStroke: "#0c0a09",
          blackShade: "#57534e",
          accent: "#eab308"
        };
      case "Gothic":
        return {
          whiteFill: "#f8fafc",
          whiteStroke: "#1e293b",
          whiteShade: "#cbd5e1",
          blackFill: "#18181b",
          blackStroke: "#09090b",
          blackShade: "#3f3f46",
          accent: "#e11d48"
        };
      case "Neo":
      default:
        return {
          whiteFill: "#ffffff",
          whiteStroke: "#272522",
          whiteShade: "#e6e6e6",
          blackFill: "#262421",
          blackStroke: "#181715",
          blackShade: "#4a4743",
          accent: "#e5c07b"
        };
    }
  };

  const pal = getPalette();
  const fill = isWhite ? pal.whiteFill : pal.blackFill;
  const stroke = isWhite ? pal.whiteStroke : pal.blackStroke;
  const shade = isWhite ? pal.whiteShade : pal.blackShade;
  const detailStroke = isWhite ? pal.whiteStroke : "#ffffffb0";

  // Common Gradients for Wood and Glass
  const renderGradients = () => (
    <defs>
      <linearGradient id="wood-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff2dc" />
        <stop offset="60%" stopColor="#ebd1a4" />
        <stop offset="100%" stopColor="#cfa56a" />
      </linearGradient>
      <linearGradient id="wood-black-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#543722" />
        <stop offset="60%" stopColor="#3d2212" />
        <stop offset="100%" stopColor="#241308" />
      </linearGradient>
      <linearGradient id="glass-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="70%" stopColor="#e0f2fe" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="glass-black-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" stopOpacity="0.95" />
        <stop offset="70%" stopColor="#1e293b" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
      </linearGradient>
      <filter id="piece-shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.35" />
      </filter>
    </defs>
  );

  // 8-bit retro pixel rendering
  if (style === "Retro8Bit") {
    return (
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        className={`chess-piece-svg ${className}`}
        style={{ shapeRendering: "crispEdges" }}
      >
        {p === "p" && (
          <g fill={isWhite ? "#fef08a" : "#44403c"}>
            <rect x="7" y="3" width="2" height="2" />
            <rect x="6" y="5" width="4" height="2" />
            <rect x="7" y="7" width="2" height="4" />
            <rect x="5" y="11" width="6" height="2" />
          </g>
        )}
        {p === "n" && (
          <g fill={isWhite ? "#fef08a" : "#44403c"}>
            <rect x="6" y="2" width="4" height="2" />
            <rect x="4" y="4" width="7" height="3" />
            <rect x="7" y="7" width="4" height="4" />
            <rect x="5" y="11" width="6" height="2" />
          </g>
        )}
        {p === "b" && (
          <g fill={isWhite ? "#fef08a" : "#44403c"}>
            <rect x="7" y="2" width="2" height="2" />
            <rect x="6" y="4" width="4" height="4" />
            <rect x="7" y="8" width="2" height="3" />
            <rect x="5" y="11" width="6" height="2" />
          </g>
        )}
        {p === "r" && (
          <g fill={isWhite ? "#fef08a" : "#44403c"}>
            <rect x="4" y="3" width="2" height="2" />
            <rect x="7" y="3" width="2" height="2" />
            <rect x="10" y="3" width="2" height="2" />
            <rect x="4" y="5" width="8" height="2" />
            <rect x="6" y="7" width="4" height="4" />
            <rect x="4" y="11" width="8" height="2" />
          </g>
        )}
        {p === "q" && (
          <g fill={isWhite ? "#fef08a" : "#44403c"}>
            <rect x="4" y="3" width="2" height="2" />
            <rect x="7" y="2" width="2" height="2" />
            <rect x="10" y="3" width="2" height="2" />
            <rect x="5" y="5" width="6" height="3" />
            <rect x="6" y="8" width="4" height="3" />
            <rect x="4" y="11" width="8" height="2" />
          </g>
        )}
        {p === "k" && (
          <g fill={isWhite ? "#fef08a" : "#44403c"}>
            <rect x="7" y="1" width="2" height="3" />
            <rect x="6" y="2" width="4" height="1" />
            <rect x="5" y="4" width="6" height="4" />
            <rect x="6" y="8" width="4" height="3" />
            <rect x="4" y="11" width="8" height="2" />
          </g>
        )}
      </svg>
    );
  }

  // High-fidelity standard vector renders (Neo, Staunton, Wood, Glass, Minimal, Gothic)
  return (
    <svg
      viewBox="0 0 45 45"
      width={size}
      height={size}
      className={`chess-piece-svg ${className}`}
      filter="url(#piece-shadow)"
    >
      {renderGradients()}

      {/* PAWN */}
      {p === "p" && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 22.5,9 A 3.6,3.6 0 1,1 22.4,9 Z" />
          <path d="M 22.5,10 C 21.5,10 20,11 19.5,12 C 18,15 21,17 21,19 C 21,21 16,23 16,27 C 16,30 18,33 19,35 L 26,35 C 27,33 29,30 29,27 C 29,23 24,21 24,19 C 24,17 27,15 25.5,12 C 25,11 23.5,10 22.5,10 z" />
          <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,37.3 35,38 34.5,39 C 34,40 33,40.5 32,40.5 L 13,40.5 C 12,40.5 11,40 10.5,39 C 10,38 10.5,37.3 11.5,37 z" />
          {/* Subtle highlight contour for depth */}
          <path d="M 19,25 C 21,27 24,27 26,25" fill="none" stroke={detailStroke} strokeWidth="1" />
        </g>
      )}

      {/* KNIGHT */}
      {p === "n" && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 22,10 C 22.5,10 25.5,11 26,13 C 26.5,15 25.5,16.5 25.5,18 C 26.5,18 29.5,18.5 30.5,21.5 C 31.5,24.5 30.5,27.5 29.5,29 C 28.5,30.5 26.5,31 24.5,31.5 C 24.5,32.5 25.5,34 26.5,35 L 16.5,35 C 16,33 15.5,30 15,28 C 14.5,26 12,24 10.5,23 C 9.5,22 9.5,20 10.5,19 C 12,18 14.5,19.5 16,19.5 C 17,17.5 18,12.5 22,10 z" />
          <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,37.3 35,38 34.5,39 C 34,40 33,40.5 32,40.5 L 13,40.5 C 12,40.5 11,40 10.5,39 C 10,38 10.5,37.3 11.5,37 z" />
          <circle cx="15" cy="15" r="1.2" fill={isWhite ? "#262421" : "#ffffff"} stroke="none" />
          <path d="M 21.5,14 C 23,16 23.5,19 22.5,22" fill="none" stroke={detailStroke} strokeWidth="1" />
        </g>
      )}

      {/* BISHOP */}
      {p === "b" && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <circle cx="22.5" cy="8" r="1.8" fill={fill} />
          <path d="M 17.5,35 L 27.5,35 C 29,32.5 30.5,27.5 29.5,23 C 28.5,18 26.5,14 22.5,11 C 18.5,14 16.5,18 15.5,23 C 14.5,27.5 16,32.5 17.5,35 z" />
          <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,37.3 35,38 34.5,39 C 34,40 33,40.5 32,40.5 L 13,40.5 C 12,40.5 11,40 10.5,39 C 10,38 10.5,37.3 11.5,37 z" />
          {/* Slit / Cross */}
          <path d="M 22.5,16 L 22.5,24" fill="none" stroke={detailStroke} strokeWidth="1.2" />
          <path d="M 19.5,19 L 25.5,19" fill="none" stroke={detailStroke} strokeWidth="1.2" />
        </g>
      )}

      {/* ROOK */}
      {p === "r" && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 12,35 L 33,35 L 31,23 L 34,16 L 34,11 L 30,11 L 30,14 L 27,14 L 27,11 L 24,11 L 24,14 L 21,14 L 21,11 L 18,11 L 18,14 L 15,14 L 15,11 L 11,11 L 11,16 L 14,23 z" />
          <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,37.3 35,38 34.5,39 C 34,40 33,40.5 32,40.5 L 13,40.5 C 12,40.5 11,40 10.5,39 C 10,38 10.5,37.3 11.5,37 z" />
          <path d="M 14,22 L 31,22" fill="none" stroke={detailStroke} strokeWidth="1" />
          <path d="M 16,30 L 29,30" fill="none" stroke={detailStroke} strokeWidth="1" />
        </g>
      )}

      {/* QUEEN */}
      {p === "q" && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <circle cx="9" cy="14" r="1.5" />
          <circle cx="15.5" cy="10" r="1.5" />
          <circle cx="22.5" cy="8" r="1.5" />
          <circle cx="29.5" cy="10" r="1.5" />
          <circle cx="36" cy="14" r="1.5" />
          <path d="M 9,16 C 11.5,23 15.5,26 15.5,35 L 29.5,35 C 29.5,26 33.5,23 36,16 L 29.5,22 L 22.5,12 L 15.5,22 z" />
          <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,37.3 35,38 34.5,39 C 34,40 33,40.5 32,40.5 L 13,40.5 C 12,40.5 11,40 10.5,39 C 10,38 10.5,37.3 11.5,37 z" />
          <circle cx="22.5" cy="27" r="2.5" fill="none" stroke={detailStroke} strokeWidth="1" />
        </g>
      )}

      {/* KING */}
      {p === "k" && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          {/* Imperial Cross */}
          <path d="M 22.5,6 L 22.5,12" stroke={detailStroke} strokeWidth="1.8" />
          <path d="M 20,8.5 L 25,8.5" stroke={detailStroke} strokeWidth="1.8" />
          <path d="M 14,15 C 13,20 16,24 16,35 L 29,35 C 29,24 32,20 31,15 C 29,17 26.5,17 24.5,15 C 23.5,17 21.5,17 20.5,15 C 18.5,17 16,17 14,15 z" />
          <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,37.3 35,38 34.5,39 C 34,40 33,40.5 32,40.5 L 13,40.5 C 12,40.5 11,40 10.5,39 C 10,38 10.5,37.3 11.5,37 z" />
          <circle cx="22.5" cy="22" r="3" fill="none" stroke={detailStroke} strokeWidth="1" />
          <path d="M 16,30 C 20,32 25,32 29,30" fill="none" stroke={detailStroke} strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

