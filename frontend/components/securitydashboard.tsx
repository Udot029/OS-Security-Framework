import React, { useEffect, useMemo, useState } from "react";
import { checkAccess, checkBackendHealth, getBackendConfig } from "../services/api_service.ts";
import { AccessCheckRequest, AccessCheckResponse, BackendConfig } from "../type/type.ts";

const SUBJECTS = ["Uday", "Rishu", "Anisha", "Kavya", "Rahul", "Sanya", "Aarav", "Diya", "Kabir", "Myra"];
const FILES = ["file1", "file2"];
const ACTIONS = ["read", "write"] as const;
const POLICIES = [
  { id: "bell", label: "Bell LaPadula", description: "Confidentiality model ." },
  { id: "biba", label: "Biba", description: "Integrity model." },
] as const;

const SUBJECT_LEVELS: Record<string, number> = {
  Uday: 3,
  Rishu: 1,
  Anisha: 2,
  Kavya: 1,
  Rahul: 2,
  Sanya: 1,
  Aarav: 2,
  Diya: 1,
  Kabir: 2,
  Myra: 1,
};

const OBJECT_LEVELS: Record<string, number> = {
  file1: 2,
  file2: 1,
};

const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  securityModel: "bell",
  subjects: SUBJECT_LEVELS,
  objects: OBJECT_LEVELS,
  files: FILES,
  policies: ["bell", "biba"],
  actions: ["read", "write"],
};

type ActionType = typeof ACTIONS[number];
type PolicyType = typeof POLICIES[number]["id"];

const containerStyle: React.CSSProperties = {
  display: "grid",
  gap: 24,
  padding: 28,
  borderRadius: 32,
  background: "#ffffff",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 24px 48px rgba(15, 23, 42, 0.08)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: 24,
  gridTemplateColumns: "1.8fr 1fr",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 24,
  background: "#f8fbff",
  padding: 20,
  border: "1px solid rgba(56, 189, 248, 0.15)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 10,
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "#ffffff",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: 14,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  letterSpacing: "0.01em",
};

const simulationSceneStyle: React.CSSProperties = {
  perspective: "1200px",
  width: "100%",
  minHeight: 320,
  display: "grid",
  placeItems: "center",
};

const simulationCubeStyle: React.CSSProperties = {
  position: "relative",
  width: 240,
  height: 240,
  transformStyle: "preserve-3d",
  transition: "transform 0.7s ease",
};

const simulationFaceStyle: React.CSSProperties = {
  position: "absolute",
  width: 220,
  height: 220,
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.18)",
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  padding: 18,
  boxSizing: "border-box",
  color: "white",
  fontWeight: 700,
  boxShadow: "0 24px 42px rgba(15, 23, 42, 0.16)",
};

const simulationLabelStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  margin: "0 0 10px",
  opacity: 0.85,
};

const simulationValueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.35rem",
  lineHeight: 1.1,
};

