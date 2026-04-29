import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from "react-dom/client";
import SecurityDashboard from "./components/securitydashboard.js";
function App() {
    return (_jsxs("div", { style: { fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto", background: "#f5f7fb" }, children: [_jsx("h1", { children: "OS Security Framework" }), _jsx("p", { children: "Use this dashboard to test Bell/Biba access control for subjects and objects." }), _jsx(SecurityDashboard, {})] }));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(_jsx(App, {}));
