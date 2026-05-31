import { HttpError } from "../http/middleware/errorHandler";

type AccessTokenClaims = {
  sub: string;
  email: string;
  role: string;
  name?: string;
  pictureUrl?: string;
};

export async function issueAccessToken(claims: AccessTokenClaims) {
  const secret = process.env.JWT_SIGNING_SECRET;
  if (!secret) throw new HttpError(500, "JWT_SIGNING_SECRET not configured");

  const issuer = process.env.JWT_ISSUER || "animenation";
  const audience = process.env.JWT_AUDIENCE || "animenation-web";
  const ttl = Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7);

  const now = Math.floor(Date.now() / 1000);
  const { SignJWT } = await import("jose");
  const payload: Record<string, unknown> = {
    email: claims.email,
    role: claims.role,
  };
  if (claims.name) payload.name = claims.name;
  if (claims.pictureUrl) payload.pictureUrl = claims.pictureUrl;

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(claims.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + ttl)
    .sign(new TextEncoder().encode(secret));

  return jwt;
}

