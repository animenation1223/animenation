import type { RequestHandler } from "express";
import { prisma } from "../../../infra/prisma";
import { HttpError } from "../middleware/errorHandler";
import { keysToCamel, snakeToCamel } from "../../../lib/case";
import { parseSort } from "../../../lib/sort";
import {
  serializeBlogPost,
  serializeCartItem,
  serializeContactMessage,
  serializeOrder,
  serializeProduct,
  serializeReview,
  serializeWishlistItem,
} from "../../../lib/serializers";
import { createOrderForUser } from "../../../services/order.service";
import { routeParam } from "../../../lib/params";

function parseLimit(raw: unknown, fallback = 100) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : fallback;
}

function buildWhere(query: Record<string, string | string[] | undefined>, allowed: string[]) {
  const where: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (["sort", "limit"].includes(key) || value === undefined) continue;
    const field = snakeToCamel(key);
    if (!allowed.includes(field)) continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v === "true") where[field] = true;
    else if (v === "false") where[field] = false;
    else where[field] = v;
  }
  return where;
}

// ─── Products ───────────────────────────────────────────────

export const listProducts: RequestHandler = async (req, res, next) => {
  try {
    const where = buildWhere(req.query as Record<string, string>, [
      "id",
      "isActive",
      "category",
      "animeSeries",
      "slug",
    ]);
    const rows = await prisma.product.findMany({
      where,
      orderBy: parseSort(req.query.sort as string | undefined),
      take: parseLimit(req.query.limit),
    });
    res.json(rows.map(serializeProduct));
  } catch (e) {
    next(e);
  }
};

export const createProduct: RequestHandler = async (req, res, next) => {
  try {
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.product.create({
      data: {
        title: String(data.title),
        description: data.description ? String(data.description) : null,
        price: Number(data.price),
        comparePrice: data.comparePrice != null ? Number(data.comparePrice) : null,
        category: String(data.category),
        animeSeries: data.animeSeries ? String(data.animeSeries) : null,
        imageUrl: data.imageUrl ? String(data.imageUrl) : null,
        images: (data.images as string[]) || [],
        sizes: (data.sizes as string[]) || [],
        tags: (data.tags as string[]) || [],
        stock: Number(data.stock ?? 0),
        rating: Number(data.rating ?? 0),
        reviewCount: Number(data.reviewCount ?? 0),
        isActive: data.isActive !== false,
        gsm: data.gsm ? String(data.gsm) : null,
        printType: data.printType ? String(data.printType) : null,
      },
    });
    res.status(201).json(serializeProduct(row));
  } catch (e) {
    next(e);
  }
};

export const updateProduct: RequestHandler = async (req, res, next) => {
  try {
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.product.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(data.title !== undefined ? { title: String(data.title) } : {}),
        ...(data.description !== undefined ? { description: data.description ? String(data.description) : null } : {}),
        ...(data.price !== undefined ? { price: Number(data.price) } : {}),
        ...(data.comparePrice !== undefined ? { comparePrice: data.comparePrice != null ? Number(data.comparePrice) : null } : {}),
        ...(data.category !== undefined ? { category: String(data.category) } : {}),
        ...(data.animeSeries !== undefined ? { animeSeries: data.animeSeries ? String(data.animeSeries) : null } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl ? String(data.imageUrl) : null } : {}),
        ...(data.images !== undefined ? { images: data.images as string[] } : {}),
        ...(data.sizes !== undefined ? { sizes: data.sizes as string[] } : {}),
        ...(data.tags !== undefined ? { tags: data.tags as string[] } : {}),
        ...(data.stock !== undefined ? { stock: Number(data.stock) } : {}),
        ...(data.rating !== undefined ? { rating: Number(data.rating) } : {}),
        ...(data.reviewCount !== undefined ? { reviewCount: Number(data.reviewCount) } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
        ...(data.gsm !== undefined ? { gsm: data.gsm ? String(data.gsm) : null } : {}),
        ...(data.printType !== undefined ? { printType: data.printType ? String(data.printType) : null } : {}),
      },
    });
    res.json(serializeProduct(row));
  } catch (e) {
    next(e);
  }
};

export const deleteProduct: RequestHandler = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

// ─── Cart ───────────────────────────────────────────────────

export const listCartItems: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const rows = await prisma.cartItem.findMany({
      where: { userId: req.auth.sub },
      orderBy: parseSort(req.query.sort as string | undefined),
    });
    res.json(rows.map(serializeCartItem));
  } catch (e) {
    next(e);
  }
};

