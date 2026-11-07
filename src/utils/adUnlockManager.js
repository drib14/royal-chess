// Google Ad Rewarded Variation Unlock Manager
// 3 Default Free variations for Boards and Pieces
// All other variations lockable, unlocked for 24 hours (1 day) after watching a Google Ad.

export const FREE_BOARDS = ["Green", "Wood", "Tournament"];
export const FREE_PIECES = ["Neo", "Staunton", "Minimal"];

const STORAGE_KEY = "royal_ad_unlocks";

function getStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Checks if a specific board or piece variation is currently unlocked.
 * @param {'board'|'piece'} type
 * @param {string} id
 * @returns {boolean}
 */
export function isVariationUnlocked(type, id) {
  if (type === "board" && FREE_BOARDS.includes(id)) return true;
  if (type === "piece" && FREE_PIECES.includes(id)) return true;

  const storage = getStorage();
  const key = `${type}:${id}`;
  const expiry = storage[key];

  if (!expiry) return false;
  if (Date.now() > expiry) {
    // Expired - clean up
    delete storage[key];
    saveStorage(storage);
    return false;
  }
  return true;
}

/**
 * Gets remaining time formatted string for an ad-unlocked variation.
 * @param {'board'|'piece'} type
 * @param {string} id
 * @returns {string|null}
 */
export function getRemainingTimeString(type, id) {
  if (type === "board" && FREE_BOARDS.includes(id)) return null;
  if (type === "piece" && FREE_PIECES.includes(id)) return null;

  const storage = getStorage();
  const key = `${type}:${id}`;
  const expiry = storage[key];

  if (!expiry || Date.now() > expiry) return null;

  const diffMs = expiry - Date.now();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

/**
 * Unlocks a variation for exactly 24 hours (1 day) after watching a Google Ad.
 * @param {'board'|'piece'} type
 * @param {string} id
 */
export function unlockVariationForOneDay(type, id) {
  const storage = getStorage();
  const key = `${type}:${id}`;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  storage[key] = Date.now() + ONE_DAY_MS;
  saveStorage(storage);

  // Dispatch custom window event so all components react immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("royal_unlock_change", { detail: { type, id } }));
  }
}

