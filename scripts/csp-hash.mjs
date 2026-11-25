// index.html-dəki inline skriptin CSP hash-ını hesablayıb netlify.toml-a yazır
import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";

const html = readFileSync("dist/index.html", "utf8");
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (inline.length !== 1) throw new Error(`Bir inline skript gözlənilirdi, tapıldı: ${inline.length}`);
const hash = createHash("sha256").update(inline[0]).digest("base64");
const toml = readFileSync("netlify.toml", "utf8");
writeFileSync("netlify.toml", toml.replace(/'sha256-[^']*'(?=; style-src)/, `'sha256-${hash}'`));
console.log("CSP hash:", hash);
