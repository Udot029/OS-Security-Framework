import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { checkAccess } from "../services/api_service.js";
const SUBJECTS = ["alice", "bob"];
const FILES = ["file1", "file2"];
const ACTIONS = ["read", "write"];
const POLICIES = [
    { id: "bell", label: "Bell LaPadula", description: "Confidentiality model with no read-up and no write-down enforcement." },
    { id: "biba", label: "Biba", description: "Integrity model with no read-down and no write-up enforcement." },
];
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
export default function SecurityDashboard() {
    const [user, setUser] = useState(SUBJECTS[0]);
    const [file, setFile] = useState(FILES[0]);
    const [action, setAction] = useState(ACTIONS[0]);
    const [policy, setPolicy] = useState(POLICIES[0].id);
    const [response, setResponse] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [backendStatus, setBackendStatus] = useState("loading");
    const requestPayload = useMemo(() => ({ user, file, action, policy }), [user, file, action, policy]);
    async function checkBackendStatus() {
        try {
            const res = await fetch("http://localhost:5000/status");
            setBackendStatus(res.ok ? "connected" : "disconnected");
        }
        catch {
            setBackendStatus("disconnected");
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setResponse(null);
        try {
            const result = await checkAccess(requestPayload);
            setResponse(result);
            setHistory((prev) => [result, ...prev].slice(0, 5));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setLoading(false);
            checkBackendStatus();
        }
    }
    useEffect(() => {
        checkBackendStatus();
    }, []);
    const activePolicy = POLICIES.find((item) => item.id === policy);
    return (_jsxs("div", { style: containerStyle, children: [_jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsxs("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }, children: [_jsx("span", { style: { color: "#2563eb", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.16em" }, children: "Policy evaluation" }), _jsxs("span", { style: {
                                    padding: "10px 14px",
                                    borderRadius: 999,
                                    background: backendStatus === "connected" ? "#dcfce7" : backendStatus === "loading" ? "#fef3c7" : "#fee2e2",
                                    color: backendStatus === "connected" ? "#166534" : backendStatus === "loading" ? "#92400e" : "#991b1b",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                }, children: ["Backend: ", backendStatus === "loading" ? "Checking..." : backendStatus === "connected" ? "Connected" : "Disconnected"] })] }), _jsx("h2", { style: { margin: 0, fontSize: "2rem", color: "#111827" }, children: "Realtime OS access control dashboard" }), _jsx("p", { style: { margin: 0, color: "#475569", fontSize: "1rem", lineHeight: 1.8 }, children: "Select a subject, object, action, and security model, then submit the request to see an allow or deny decision from the backend guard." })] }), _jsxs("div", { style: gridStyle, children: [_jsxs("div", { style: { display: "grid", gap: 22 }, children: [_jsxs("form", { onSubmit: handleSubmit, style: { display: "grid", gap: 18 }, children: [_jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Subject", _jsx("select", { value: user, onChange: (e) => setUser(e.target.value), style: inputStyle, children: SUBJECTS.map((subject) => (_jsx("option", { value: subject, children: subject }, subject))) })] }), _jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Object", _jsx("select", { value: file, onChange: (e) => setFile(e.target.value), style: inputStyle, children: FILES.map((entry) => (_jsx("option", { value: entry, children: entry }, entry))) })] }), _jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Action", _jsx("select", { value: action, onChange: (e) => setAction(e.target.value), style: inputStyle, children: ACTIONS.map((entry) => (_jsx("option", { value: entry, children: entry }, entry))) })] }), _jsxs("label", { style: { display: "grid", gap: 8, color: "#0f172a", fontWeight: 600 }, children: ["Security model", _jsx("select", { value: policy, onChange: (e) => setPolicy(e.target.value), style: inputStyle, children: POLICIES.map((entry) => (_jsx("option", { value: entry.id, children: entry.label }, entry.id))) })] }), _jsx("button", { type: "submit", disabled: loading, style: { ...buttonStyle, opacity: loading ? 0.7 : 1 }, children: loading ? "Evaluating policy..." : "Run access check" })] }), _jsxs("div", { style: cardStyle, children: [_jsx("h3", { style: { margin: "0 0 10px", fontSize: "1.1rem", color: "#0f172a" }, children: "Selected policy" }), _jsx("p", { style: { margin: 0, color: "#475569", lineHeight: 1.7 }, children: activePolicy?.description })] })] }), _jsxs("div", { style: cardStyle, children: [_jsx("h3", { style: { margin: 0, color: "#0f172a" }, children: "Live request summary" }), _jsxs("div", { style: { marginTop: 18, display: "grid", gap: 14 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Subject" }), _jsx("strong", { style: { color: "#111827" }, children: user })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Object" }), _jsx("strong", { style: { color: "#111827" }, children: file })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Action" }), _jsx("strong", { style: { color: "#111827" }, children: action })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 }, children: [_jsx("span", { style: { color: "#475569" }, children: "Model" }), _jsx("strong", { style: { color: "#111827" }, children: activePolicy?.label })] })] })] })] }), error && (_jsxs("div", { style: { padding: 20, borderRadius: 22, background: "#ffe4e6", border: "1px solid rgba(191, 90, 242, 0.18)", color: "#991b1b" }, children: [_jsx("strong", { children: "Error:" }), " ", error] })), response && (_jsxs("div", { style: { display: "grid", gap: 20, padding: 24, borderRadius: 28, background: "#0f172a", color: "#f8fafc" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }, children: [_jsx("div", { children: _jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, background: response.allowed ? "#1d4ed8" : "#991b1b", padding: "10px 16px", borderRadius: 999, fontWeight: 700 }, children: response.allowed ? "Access allowed" : "Access denied" }) }), _jsxs("span", { style: { color: "#cbd5e1", fontSize: "0.95rem" }, children: ["Return code: ", response.code] })] }), _jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { children: "Guard output" }), _jsx("strong", { children: response.output || "No output" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { children: "Error" }), _jsx("strong", { children: response.error || "None" })] })] }), _jsxs("div", { style: { display: "grid", gap: 14, padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }, children: [_jsx("h4", { style: { margin: 0, fontSize: "1rem", color: "#e2e8f0" }, children: "Request payload" }), _jsx("pre", { style: { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#dbeafe", fontSize: "0.95rem" }, children: JSON.stringify(requestPayload, null, 2) })] })] })), history.length > 0 && (_jsxs("div", { style: cardStyle, children: [_jsx("h3", { style: { margin: "0 0 18px", color: "#0f172a" }, children: "Recent decision history" }), _jsx("div", { style: { display: "grid", gap: 14 }, children: history.map((entry, index) => (_jsxs("div", { style: { display: "grid", gap: 8, padding: 16, borderRadius: 20, background: "#f8fafc", border: "1px solid rgba(148, 163, 184, 0.16)" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, children: [_jsxs("span", { style: { color: "#475569" }, children: ["Decision ", history.length - index] }), _jsx("strong", { style: { color: entry.allowed ? "#185adb" : "#b91c1c" }, children: entry.allowed ? "Allowed" : "Denied" })] }), _jsxs("div", { style: { display: "grid", gap: 6, color: "#475569", fontSize: "0.94rem" }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Output:" }), " ", entry.output || "No output"] }), _jsxs("div", { children: [_jsx("strong", { children: "Error:" }), " ", entry.error || "None"] }), _jsxs("div", { children: [_jsx("strong", { children: "Code:" }), " ", entry.code] })] })] }, index))) })] }))] }));
}
