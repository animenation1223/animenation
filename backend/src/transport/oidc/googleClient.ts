import { HttpError } from "../http/middleware/errorHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: { config: any } | null = null;

export async function getGoogleClient() {
  if (cached) return cached;

  const clientId = process.env.GOOGLE_OIDC_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OIDC_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OIDC_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new HttpError(500, "Google OIDC not configured");
  }

  const { discovery, ClientSecretPost } = await import("openid-client");
  const config = await discovery(
    new URL("https://accounts.google.com"),
    clientId,
    undefined,
    ClientSecretPost(clientSecret)
  );

  cached = { config };
  return cached;
}

