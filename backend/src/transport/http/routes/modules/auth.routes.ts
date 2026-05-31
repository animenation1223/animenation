import { Router } from "express";
import {
  googleLoginHandler,
  googleCallbackHandler,
  meHandler,
  logoutHandler,
  emailSignupHandler,
  emailLoginHandler,
  refreshHandler,
  verifyEmailHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "../../controllers/auth.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { createRateLimiter } from "../../middleware/rateLimiter";

export const authRouter = Router();

// Rate limiters
const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3, // Max 3 requests per 15 minutes per IP
  keyGenerator: (req) => req.ip || 'unknown',
});

// Email/password auth
authRouter.post("/signup", emailSignupHandler);
authRouter.post("/login", emailLoginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/forgot-password", forgotPasswordRateLimiter, forgotPasswordHandler);
authRouter.post("/reset-password", resetPasswordHandler);
authRouter.get("/verify-email", verifyEmailHandler);

// Google OIDC login (optional)
authRouter.get("/google/login", googleLoginHandler);
authRouter.get("/google/callback", googleCallbackHandler);

// Session / profile
authRouter.get("/me", requireAuth, meHandler);
authRouter.post("/logout", logoutHandler);

