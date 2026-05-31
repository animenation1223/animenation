import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import { prisma } from "./infra/prisma";
import { apiRouter } from "./transport/http/routes";
import { errorHandler } from "./transport/http/middleware/errorHandler";
import { notFoundHandler } from "./transport/http/middleware/notFoundHandler";
import { razorpayWebhookHandler } from "./transport/http/controllers/payment.controller";

const isProd = process.env.NODE_ENV === "production";

export function createServer() {
  const app = express();

  // Trust Railway/Vercel reverse proxy headers
  if (isProd) {
    app.set("trust proxy", 1);
  }

  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

  app.use(helmet());
  app.use(
    cors({
      origin: frontendBaseUrl,
      credentials: true,
    })
  );

  // Production uses structured 'combined' logs; dev uses coloured 'dev' format
  app.use(morgan(isProd ? "combined" : "dev"));

  // Razorpay webhook needs raw body — mount before json parser
  app.post(
    "/api/payments/razorpay/webhook",
    express.raw({ type: "application/json" }),
    razorpayWebhookHandler
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ── Health & Readiness ────────────────────────────────────────────────
  app.get("/healthz", async (_req, res) => {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      res.json({
        ok: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[healthz] DB unreachable:", err);
      res.status(503).json({ ok: false, error: "database unreachable" });
    }
  });

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

