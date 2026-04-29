import React, { useMemo, useState } from "react";
import { checkAccess } from "../services/api_service.ts";
import { AccessCheckRequest, AccessCheckResponse } from "../type/type.ts";

const SUBJECTS = ["alice", "bob"];
const FILES = ["file1", "file2"];
const ACTIONS = ["read", "write"] as const;

type ActionType = typeof ACTIONS[number];

export default function SecurityDashboard() {
  const [user, setUser] = useState<string>(SUBJECTS[0]);
  const [file, setFile] = useState<string>(FILES[0]);
  const [action, setAction] = useState<ActionType>(ACTIONS[0]);
  const [response, setResponse] = useState<AccessCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const requestPayload: AccessCheckRequest = useMemo(
    () => ({ user, file, action }),
    [user, file, action]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await checkAccess(requestPayload);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 12, padding: 24, background: "#fafafa" }}>
      <h2>Security Dashboard</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label>
          Subject
          <select value={user} onChange={(e) => setUser(e.target.value)} style={{ width: "100%", marginTop: 8, padding: 8 }}>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <label>
          Object
          <select value={file} onChange={(e) => setFile(e.target.value)} style={{ width: "100%", marginTop: 8, padding: 8 }}>
            {FILES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label>
          Action
          <select value={action} onChange={(e) => setAction(e.target.value as ActionType)} style={{ width: "100%", marginTop: 8, padding: 8 }}>
            {ACTIONS.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={loading} style={{ padding: "12px 18px", borderRadius: 8, border: "none", background: "#007bff", color: "white", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Checking..." : "Check Access"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 20, color: "#b00020" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: 20, padding: 18, border: "1px solid #ddd", borderRadius: 12, background: "white" }}>
          <h3>Access Result</h3>
          <p>
            <strong>Allowed:</strong> {response.allowed ? "Yes" : "No"}
          </p>
          <p>
            <strong>Guard output:</strong> {response.output || "(none)"}
          </p>
          <p>
            <strong>Error:</strong> {response.error || "(none)"}
          </p>
          <p>
            <strong>Return code:</strong> {response.code}
          </p>
        </div>
      )}
    </div>
  );
}
