import type { RequestHandler } from "express";
import { prisma } from "../../../infra/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getGoogleClient } from "../../oidc/googleClient";
import { issueAccessToken } from "../../security/jwt";
import { upsertUserFromGoogle } from "../../../usecases/auth/upsertUserFromGoogle";
import { ZodError, z } from "zod";
import crypto from "crypto";

const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/\d/, "Must include a number");

const authBodySchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(1).max(120).optional(),
});

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

function setAuthCookies(res: Parameters<RequestHandler>[1], accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === "production";
  const accessTtl = Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS || 60 * 15);
  const refreshTtl = Number(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 30);

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: accessTtl * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: refreshTtl * 1000,
  });
}

export const emailSignupHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = authBodySchema.parse(req.body ?? {});
    const existing = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });
    if (existing && (existing as any).passwordHash) {
      throw new HttpError(400, "Email already registered");
    }

    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash(parsed.password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.upsert({
      where: { email: parsed.email.toLowerCase() },
      update: {
        passwordHash: hash,
        name: parsed.name ?? existing?.name ?? null,
        verificationToken,
      },
      create: {
        email: parsed.email.toLowerCase(),
        name: parsed.name ?? null,
        passwordHash: hash,
        verificationToken,
        loyalty: {
          create: {
            points: 0,
            referralCode: `AV${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          },
        },
      },
    });

    // TODO: integrate real email service – for now, return token in dev
    const sendToken =
      process.env.NODE_ENV !== "production"
        ? { verification_token: verificationToken }
        : {};

    res.status(201).json({
      id: user.id,
      email: user.email,
      requires_verification: true,
      ...sendToken,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr: any = err;
      const first = anyErr.issues?.[0];
      next(new HttpError(400, first?.message || "Invalid payload"));
      return;
    }
    next(err);
  }
};

export const emailLoginHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = loginBodySchema.parse(req.body ?? {});
    const user = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });
    if (!user || !(user as any).passwordHash) {
      throw new HttpError(401, "Invalid credentials");
    }

    const bcrypt = await import("bcrypt");
    const ok = await bcrypt.compare(parsed.password, (user as any).passwordHash as string);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    if (!(user as any).emailVerifiedAt && process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
      throw new HttpError(403, "Email not verified");
    }

    const accessToken = await issueAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(user.name ? { name: user.name } : {}),
      ...(user.pictureUrl ? { pictureUrl: user.pictureUrl } : {}),
    });

    const refreshTtl = Number(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 30);
    const rt = crypto.randomBytes(48).toString("hex");
    const expires = new Date(Date.now() + refreshTtl * 1000);
    await (prisma as any).refreshToken.create({
      data: {
        userId: user.id,
        token: rt,
        expiresAt: expires,
      },
    });

    setAuthCookies(res, accessToken, rt);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      picture_url: user.pictureUrl,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr: any = err;
      const first = anyErr.issues?.[0];
      next(new HttpError(400, first?.message || "Invalid payload"));
      return;
    }
    next(err);
  }
};

export const refreshHandler: RequestHandler = async (req, res, next) => {
  try {
    const rtCookie = req.cookies?.refresh_token as string | undefined;
    if (!rtCookie) throw new HttpError(401, "No refresh token");

    const token = await (prisma as any).refreshToken.findUnique({ where: { token: rtCookie } });
    if (!token || token.revokedAt || token.expiresAt < new Date()) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!user) throw new HttpError(401, "User not found");

    const accessToken = await issueAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(user.name ? { name: user.name } : {}),
      ...(user.pictureUrl ? { pictureUrl: user.pictureUrl } : {}),
    });

    setAuthCookies(res, accessToken, rtCookie);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = (req.query.token as string | undefined) || "";
    if (!token) throw new HttpError(400, "Missing token");
    const user = await prisma.user.findFirst({ where: { verificationToken: token } as any });
    if (!user) throw new HttpError(400, "Invalid token");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        verificationToken: null,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordHandler: RequestHandler = async (req, res, next) => {
  try {
    const email = String((req.body?.email as string | undefined) || "").toLowerCase();
    if (!email) throw new HttpError(400, "Email required");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Do not reveal user existence
      res.json({ ok: true });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetTokenExpires: expires,
      },
    });

    const payload =
      process.env.NODE_ENV !== "production"
        ? { reset_token: token }
        : {};
    res.json({ ok: true, ...payload });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordHandler: RequestHandler = async (req, res, next) => {
  try {
    const schema = z.object({
      token: z.string().min(1),
      password: passwordSchema,
    });
    const parsed = schema.parse(req.body ?? {});
    const user = await prisma.user.findFirst({ where: { resetPasswordToken: parsed.token } as any });
    const expires = (user as any)?.resetTokenExpires as Date | undefined;
    if (!user || !expires || expires < new Date()) {
      throw new HttpError(400, "Invalid or expired token");
    }

    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash(parsed.password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        resetPasswordToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      const first = err.issues?.[0];
      next(new HttpError(400, first?.message || "Invalid payload"));
      return;
    }
    next(err);
  }
};

export const googleLoginHandler: RequestHandler = async (req, res, next) => {
  try {
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    const returnTo = (req.query.return_to as string | undefined) || frontendBaseUrl;

    const { config } = await getGoogleClient();
    const redirectUri = process.env.GOOGLE_OIDC_REDIRECT_URI;
    if (!redirectUri) throw new HttpError(500, "GOOGLE_OIDC_REDIRECT_URI not configured");

    const { buildAuthorizationUrl } = await import("openid-client");
    const url = buildAuthorizationUrl(config, {
      redirect_uri: redirectUri,
      scope: "openid email profile",
      state: Buffer.from(JSON.stringify({ returnTo })).toString("base64url"),
    });

    res.redirect(url.toString());
  } catch (e) {
    next(e);
  }
};

export const googleCallbackHandler: RequestHandler = async (req, res, next) => {
  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    if (!code) throw new HttpError(400, "Missing code");

    const { config } = await getGoogleClient();
    const redirectUri = process.env.GOOGLE_OIDC_REDIRECT_URI;
    if (!redirectUri) throw new HttpError(500, "GOOGLE_OIDC_REDIRECT_URI not configured");

    const currentUrl = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
    const { authorizationCodeGrant } = await import("openid-client");
    const checks = state ? { expectedState: state } : {};
    const tokenSet = await authorizationCodeGrant(config, currentUrl, checks);
    const claims = tokenSet.claims();
    if (!claims) throw new HttpError(400, "Invalid token response");
    const email = claims.email as string | undefined;
    if (!email) throw new HttpError(400, "Google account has no email");

    const user = await upsertUserFromGoogle({
      email,
      name: typeof claims.name === "string" ? claims.name : null,
      pictureUrl: typeof claims.picture === "string" ? claims.picture : null,
    });

    const jwt = await issueAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(user.name ? { name: user.name } : {}),
      ...(user.pictureUrl ? { pictureUrl: user.pictureUrl } : {}),
    });

    let returnTo = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
        if (parsed?.returnTo) returnTo = String(parsed.returnTo);
      } catch {
        // ignore
      }
    }

    const url = new URL(returnTo);
    url.searchParams.set("access_token", jwt);
    res.redirect(url.toString());
  } catch (e) {
    next(e);
  }
};

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    res.json({
      id: req.auth.sub,
      email: req.auth.email,
      role: req.auth.role,
      name: req.auth.name,
      picture_url: req.auth.pictureUrl,
    });
  } catch (e) {
    next(e);
  }
};

export const logoutHandler: RequestHandler = async (_req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/api/auth" });
  res.status(204).send();
};

