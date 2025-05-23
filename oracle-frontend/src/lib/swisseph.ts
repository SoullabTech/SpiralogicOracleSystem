// src/lib/swisseph.ts

/**
 * Type definitions for the Swiss Ephemeris WebAssembly module.
 * Extend these signatures with additional functions you need.
 */
export interface SwissEphModule {
  /**
   * Calculates the Julian Day number.
   * @param year full year
   * @param month 1–12
   * @param day 1–31
   * @param hour fractional hour (e.g. 14.5 for 14:30)
   * @param flag calendar flag (e.g. GREG_CAL)
   */
  JulianDay(year: number, month: number, day: number, hour: number, flag: number): number;

  /** Gregorian calendar flag constant */
  GREG_CAL: number;

  /** Sun planet constant */
  SE_SUN: number;

  /**
   * Calculate a planet position for UTC.
   * @param jd Julian Day
   * @param ipl planet id (e.g. SE_SUN)
   * @param flag calculation flags
   * @param xx array of length ≥6 to receive the result
   */
  calc_ut(jd: number, ipl: number, flag: number, xx: number[]): number;

  // …add any other Swiss Ephemeris exports you need
}

/**
 * Dynamically injects a <script> tag and waits for it to load.
 */
async function loadScript(src: string): Promise<void> {
  // If it’s already been injected, bail early
  if (document.querySelector(`script[src="${src}"]`)) return;

  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = src;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(tag);
  });
}

/**
 * Initialize the Swiss Ephemeris WebAssembly module at runtime.
 *
 * Works by:
 *   1) Loading `/swisseph.js` from `public/`
 *   2) Reading the global `createSwissephModule` that Emscripten defines
 *   3) Passing a `locateFile` hook so it finds `/swisseph.wasm` next to it
 */
export async function initSwissEph(): Promise<SwissEphModule> {
  // Vite’s base URL (usually “/” in dev and “/your-subpath/” in prod)
  const base = (import.meta.env.BASE_URL as string) || '/';

  // 1️⃣ Load the JS wrapper
  await loadScript(`${base}swisseph.js`);

  // 2️⃣ Grab the Emscripten factory function
  const factory = (window as any).createSwissephModule as
    | ((opts: any) => Promise<SwissEphModule>)
    | undefined;

  if (typeof factory !== 'function') {
    throw new Error(
      `Swiss Ephemeris factory (createSwissephModule) not found on window`
    );
  }

  // 3️⃣ Instantiate, pointing locateFile at the .wasm alongside the .js
  const module = await factory({
    locateFile: (filename: string) =>
      filename.endsWith('.wasm') ? `${base}swisseph.wasm` : filename,
    // optional: if you need manual memory tuning
    wasmMemory: new WebAssembly.Memory({ initial: 256, maximum: 1024 }),
  });

  return module;
}
