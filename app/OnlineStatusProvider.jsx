"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const OnlineStatusContext = createContext(true);

/* ---------- store ---------- */
function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // assume online during SSR
}

/* ---------- provider ---------- */
export function OnlineStatusProvider({ children }) {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <OnlineStatusContext.Provider value={isOnline}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

/* ---------- hook ---------- */
export function useOnlineStatus() {
  return useContext(OnlineStatusContext);
}
