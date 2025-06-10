// --- File: frontend/src/lib/themeStore.ts ---

import { writable } from "svelte/store";

const defaultTheme = typeof localStorage !== "undefined"
  ? localStorage.getItem("elemental-theme") || "fire"
  : "fire";

export const elementalTheme = writable<string>(defaultTheme);

// Subscribe to changes and persist
if (typeof localStorage !== "undefined") {
  elementalTheme.subscribe((value) => {
    localStorage.setItem("elemental-theme", value);
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-theme", value);
    }
  });
}

// Optional: helper to cycle through elements
export const cycleTheme = () => {
  const themes = ["fire", "water", "earth", "air", "aether"];
  elementalTheme.update((current) => {
    const nextIndex = (themes.indexOf(current) + 1) % themes.length;
    return themes[nextIndex];
  });
};
