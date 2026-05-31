import type { ErrorRequestHandler } from "express";

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, opts?: { code?: string; details?: unknown }) {
    super(message);
    this.status = status;
    if (opts && "code" in opts && opts.code !== undefined) this.code = opts.code;
    if (opts && "details" in opts && opts.details !== undefined) this.details = opts.details;
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message = status >= 500 ? "Internal Server Error" : (err?.message || "Request failed");

  const payload = {
    error: {
      message,
      code: err?.code,
      details: err?.details,
    },
  };

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[backend] unhandled error:", err);
  }

  res.status(status).json(payload);
};

