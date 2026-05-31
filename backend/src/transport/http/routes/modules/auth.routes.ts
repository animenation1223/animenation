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

export const authRouter = Router();

// Email/password auth
authRouter.post("/signup", emailSignupHandler);
authRouter.post("/login", emailLoginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/forgot-password", forgotPasswordHandler);
authRouter.post("/reset-password", resetPasswordHandler);
authRouter.get("/verify-email", verifyEmailHandler);

// Google OIDC login (optional)
authRouter.get("/google/login", googleLoginHandler);
authRouter.get("/google/callback", googleCallbackHandler);

// Session / profile
authRouter.get("/me", requireAuth, meHandler);
authRouter.post("/logout", logoutHandler);