export const createCartItem: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const productId = String(data.productId);
    const size = data.size ? String(data.size) : null;

    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.auth.sub, productId, size: size ?? null },
    });

    if (existing) {
      const row = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + Number(data.quantity || 1) },
      });
      return res.json(serializeCartItem(row));
    }

    const row = await prisma.cartItem.create({
      data: {
        userId: req.auth.sub,
        productId,
        title: String(data.title),
        price: Number(data.price),
        quantity: Number(data.quantity || 1),
        size,
        imageUrl: data.imageUrl ? String(data.imageUrl) : null,
      },
    });
    res.status(201).json(serializeCartItem(row));
  } catch (e) {
    next(e);
  }
};

export const updateCartItem: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const existing = await prisma.cartItem.findFirst({
        where: { id: routeParam(req.params.id), userId: req.auth.sub },
    });
    if (!existing) throw new HttpError(404, "Cart item not found");
    const row = await prisma.cartItem.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(data.quantity !== undefined ? { quantity: Number(data.quantity) } : {}),
      },
    });
    res.json(serializeCartItem(row));
  } catch (e) {
    next(e);
  }
};

export const deleteCartItem: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const existing = await prisma.cartItem.findFirst({
        where: { id: routeParam(req.params.id), userId: req.auth.sub },
    });
    if (!existing) throw new HttpError(404, "Cart item not found");
    await prisma.cartItem.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

// ─── Wishlist ─────────────────────────────────────────────────

export const listWishlistItems: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const rows = await prisma.wishlistItem.findMany({
      where: { userId: req.auth.sub },
      orderBy: parseSort(req.query.sort as string | undefined),
    });
    res.json(rows.map(serializeWishlistItem));
  } catch (e) {
    next(e);
  }
};

export const createWishlistItem: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: req.auth.sub,
          productId: String(data.productId),
        },
      },
      create: {
        userId: req.auth.sub,
        productId: String(data.productId),
        title: String(data.title),
        price: data.price != null ? Number(data.price) : null,
        imageUrl: data.imageUrl ? String(data.imageUrl) : null,
        category: data.category ? String(data.category) : null,
      },
      update: {},
    });

    const loyalty = await prisma.loyaltyAccount.findUnique({ where: { userId: req.auth.sub } });
    if (loyalty) {
      await prisma.loyaltyAccount.update({
        where: { id: loyalty.id },
        data: { points: { increment: 5 } },
      });
      await prisma.loyaltyTransaction.create({
        data: { accountId: loyalty.id, type: "wishlist_add", delta: 5 },
      });
    }

    res.status(201).json(serializeWishlistItem(row));
  } catch (e) {
    next(e);
  }
};

export const deleteWishlistItem: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const existing = await prisma.wishlistItem.findFirst({
        where: { id: routeParam(req.params.id), userId: req.auth.sub },
    });
    if (!existing) throw new HttpError(404, "Wishlist item not found");
    await prisma.wishlistItem.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

// ─── Orders ───────────────────────────────────────────────────

export const listOrders: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const isAdmin = req.auth.role === "admin";
    const rows = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: req.auth.sub },
      include: { items: true },
      orderBy: parseSort(req.query.sort as string | undefined),
      take: parseLimit(req.query.limit, 200),
    });
    res.json(rows.map(serializeOrder));
  } catch (e) {
    next(e);
  }
};

export const createOrderHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const order = await createOrderForUser(req.auth.sub, req.auth.email, req.body);
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
};

export const updateOrder: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const existing = await prisma.order.findUnique({ where: { id: routeParam(req.params.id) } });
    if (!existing) throw new HttpError(404, "Order not found");
    if (req.auth.role !== "admin" && existing.userId !== req.auth.sub) {
      throw new HttpError(403, "Forbidden");
    }
    const row = await prisma.order.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(data.status !== undefined
          ? { status: String(data.status) as import("@prisma/client").OrderStatus }
          : {}),
        ...(data.trackingId !== undefined ? { trackingId: data.trackingId ? String(data.trackingId) : null } : {}),
      },
      include: { items: true },
    });
    res.json(serializeOrder(row));
  } catch (e) {
    next(e);
  }
};

// ─── Reviews ──────────────────────────────────────────────────

export const listReviews: RequestHandler = async (req, res, next) => {
  try {
    const isAdmin = req.auth?.role === "admin";
    const where = buildWhere(req.query as Record<string, string>, ["id", "productId", "isApproved"]);
    if (!isAdmin) where.isApproved = true;
    const rows = await prisma.review.findMany({
      where,
      orderBy: parseSort(req.query.sort as string | undefined),
      take: parseLimit(req.query.limit),
    });
    res.json(rows.map(serializeReview));
  } catch (e) {
    next(e);
  }
};