export default function SecurityDashboard() {
  const [backendConfig, setBackendConfig] = useState<BackendConfig>(DEFAULT_BACKEND_CONFIG);
  const [user, setUser] = useState<string>(SUBJECTS[0]);
  const [file, setFile] = useState<string>(FILES[0]);
  const [action, setAction] = useState<ActionType>(ACTIONS[0]);
  const [policy, setPolicy] = useState<PolicyType>(POLICIES[0].id);
  const [cubeRotation, setCubeRotation] = useState(0);
  const [response, setResponse] = useState<AccessCheckResponse | null>(null);
  const [history, setHistory] = useState<AccessCheckResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [lastCheckedAt, setLastCheckedAt] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  const requestPayload: AccessCheckRequest = useMemo(
    () => ({ user, file, action, policy }),
    [user, file, action, policy]
  );

  const subjects = useMemo(() => Object.keys(backendConfig.subjects), [backendConfig.subjects]);
  const files = backendConfig.files;

  const liveSimulation = useMemo(() => {
    const sLvl = backendConfig.subjects[user] ?? 0;
    const oLvl = backendConfig.objects[file] ?? 0;
    let allowed = false;
    let reason = "";

    if (policy === "bell") {
      if (action === "read") {
        allowed = sLvl >= oLvl;
        reason = allowed ? "Allowed: subject can read ." : "Denied: Bell no read up rule violated.";
      } else {
        allowed = sLvl <= oLvl;
        reason = allowed ? "Allowed: subject can write ." : "Denied: Bell no write down rule violated.";
      }
    } else {
      if (action === "read") {
        allowed = sLvl <= oLvl;
        reason = allowed ? "Allowed: subject can read ." : "Denied: Biba no read down rule violated.";
      } else {
        allowed = sLvl >= oLvl;
        reason = allowed ? "Allowed: subject can write ." : "Denied: Biba no write up rule violated.";
      }
    }

    return { allowed, reason, sLvl, oLvl };
  }, [backendConfig.objects, backendConfig.subjects, user, file, action, policy]);

  useEffect(() => {
    setCubeRotation((prev) => prev + 72);
  }, [user, file, action, policy]);

  const simulationColor = liveSimulation.allowed ? "#0f766e" : "#881337";
  const cubeTransform = `rotateX(${18 + liveSimulation.sLvl * 7}deg) rotateY(${36 + liveSimulation.oLvl * 12 + cubeRotation}deg) rotateZ(${action === "read" ? 6 : -6}deg)`;

  async function checkBackendStatus() {
    const isHealthy = await checkBackendHealth();
    setBackendStatus(isHealthy ? "connected" : "disconnected");
  }

  async function loadBackendConfig() {
    try {
      const config = await getBackendConfig();
      setBackendConfig(config);
      setBackendStatus("connected");

      const nextSubjects = Object.keys(config.subjects);
      const nextFiles = config.files;
      if (nextSubjects.length > 0 && !nextSubjects.includes(user)) {
        setUser(nextSubjects[0]);
      }
      if (nextFiles.length > 0 && !nextFiles.includes(file)) {
        setFile(nextFiles[0]);
      }
      if (config.actions.length > 0 && !config.actions.includes(action)) {
        setAction(config.actions[0]);
      }
      if (config.policies.length > 0 && !config.policies.includes(policy)) {
        setPolicy(config.securityModel);
      }
    } catch {
      setBackendStatus("disconnected");
    }
  }

  async function runAccessCheck() {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await checkAccess(requestPayload);
      setResponse(result);
      setLastCheckedAt(new Date().toLocaleTimeString());
      setHistory((prev) => [result, ...prev].slice(0, 5));
      setBackendStatus("connected");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBackendStatus("disconnected");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await runAccessCheck();
  }

 
  useEffect(() => {
    loadBackendConfig();
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const activePolicy = POLICIES.find((item) => item.id === policy);
  const availablePolicies = POLICIES.filter((item) => backendConfig.policies.includes(item.id));

  return (
    <div style={containerStyle}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#2563eb", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.16em" }}>
            Evaluation
          </span>
          <span
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: backendStatus === "connected" ? "#dcfce7" : backendStatus === "loading" ? "#fef3c7" : "#fee2e2",
              color: backendStatus === "connected" ? "#166534" : backendStatus === "loading" ? "#92400e" : "#991b1b",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            Backend: {backendStatus === "loading" ? "Checking..." : backendStatus === "connected" ? "Connected" : "Disconnected"}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: "2rem", color: "#111827" }}>Dashboard</h2>
        <p style={{ margin: 0, color: "#475569", fontSize: "1rem", lineHeight: 1.8 }}>
          Security check is running...
        </p>
      </div>

      <div style={gridStyle}>
        <div style={{ display: "grid", gap: 22 }}>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ padding: 22, borderRadius: 24, background: "#eff6ff", border: "1px solid rgba(37, 99, 235, 0.16)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: liveSimulation.allowed ? "#164e63" : "#881337", fontWeight: 700 }}>
                Live simulation: {liveSimulation.allowed ? "Allowed" : "Denied"}
              </span>
              <p style={{ margin: "14px 0 0", color: "#0f172a" }}>
                Policy: <strong>{activePolicy?.label}</strong>
              </p>
              <p style={{ margin: "8px 0 0", color: "#475569" }}>
                Subject level: <strong>{liveSimulation.sLvl}</strong> / Object level: <strong>{liveSimulation.oLvl}</strong>
              </p>
              <p style={{ margin: "14px 0 0", color: "#475569" }}>
                {liveSimulation.reason}
              </p>

              <div style={simulationSceneStyle}>
                <div style={{ ...simulationCubeStyle, width: 300, height: 300, transform: cubeTransform }}>
                  <div style={{
                    ...simulationFaceStyle,
                    width: 240,
                    height: 240,
                    background: `linear-gradient(180deg, ${simulationColor} 0%, rgba(15, 23, 42, 0.95) 100%)`,
                    transform: "rotateY(0deg) translateZ(130px)",
                  }}>
                    <div style={simulationLabelStyle}>Live simulation</div>
                    <p style={simulationValueStyle}>{liveSimulation.allowed ? "Permit" : "Block"}</p>
                    <p style={{ margin: 0, marginTop: 10, fontSize: "0.95rem", opacity: 0.9 }}>
                      {user} to {file} / {action} / {activePolicy?.label}
                    </p>
                  </div>
                  <div style={{
                    ...simulationFaceStyle,
                    width: 200,
                    height: 200,
                    background: "rgba(255,255,255,0.08)",
                    color: "#cbd5e1",
                    transform: "rotateY(90deg) translateZ(130px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}>
                    <div style={simulationLabelStyle}>Subject level</div>
                    <p style={simulationValueStyle}>{liveSimulation.sLvl}</p>
                  </div>
                  <div style={{
                    ...simulationFaceStyle,
                    width: 200,
                    height: 200,
                    background: "rgba(255,255,255,0.08)",
                    color: "#cbd5e1",
                    transform: "rotateX(90deg) translateZ(130px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}>
                    <div style={simulationLabelStyle}>Object level</div>
                    <p style={simulationValueStyle}>{liveSimulation.oLvl}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
              <label style={{ display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }}>
                Subject
                <select value={user} onChange={(e) => setUser(e.target.value)} style={inputStyle}>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }}>
                Object
                <select value={file} onChange={(e) => setFile(e.target.value)} style={inputStyle}>
                  {files.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }}>
                Action
                <select value={action} onChange={(e) => setAction(e.target.value as ActionType)} style={inputStyle}>
                  {backendConfig.actions.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }}>
                Security model
                <select value={policy} onChange={(e) => setPolicy(e.target.value as PolicyType)} style={inputStyle}>
                  {availablePolicies.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                disabled={loading}
                onClick={runAccessCheck}
                style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Evaluation..." : "Run access check"}
              </button>
              <div style={{ minHeight: 24, color: loading ? "#2563eb" : response ? (response.allowed ? "#166534" : "#991b1b") : "#64748b", fontWeight: 700 }}>
                {loading
                  ? "Sending request ..."
                  : response
                    ? `${response.allowed ? "Access allowed" : "Access denied"}${lastCheckedAt ? ` at ${lastCheckedAt}` : ""}`
                    : "Ready to run access check"}
              </div>
            </form>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Live request summary</h3>
            <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#475569" }}>Subject</span>
                <strong style={{ color: "#111827" }}>{user}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#475569" }}>Object</span>
                <strong style={{ color: "#111827" }}>{file}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#475569" }}>Action</span>
                <strong style={{ color: "#111827" }}>{action}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#475569" }}>Model</span>
                <strong style={{ color: "#111827" }}>{activePolicy?.label}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#475569" }}>Last backend result</span>
                <strong style={{ color: response ? (response.allowed ? "#166534" : "#991b1b") : "#64748b" }}>
                  {response ? (response.allowed ? "Allowed" : "Denied") : "Not run"}
                </strong>
              </div>
              {response && (
                <div style={{ display: "grid", gap: 6, padding: 12, borderRadius: 14, background: "#ffffff", border: "1px solid rgba(148, 163, 184, 0.16)" }}>
                  <span style={{ color: "#475569" }}>Backend output</span>
                  <strong style={{ color: "#111827" }}>{response.output || response.error || "No output"}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {history.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 18px", color: "#0f172a" }}>History</h3>
          <div style={{ display: "grid", gap: 14 }}>
            {history.map((entry, index) => (
              <div key={index} style={{ display: "grid", gap: 8, padding: 16, borderRadius: 20, background: "#f8fafc", border: "1px solid rgba(148, 163, 184, 0.16)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#475569" }}>Decision {history.length - index}</span>
                  <strong style={{ color: entry.allowed ? "#185adb" : "#b91c1c" }}>{entry.allowed ? "Allowed" : "Denied"}</strong>
                </div>
                <div style={{ display: "grid", gap: 6, color: "#475569", fontSize: "0.94rem" }}>
                  <div><strong>Output:</strong> {entry.output || "No output"}</div>
                  <div><strong>Error:</strong> {entry.error || "None"}</div>
                  <div><strong>Code:</strong> {entry.code}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
