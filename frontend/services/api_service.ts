import { AccessCheckRequest, AccessCheckResponse } from "../type/type";

const API_BASE = "http://localhost:5000";

export async function checkAccess(
  payload: AccessCheckRequest
): Promise<AccessCheckResponse> {
  const response = await fetch(`${API_BASE}/check-access`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const message = errorJson?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
