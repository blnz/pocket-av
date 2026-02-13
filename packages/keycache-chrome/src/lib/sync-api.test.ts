import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  register,
  authenticate,
  logout,
  changeSecret,
  createCard,
  updateCard,
  deleteCard,
  listCards,
} from "./sync-api";

const HOST = "http://localhost:8000";

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(json: unknown, ok = true): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(json),
    }),
  );
}

function lastFetchCall(): { url: string; opts: RequestInit } {
  const mock = vi.mocked(fetch);
  const [url, opts] = mock.mock.calls[0];
  return { url: url as string, opts: opts as RequestInit };
}

describe("sync-api", () => {
  describe("register", () => {
    it("should POST to /api/register with correct body", async () => {
      mockFetch({ user_id: "u123" });
      const wrapped = {
        wrapped: "w",
        iv: "iv",
        salt: "s",
      };
      const result = await register(HOST, "secret-hash", "alice", wrapped);

      const { url, opts } = lastFetchCall();
      expect(url).toBe("http://localhost:8000/api/register");
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body as string)).toEqual({
        secret: "secret-hash",
        username: "alice",
        wrapped_master: wrapped,
      });
      expect(result.user_id).toBe("u123");
    });
  });

  describe("authenticate", () => {
    it("should POST to /api/authenticate", async () => {
      mockFetch({ session: "tok123" });
      const result = await authenticate(HOST, "secret", "alice");

      const { url, opts } = lastFetchCall();
      expect(url).toBe("http://localhost:8000/api/authenticate");
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body as string)).toEqual({
        secret: "secret",
        username: "alice",
      });
      expect(result.session).toBe("tok123");
    });
  });

  describe("logout", () => {
    it("should POST to /api/logout with session query param", async () => {
      mockFetch({});
      await logout(HOST, "tok123");

      const { url, opts } = lastFetchCall();
      expect(url).toBe("http://localhost:8000/api/logout?session=tok123");
      expect(opts.method).toBe("POST");
    });
  });

  describe("changeSecret", () => {
    it("should POST to /api/changeSecret with session", async () => {
      mockFetch({});
      const wrapped = { wrapped: "w", iv: "i", salt: "s" };
      await changeSecret(HOST, "tok", "new-secret", wrapped);

      const { url, opts } = lastFetchCall();
      expect(url).toBe(
        "http://localhost:8000/api/changeSecret?session=tok",
      );
      expect(JSON.parse(opts.body as string)).toEqual({
        secret: "new-secret",
        wrapped_master: wrapped,
      });
    });
  });

  describe("createCard", () => {
    it("should PUT to /api/u/:userId/c/:cardId with session", async () => {
      mockFetch({ id: "c1", version: "v1", encrypted: {} });
      const encrypted = { iv64: "iv", cipherText64: "ct" };
      await createCard(HOST, "tok", "u1", "c1", encrypted);

      const { url, opts } = lastFetchCall();
      expect(url).toBe(
        "http://localhost:8000/api/u/u1/c/c1?session=tok",
      );
      expect(opts.method).toBe("PUT");
      expect(JSON.parse(opts.body as string)).toEqual({
        encrypted,
        id: "c1",
      });
    });
  });

  describe("updateCard", () => {
    it("should POST to /api/u/:userId/c/:cardId with version", async () => {
      mockFetch({ id: "c1", version: "v2", encrypted: {} });
      const encrypted = { iv64: "iv", cipherText64: "ct" };
      await updateCard(HOST, "tok", "u1", "c1", encrypted, "v1");

      const { url, opts } = lastFetchCall();
      expect(url).toBe(
        "http://localhost:8000/api/u/u1/c/c1?session=tok",
      );
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body as string)).toEqual({
        encrypted,
        id: "c1",
        version: "v1",
      });
    });
  });

  describe("deleteCard", () => {
    it("should DELETE to /api/u/:userId/c/:cardId", async () => {
      mockFetch({});
      await deleteCard(HOST, "tok", "u1", "c1");

      const { url, opts } = lastFetchCall();
      expect(url).toBe(
        "http://localhost:8000/api/u/u1/c/c1?session=tok",
      );
      expect(opts.method).toBe("DELETE");
    });
  });

  describe("listCards", () => {
    it("should GET /api/u/:userId/c/ with session", async () => {
      mockFetch([{ id: "c1", version: "v1", encrypted: {} }]);
      const result = await listCards(HOST, "tok", "u1");

      const { url, opts } = lastFetchCall();
      expect(url).toBe(
        "http://localhost:8000/api/u/u1/c/?session=tok",
      );
      expect(opts.method).toBe("GET");
      expect(result).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("should throw on non-ok response", async () => {
      mockFetch({ message: "Unauthorized" }, false);
      await expect(
        authenticate(HOST, "bad", "user"),
      ).rejects.toThrow("Unauthorized");
    });
  });
});
