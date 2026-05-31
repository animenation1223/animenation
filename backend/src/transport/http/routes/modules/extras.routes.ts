import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/requireAuth";
import { requireAdmin } from "../../middleware/requireAdmin";
import { optionalAuth } from "../../middleware/optionalAuth";
import {
  createBannerHandler,
  createCouponHandler,
  deleteBannerHandler,
  deleteCouponHandler,
  devLoginHandler,
  listBannersHandler,
  listCouponsHandler,
  loyaltyEarnHandler,
  loyaltyMeHandler,
  newsletterHandler,
  pincodeHandler,
  publicSettingsHandler,
  updateBannerHandler,
  updateCouponHandler,
  validateCouponHandler,
} from "../../controllers/extras.controller";
import { uploadFileHandler } from "../../controllers/upload.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const extrasRouter = Router();

extrasRouter.get("/public-settings", publicSettingsHandler);
extrasRouter.get("/apps/public/prod/public-settings/by-id/:appId", publicSettingsHandler);

extrasRouter.post("/coupons/validate", validateCouponHandler);
extrasRouter.get("/coupons", requireAdmin, listCouponsHandler);
extrasRouter.post("/coupons", requireAdmin, createCouponHandler);
extrasRouter.patch("/coupons/:id", requireAdmin, updateCouponHandler);
extrasRouter.delete("/coupons/:id", requireAdmin, deleteCouponHandler);

extrasRouter.get("/banners", optionalAuth, listBannersHandler);
extrasRouter.post("/banners", requireAdmin, createBannerHandler);
extrasRouter.patch("/banners/:id", requireAdmin, updateBannerHandler);
extrasRouter.delete("/banners/:id", requireAdmin, deleteBannerHandler);

extrasRouter.get("/pincode/:pincode", pincodeHandler);
extrasRouter.get("/loyalty/me", requireAuth, loyaltyMeHandler);
extrasRouter.post("/loyalty/earn", requireAuth, loyaltyEarnHandler);
extrasRouter.post("/newsletter", newsletterHandler);
extrasRouter.post("/uploads", requireAuth, upload.single("file"), uploadFileHandler);
extrasRouter.post("/auth/dev-login", devLoginHandler);
