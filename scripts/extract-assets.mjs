// extract-assets.mjs
// Subyekt JSON'idan ma'lumotni ajratadi va MAS'UL XODIM (stuff) bo'yicha guruhlaydi.
//
// Kirish: massiv. Har element = bitta obyekt:
//   { name, stuff:{fullName,emails}, infoToolList[], cyberSecToolList[] }
//
// Chiqish: massiv. Har element = bitta mas'ul xodim:
//   {
//     "stuff": {
//       "fullName": "...",
//       "emails": ["..."],
//       "objects": [
//         { "name": "<obyekt nomi>", "infotools": [...], "cyberSecToolList": [...] }
//       ]
//     }
//   }
// Bir xodimga tegishli bir nechta obyekt -> bitta stuff ostida birlashtiriladi.
//
// VERSIYA QOIDASI: vosita `name.name` oxirgi tokeni versiya bo'lsa saqlanadi:
//   1) v/V-prefiksli: v3.1.5, V10.2.16-h16
//   2) nuqtali raqam: 10.2.16
//   3) yakka raqam:   8   (Vmware 8 -> "8")
// Model kodi (R750, 3220) versiya EMAS. Versiyasiz vosita TASHLANADI.
//
// Ishlatish:
//   node scripts/extract-assets.mjs <input.json> [output.json]
//   default: input = "F:/example json.txt", output = "./extracted.json"

import { readFile, writeFile } from "node:fs/promises";

const inputPath = process.argv[2] ?? "F:/example json.txt";
const outputPath = process.argv[3] ?? "./extracted.json";

const VERSION_RE = /^(v\d[\w.-]*|\d+(?:\.\d+)+[\w.-]*|\d+)$/i;

/** "Nom versiya" -> { nomi, versiya }. Versiya yo'q bo'lsa null. */
function splitNameVersion(raw) {
  if (!raw || typeof raw !== "string") return null;
  const tokens = raw.trim().split(/\s+/);
  if (tokens.length < 2) return null;

  const last = tokens[tokens.length - 1];
  if (!VERSION_RE.test(last)) return null; // mas: R750

  const nomi = tokens.slice(0, -1).join(" ").trim();
  if (!nomi) return null;
  return { nomi, versiya: last };
}

/** Vosita -> normallashtirilgan obyekt. Versiyasiz bo'lsa null. */
function mapTool(tool) {
  const nv = splitNameVersion(tool?.name?.name);
  if (!nv) return null;
  return {
    name: nv.nomi,
    version: nv.versiya,
    manufacturer: tool.manufacturer ?? null,
    type: tool.type ?? null,
  };
}

function mapTools(list) {
  return (list ?? []).map(mapTool).filter(Boolean);
}

/** Xodim uchun guruh kaliti: birinchi email, bo'lmasa fullName. */
function stuffKey(stuff) {
  const email = Array.isArray(stuff?.emails) ? stuff.emails[0] : null;
  return (email || stuff?.fullName || "noma'lum").toLowerCase().trim();
}

async function main() {
  const text = await readFile(inputPath, "utf8");
  const data = JSON.parse(text);
  const entries = Array.isArray(data) ? data : [data];

  // Map: kalit -> { stuff: {fullName, emails, objects[]} }
  const groups = new Map();
  let dropped = 0;

  for (const entry of entries) {
    const stuff = entry?.stuff ?? {};
    const key = stuffKey(stuff);

    if (!groups.has(key)) {
      groups.set(key, {
        stuff: {
          fullName: stuff.fullName ?? null,
          organizationName: stuff.subject?.name ?? null,
          emails: Array.isArray(stuff.emails) ? [...stuff.emails] : [],
          objects: [],
        },
      });
    }
    const group = groups.get(key);

    // Yangi email bo'lsa qo'shamiz (takrorlanmasin).
    if (Array.isArray(stuff.emails)) {
      for (const e of stuff.emails) {
        if (!group.stuff.emails.includes(e)) group.stuff.emails.push(e);
      }
    }

    // Tashlangan vositalar hisobi.
    for (const t of [...(entry?.infoToolList ?? []), ...(entry?.cyberSecToolList ?? [])]) {
      if (!splitNameVersion(t?.name?.name)) dropped++;
    }

    group.stuff.objects.push({
      name: entry?.name ?? null,
      infotools: mapTools(entry?.infoToolList),
      cyberSecToolList: mapTools(entry?.cyberSecToolList),
    });
  }

  const result = [...groups.values()];

  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`OK -> ${outputPath}`);
  console.log(
    `Xodimlar: ${result.length}, obyektlar: ${entries.length}, versiyasiz tashlangan vositalar: ${dropped}`
  );
}

main().catch((err) => {
  console.error("XATO:", err.message);
  process.exit(1);
});
