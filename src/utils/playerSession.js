const STORAGE_KEY = "amoung-guess-player-session";

export function savePlayerSession({ roomCode, playerName }) {
  const session = {roomCode, playerName,updatedAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function loadPlayerSession() {
  try {
 const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function clearPlayerSession() {
  localStorage.removeItem(STORAGE_KEY);
}
