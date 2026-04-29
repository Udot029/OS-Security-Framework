import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { checkAccess } from "../services/api_service.js";
const SUBJECTS = ["alice", "bob"];
const FILES = ["file1", "file2"];
const ACTIONS = ["read", "write"];
export default function SecurityDashboard() {
    const [user, setUser] = useState(SUBJECTS[0]);
    const [file, setFile] = useState(FILES[0]);
    const [action, setAction] = useState(ACTIONS[0]);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const requestPayload = useMemo(() => ({ user, file, action }), [user, file, action]);
    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setResponse(null);
        try {
            const result = await checkAccess(requestPayload);
            setResponse(result);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { style: { border: "1px solid #ccc", borderRadius: 12, padding: 24, background: "#fafafa" }, children: [_jsx("h2", { children: "Security Dashboard" }), _jsxs("form", { onSubmit: handleSubmit, style: { display: "grid", gap: 16 }, children: [_jsxs("label", { children: ["Subject", _jsx("select", { value: user, onChange: (e) => setUser(e.target.value), style: { width: "100%", marginTop: 8, padding: 8 }, children: SUBJECTS.map((subject) => (_jsx("option", { value: subject, children: subject }, subject))) })] }), _jsxs("label", { children: ["Object", _jsx("select", { value: file, onChange: (e) => setFile(e.target.value), style: { width: "100%", marginTop: 8, padding: 8 }, children: FILES.map((entry) => (_jsx("option", { value: entry, children: entry }, entry))) })] }), _jsxs("label", { children: ["Action", _jsx("select", { value: action, onChange: (e) => setAction(e.target.value), style: { width: "100%", marginTop: 8, padding: 8 }, children: ACTIONS.map((entry) => (_jsx("option", { value: entry, children: entry }, entry))) })] }), _jsx("button", { type: "submit", disabled: loading, style: { padding: "12px 18px", borderRadius: 8, border: "none", background: "#007bff", color: "white", cursor: loading ? "not-allowed" : "pointer" }, children: loading ? "Checking..." : "Check Access" })] }), error && (_jsxs("div", { style: { marginTop: 20, color: "#b00020" }, children: [_jsx("strong", { children: "Error:" }), " ", error] })), response && (_jsxs("div", { style: { marginTop: 20, padding: 18, border: "1px solid #ddd", borderRadius: 12, background: "white" }, children: [_jsx("h3", { children: "Access Result" }), _jsxs("p", { children: [_jsx("strong", { children: "Allowed:" }), " ", response.allowed ? "Yes" : "No"] }), _jsxs("p", { children: [_jsx("strong", { children: "Guard output:" }), " ", response.output || "(none)"] }), _jsxs("p", { children: [_jsx("strong", { children: "Error:" }), " ", response.error || "(none)"] }), _jsxs("p", { children: [_jsx("strong", { children: "Return code:" }), " ", response.code] })] }))] }));
}
