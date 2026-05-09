/**
 * FlowFOR Creative — Environment Validation
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 * Validates required env vars at startup / import time.
 * Throws a clear error if any variable is missing.
 */

const requiredEnvVars = ["GEMINI_API_KEY"] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function validateEnv(): Record<EnvVar, string> {
  const missing: string[] = [];
  const env: Partial<Record<EnvVar, string>> = {};

  for (const key of requiredEnvVars) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    } else {
      env[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[FlowFOR] Missing required environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file or Cloud Run environment settings.\n` +
        `See .env.example for reference.`
    );
  }

  return env as Record<EnvVar, string>;
}

// Throws at import time if env is misconfigured
export const env = validateEnv();