const { spawn } = require("child_process");
const { resolvePythonExe, pyCwd } = require("../utils/resolvePython.cjs");

const pyBin = resolvePythonExe();

const child = spawn(pyBin, ["app.py"], {
  cwd: pyCwd,
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
