import { randomBytes } from "node:crypto";
import { promisify } from "node:util";

const randomBytesAsync = promisify(randomBytes);

// token -> userId
const tokenToUser = new Map<string, string>();
// userId -> token
const userToToken = new Map<string, string>();

export async function createSession(userId: string): Promise<string> {
  const existing = userToToken.get(userId);
  if (existing) {
    return existing;
  }

  const buf = await randomBytesAsync(16);
  const token = buf.toString("hex");
  tokenToUser.set(token, userId);
  userToToken.set(userId, token);
  return token;
}

export function getUserByToken(token: string): string | undefined {
  return tokenToUser.get(token);
}

export function closeSession(token: string): boolean {
  const userId = tokenToUser.get(token);
  if (!userId) {
    return false;
  }
  tokenToUser.delete(token);
  userToToken.delete(userId);
  return true;
}

export function clearAllSessions(): void {
  tokenToUser.clear();
  userToToken.clear();
}
