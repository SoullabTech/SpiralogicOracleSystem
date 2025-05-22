import '@testing-library/jest-dom';

// Mock matchMedia for UI libraries using it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Mock scrollIntoView for refs used in test environments
window.HTMLElement.prototype.scrollIntoView = vi.fn();
