import { fromByteArray, toByteArray } from "base64-js";
import type { EncryptedCardData, WrappedKeyData } from "../store/types";

const subtle = globalThis.crypto.subtle;
const getRandomValues = globalThis.crypto.getRandomValues.bind(
  globalThis.crypto,
);

/** Ensure we have a plain ArrayBuffer (not SharedArrayBuffer). */
function toBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.byteLength === data.byteLength
    ? (data.buffer as ArrayBuffer)
    : data.slice().buffer;
}

function stringToArrayBuffer(str: string): ArrayBuffer {
  return toBuffer(new TextEncoder().encode(str));
}

function arrayBufferToString(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

function b64ToBuffer(b64: string): ArrayBuffer {
  return toBuffer(toByteArray(b64));
}

/**
 * Generate a new random AES-CBC-256 master key.
 */
export async function generateMasterKey(): Promise<CryptoKey> {
  return subtle.generateKey(
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

/**
 * Wrap a CryptoKey with a passphrase using PBKDF2-derived AES-CBC key.
 * Preserves original parameters: SHA-256, 1000 iterations, 8-byte salt.
 */
export async function wrapKey(
  passphrase: string,
  key: CryptoKey,
): Promise<WrappedKeyData> {
  const salt = getRandomValues(new Uint8Array(8));
  const iv = getRandomValues(new Uint8Array(16));

  const baseKey = await subtle.importKey(
    "raw",
    stringToArrayBuffer(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toBuffer(salt),
      iterations: 1000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt", "wrapKey"],
  );

  const wrapped = await subtle.wrapKey("jwk", key, derivedKey, {
    name: "AES-CBC",
    iv: toBuffer(iv),
  });

  return {
    wrapped: fromByteArray(new Uint8Array(wrapped)),
    iv: fromByteArray(iv),
    salt: fromByteArray(salt),
  };
}

/**
 * Unwrap a CryptoKey from passphrase-protected storage.
 */
export async function unwrapKey(
  passphrase: string,
  data: WrappedKeyData,
): Promise<CryptoKey> {
  const baseKey = await subtle.importKey(
    "raw",
    stringToArrayBuffer(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: b64ToBuffer(data.salt),
      iterations: 1000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );

  return subtle.unwrapKey(
    "jwk",
    b64ToBuffer(data.wrapped),
    derivedKey,
    { name: "AES-CBC", iv: b64ToBuffer(data.iv) },
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt a plaintext string with AES-CBC-256.
 * Returns base64-encoded IV and ciphertext.
 */
export async function encryptString(
  key: CryptoKey,
  plaintext: string,
): Promise<EncryptedCardData> {
  const iv = getRandomValues(new Uint8Array(16));
  const encrypted = await subtle.encrypt(
    { name: "AES-CBC", iv: toBuffer(iv) },
    key,
    stringToArrayBuffer(plaintext),
  );

  return {
    iv64: fromByteArray(iv),
    cipherText64: fromByteArray(new Uint8Array(encrypted)),
  };
}

/**
 * Decrypt a base64-encoded ciphertext with AES-CBC-256.
 */
export async function decryptString(
  key: CryptoKey,
  encrypted: EncryptedCardData,
): Promise<string> {
  const decrypted = await subtle.decrypt(
    { name: "AES-CBC", iv: b64ToBuffer(encrypted.iv64) },
    key,
    b64ToBuffer(encrypted.cipherText64),
  );

  return arrayBufferToString(decrypted);
}

/**
 * PBKDF2 key derivation (used for server auth secret).
 * Original uses SHA-1, 100000 iterations, hardcoded salt 'sample-salt'.
 * Returns 160 bits.
 */
export async function deriveBits(
  passphrase: string,
  salt: string,
  iterations: number,
): Promise<ArrayBuffer> {
  const keyMaterial = await subtle.importKey(
    "raw",
    stringToArrayBuffer(passphrase),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  return subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-1",
      salt: stringToArrayBuffer(salt),
      iterations,
    },
    keyMaterial,
    160,
  );
}

/**
 * Convert ArrayBuffer to hex string (replaces Buffer.toString('hex')).
 */
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
