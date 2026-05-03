import { pbkdf2Sync, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

function base64Url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

const password = process.argv[2] || readFileSync(0, "utf8").trim();

if (!password || password.length < 12) {
  console.error("Provide an admin password of at least 12 characters as argv[2] or stdin.");
  process.exit(1);
}

const iterations = 120000;
const salt = randomBytes(18);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");

console.log(`pbkdf2$${iterations}$${base64Url(salt)}$${base64Url(hash)}`);
