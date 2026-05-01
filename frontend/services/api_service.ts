import { AccessCheckRequest, AccessCheckResponse } from "../type/type";

const API_BASE = "http://localhost:5000";
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // milliseconds

/**
 * Retry logic for failed requests
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
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
    }
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const message = errorJson?.error || `HTTP ${response.status}`;
    throw new Error(message);
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
      2 // Fewer retries for health checks
    );
    return response.ok;
  } catch {
    return false;
  }
}
