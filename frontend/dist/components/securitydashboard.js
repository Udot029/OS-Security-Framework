import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { checkAccess, checkBackendHealth, getBackendConfig } from "../services/api_service.js";
const SUBJECTS = ["Uday", "Rishu","Anisha", "Kavya", "Rahul", "Sanya", "Aarav", "Diya", "Kabir", "Myra"];
const FILES = ["file1", "file2"];
const ACTIONS = ["read", "write"];
const POLICIES = [
    { id: "bell", label: "Bell LaPadula", description: "Confidentiality model with no read-up and no write-down enforcement." },
    { id: "biba", label: "Biba", description: "Integrity model with no read-down and no write-up enforcement." },
];
const SUBJECT_LEVELS = {
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
const OBJECT_LEVELS = {
    file1: 2,
    file2: 1,
};
const DEFAULT_BACKEND_CONFIG = {
    securityModel: "bell",
    subjects: SUBJECT_LEVELS,
    objects: OBJECT_LEVELS,
    files: FILES,
    policies: ["bell", "biba"],
    actions: ["read", "write"],
};
const containerStyle = {
    display: "grid",
    gap: 24,
    padding: 28,
    borderRadius: 32,
    background: "#ffffff",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 24px 48px rgba(15, 23, 42, 0.08)",
};
const gridStyle = {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "1.8fr 1fr",
};
const cardStyle = {
    borderRadius: 24,
    background: "#f8fbff",
    padding: 20,
    border: "1px solid rgba(56, 189, 248, 0.15)",
};
const inputStyle = {
    width: "100%",
    marginTop: 10,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background: "#ffffff",
};
const buttonStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 14,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 700,
    letterSpacing: "0.01em",
};
const simulationSceneStyle = {
    perspective: "1200px",
    width: "100%",
    minHeight: 320,
    display: "grid",
    placeItems: "center",
};
const simulationCubeStyle = {
    position: "relative",
    width: 240,
    height: 240,
    transformStyle: "preserve-3d",
    transition: "transform 0.7s ease",
};
const simulationFaceStyle = {
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
const simulationLabelStyle = {
    fontSize: "0.95rem",
    margin: "0 0 10px",
    opacity: 0.85,
};
const simulationValueStyle = {
    margin: 0,
    fontSize: "1.35rem",
    lineHeight: 1.1,
};
export default function SecurityDashboard() {
    const [backendConfig, setBackendConfig] = useState(DEFAULT_BACKEND_CONFIG);
    const [user, setUser] = useState(SUBJECTS[0]);
    const [file, setFile] = useState(FILES[0]);
    const [action, setAction] = useState(ACTIONS[0]);
    const [policy, setPolicy] = useState(POLICIES[0].id);
    const [cubeRotation, setCubeRotation] = useState(0);
    const [response, setResponse] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lastCheckedAt, setLastCheckedAt] = useState("");
    const [backendStatus, setBackendStatus] = useState("loading");
    const requestPayload = useMemo(() => ({ user, file, action, policy }), [user, file, action, policy]);
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
                reason = allowed ? "Allowed: subject can read at or below its clearance." : "Denied: Bell no read-up rule violated.";
            }
            else {
                allowed = sLvl <= oLvl;
                reason = allowed ? "Allowed: subject can write at or above its clearance." : "Denied: Bell no write-down rule violated.";
            }
        }
        else {
            if (action === "read") {
                allowed = sLvl <= oLvl;
                reason = allowed ? "Allowed: subject can read at or above its integrity." : "Denied: Biba no read-down rule violated.";
            }
            else {
                allowed = sLvl >= oLvl;
                reason = allowed ? "Allowed: subject can write at or below its integrity." : "Denied: Biba no write-up rule violated.";
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
        }
        catch {
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setBackendStatus("disconnected");
        }
        finally {
            setLoading(false);
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        await runAccessCheck();
    }
    // Check backend status on mount and periodically
    useEffect(() => {
        loadBackendConfig();
        const interval = setInterval(checkBackendStatus, 10000);
        return () => clearInterval(interval);
    }, []);
    const activePolicy = POLICIES.find((item) => item.id === policy);
    const availablePolicies = POLICIES.filter((item) => backendConfig.policies.includes(item.id));
    return (_jsxs("div", { style: containerStyle, children: [_jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsxs("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }, children: [_jsx("span", { style: { color: "#2563eb", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.16em" }, children: "Policy evaluation" }), _jsxs("span", { style: {
                                    padding: "10px 14px",
                                    borderRadius: 999,
                                    background: backendStatus === "connected" ? "#dcfce7" : backendStatus === "loading" ? "#fef3c7" : "#fee2e2",
                                    color: backendStatus === "connected" ? "#166534" : backendStatus === "loading" ? "#92400e" : "#991b1b",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                }, children: ["Backend: ", backendStatus === "loading" ? "Checking..." : backendStatus === "connected" ? "Connected" : "Disconnected"] })] }), _jsx("h2", { style: { margin: 0, fontSize: "2rem", color: "#111827" }, children: "Realtime OS access control dashboard" }), _jsx("p", { style: { margin: 0, color: "#475569", fontSize: "1rem", lineHeight: 1.8 }, children: "Select a subject, object, action, and security model, then submit the request to see an allow or deny decision from the backend guard." })] }), _jsx("div", { style: gridStyle, children: _jsxs("div", { style: { display: "grid", gap: 22 }, children: [_jsxs("div", { style: { display: "grid", gap: 18 }, children: [_jsxs("div", { style: { padding: 22, borderRadius: 24, background: "#eff6ff", border: "1px solid rgba(37, 99, 235, 0.16)" }, children: [_jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, color: liveSimulation.allowed ? "#164e63" : "#881337", fontWeight: 700 }, children: ["Live simulation: ", liveSimulation.allowed ? "Allowed" : "Denied"] }), _jsxs("p", { style: { margin: "14px 0 0", color: "#0f172a" }, children: ["Policy: ", _jsx("strong", { children: activePolicy?.label })] }), _jsxs("p", { style: { margin: "8px 0 0", color: "#475569" }, children: ["Subject level: ", _jsx("strong", { children: liveSimulation.sLvl }), " / Object level: ", _jsx("strong", { children: liveSimulation.oLvl })] }), _jsx("p", { style: { margin: "14px 0 0", color: "#475569" }, children: liveSimulation.reason }), _jsx("div", { style: simulationSceneStyle, children: _jsxs("div", { style: { ...simulationCubeStyle, width: 300, height: 300, transform: cubeTransform }, children: [_jsxs("div", { style: {
                                                            ...simulationFaceStyle,
                                                            width: 240,
                                                            height: 240,
                                                            background: `linear-gradient(180deg, ${simulationColor} 0%, rgba(15, 23, 42, 0.95) 100%)`,
                                                            transform: "rotateY(0deg) translateZ(130px)",
                                                        }, children: [_jsx("div", { style: simulationLabelStyle, children: "Live simulation" }), _jsx("p", { style: simulationValueStyle, children: liveSimulation.allowed ? "Permit" : "Block" }), _jsxs("p", { style: { margin: 0, marginTop: 10, fontSize: "0.95rem", opacity: 0.9 }, children: [user, " to ", file, " / ", action, " / ", activePolicy?.label] })] }), _jsxs("div", { style: {
                                                            ...simulationFaceStyle,
                                                            width: 200,
                                                            height: 200,
                                                            background: "rgba(255,255,255,0.08)",
                                                            color: "#cbd5e1",
                                                            transform: "rotateY(90deg) translateZ(130px)",
                                                            border: "1px solid rgba(255,255,255,0.12)",
                                                        }, children: [_jsx("div", { style: simulationLabelStyle, children: "Subject level" }), _jsx("p", { style: simulationValueStyle, children: liveSimulation.sLvl })] }), _jsxs("div", { style: {
                                                            ...simulationFaceStyle,
                                                            width: 200,
                                                            height: 200,
                                                            background: "rgba(255,255,255,0.08)",
                                                            color: "#cbd5e1",
                                                            transform: "rotateX(90deg) translateZ(130px)",
                                                            border: "1px solid rgba(255,255,255,0.12)",
                                                        }, children: [_jsx("div", { style: simulationLabelStyle, children: "Object level" }), _jsx("p", { style: simulationValueStyle, children: liveSimulation.oLvl })] })] }) })] }), _jsxs("form", { onSubmit: handleSubmit, style: { display: "grid", gap: 18 }, children: [_jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Subject", _jsx("select", { value: user, onChange: (e) => setUser(e.target.value), style: inputStyle, children: subjects.map((subject) => (_jsx("option", { value: subject, children: subject }, subject))) })] }), _jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Object", _jsx("select", { value: file, onChange: (e) => setFile(e.target.value), style: inputStyle, children: files.map((entry) => (_jsx("option", { value: entry, children: entry }, entry))) })] }), _jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Action", _jsx("select", { value: action, onChange: (e) => setAction(e.target.value), style: inputStyle, children: backendConfig.actions.map((entry) => (_jsx("option", { value: entry, children: entry }, entry))) })] }), _jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Security model", _jsx("select", { value: policy, onChange: (e) => setPolicy(e.target.value), style: inputStyle, children: availablePolicies.map((entry) => (_jsx("option", { value: entry.id, children: entry.label }, entry.id))) })] }), _jsx("button", { type: "button", disabled: loading, onClick: runAccessCheck, style: { ...buttonStyle, opacity: loading ? 0.7 : 1 }, children: loading ? "Evaluating policy..." : "Run access check" }), _jsx("div", { style: { minHeight: 24, color: loading ? "#2563eb" : response ? (response.allowed ? "#166534" : "#991b1b") : "#64748b", fontWeight: 700 }, children: loading
                                                ? "Sending request to backend..."
                                                : response
                                                    ? `${response.allowed ? "Access allowed" : "Access denied"}${lastCheckedAt ? ` at ${lastCheckedAt}` : ""}`
                                                    : "Ready to run access check" })] }), _jsxs("div", { style: cardStyle, children: [_jsx("h3", { style: { margin: "0 0 10px", fontSize: "1.1rem", color: "#0f172a" }, children: "Selected policy" }), _jsx("p", { style: { margin: 0, color: "#475569", lineHeight: 1.7 }, children: activePolicy?.description })] })] }), _jsxs("div", { style: cardStyle, children: [_jsx("h3", { style: { margin: 0, color: "#0f172a" }, children: "Live request summary" }), _jsxs("div", { style: { marginTop: 18, display: "grid", gap: 14 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Subject" }), _jsx("strong", { style: { color: "#111827" }, children: user })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Object" }), _jsx("strong", { style: { color: "#111827" }, children: file })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Action" }), _jsx("strong", { style: { color: "#111827" }, children: action })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Model" }), _jsx("strong", { style: { color: "#111827" }, children: activePolicy?.label })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Last backend result" }), _jsx("strong", { style: { color: response ? (response.allowed ? "#166534" : "#991b1b") : "#64748b" }, children: response ? (response.allowed ? "Allowed" : "Denied") : "Not run" })] }), response && (_jsxs("div", { style: { display: "grid", gap: 6, padding: 12, borderRadius: 14, background: "#ffffff", border: "1px solid rgba(148, 163, 184, 0.16)" }, children: [_jsx("span", { style: { color: "#475569" }, children: "Backend output" }), _jsx("strong", { style: { color: "#111827" }, children: response.output || response.error || "No output" })] }))] })] })] }) }), error && (_jsxs("div", { style: { padding: 20, borderRadius: 22, background: "#ffe4e6", border: "1px solid rgba(191, 90, 242, 0.18)", color: "#991b1b" }, children: [_jsx("strong", { children: "Error:" }), " ", error] })), response && (_jsxs("div", { style: { display: "grid", gap: 20, padding: 24, borderRadius: 28, background: "#0f172a", color: "#f8fafc" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }, children: [_jsx("div", { children: _jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, background: response.allowed ? "#1d4ed8" : "#991b1b", padding: "10px 16px", borderRadius: 999, fontWeight: 700 }, children: response.allowed ? "Access allowed" : "Access denied" }) }), _jsxs("span", { style: { color: "#cbd5e1", fontSize: "0.95rem" }, children: ["Return code: ", response.code] })] }), _jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { children: "Guard output" }), _jsx("strong", { children: response.output || "No output" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { children: "Error" }), _jsx("strong", { children: response.error || "None" })] })] }), _jsxs("div", { style: { display: "grid", gap: 14, padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }, children: [_jsx("h4", { style: { margin: 0, fontSize: "1rem", color: "#e2e8f0" }, children: "Request payload" }), _jsx("pre", { style: { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#dbeafe", fontSize: "0.95rem" }, children: JSON.stringify(requestPayload, null, 2) })] })] })), history.length > 0 && (_jsxs("div", { style: cardStyle, children: [_jsx("h3", { style: { margin: "0 0 18px", color: "#0f172a" }, children: "Recent decision history" }), _jsx("div", { style: { display: "grid", gap: 14 }, children: history.map((entry, index) => (_jsxs("div", { style: { display: "grid", gap: 8, padding: 16, borderRadius: 20, background: "#f8fafc", border: "1px solid rgba(148, 163, 184, 0.16)" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, children: [_jsxs("span", { style: { color: "#475569" }, children: ["Decision ", history.length - index] }), _jsx("strong", { style: { color: entry.allowed ? "#185adb" : "#b91c1c" }, children: entry.allowed ? "Allowed" : "Denied" })] }), _jsxs("div", { style: { display: "grid", gap: 6, color: "#475569", fontSize: "0.94rem" }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Output:" }), " ", entry.output || "No output"] }), _jsxs("div", { children: [_jsx("strong", { children: "Error:" }), " ", entry.error || "None"] }), _jsxs("div", { children: [_jsx("strong", { children: "Code:" }), " ", entry.code] })] })] }, index))) })] }))] }));
}
