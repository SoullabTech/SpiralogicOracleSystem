// tests/pause_mode.e2e.tsx
import { test, expect } from "@playwright/test";

test.describe("Pause Mode E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("user can pause and resume conversation with voice commands", async ({ page }) => {
    // Start voice session
    await page.click('[aria-label="Start voice session"]');

    // Wait for Maya to be ready
    await expect(page.locator("text=Say 'Hey Maya' to wake me")).toBeVisible();

    // Simulate wake word
    await page.evaluate(() => {
      const event = new CustomEvent("transcript", {
        detail: { text: "hey maya", isFinal: true }
      });
      window.dispatchEvent(event);
    });

    // Expect active listening mode
    await expect(page.locator("text=I'm listening")).toBeVisible({ timeout: 5000 });

    // Simulate pause command
    await page.evaluate(() => {
      const event = new CustomEvent("transcript", {
        detail: { text: "let me think", isFinal: true }
      });
      window.dispatchEvent(event);
    });

    // Expect pause indicator
    await expect(page.locator("text=Taking a moment")).toBeVisible();

    // Maya should acknowledge briefly
    await expect(page.locator("text=I'll wait")).toBeVisible({ timeout: 2000 });

    // Verify Maya stays quiet (no prompts for 25 seconds)
    await page.waitForTimeout(25000);
    await expect(page.locator("text=What's on your mind?")).toHaveCount(0);

    // Simulate resume command
    await page.evaluate(() => {
      const event = new CustomEvent("transcript", {
        detail: { text: "okay maya i'm ready", isFinal: true }
      });
      window.dispatchEvent(event);
    });

    // Expect return to active listening
    await expect(page.locator("text=Taking a moment")).toHaveCount(0);
    await expect(page.locator("text=I'm listening")).toBeVisible();
  });

  test("pause mode respects different pause phrases", async ({ page }) => {
    const pausePhrases = [
      { phrase: "one moment maya", response: "Take your time." },
      { phrase: "let me meditate on that", response: "I'll hold quiet." },
      { phrase: "give me space", response: "Here when you're ready." }
    ];

    for (const { phrase, response } of pausePhrases) {
      await page.reload();
      await page.click('[aria-label="Start voice session"]');

      // Wake Maya
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent("transcript", {
          detail: { text: "hey maya", isFinal: true }
        }));
      });

      await expect(page.locator("text=I'm listening")).toBeVisible({ timeout: 5000 });

      // Test pause phrase
      await page.evaluate((p) => {
        window.dispatchEvent(new CustomEvent("transcript", {
          detail: { text: p, isFinal: true }
        }));
      }, phrase);

      // Verify appropriate response
      await expect(page.locator(`text=${response}`)).toBeVisible({ timeout: 3000 });
      await expect(page.locator("text=Taking a moment")).toBeVisible();
    }
  });

  test("pause mode persists until explicit resume", async ({ page }) => {
    await page.click('[aria-label="Start voice session"]');

    // Wake and pause Maya
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("transcript", {
        detail: { text: "hey maya", isFinal: true }
      }));
    });

    await expect(page.locator("text=I'm listening")).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("transcript", {
        detail: { text: "pause maya", isFinal: true }
      }));
    });

    await expect(page.locator("text=Taking a moment")).toBeVisible();

    // Try normal speech - should not exit pause mode
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("transcript", {
        detail: { text: "the weather is nice today", isFinal: true }
      }));
    });

    // Still in pause mode
    await expect(page.locator("text=Taking a moment")).toBeVisible();

    // Only resume command exits pause
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("transcript", {
        detail: { text: "let's continue", isFinal: true }
      }));
    });

    await expect(page.locator("text=Taking a moment")).toHaveCount(0);
  });

  test("visual feedback shows correct pause states", async ({ page }) => {
    await page.click('[aria-label="Start voice session"]');

    // Wake Maya
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("transcript", {
        detail: { text: "hey maya", isFinal: true }
      }));
    });

    // Check normal state visual
    const normalOrb = page.locator('[data-testid="voice-orb"]');
    await expect(normalOrb).toHaveCSS('opacity', '1');

    // Enter pause mode
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("transcript", {
        detail: { text: "let me think", isFinal: true }
      }));
    });

    // Check paused state visual (dimmed, slower pulse)
    await expect(page.locator('[data-testid="voice-orb"]')).toHaveCSS('opacity', '0.6');
    await expect(page.locator("text=🌙")).toBeVisible();
  });
});