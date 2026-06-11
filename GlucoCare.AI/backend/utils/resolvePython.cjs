const path = require("path");
const fs = require("fs");

const backendRoot = path.join(__dirname, "..");
const loginRoot = path.join(__dirname, "..", "..");
const pyCwd = path.join(__dirname, "..", "..", "python-service");

/**
 * Python interpreter for ML/chat workers and optional `python app.py`.
 * Respects PYTHON_EXE / PYTHON, VIRTUAL_ENV, then common .venv locations.
 */
function resolvePythonExe() {
  const fromEnv = process.env.PYTHON_EXE || process.env.PYTHON;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  const venv = process.env.VIRTUAL_ENV;
  if (venv) {
    const venvPython = process.platform === "win32"
      ? path.join(venv, "Scripts", "python.exe")
      : path.join(venv, "bin", "python3");
    if (fs.existsSync(venvPython)) {
      return venvPython;
    }
    const venvPythonAlt = path.join(venv, "bin", "python");
    if (fs.existsSync(venvPythonAlt)) {
      return venvPythonAlt;
    }
  }

  const win = process.platform === "win32";
  const candidates = win
    ? [
        path.join(backendRoot, ".venv", "Scripts", "python.exe"),
        path.join(pyCwd, ".venv", "Scripts", "python.exe"),
        path.join(loginRoot, ".venv", "Scripts", "python.exe"),
      ]
    : [
        path.join(backendRoot, ".venv", "bin", "python3"),
        path.join(backendRoot, ".venv", "bin", "python"),
        path.join(pyCwd, ".venv", "bin", "python3"),
        path.join(loginRoot, ".venv", "bin", "python3"),
      ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  return win ? "python" : "python3";
}

module.exports = { resolvePythonExe, pyCwd };
