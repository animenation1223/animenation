import type { Request } from "express";
import { HttpError } from "../transport/http/middleware/errorHandler";
import type { AuthUser } from "../transport/http/middleware/requireAuth";

function getBearerToken(req: Request) {
  const header = req.header("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

export async function authenticateRequest(req: Request): Promise<AuthUser> {
  const token = getBearerToken(req) || (req.cookies?.access_token as string | undefined) || null;
  if (!token) throw new HttpError(401, "Unauthorized");

  const secret = process.env.JWT_SIGNING_SECRET;
  if (!secret) throw new HttpError(500, "JWT_SIGNING_SECRET not configured");

  const issuer = process.env.JWT_ISSUER || "animenation";
  const audience = process.env.JWT_AUDIENCE || "animenation-web";

  const { jwtVerify } = await import("jose");
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    issuer,
    audience,
  });

  const auth: AuthUser = {
    sub: String(payload.sub),
    email: String(payload.email),
    role: String(payload.role || "user"),
  };
  if (payload.name) auth.name = String(payload.name);
  if (payload.pictureUrl) auth.pictureUrl = String(payload.pictureUrl);
  return auth;
}
