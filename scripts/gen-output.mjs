// gen-output.mjs
// Random ma'lumot YANGI (guruhlangan) formatda hosil qiladi — extractor chiqishi shaklida:
//   [ { stuff: { fullName, organizationName, emails[], objects[] } } ]
//   objects[] = { name, infotools[], cyberSecToolList[] }
//   tool      = { name, version, manufacturer, type }   (faqat versiyali, model kodi yo'q)
//
// Ishlatish:
//   node scripts/gen-output.mjs [output.json] [xodimlarSoni]
//   default: output = "F:/extracted.json", soni = 3

import { writeFile } from "node:fs/promises";

const outPath = process.argv[2] ?? "F:/extracted.json";
const COUNT = Number(process.argv[3] ?? 3);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const EMPLOYEES = [
  { fullName: "Ivan Ivanov Ivanovich", email: "ivan@gmail.uz", org: "Uztelecom" },
  { fullName: "Aziz Karimov Akmalovich", email: "aziz.karimov@mail.uz", org: "Kapital bank" },
  { fullName: "Dilnoza Yusupova Baxtiyorovna", email: "dilnoza.y@corp.uz", org: "Markaziy bank" },
  { fullName: "Petr Petrov", email: "petr.petrov@inbox.uz", org: "Soliq qo'mitasi" },
  { fullName: "Sardor Toshmatov", email: "sardor.t@gov.uz", org: "Energetika vazirligi" },
];

const OBJECTS = [
  "Ichki boshqaruv axborot tizimi",
  "To'lov tizimi",
  "Hujjat aylanish tizimi",
  "Monitoring portali",
  "Deklaratsiya platformasi",
  "Pensiya axborot tizimi",
];

// faqat versiyali vositalar (model kodisiz) — chiqish formatida versiya doim bor
const INFO_TOOLS = [
  { name: "Vmware", versions: ["8", "7.0", "v8.0.2"], manufacturer: "VMware by Broadcom", type: "Virtualizatsiya" },
  { name: "Windows Server", versions: ["2019", "2022", "2016"], manufacturer: "Microsoft", type: "Operatsion tizim" },
  { name: "Oracle Database", versions: ["19c", "21.3", "v12.2"], manufacturer: "Oracle", type: "Ma'lumotlar bazasi" },
  { name: "Nginx", versions: ["1.24.0", "1.25.3"], manufacturer: "F5 Networks", type: "Veb-server" },
  { name: "Ubuntu Server", versions: ["22.04", "20.04"], manufacturer: "Canonical", type: "Operatsion tizim" },
];

const CYBER_TOOLS = [
  { name: "PaloAlto 3220", versions: ["V10.2.16-h16", "v11.0.2"], manufacturer: "Palo Alto Networks", type: "Tarmoqlararo ekran (Firewall)" },
  { name: "My ID SDK", versions: ["v3.1.5", "v3.2.0"], manufacturer: "Uzinfocom", type: "Biometrik identifikatsiya tizimi" },
  { name: "Kaspersky Endpoint Security", versions: ["11.10", "12.0"], manufacturer: "Kaspersky", type: "Antivirus" },
  { name: "Splunk Enterprise", versions: ["9.1.2", "9.2.0"], manufacturer: "Splunk", type: "SIEM" },
];

function buildTool(pool) {
  const t = pick(pool);
  return { name: t.name, version: pick(t.versions), manufacturer: t.manufacturer, type: t.type };
}

function buildObject(objName) {
  return {
    name: objName,
    infotools: Array.from({ length: int(1, 3) }, () => buildTool(INFO_TOOLS)),
    cyberSecToolList: Array.from({ length: int(0, 2) }, () => buildTool(CYBER_TOOLS)),
  };
}

function buildEmployee(emp) {
  const objNames = shuffle(OBJECTS).slice(0, int(1, 3)).map((o) => `${emp.org} ${o}`);
  return {
    stuff: {
      fullName: emp.fullName,
      organizationName: emp.org,
      emails: [emp.email],
      objects: objNames.map(buildObject),
    },
  };
}

async function main() {
  const emps = shuffle(EMPLOYEES).slice(0, Math.min(COUNT, EMPLOYEES.length));
  const result = emps.map(buildEmployee);
  await writeFile(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`OK -> ${outPath} (${result.length} xodim)`);
}

main().catch((e) => {
  console.error("XATO:", e.message);
  process.exit(1);
});
