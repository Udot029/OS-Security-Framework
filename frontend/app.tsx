import React from "react";
import ReactDOM from "react-dom/client";
import SecurityDashboard from "./components/securitydashboard.tsx";

const pageStyles = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "32px 24px",
  background: "linear-gradient(180deg, #e2e8ff 0%, #f8fafc 48%, #f5f7fb 100%)",
};

const heroStyles = {
  width: "100%",
  maxWidth: 1080,
  display: "grid",
  gap: 24,
  padding: "32px 36px",
  borderRadius: 32,
  background: "rgba(255,255,255,0.96)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 32px 80px rgba(15, 23, 42, 0.08)",
};

const metricGrid = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const metricCard = {
  padding: "22px 20px",
  borderRadius: 24,
  background: "#f8fbff",
  border: "1px solid rgba(148, 163, 184, 0.12)",
};

const heading = {
  margin: 0,
  fontSize: "clamp(2rem, 3vw, 2.8rem)",
  lineHeight: 1.05,
  color: "#111827",
};

const subhead = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.8,
};

function App() {
  return (
    <main style={pageStyles}>
      <div style={heroStyles}>
        <div style={{ display: "grid", gap: 18 }}>
          <span style={{ color: "#2563eb", fontWeight: 700, textTransform: "uppercase", fontSize: "0.82rem", letterSpacing: "0.2em" }}>
            OS Security Framework
          </span>
            <h1 style={heading}>Interactive Access Control Dashboard</h1>
            <p style={subhead}>
              Explore how access decisions work in real time with a simple and clear dashboard.
              Try different scenarios, see results instantly, and understand system behavior step by step.
            </p>
        </div>

        <div style={metricGrid}>  
          <strong style={{ fontSize: "1.15rem", color: "#0f172a" }}>Live Access Check</strong>
          <p style={{ margin: "12px 0 0", color: "#475569" }}>
            Submit a request and see the result instantly.
          </p>
        </div>
        <div style={metricCard}>
          <strong style={{ fontSize: "1.15rem", color: "#0f172a" }}>Two Models</strong>
          <p style={{ margin: "12px 0 0", color: "#475569" }}>
            Switch between Bell-LaPadula and Biba to explore different scenarios.
          </p>
        </div>
        <div style={metricCard}>
          <strong style={{ fontSize: "1.15rem", color: "#0f172a" }}>Clear Results</strong>
          <p style={{ margin: "12px 0 0", color: "#475569" }}>
            View recent decisions and understand what happened at a glance.
          </p>
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 1080, marginTop: 28 }}>
        <SecurityDashboard />
      </div>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
