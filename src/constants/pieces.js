// SVG Piece Renderers for multiple piece set variations:
// 1. Neo (Chess.com modern iconic style)
// 2. Staunton (Classic tournament woodcraft)
// 3. Wood (Rich organic shaded timber)
// 4. Glass (Luminous futuristic crystal)
// 5. Modern Minimal (Ultra-clean contemporary vectors)
// 6. Retro 8-Bit (Arcade pixel-art sprites)
// 7. Gothic Regal (Sharp heraldic battlements and crosses)

export const PIECE_STYLES = [
  { id: "Neo", label: "Neo (Chess.com)", desc: "Modern tournament standard" },
  { id: "Staunton", label: "Classic Staunton", desc: "Traditional championship look" },
  { id: "Wood", label: "Warm Wood", desc: "Handcrafted timber grain" },
  { id: "Glass", label: "Crystal Glass", desc: "Translucent glowing edges" },
  { id: "Minimal", label: "Modern Minimal", desc: "Geometric sleek outlines" },
  { id: "Retro8Bit", label: "8-Bit Arcade", desc: "Retro pixel art sprites" },
  { id: "Gothic", label: "Gothic Regal", desc: "Imperial crowns & heraldry" }
];

// Standard vector path definitions for chess pieces
export const SVG_PATHS = {
  // Pawn
  p: {
    body: "M22 39c0 1.5 1 2.5 3 2.5h14c2 0 3-1 3-2.5 0-3-4-5-4-8 0-2 2-3 2-6 0-3.3-2.7-6-6-6s-6 2.7-6 6c0 3 2 4 2 6 0 3-4 5-4 8z",
    base: "M20 42h24v3H20z"
  },
  // Knight
  n: {
    body: "M22 41.5h20c1 0 2-.8 2-2 0-2.8-2-4.5-3-7 2.5-.5 5.5-2.5 5.5-6.5 0-4-3-7-7-7-1.5 0-2.5.5-3.5 1.2-1.2-2.2-3.8-3.7-6.5-3.7-3 0-5.5 2-6 5-.8.5-3 2.5-3 5.5 0 3.5 3 6.5 6 7.5-.5 2-1.5 4.5-4 5-.5 0-.5 2 0 2z",
    eye: "M26 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
    nostril: "M19 27a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
  },
  // Bishop
  b: {
    head: "M32 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    body: "M26 41.5h12c1.5 0 2.5-1 2.5-2.5 0-4-3.5-7.5-3.5-11 0-3 2-5.5 2-9 0-4-3.1-7-7-7s-7 3-7 7c0 3.5 2 6 2 9 0 3.5-3.5 7-3.5 11 0 1.5 1 2.5 2.5 2.5z",
    slit: "M32 16v8M36 20h-8",
    base: "M21 42h22v3H21z"
  },
  // Rook
  r: {
    top: "M19 16h6v5h4v-5h6v5h4v-5h6v9H19z",
    waist: "M21 25h22l-2 14H23z",
    base: "M18 40h28v4H18z"
  },
  // Queen
  q: {
    crown: "M18 20l4 15h20l4-15-7 7-7-11-7 11z",
    jewels: [
      { cx: 18, cy: 19, r: 2 },
      { cx: 25, cy: 15, r: 2 },
      { cx: 32, cy: 11, r: 2 },
      { cx: 39, cy: 15, r: 2 },
      { cx: 46, cy: 19, r: 2 }
    ],
    body: "M21 35h22c1 0 2 .5 2 1.5s-.8 3-2 3H21c-1.2 0-2-2-2-3s1-1.5 2-1.5z",
    base: "M19 41h26v3.5H19z"
  },
  // King
  k: {
    cross: "M32 8v8M28 12h8",
    crown: "M22 20c2-3 5-4 10-4s8 1 10 4c2 3 2 7 0 10-3 4-4 6-4 9h-12c0-3-1-5-4-9-2-3-2-7 0-10z",
    band: "M20 39h24v2.5H20z",
    base: "M18 42h28v3H18z"
  }
};

