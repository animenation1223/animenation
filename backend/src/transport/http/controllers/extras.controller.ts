import type { RequestHandler } from "express";
import { prisma } from "../../../infra/prisma";
import { HttpError } from "../middleware/errorHandler";
import { keysToCamel } from "../../../lib/case";
import { issueAccessToken } from "../../security/jwt";
import { upsertUserFromGoogle } from "../../../usecases/auth/upsertUserFromGoogle";
import { routeParam } from "../../../lib/params";

export const publicSettingsHandler: RequestHandler = (_req, res) => {
  res.json({
    id: "animenation",
    public_settings: {
      auth_required: false,
      features: { loyalty: true, coupons: true },
    },
  });
};

export const validateCouponHandler: RequestHandler = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body as { code?: string; subtotal?: number };
    if (!code) throw new HttpError(400, "Coupon code required");
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!coupon || !coupon.active) throw new HttpError(400, "Invalid coupon code");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new HttpError(400, "Coupon expired");
    }
    if (Number(subtotal) < coupon.minOrder) {
      throw new HttpError(400, `Minimum order ₹${coupon.minOrder} required`);
    }
    const discount =
      coupon.type === "percent"
        ? Math.round((Number(subtotal) * coupon.discount) / 100)
        : coupon.discount;
    res.json({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      discount_amount: Math.min(discount, Number(subtotal)),
      label:
        coupon.type === "percent"
          ? `${coupon.discount}% off`
          : `₹${coupon.discount} off`,
    });
  } catch (e) {
    next(e);
  }
};

export const listCouponsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(
      rows.map((c) => ({
        id: c.id,
        code: c.code,
        discount: c.discount,
        type: c.type,
        minOrder: c.minOrder,
        uses: c.uses,
        active: c.active,
        expires: c.expiresAt?.toISOString().slice(0, 10) || null,
      }))
    );
  } catch (e) {
    next(e);
  }
};

export const createCouponHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const row = await prisma.coupon.create({
      data: {
        code: String(body.code).toUpperCase(),
        type: body.type === "flat" ? "flat" : "percent",
        discount: Number(body.discount),
        minOrder: Number(body.minOrder || 0),
        active: body.active !== false,
        expiresAt: body.expires ? new Date(String(body.expires)) : null,
      },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
};

export const updateCouponHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const row = await prisma.coupon.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
        ...(body.discount !== undefined ? { discount: Number(body.discount) } : {}),
        ...(body.minOrder !== undefined ? { minOrder: Number(body.minOrder) } : {}),
        ...(body.expires !== undefined
          ? { expiresAt: body.expires ? new Date(String(body.expires)) : null }
          : {}),
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
};

export const deleteCouponHandler: RequestHandler = async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const listBannersHandler: RequestHandler = async (req, res, next) => {
  try {
    const admin = req.auth?.role === "admin";
    const rows = await prisma.banner.findMany({
      where: admin ? {} : { active: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

export const createBannerHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const row = await prisma.banner.create({
      data: {
        title: String(body.title),
        subtitle: body.subtitle ? String(body.subtitle) : null,
        cta: String(body.cta),
        link: String(body.link),
        gradient: String(body.gradient),
        sortOrder: Number(body.sortOrder || 0),
        active: body.active !== false,
      },
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
};

export const updateBannerHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const row = await prisma.banner.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(body.title !== undefined ? { title: String(body.title) } : {}),
        ...(body.subtitle !== undefined ? { subtitle: body.subtitle ? String(body.subtitle) : null } : {}),
        ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      },
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
};

export const deleteBannerHandler: RequestHandler = async (req, res, next) => {
  try {
    await prisma.banner.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const pincodeHandler: RequestHandler = async (req, res, next) => {
  try {
    const pincode = routeParam(req.params.pincode);
    if (!pincode || pincode.length !== 6) throw new HttpError(400, "Invalid pincode");
    const row = await prisma.pincodeServiceability.findUnique({ where: { pincode } });
    if (!row) throw new HttpError(404, "Pincode not serviceable");
    const eta = new Date();
    eta.setDate(eta.getDate() + row.etaDays);
    res.json({
      name: row.courier,
      days: row.etaDays,
      eta: eta.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      cod: row.cod,
    });
  } catch (e) {
    next(e);
  }
};

export const loyaltyMeHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    let account = await prisma.loyaltyAccount.findUnique({
      where: { userId: req.auth.sub },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
    });
    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: {
          userId: req.auth.sub,
          referralCode: `AV${req.auth.sub.slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        },
        include: { transactions: true },
      });
    }
    res.json({
      points: account.points,
      referral_code: account.referralCode,
      referrals_made: account.referralsMade,
      transactions: account.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        delta: t.delta,
        created_at: t.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
};

export const loyaltyEarnHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const { type, delta } = req.body as { type?: string; delta?: number };
    if (!type || !delta) throw new HttpError(400, "type and delta required");
    const account = await prisma.loyaltyAccount.findUnique({ where: { userId: req.auth.sub } });
    if (!account) throw new HttpError(404, "Loyalty account not found");
    const updated = await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { points: { increment: Number(delta) } },
    });
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: type as "newsletter",
        delta: Number(delta),
      },
    });
    res.json({ points: updated.points });
  } catch (e) {
    next(e);
  }
};

export const newsletterHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) throw new HttpError(400, "Email required");
    await prisma.newsletterSubscription.upsert({
      where: { email: email.toLowerCase() },
      create: { email: email.toLowerCase(), userId: req.auth?.sub || null },
      update: {},
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const devLoginHandler: RequestHandler = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(404, "Not found");
    }
    const { email, name } = req.body as { email?: string; name?: string };
    if (!email) throw new HttpError(400, "email required");
    const user = await upsertUserFromGoogle({ email, name: name || "Dev User", pictureUrl: null });
    const jwt = await issueAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(user.name ? { name: user.name } : {}),
    });
    res.json({ access_token: jwt, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (e) {
    next(e);
  }
};
