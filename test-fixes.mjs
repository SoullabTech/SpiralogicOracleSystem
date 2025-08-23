import { spawn } from "node:child_process";
import { resolve } from "node:path";

const repo = resolve(process.env.REPO || process.cwd());
const steps = [
  ["npm", ["run", "doctor"]],
  ["npm", ["run", "build"]],
  ["docker", ["compose", "up", "-d"]],
  ["docker", ["compose", "config", "--services"]],
  ["docker", ["compose", "logs", "-f", "oracle-system"]],
];

const run = (cmd, args) =>
  new Promise((ok, fail) => {
    console.log(`\n🚀 Running: ${cmd} ${args.join(" ")}`);
    const p = spawn(cmd, args, { cwd: repo, stdio: "inherit" });
    p.on("close", (code) => (code === 0 ? ok() : fail(new Error(`${cmd} ${args.join(" ")} -> ${code}`))));
  });

console.log("🔧 Testing Spiralogic Oracle System fixes...\n");
console.log(`📁 Working directory: ${repo}\n`);

for (const s of steps) {
  try {
    await run(...s);
    console.log(`✅ ${s[0]} ${s[1].join(" ")} - SUCCESS`);
  } catch (error) {
    console.log(`❌ ${s[0]} ${s[1].join(" ")} - FAILED:`, error.message);
    break;
  }
}