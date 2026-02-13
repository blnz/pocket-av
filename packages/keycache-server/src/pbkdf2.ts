import { pbkdf2, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);
const randomBytesAsync = promisify(randomBytes);

const config = {
  iters: 1_000_000,
  saltLen: 32,
  keyLen: 32,
  algo: "sha256",
} as const;

interface PassHashResult {
  hash: string;
  salt: string;
}

async function genHash(secret: string, salt: string): Promise<PassHashResult> {
  const key = await pbkdf2Async(
    secret,
    salt,
    config.iters,
    config.keyLen,
    config.algo,
  );
  return { salt, hash: key.toString("hex") };
}

export async function newPassHash(secret: string): Promise<PassHashResult> {
  const buf = await randomBytesAsync(config.saltLen);
  return genHash(secret, buf.toString("hex"));
}

export async function testPassHash(
  secret: string,
  salt: string,
  expectedHash: string,
): Promise<void> {
  const result = await genHash(secret, salt);
  if (result.hash !== expectedHash) {
    throw new Error("mismatch");
  }
}
