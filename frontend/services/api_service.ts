import { AccessCheckRequest, AccessCheckResponse, BackendConfig } from "../type/type";

declare global {
  interface Window {
    OS_SECURITY_API_BASE?: string;
  }
}

const API_BASE =
  window.OS_SECURITY_API_BASE ||
  "http://127.0.0.1:5000";
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // milliseconds
const REQUEST_TIMEOUT = 15000; // milliseconds
const HEALTH_TIMEOUT = 3000; // milliseconds

/**
 * Retry logic for failed requests
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES,
  timeoutMs: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Backend request timed out. Make sure ${API_BASE} is running.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function checkAccess(
  payload: AccessCheckRequest
): Promise<AccessCheckResponse> {
  const response = await fetchWithRetry(
    `${API_BASE}/check-access`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    MAX_RETRIES,
    REQUEST_TIMEOUT
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const message = errorJson?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function getBackendConfig(): Promise<BackendConfig> {
  const response = await fetchWithRetry(
    `${API_BASE}/config`,
    { method: "GET" },
    1,
    HEALTH_TIMEOUT
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Check backend health with retry logic
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE}/status`,
      { method: "GET" },
      1,
      HEALTH_TIMEOUT
    );
    return response.ok;
  } catch {
    return false;
  }
}
