import type { RequestHandler } from "express";
import { authenticateRequest } from "../../../lib/auth";
import { HttpError } from "./errorHandler";

export const requireAdmin: RequestHandler = async (req, _res, next) => {
  try {
    req.auth = await authenticateRequest(req);
    if (req.auth.role !== "admin") {
      throw new HttpError(403, "Admin access required");
    }
    next();
  } catch (err: unknown) {
    next(err);
  }
};
