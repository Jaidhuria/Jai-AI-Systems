const { spawn } = require("child_process");
const readline = require("readline");
const path = require("path");
const { resolvePythonExe, pyCwd } = require("./resolvePython.cjs");

const workerScript = path.join(pyCwd, "python_worker.py");

let proc = null;
let rl = null;
/** @type {((msg: object) => void)[]} */
const pending = [];
let stderrBuf = "";

function tailStderr() {
  const t = stderrBuf.trim();
  if (!t) return "";
  const lines = t.split(/\r?\n/).filter(Boolean);
  const last = lines.slice(-8).join(" | ");
  return last.length > 1200 ? last.slice(-1200) : last;
}

function ensureWorker() {
  if (proc && !proc.killed) return proc;

  stderrBuf = "";
  const py = resolvePythonExe();
  proc = spawn(py, [workerScript], {
    cwd: pyCwd,
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });

  rl = readline.createInterface({ input: proc.stdout });

  rl.on("line", (line) => {
    const resolve = pending.shift();
    if (!resolve) return;
    try {
      resolve(JSON.parse(line));
    } catch (e) {
      resolve({
        ok: false,
        error: `Invalid worker JSON: ${e.message}. Line: ${line.slice(0, 200)}`,
      });
    }
  });

  proc.stderr.on("data", (d) => {
    const s = d.toString();
    stderrBuf += s;
    if (stderrBuf.length > 16000) {
      stderrBuf = stderrBuf.slice(-16000);
    }
    process.stderr.write(`[python-worker] ${s}`);
  });

  proc.on("exit", (code, signal) => {
    const hint = tailStderr();
    proc = null;
    rl = null;
    while (pending.length) {
      const r = pending.shift();
      const sig = signal ? ` signal ${signal}` : "";
      const extra = hint ? ` — ${hint}` : "";
      r({
        ok: false,
        error: `Python worker exited (code ${code}${sig})${extra}`,
      });
    }
    stderrBuf = "";
  });

  return proc;
}

function invoke(cmd, body) {
  return new Promise((resolve, reject) => {
    const w = ensureWorker();
    if (!w.stdin.writable) {
      reject(new Error("Python worker stdin is closed"));
      return;
    }

    pending.push((msg) => {
      if (!msg.ok) {
        reject(new Error(msg.error || "Python worker error"));
        return;
      }
      resolve(msg.data);
    });

    try {
      w.stdin.write(`${JSON.stringify({ cmd, body })}\n`);
    } catch (e) {
      pending.pop();
      reject(e);
    }
  });
}

function invokePredict(body) {
  return invoke("predict", body);
}

function invokeChat(body) {
  return invoke("chat", body);
}

module.exports = { invokePredict, invokeChat };
