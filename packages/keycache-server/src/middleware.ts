import type { Request, Response, NextFunction } from "express";
import { getUserByToken } from "./session.js";

function paramString(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token =
    paramString(req.query.session as string | string[] | undefined) ??
    paramString(req.params.session) ??
    req.body?.session;

  if (!token || typeof token !== "string") {
    res.status(401).send("not authenticated");
    return;
  }

  const userId = getUserByToken(token);
  if (!userId) {
    res.status(401).send("not authenticated");
    return;
  }

  req.sessionData = { user: userId, token };
  next();
}
