import crypto from "crypto";
import process from "process";

const HINT = "base64url" as BufferEncoding;
const AES_GCM_IV_LENGTH = 12;
const AES_GCM_TAG_LENGTH = 16;
const AES_GCM_TYPE = "aes-256-gcm";
const AES_KEY = process.env.AES_KEY ?? ""; // "..."

const ECDH_TYPE = "secp256k1";
const ECDH_KEY = process.env.ECDH_KEY ?? ""; // "..."

export async function sharedKeyECDH(pub: Buffer): Promise<Buffer> {
  await (async (): Promise<void> => { /*  */ })()
  const ecdh = crypto.createECDH(ECDH_TYPE);
  const key = Buffer.from(ECDH_KEY, HINT);
  ecdh.setPrivateKey(key);
  return ecdh.computeSecret(pub);
}

export async function getKeyAesGcm(): Promise<Buffer> {
  await (async (): Promise<void> => { /*  */ })()
  return Buffer.from(AES_KEY, HINT);
}

export async function encryptAesGcm(key: Buffer, txt: string): Promise<string> {
  await (async (): Promise<void> => { /*  */ })()
  const iv = crypto.randomBytes(AES_GCM_IV_LENGTH);
  const gcm = crypto.createCipheriv(AES_GCM_TYPE, key, iv);
  return Buffer.concat([iv, gcm.update(txt), gcm.final(), gcm.getAuthTag()]).toString(HINT);
}

export async function decryptAesGcm(key: Buffer, enc: string): Promise<string> {
  await (async (): Promise<void> => { /*  */ })()
  const buf = Buffer.from(enc, HINT); const TAG_START = (buf.length - AES_GCM_TAG_LENGTH);
  const gcm = crypto.createDecipheriv(AES_GCM_TYPE, key, buf.subarray(0, AES_GCM_IV_LENGTH)).setAuthTag(buf.subarray(TAG_START));
  return Buffer.concat([gcm.update(buf.subarray(AES_GCM_IV_LENGTH, TAG_START)), gcm.final()]).toString();
}

export default {};
