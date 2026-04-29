import React from "react";
import ReactDOM from "react-dom/client";
import SecurityDashboard from "./components/securitydashboard.tsx";

function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto", background: "#f5f7fb" }}>
      <h1>OS Security Framework</h1>
      <p>Use this dashboard to test Bell/Biba access control for subjects and objects.</p>
      <SecurityDashboard />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
