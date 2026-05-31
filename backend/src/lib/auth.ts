import type { Request } from "express";
import { HttpError } from "../transport/http/middleware/errorHandler";
import type { AuthUser } from "../transport/http/middleware/requireAuth";
import { prisma } from "../infra/prisma";

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

  const configuredIssuer = process.env.JWT_ISSUER || "animenation";
  const allowedIssuers = Array.from(new Set([configuredIssuer, "animenation", "animeverse"]));

  const configuredAudience = process.env.JWT_AUDIENCE || "animenation-web";
  const allowedAudiences = Array.from(new Set([configuredAudience, "animenation-web", "animeverse-web"]));

  const { jwtVerify } = await import("jose");
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    issuer: allowedIssuers,
    audience: allowedAudiences,
  });

  // Verify that the user still exists in the database to prevent P2003 Foreign Key constraint violations
  const dbUser = await prisma.user.findUnique({
    where: { id: String(payload.sub) },
    select: { id: true },
  });
  if (!dbUser) {
    throw new HttpError(401, "User no longer exists in database");
  }

  const auth: AuthUser = {
    sub: String(payload.sub),
    email: String(payload.email),
    role: String(payload.role || "user"),
  };
  if (payload.name) auth.name = String(payload.name);
  if (payload.pictureUrl) auth.pictureUrl = String(payload.pictureUrl);
  return auth;
}
