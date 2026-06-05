// patch-emails.mjs
// Faylsdagi har stuff.emails ni 2 manzildan biriga (navbatma-navbat) almashtiradi.
// Dublicate ruxsat. Yangi + eski (input) ikkala formatni qo'llaydi.
//
// Ishlatish: node scripts/patch-emails.mjs <file.json>

import { readFile, writeFile } from "node:fs/promises";

const path = process.argv[2] ?? "F:/generated.json";
const POOL = ["jozodov81@gmail.com", "jozodoov7074@gmail.com"];

const text = await readFile(path, "utf8");
const data = JSON.parse(text);
const arr = Array.isArray(data) ? data : [data];

let i = 0;
for (const item of arr) {
  const stuff = item?.stuff;
  if (stuff && Array.isArray(stuff.emails)) {
    stuff.emails = [POOL[i % POOL.length]];
    i++;
  }
}

await writeFile(path, JSON.stringify(arr, null, 2), "utf8");
console.log(`OK -> ${path} (${i} ta stuff email almashtirildi)`);
