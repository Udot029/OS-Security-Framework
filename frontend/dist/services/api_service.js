const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // milliseconds
const REQUEST_TIMEOUT = 15000; // milliseconds
const HEALTH_TIMEOUT = 3000; // milliseconds
const API_PORT = 5000;
function normalizeApiBase(apiBase) {
    return apiBase.replace(/\/+$/, "");
}
function getApiCandidates() {
    const configuredCandidates = window.getOSSecurityApiCandidates?.() || window.OS_SECURITY_API_CANDIDATES || [];
    const pageHost = window.location.hostname || "127.0.0.1";
    const candidates = [
        window.OS_SECURITY_API_BASE,
        ...configuredCandidates,
        `${window.location.protocol}//${pageHost}:${API_PORT}`,
        `http://${pageHost}:${API_PORT}`,
        "http://localhost:5000",
        "http://127.0.0.1:5000",
    ];
    return Array.from(new Set(candidates
        .filter((candidate) => Boolean(candidate))
        .map(normalizeApiBase)));
}
function rememberApiBase(apiBase) {
    window.OS_SECURITY_API_BASE = normalizeApiBase(apiBase);
}
/**
 * Retry logic for failed requests
 */
async function fetchWithRetry(url, options, retries = MAX_RETRIES, timeoutMs = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    }
    catch (error) {
        if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1, timeoutMs);
        }
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("Backend request timed out. Make sure the backend is running and reachable from this device.");
        }
        throw error;
    }
    finally {
        window.clearTimeout(timeoutId);
    }
}
async function fetchFromBackend(path, options, retries = MAX_RETRIES, timeoutMs = REQUEST_TIMEOUT) {
    let lastError = null;
    for (const apiBase of getApiCandidates()) {
        try {
            const response = await fetchWithRetry(`${apiBase}${path}`, options, retries, timeoutMs);
            rememberApiBase(apiBase);
            return response;
        }
        catch (error) {
            lastError = error;
        }
    }
    const candidates = getApiCandidates().join(", ");
    const detail = lastError instanceof Error ? ` Last error: ${lastError.message}` : "";
    throw new Error(`Backend disconnected. Tried: ${candidates}.${detail}`);
}
export async function checkAccess(payload) {
    const response = await fetchFromBackend("/check-access", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    }, MAX_RETRIES, REQUEST_TIMEOUT);
    if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const message = errorJson?.error || `HTTP ${response.status}`;
        throw new Error(message);
    }
    return response.json();
}
export async function getBackendConfig() {
    const response = await fetchFromBackend("/config", { method: "GET" }, 1, HEALTH_TIMEOUT);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}
/**
 * Check backend health with retry logic
 */
export async function checkBackendHealth() {
    try {
        const response = await fetchFromBackend("/status", { method: "GET" }, 1, HEALTH_TIMEOUT);
        return response.ok;
    }
    catch {
        return false;
    }
}
