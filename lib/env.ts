/**
 * FlowFOR Creative — Environment Validation
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 * Validates required env vars at startup / import time.
 * Throws a clear error if any variable is missing.
 */

const requiredEnvVars = ["GEMINI_API_KEY"] as const;

type EnvVar = (typeof requiredEnvVars)[number];

// Use a Proxy to evaluate env vars lazily.
// This prevents Next.js from crashing during the build phase (e.g. on Cloud Run)
// when it statically analyzes API routes before runtime env vars are injected.
export const env = new Proxy({} as Record<EnvVar, string>, {
  get(_, prop: string) {
    if (requiredEnvVars.includes(prop as EnvVar)) {
      const value = process.env[prop];
      if (!value || value.trim() === "") {
        // If we are building, we just warn to allow build to succeed.
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