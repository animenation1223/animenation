import type { RequestHandler } from "express";
import { authenticateRequest } from "../../../lib/auth";

export type AuthUser = {
  sub: string;
  email: string;
  role: string;
  name?: string;
  pictureUrl?: string;
};

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthUser;
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    req.auth = await authenticateRequest(req);
    next();
  } catch (err: unknown) {
    next(err);
  }
};
