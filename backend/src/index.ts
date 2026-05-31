import dotenv from "dotenv";
dotenv.config();

import { createServer } from "./server";
import { prisma } from "./infra/prisma";

const port = Number(process.env.PORT || 4000);

const app = createServer();
const server = app.listen(port, () => {
  console.log(
    JSON.stringify({
      event: "server_start",
      port,
      env: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    })
  );
});

// ── Graceful Shutdown ──────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`[shutdown] ${signal} received — closing connections…`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("[shutdown] Prisma disconnected. Bye.");
    process.exit(0);
  });
  // Force exit after 10s if connections won't drain
  setTimeout(() => process.exit(1), 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
