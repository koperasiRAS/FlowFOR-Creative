/**
 * FlowFOR Creative — Environment Validation + API Key Manager
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 */

const requiredEnvVars = ["GEMINI_API_KEY"] as const;
type EnvVar = (typeof requiredEnvVars)[number];

// Use a Proxy to evaluate env vars lazily.
// This prevents Next.js from crashing during the build phase.
export const env = new Proxy({} as Record<EnvVar, string>, {
  get(_, prop: string) {
    if (requiredEnvVars.includes(prop as EnvVar)) {
      const value = process.env[prop];
      if (!value || value.trim() === "") {
        if (process.env.npm_lifecycle_event === "build") {
          console.warn(`[FlowFOR] Warning: Missing environment variable during build: ${prop}`);
          return "";
        }
        throw new Error(
          `[FlowFOR] Missing required environment variable: ${prop}\n` +
          `Please check your .env.local file or Cloud Run environment settings.`
        );
      }
      return value;
    }
    return process.env[prop];
  }
});

// ==============================================
// API KEY MANAGER — tracks exhausted keys + auto-retry
// ==============================================

interface KeyState {
  exhausted: boolean;
  cooldownUntil: number; // timestamp when key becomes available again
}

const COOLDOWN_MS = 60_000; // 60 seconds cooldown after quota error

// In-memory key health state (persists across requests in same server instance)
const keyStates = new Map<string, KeyState>();

/**
 * Get all raw keys from env (comma-separated).
 */
function getAllKeys(): string[] {
  const keysStr = env.GEMINI_API_KEY;
  if (!keysStr) return [];
  return keysStr.split(",").map(k => k.trim()).filter(Boolean);
}

/**
 * Pick a random key that is currently healthy (not exhausted or past cooldown).
 * Falls back to any key if all are exhausted.
 */
export function getHealthyGeminiKey(): string {
  const keys = getAllKeys();
  if (keys.length === 0) return "";
  if (keys.length === 1) return keys[0];

  const now = Date.now();

  // First pass: try to find a healthy key (not exhausted or cooldown expired)
  const healthyKeys = keys.filter(k => {
    const state = keyStates.get(k);
    if (!state) return true; // never used, assume healthy
    if (state.exhausted && now < state.cooldownUntil) return false; // still in cooldown
    // Key was exhausted but cooldown expired — mark as healthy again
    if (state.exhausted && now >= state.cooldownUntil) {
      state.exhausted = false;
      return true;
    }
    return true;
  });

  const pool = healthyKeys.length > 0 ? healthyKeys : keys;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Mark a key as exhausted (quota error). Will not be used for 60 seconds.
 */
export function markKeyExhausted(apiKey: string): void {
  keyStates.set(apiKey, {
    exhausted: true,
    cooldownUntil: Date.now() + COOLDOWN_MS,
  });
}

/**
 * Retry helper: attempts a function that uses an API key.
 * If it fails with 429/quota, automatically retries with a different key.
 * Returns the result of the successful attempt, or throws the last error.
 *
 * @param maxRetries - max number of retries (default 2, so up to 3 total attempts)
 * @param fn - async function that receives an apiKey and executes the API call
 */
export async function withKeyRetry<T>(
  fn: (apiKey: string) => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const apiKey = getHealthyGeminiKey();
    if (!apiKey) throw new Error("No Gemini API key available");

    try {
      const result = await fn(apiKey);
      return result;
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);

      // Only retry on quota/exhausted errors
      const isQuotaError =
        message.includes("429") ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("resource has been exhausted") ||
        message.toLowerCase().includes("rate limit");

      if (isQuotaError && attempt < maxRetries) {
        // Mark current key as exhausted and retry with another
        markKeyExhausted(apiKey);
        if (process.env.NODE_ENV === "development") {
          console.warn(`[KeyManager] Key quota hit (attempt ${attempt + 1}), switching to another key...`);
        }
        continue;
      }

      // Non-quota error or out of retries — propagate immediately
      throw err;
    }
  }

  throw lastError;
}

/**
 * @deprecated Use getHealthyGeminiKey() + manual retry logic instead.
 * Kept for backward compatibility.
 */
export function getRandomGeminiKey(): string {
  return getHealthyGeminiKey();
}