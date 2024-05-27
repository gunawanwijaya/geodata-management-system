const HINT = "base64url" as BufferEncoding;
const AES_GCM_IV_LENGTH = 12;
const AES_GCM_TAG_LENGTH = 16;
const AES_GCM_TYPE = { name: "AES-GCM", length: 256 };
const AES_KEY = process.env.AES_KEY ?? ""; // "..."

const ECDH_TYPE = { name: "ECDH", namedCurve: "P-256" };
const ECDH_KEY = process.env.ECDH_KEY ?? ""; // "..."

export async function sharedKeyECDH(pub: CryptoKey): Promise<CryptoKey> {
  const ecdhKey = await crypto.subtle.importKey("raw", Buffer.from(ECDH_KEY, HINT), ECDH_TYPE, true, []);
  return crypto.subtle.deriveKey({ name: "ECDH", public: pub }, ecdhKey, AES_GCM_TYPE, true, ["encrypt", "decrypt"]);
}

export async function getKeyAesGcm(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", Buffer.from(AES_KEY, HINT), AES_GCM_TYPE, true, ["encrypt", "decrypt"]);
}

export async function decryptAesGcm(key: CryptoKey, txt: string): Promise<string> {
  const buf = Buffer.from(txt, "base64");
  const [iv, enc] = [buf.subarray(0, AES_GCM_IV_LENGTH), buf.subarray(AES_GCM_IV_LENGTH)];
  const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: 8 * AES_GCM_TAG_LENGTH }, key, enc);
  return Buffer.from(dec).toString();
}

export async function encryptAesGcm(key: CryptoKey, txt: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const enc = await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 8 * AES_GCM_TAG_LENGTH }, key, new TextEncoder().encode(txt));
  const out = new Uint8Array(iv.length + enc.byteLength); out.set(iv, 0); out.set(new Uint8Array(enc), AES_GCM_IV_LENGTH);
  return Buffer.from(out).toString(HINT);
}

export default {};
