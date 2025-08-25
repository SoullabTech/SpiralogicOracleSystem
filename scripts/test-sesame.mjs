import { synthesizeToWav } from "../lib/runpodSesame.js";
import { writeFileSync } from "node:fs";

const text = process.argv.slice(2).join(" ") || "Hello from Maya on Sesame";
const wav = await synthesizeToWav(text);
writeFileSync("maya.wav", wav);
console.log("✅ wrote maya.wav", wav.length, "bytes");