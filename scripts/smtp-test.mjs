// smtp-test.mjs — SMTP credential'ni to'g'ridan-to'g'ri sinaydi.
// .env.local dan o'qiydi (Next kabi). Faqat verify() — login holatini ko'rsatadi.
import { readFile } from "node:fs/promises";
import nodemailer from "nodemailer";

// .env.local ni qo'lda parse qilamiz (dotenv shart emas)
const env = {};
try {
  const t = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of t.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
} catch (e) {
  console.log("env o'qilmadi:", e.message);
}

const host = env.SMTP_HOST;
const port = Number(env.SMTP_PORT ?? 587);
const user = env.SMTP_USER;
const pass = env.SMTP_PASSWORD;

console.log("host:", host, "port:", port);
console.log("user:", user || "(BO'SH)");
console.log("pass uzunligi:", pass ? pass.length : 0, "belgi");

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user ? { user, pass } : undefined,
});

try {
  await transport.verify();
  console.log("VERIFY OK — login muvaffaqiyatli, SMTP tayyor.");
} catch (e) {
  console.log("VERIFY XATO:", e.message);
}
