/* eslint-disable */
import crypto from "crypto";
// import process from "process";

import cfg from "./next.config.mjs";
const { subtle } = globalThis.crypto;

const [IV_LENGTH, TAG_LENGTH] = [12, 16];
const HINT = "base64";
const txt = "yooo";

; (async function () {
  const ECDH_TYPE = { name: "ECDH", namedCurve: "P-256" };
  const kp = await subtle.generateKey(ECDH_TYPE, true, ['deriveKey']);

  const key = await subtle.exportKey("pkcs8", kp.privateKey)
  const pub = await subtle.exportKey("spki", kp.publicKey)
  const keyTxt = Buffer.from(key).toString(HINT)
  const pubTxt = Buffer.from(pub).toString(HINT)

  const keyDrv = await subtle.importKey("pkcs8", key, ECDH_TYPE, true, ['deriveKey']);
  const pubDrv = await subtle.importKey("spki", pub, ECDH_TYPE, true, []);
  const shared = await subtle.deriveKey({ name: "ECDH", public: pubDrv }, keyDrv, { name: "AES-GCM", length: 256 }, true, ["decrypt", "encrypt"]);

  const iv = crypto.randomBytes(IV_LENGTH);
  const enc = Buffer.concat([(iv), Buffer.from(await subtle.encrypt({ iv, name: "AES-GCM" }, shared, Buffer.from(txt)))]).toString(HINT)
  const [iv_, enc_] = ((b, n) => [b.subarray(0, n), b.subarray(n)])(Buffer.from(enc, HINT), IV_LENGTH);
  const dec = Buffer.from(await subtle.decrypt({ iv: iv_, name: "AES-GCM" }, shared, enc_)).toString();

  console.log("subtle", {
    keyTxt,
    pubTxt,
    enc,
    dec,
    cfg,
  });
})();

; (async function () {
  const ecdh = crypto.createECDH("secp256k1");
  const pub = ecdh.generateKeys();
  const key = ecdh.getPrivateKey();

  const keyTxt = Buffer.from(key).toString(HINT)
  const pubTxt = Buffer.from(pub).toString(HINT)

  // ecdh.setPrivateKey(key);
  const secret = ecdh.computeSecret(pub);
  const iv = crypto.randomBytes(IV_LENGTH);

  const gcmEnc = crypto.createCipheriv("aes-256-gcm", secret, iv);
  const enc = Buffer.concat([iv, gcmEnc.update(txt), gcmEnc.final(), gcmEnc.getAuthTag()]).toString(HINT);

  const [iv_, enc_, tag_] = ((b, n, m) => [
    b.subarray(0, n),
    b.subarray(n, b.length - m),
    b.subarray(b.length - m),
  ])(Buffer.from(enc, HINT), IV_LENGTH, TAG_LENGTH);

  const gcmDec = crypto.createDecipheriv("aes-256-gcm", secret, iv_).setAuthTag(tag_);
  const dec = Buffer.concat([gcmDec.update(enc_), gcmDec.final()]).toString();
  console.log("native", {
    keyTxt,
    pubTxt,
    enc,
    dec,
    cfg,
  });
})();
