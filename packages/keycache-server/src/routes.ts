import { type Router as RouterType, Router } from "express";
import * as db from "./db.js";
import { closeSession } from "./session.js";
import type {
  RegisterRequest,
  AuthenticateRequest,
  ChangeSecretRequest,
  CardCreateRequest,
  CardUpdateRequest,
  CardListItem,
} from "./types.js";
import { isAuthenticated } from "./middleware.js";

export const router: RouterType = Router();

function p(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : val ?? "";
}

// Create and return a session token if successful
router.post("/api/authenticate", async (req, res) => {
  const { username, secret } = req.body as AuthenticateRequest;
  try {
    const token = await db.loginUser(username, secret);
    res.json({ session: token });
  } catch {
    res.status(400).send("sorry");
  }
});

// Create a new user
router.post("/api/register", async (req, res) => {
  const { username, secret, wrapped_master } = req.body as RegisterRequest;
  try {
    const data = await db.registerUser(
      username,
      secret,
      JSON.stringify(wrapped_master),
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(400).send("cannot register");
  }
});

// Change the user's secret(s)
router.post("/api/changeSecret", isAuthenticated, async (req, res) => {
  const { secret, wrapped_master } = req.body as ChangeSecretRequest;
  try {
    await db.changeUserSecret(
      req.sessionData!.user,
      secret,
      JSON.stringify(wrapped_master),
    );
    res.json("true");
  } catch (err) {
    console.error(err);
    res.status(400).send("cannot change secret");
  }
});

// Logout
router.post("/api/logout", isAuthenticated, (req, res) => {
  if (closeSession(req.sessionData!.token)) {
    res.json(true);
  } else {
    res.status(403).send("cannot logout");
  }
});

// Get a single card
router.get("/api/u/:user/c/:card", isAuthenticated, async (req, res) => {
  if (req.sessionData!.user !== p(req.params.user)) {
    res.status(403).send("not authorized");
    return;
  }

  try {
    const data = await db.getCard(p(req.params.card), p(req.params.user));
    res.json(data);
  } catch (err) {
    console.error("failed get", err);
    res.status(404).send("not found");
  }
});

// Delete a card (soft-delete)
router.delete("/api/u/:user/c/:card", isAuthenticated, async (req, res) => {
  if (req.sessionData!.user !== p(req.params.user)) {
    res.status(403).send("not authorized");
    return;
  }

  try {
    await db.deleteCard(p(req.params.card), p(req.params.user));
    res.json(true);
  } catch (err) {
    console.error("failed delete", err);
    res.status(404).send("not found");
  }
});

// Create a new card
router.put("/api/u/:user/c/:card", isAuthenticated, async (req, res) => {
  if (req.sessionData!.user !== p(req.params.user)) {
    res.status(403).send("not allowed");
    return;
  }

  const { encrypted } = req.body as CardCreateRequest;
  try {
    const data = await db.createCard(
      p(req.params.card),
      p(req.params.user),
      JSON.stringify(encrypted),
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(400).send("failed");
  }
});

// Update a card (optimistic locking via version/last_update)
router.post("/api/u/:user/c/:card", isAuthenticated, async (req, res) => {
  if (req.sessionData!.user !== p(req.params.user)) {
    res.status(403).send("not allowed");
    return;
  }

  const { encrypted, version } = req.body as CardUpdateRequest;
  try {
    const data = await db.updateCard(
      p(req.params.card),
      p(req.params.user),
      version,
      JSON.stringify(encrypted),
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(409).send("update conflict or not found");
  }
});

// List cards for a user
router.get("/api/u/:user/c", isAuthenticated, async (req, res) => {
  if (req.sessionData!.user !== p(req.params.user)) {
    res.status(403).send("not allowed");
    return;
  }

  try {
    const data = await db.listCards(
      p(req.params.user),
      (req.query.since as string) || null,
    );
    const list: CardListItem[] = data.map((card) => ({
      id: card.card_id,
      version: card.last_update,
      encrypted: JSON.parse(card.data_blob),
    }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(400).send("failed");
  }
});
