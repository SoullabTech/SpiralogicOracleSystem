// src/setupTests.ts

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Make Vitest's `vi` accessible as global `jest` to support legacy Jest-style mocks
globalThis.jest = vi;

// Optional: Handle common DOM setup, mock MatchMedia, etc.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
