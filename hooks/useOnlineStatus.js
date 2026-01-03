import { useSyncExternalStore } from "react";

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getClientSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  // During SSR we assume "online"
  // This prevents hydration mismatch
  return true;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
