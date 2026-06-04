// Vosita nomidan versiyani ajratib olishga urinish (best-effort).
// Ustuvorlik: (1) V-prefiksli/nuqtali versiya, (2) bo'sh joy bilan ajralgan toza raqam.
// "PaloAlto 3220 V10.2.16-h16" → "10.2.16-h16" (3220 = model, e'tiborsiz),
// "My ID SDK v3.1.5" → "3.1.5", "Vmware 8" → "8", "Dell R750" → null (harfga yopishgan),
// "catalyst_sd-wan_manager 18.9.9.1" → "18.9.9.1".
// NOT "use server" — import.actions (server) VA bir martalik skriptlar ham ishlatadi.
export function extractVersion(name: string): string | null {
  // 1. V-prefiksli ko'p segmentli versiya (eng ishonchli)
  const vpref = name.match(/[vV](\d+(?:\.\d+)+(?:-[\w.]+)?)/)
  if (vpref) return vpref[1]
  // 2. Nuqtali versiya (10.2.16, 3.1.5)
  const dotted = name.match(/\b(\d+\.\d+(?:\.\d+)*(?:-[\w.]+)?)\b/)
  if (dotted) return dotted[1]
  // 3. Zaxira: alohida turgan toza raqam (oxirgisidan) — "Vmware 8" → "8".
  //    Harfga yopishgan raqam (R750, ASA5500) versiya emas — o'tkazib yuboriladi.
  const tokens = name.split(/\s+/)
  for (let i = tokens.length - 1; i >= 0; i--) {
    const mt = tokens[i].match(/^[vV]?(\d+)$/)
    if (mt) return mt[1]
  }
  return null
}
