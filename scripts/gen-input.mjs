// gen-input.mjs
// Random REAL kirish ma'lumoti hosil qiladi (extractor kutadigan shaklda):
//   [ { name, stuff:{fullName,emails,phones,position}, infoToolList[], cyberSecToolList[] } ]
// Vosita name.name = "Nom versiya" (ba'zilari versiyasiz -> extractor tashlaydi).
//
// Ishlatish:
//   node scripts/gen-input.mjs [output.json] [obyektlarSoni]
//   default: output = "F:/example json.txt", soni = 6

import { writeFile } from "node:fs/promises";

const outPath = process.argv[2] ?? "F:/example json.txt";
const COUNT = Number(process.argv[3] ?? 6);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ---- ma'lumot havzalari ----
const EMPLOYEES = [
  { fullName: "Ivan Ivanov Ivanovich", email: "ivan@gmail.uz", position: "Axborot xavfsizligi departamenti direktori" },
  { fullName: "Aziz Karimov Akmalovich", email: "aziz.karimov@mail.uz", position: "Tizim administratori" },
  { fullName: "Dilnoza Yusupova Baxtiyorovna", email: "dilnoza.y@corp.uz", position: "Kiberxavfsizlik mutaxassisi" },
  { fullName: "Petr Petrov", email: "petr.petrov@inbox.uz", position: "Tarmoq muhandisi" },
];

const OBJECTS = [
  "Uztelecomning ichki boshqaruv axborot tizimi",
  "Uztelecomning ikkinchi ichki boshqaruv axborot tizimi",
  "Markaziy bank to'lov tizimi",
  "Soliq qo'mitasi hujjat aylanish tizimi",
  "Energetika vazirligi monitoring portali",
  "Pensiya jamg'armasi axborot tizimi",
  "Bojxona deklaratsiya platformasi",
];

// INFO (axborotlashtirish) vositalari — ba'zisi versiyasiz (model kodi)
const INFO_TOOLS = [
  { base: "Vmware", ver: ["8", "7.0", "v8.0.2"], man: "VMware by Broadcom", type: "Virtualizatsiya" },
  { base: "Windows Server", ver: ["2019", "2022", "2016"], man: "Microsoft", type: "Operatsion tizim" },
  { base: "Dell R750", ver: [null], man: "DELL Technologies", type: "Server qurilmasi" },        // versiyasiz
  { base: "Cisco Catalyst 9300", ver: ["v17.6.4", null], man: "Cisco", type: "Kommutator" },
  { base: "Oracle Database", ver: ["19c", "21.3", "v12.2"], man: "Oracle", type: "Ma'lumotlar bazasi" },
  { base: "Nginx", ver: ["1.24.0", "1.25.3"], man: "F5 Networks", type: "Veb-server" },
  { base: "Ubuntu Server", ver: ["22.04", "20.04"], man: "Canonical", type: "Operatsion tizim" },
];

// CYBERSEC (kiberxavfsizlik) vositalari
const CYBER_TOOLS = [
  { base: "PaloAlto 3220", ver: ["V10.2.16-h16", "v11.0.2"], man: "Palo Alto Networks", type: "Tarmoqlararo ekran (Firewall)" },
  { base: "My ID SDK", ver: ["v3.1.5", "v3.2.0"], man: "Uzinfocom", type: "Biometrik identifikatsiya tizimi" },
  { base: "Fortinet FortiGate 600E", ver: ["v7.4.1", null], man: "Fortinet", type: "Tarmoqlararo ekran (Firewall)" },
  { base: "Kaspersky Endpoint Security", ver: ["11.10", "12.0"], man: "Kaspersky", type: "Antivirus" },
  { base: "Splunk Enterprise", ver: ["9.1.2", null], man: "Splunk", type: "SIEM" },
  { base: "CheckPoint Quantum 6200", ver: [null], man: "Check Point", type: "Tarmoqlararo ekran (Firewall)" }, // versiyasiz
];

function buildTool(t) {
  const ver = pick(t.ver);
  const name = ver ? `${t.base} ${ver}` : t.base;
  return {
    id: cryptoId(),
    name: { id: cryptoId(), name, hasHardware: chance(0.5), hardwareName: chance(0.5) ? name : null },
    manufacturer: t.man,
    type: t.type,
    hasLicense: true,
    licenseType: "PROPRIETARY",
  };
}

// soxta uuid (Math.random asosida — test ma'lumoti uchun yetarli)
function cryptoId() {
  const h = () => int(0, 0xffff).toString(16).padStart(4, "0");
  return `${h()}${h()}-${h()}-${h()}-${h()}-${h()}${h()}${h()}`;
}

function buildEntry(objName, emp) {
  const infoN = int(1, 3);
  const cyberN = int(0, 3);
  return {
    name: objName,
    city: "Toshkent shahri",
    number: `01-N-${int(100000, 999999)}`,
    stuff: {
      id: cryptoId(),
      fullName: emp.fullName,
      position: { id: cryptoId(), name: emp.position },
      emails: [emp.email],
      phones: [`+998(${int(70, 99)})-${int(100, 999)}-${int(10, 99)}-${int(10, 99)}`],
    },
    infoToolList: Array.from({ length: infoN }, () => buildTool(pick(INFO_TOOLS))),
    cyberSecToolList: Array.from({ length: cyberN }, () => buildTool(pick(CYBER_TOOLS))),
  };
}

async function main() {
  // har obyektga random xodim biriktiramiz (ba'zi xodimlar bir nechta obyekt oladi)
  const entries = [];
  const usedObjects = [...OBJECTS].sort(() => Math.random() - 0.5).slice(0, Math.min(COUNT, OBJECTS.length));
  for (let i = 0; i < COUNT; i++) {
    const objName = usedObjects[i % usedObjects.length] + (i >= usedObjects.length ? ` (${i})` : "");
    entries.push(buildEntry(objName, pick(EMPLOYEES)));
  }

  await writeFile(outPath, JSON.stringify(entries, null, 2), "utf8");
  console.log(`OK -> ${outPath} (${entries.length} obyekt)`);
}

main().catch((e) => {
  console.error("XATO:", e.message);
  process.exit(1);
});
