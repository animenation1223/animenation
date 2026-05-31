import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireAdmin } from "../../middleware/requireAdmin";
import { optionalAuth } from "../../middleware/optionalAuth";
import {
  createBlogPost,
  createCartItem,
  createContactMessage,
  createOrderHandler,
  createProduct,
  createReview,
  createWishlistItem,
  deleteBlogPost,
  deleteCartItem,
  deleteProduct,
  deleteReview,
  deleteWishlistItem,
  listBlogPosts,
  listCartItems,
  listContactMessages,
  listOrders,
  listProducts,
  listReviews,
  listWishlistItems,
  updateBlogPost,
  updateCartItem,
  updateContactMessage,
  updateOrder,
  updateProduct,
  updateReview,
} from "../../controllers/entities.controller";

export const entitiesRouter = Router();

// Products (public read, admin write)
entitiesRouter.get("/products", listProducts);
entitiesRouter.post("/products", requireAdmin, createProduct);
entitiesRouter.patch("/products/:id", requireAdmin, updateProduct);
entitiesRouter.delete("/products/:id", requireAdmin, deleteProduct);

// Cart (auth required)
entitiesRouter.get("/cart-items", requireAuth, listCartItems);
entitiesRouter.post("/cart-items", requireAuth, createCartItem);
entitiesRouter.patch("/cart-items/:id", requireAuth, updateCartItem);
entitiesRouter.delete("/cart-items/:id", requireAuth, deleteCartItem);

// Wishlist (auth required)
entitiesRouter.get("/wishlist-items", requireAuth, listWishlistItems);
entitiesRouter.post("/wishlist-items", requireAuth, createWishlistItem);
entitiesRouter.delete("/wishlist-items/:id", requireAuth, deleteWishlistItem);

// Orders (auth required; admin sees all)
entitiesRouter.get("/orders", requireAuth, listOrders);
entitiesRouter.post("/orders", requireAuth, createOrderHandler);
entitiesRouter.patch("/orders/:id", requireAuth, updateOrder);

// Reviews (public read approved; admin list all via ? - need optional auth)
entitiesRouter.get("/reviews", optionalAuth, listReviews);
entitiesRouter.post("/reviews", requireAuth, createReview);
entitiesRouter.patch("/reviews/:id", requireAdmin, updateReview);
entitiesRouter.delete("/reviews/:id", requireAdmin, deleteReview);

// Blog (public read)
entitiesRouter.get("/blog-posts", listBlogPosts);
entitiesRouter.post("/blog-posts", requireAdmin, createBlogPost);
entitiesRouter.patch("/blog-posts/:id", requireAdmin, updateBlogPost);
entitiesRouter.delete("/blog-posts/:id", requireAdmin, deleteBlogPost);

// Contact (public create, admin list/update)
entitiesRouter.get("/contact-messages", requireAdmin, listContactMessages);
entitiesRouter.post("/contact-messages", createContactMessage);
entitiesRouter.patch("/contact-messages/:id", requireAdmin, updateContactMessage);
