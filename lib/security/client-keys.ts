/**
 * @file client-keys.ts
 * @description Client-side utility for safely managing user-provided API keys
 * (Gemini, OpenAI, Anthropic) across browser sessions and attaching them to API calls.
 */

const STORAGE_KEY = "legallens_user_api_key";
const STORAGE_PROVIDER = "legallens_user_provider";

export type SupportedProvider = "gemini" | "openai" | "anthropic" | "local" | "auto";

/**
 * Retrieves the stored API key from local or session storage.
 */
export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      sessionStorage.getItem(STORAGE_KEY) ||
      sessionStorage.getItem("legallens_user_key") ||
      ""
    ).trim();
  } catch {
    return "";
  }
}

/**
 * Retrieves the preferred AI provider from storage.
 */
export function getStoredProvider(): SupportedProvider {
  if (typeof window === "undefined") return "gemini";
  try {
    const p = (
      localStorage.getItem(STORAGE_PROVIDER) ||
      sessionStorage.getItem(STORAGE_PROVIDER) ||
      ""
    ).toLowerCase();
    if (p === "gemini" || p === "openai" || p === "anthropic" || p === "local") {
      return p;
    }
  } catch {
    // fallback
  }

  // Auto-detect based on key prefix if available
  const key = getStoredApiKey();
  if (key.startsWith("AIza")) return "gemini";
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("sk-")) return "openai";

  return "gemini"; // Default recommendation
}

/**
 * Persists the user's API key and provider preference.
 */
export function setStoredApiKey(key: string, provider: SupportedProvider = "gemini"): void {
  if (typeof window === "undefined") return;
  const trimmedKey = key.trim();
  try {
    if (trimmedKey) {
      localStorage.setItem(STORAGE_KEY, trimmedKey);
      localStorage.setItem(STORAGE_PROVIDER, provider);
      sessionStorage.setItem(STORAGE_KEY, trimmedKey);
      sessionStorage.setItem(STORAGE_PROVIDER, provider);
    } else {
      clearStoredApiKey();
    }
  } catch {
    // fallback to sessionStorage only if localStorage is blocked
    if (trimmedKey) {
      sessionStorage.setItem(STORAGE_KEY, trimmedKey);
      sessionStorage.setItem(STORAGE_PROVIDER, provider);
    }
  }
}

/**
 * Clears stored API keys and resets to Zero-Key Local Mode.
 */
export function clearStoredApiKey(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_PROVIDER);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_PROVIDER);
    sessionStorage.removeItem("legallens_user_key");
  } catch {
    // ignore
  }
}

/**
 * Returns HTTP headers containing the active API key and provider.
 */
export function getApiKeyHeaders(): Record<string, string> {
  const key = getStoredApiKey();
  const provider = getStoredProvider();

  const headers: Record<string, string> = {};
  if (key) {
    headers["x-api-key"] = key;
    if (provider === "gemini") {
      headers["x-gemini-api-key"] = key;
    }
    headers["x-ai-provider"] = provider;
  }
  return headers;
}