export const createReview: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.review.create({
      data: {
        userId: req.auth.sub,
        productId: String(data.productId),
        reviewerName: data.reviewerName ? String(data.reviewerName) : req.auth.name || "Customer",
        rating: Number(data.rating),
        comment: data.comment ? String(data.comment) : null,
        isApproved: false,
      },
    });

    const loyalty = await prisma.loyaltyAccount.findUnique({ where: { userId: req.auth.sub } });
    if (loyalty) {
      await prisma.loyaltyAccount.update({
        where: { id: loyalty.id },
        data: { points: { increment: 50 } },
      });
      await prisma.loyaltyTransaction.create({
        data: { accountId: loyalty.id, type: "review", delta: 50 },
      });
    }

    res.status(201).json(serializeReview(row));
  } catch (e) {
    next(e);
  }
};

export const updateReview: RequestHandler = async (req, res, next) => {
  try {
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.review.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(data.isApproved !== undefined ? { isApproved: Boolean(data.isApproved) } : {}),
        ...(data.rating !== undefined ? { rating: Number(data.rating) } : {}),
        ...(data.comment !== undefined ? { comment: data.comment ? String(data.comment) : null } : {}),
      },
    });
    res.json(serializeReview(row));
  } catch (e) {
    next(e);
  }
};

export const deleteReview: RequestHandler = async (req, res, next) => {
  try {
    await prisma.review.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

// ─── Blog ─────────────────────────────────────────────────────

export const listBlogPosts: RequestHandler = async (req, res, next) => {
  try {
    const where = buildWhere(req.query as Record<string, string>, ["id", "slug", "isPublished", "category"]);
    const rows = await prisma.blogPost.findMany({
      where,
      orderBy: parseSort((req.query.sort as string) || "-published_date"),
      take: parseLimit(req.query.limit),
    });
    res.json(rows.map(serializeBlogPost));
  } catch (e) {
    next(e);
  }
};

export const createBlogPost: RequestHandler = async (req, res, next) => {
  try {
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.blogPost.create({
      data: {
        title: String(data.title),
        slug: String(data.slug),
        excerpt: data.excerpt ? String(data.excerpt) : null,
        content: data.content ? String(data.content) : null,
        coverImage: data.coverImage ? String(data.coverImage) : null,
        category: String(data.category),
        tags: (data.tags as string[]) || [],
        author: data.author ? String(data.author) : null,
        isPublished: Boolean(data.isPublished),
        publishedDate: data.publishedDate ? new Date(String(data.publishedDate)) : null,
        readTime: data.readTime != null ? Number(data.readTime) : null,
        metaTitle: data.metaTitle ? String(data.metaTitle) : null,
        metaDescription: data.metaDescription ? String(data.metaDescription) : null,
        featured: Boolean(data.featured),
      },
    });
    res.status(201).json(serializeBlogPost(row));
  } catch (e) {
    next(e);
  }
};

export const updateBlogPost: RequestHandler = async (req, res, next) => {
  try {
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.blogPost.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(data.title !== undefined ? { title: String(data.title) } : {}),
        ...(data.slug !== undefined ? { slug: String(data.slug) } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt ? String(data.excerpt) : null } : {}),
        ...(data.content !== undefined ? { content: data.content ? String(data.content) : null } : {}),
        ...(data.isPublished !== undefined ? { isPublished: Boolean(data.isPublished) } : {}),
        ...(data.publishedDate !== undefined
          ? { publishedDate: data.publishedDate ? new Date(String(data.publishedDate)) : null }
          : {}),
      },
    });
    res.json(serializeBlogPost(row));
  } catch (e) {
    next(e);
  }
};

export const deleteBlogPost: RequestHandler = async (req, res, next) => {
  try {
    await prisma.blogPost.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

// ─── Contact ──────────────────────────────────────────────────

export const listContactMessages: RequestHandler = async (req, res, next) => {
  try {
    const rows = await prisma.contactMessage.findMany({
      orderBy: parseSort(req.query.sort as string | undefined),
      take: parseLimit(req.query.limit, 200),
    });
    res.json(rows.map(serializeContactMessage));
  } catch (e) {
    next(e);
  }
};

export const createContactMessage: RequestHandler = async (req, res, next) => {
  try {
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.contactMessage.create({
      data: {
        name: String(data.name),
        email: String(data.email),
        subject: data.subject ? String(data.subject) : null,
        message: String(data.message),
      },
    });
    res.status(201).json(serializeContactMessage(row));
  } catch (e) {
    next(e);
  }
};

export const updateContactMessage: RequestHandler = async (req, res, next) => {
  try {
    const data = keysToCamel(req.body) as Record<string, unknown>;
    const row = await prisma.contactMessage.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...(data.isRead !== undefined ? { isRead: Boolean(data.isRead) } : {}),
      },
    });
    res.json(serializeContactMessage(row));
  } catch (e) {
    next(e);
  }
};
