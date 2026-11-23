import { useSyncExternalStore } from "react";

// Which side of the profile picture is showing: false = memoji, true = real photo.
// The big portrait in the hero and the small avatar in the navbar share it, so they always flip together.
let flipped = false;
const listeners = new Set<() => void>();

export function toggleProfileFlip() {
  flipped = !flipped;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The server and the first client render always start on the memoji, so they match.
export function useProfileFlipped() {
  return useSyncExternalStore(
    subscribe,
    () => flipped,
    () => false,
  );
}
