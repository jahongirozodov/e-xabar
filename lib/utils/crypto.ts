import crypto from "crypto"

// AES-256-GCM. ENCRYPTION_KEY = 32-bayt hex (.env.local).
// Format: base64(iv[12] + tag[16] + ciphertext).
const ALGORITHM = "aes-256-gcm"

// Kalit LAZY o'qiladi — build (page-data collection) vaqtida ENCRYPTION_KEY
// bo'lmasa ham modul import qilinadi. Xato faqat shifrlash haqiqatan
// chaqirilganda (runtime) chiqadi.
function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex) {
    throw new Error("ENCRYPTION_KEY muhit o'zgaruvchisi yo'q (.env.local da 32-bayt hex bering)")
  }
  return Buffer.from(hex, "hex")
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decrypt(data: string): string {
  const buf = Buffer.from(data, "base64")
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final("utf8")
}
