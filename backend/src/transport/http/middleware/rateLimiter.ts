import { RequestHandler } from 'express';

// Simple in-memory rate limiter for development
// In production, use Redis or a proper rate limiting solution
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: any) => string;
}

export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  const { windowMs, maxRequests, keyGenerator } = options;

  return (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      const resetTime = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', resetTime.toString());
      res.status(429).json({
        error: 'Too many requests',
        message: `Too many requests. Please try again in ${resetTime} seconds.`,
      });
      return;
    }

    // Increment count
    record.count++;
    next();
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute
