import { describe, it, expect } from "vitest";
import {
  generateMasterKey,
  wrapKey,
  unwrapKey,
  encryptString,
  decryptString,
  deriveBits,
  arrayBufferToHex,
} from "./crypto";

describe("crypto", () => {
  describe("generateMasterKey", () => {
    it("should generate an AES-CBC-256 CryptoKey", async () => {
      const key = await generateMasterKey();
      expect(key).toBeDefined();
      expect(key.type).toBe("secret");
      expect(key.algorithm).toMatchObject({ name: "AES-CBC", length: 256 });
      expect(key.extractable).toBe(true);
      expect(key.usages).toContain("encrypt");
      expect(key.usages).toContain("decrypt");
    });
  });

  describe("wrapKey / unwrapKey", () => {
    it("should roundtrip wrap and unwrap a key", async () => {
      const passphrase = "test-passphrase-123";
      const original = await generateMasterKey();

      const wrapped = await wrapKey(passphrase, original);
      expect(wrapped.wrapped).toBeTruthy();
      expect(wrapped.iv).toBeTruthy();
      expect(wrapped.salt).toBeTruthy();

      const unwrapped = await unwrapKey(passphrase, wrapped);
      expect(unwrapped.type).toBe("secret");
      expect(unwrapped.algorithm).toMatchObject({
        name: "AES-CBC",
        length: 256,
      });
    });

    it("should fail with wrong passphrase", async () => {
      const original = await generateMasterKey();
      const wrapped = await wrapKey("correct-passphrase", original);

      await expect(
        unwrapKey("wrong-passphrase", wrapped),
      ).rejects.toThrow();
    });

    it("should produce a key that decrypts data encrypted by original", async () => {
      const passphrase = "roundtrip-test";
      const original = await generateMasterKey();

      const plaintext = "hello world from KeyCache";
      const encrypted = await encryptString(original, plaintext);

      const wrapped = await wrapKey(passphrase, original);
      const unwrapped = await unwrapKey(passphrase, wrapped);

      const decrypted = await decryptString(unwrapped, encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe("encryptString / decryptString", () => {
    it("should roundtrip encrypt and decrypt a string", async () => {
      const key = await generateMasterKey();
      const plaintext = "test card data: {username: 'alice'}";

      const encrypted = await encryptString(key, plaintext);
      expect(encrypted.iv64).toBeTruthy();
      expect(encrypted.cipherText64).toBeTruthy();

      const decrypted = await decryptString(key, encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("should produce different ciphertexts for same plaintext (random IV)", async () => {
      const key = await generateMasterKey();
      const plaintext = "same data";

      const enc1 = await encryptString(key, plaintext);
      const enc2 = await encryptString(key, plaintext);

      expect(enc1.iv64).not.toBe(enc2.iv64);
      expect(enc1.cipherText64).not.toBe(enc2.cipherText64);
    });

    it("should handle empty string", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptString(key, "");
      const decrypted = await decryptString(key, encrypted);
      expect(decrypted).toBe("");
    });

    it("should handle unicode", async () => {
      const key = await generateMasterKey();
      const plaintext = "passwords with unicode: cafe\u0301 \u{1F512}";
      const encrypted = await encryptString(key, plaintext);
      const decrypted = await decryptString(key, encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("should handle JSON roundtrip (card data pattern)", async () => {
      const key = await generateMasterKey();
      const cardData = {
        name: "Example",
        url: "example.com",
        username: "user@example.com",
        password: "s3cret!",
        note: "test note",
        type: "web",
      };
      const json = JSON.stringify(cardData);
      const encrypted = await encryptString(key, json);
      const decrypted = await decryptString(key, encrypted);
      expect(JSON.parse(decrypted)).toEqual(cardData);
    });
  });

  describe("deriveBits", () => {
    it("should derive 160 bits from passphrase", async () => {
      const bits = await deriveBits("test-password", "sample-salt", 100000);
      expect(bits.byteLength).toBe(20); // 160 bits = 20 bytes
    });

    it("should produce consistent output for same inputs", async () => {
      const bits1 = await deriveBits("password", "sample-salt", 100000);
      const bits2 = await deriveBits("password", "sample-salt", 100000);
      expect(arrayBufferToHex(bits1)).toBe(arrayBufferToHex(bits2));
    });

    it("should produce different output for different passwords", async () => {
      const bits1 = await deriveBits("password1", "sample-salt", 100000);
      const bits2 = await deriveBits("password2", "sample-salt", 100000);
      expect(arrayBufferToHex(bits1)).not.toBe(arrayBufferToHex(bits2));
    });
  });

  describe("arrayBufferToHex", () => {
    it("should convert ArrayBuffer to hex string", () => {
      const buffer = new Uint8Array([0, 1, 15, 16, 255]).buffer;
      expect(arrayBufferToHex(buffer)).toBe("00010f10ff");
    });
  });
});
