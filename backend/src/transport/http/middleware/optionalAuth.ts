import type { RequestHandler } from "express";
import { authenticateRequest } from "../../../lib/auth";

/** Attaches req.auth when a valid token is present; does not fail otherwise. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    req.auth = await authenticateRequest(req);
  } catch {
    // not authenticated
  }
  next();
};
