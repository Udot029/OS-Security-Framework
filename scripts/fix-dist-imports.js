const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "../frontend/dist");

function rewriteImports(filePath) {
  let text = fs.readFileSync(filePath, "utf8");
  const replacements = [
    ["from \"./components/securitydashboard\"", "from \"./components/securitydashboard.js\""],
    ["from './components/securitydashboard'", "from './components/securitydashboard.js'"],
    ["from \"../services/api_service\"", "from \"../services/api_service.js\""],
    ["from '../services/api_service'", "from '../services/api_service.js'"],
    ["from \"../type/type\"", "from \"../type/type.js\""],
    ["from '../type/type'", "from '../type/type.js'"],
  ];

  for (const [search, replace] of replacements) {
    text = text.split(search).join(replace);
  }

  if (text !== fs.readFileSync(filePath, "utf8")) {
    fs.writeFileSync(filePath, text, "utf8");
    console.log(`Rewrote imports in ${filePath}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && fullPath.endsWith(".js")) {
      rewriteImports(fullPath);
    }
  }
}

walk(distDir);
