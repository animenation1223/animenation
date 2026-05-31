import type {
  BlogPost,
  CartItem,
  ContactMessage,
  Order,
  OrderItem,
  Product,
  Review,
  User,
  WishlistItem,
} from "@prisma/client";
import { keysToSnake } from "./case";

function withDates<T extends { createdAt?: Date; updatedAt?: Date; publishedDate?: Date | null }>(
  row: T
): Record<string, unknown> {
  const base = keysToSnake(row as Record<string, unknown>);
  if (row.createdAt) base.created_date = row.createdAt.toISOString();
  if ("updatedAt" in row && row.updatedAt) base.updated_date = row.updatedAt.toISOString();
  if ("publishedDate" in row && row.publishedDate) base.published_date = row.publishedDate.toISOString();
  return base;
}

export function serializeUser(user: User) {
  const row = withDates(user);
  row.picture_url = user.pictureUrl;
  return row;
}

export function serializeProduct(product: Product) {
  const row = withDates(product);
  row.compare_price = product.comparePrice;
  row.anime_series = product.animeSeries;
  row.image_url = product.imageUrl;
  row.review_count = product.reviewCount;
  row.is_active = product.isActive;
  row.print_type = product.printType;
  return row;
}

export function serializeCartItem(item: CartItem) {
  const row = withDates(item);
  row.product_id = item.productId;
  row.image_url = item.imageUrl;
  return row;
}

export function serializeWishlistItem(item: WishlistItem) {
  const row = withDates(item);
  row.product_id = item.productId;
  row.image_url = item.imageUrl;
  return row;
}

export function serializeReview(review: Review) {
  const row = withDates(review);
  row.product_id = review.productId;
  row.reviewer_name = review.reviewerName;
  row.is_approved = review.isApproved;
  return row;
}

export function serializeBlogPost(post: BlogPost) {
  const row = withDates(post);
  row.cover_image = post.coverImage;
  row.is_published = post.isPublished;
  row.read_time = post.readTime;
  row.meta_title = post.metaTitle;
  row.meta_description = post.metaDescription;
  return row;
}

export function serializeContactMessage(msg: ContactMessage) {
  const row = withDates(msg);
  row.is_read = msg.isRead;
  return row;
}

export function serializeOrder(order: Order & { items: OrderItem[] }) {
  const row = withDates(order);
  const paymentOrder = order as unknown as {
    paymentStatus?: string;
    paymentGateway?: string | null;
    paymentOrderId?: string | null;
    paymentId?: string | null;
    paymentCapturedAt?: Date | null;
  };
  row.order_number = order.orderNumber;
  row.payment_method = order.paymentMethod;
  row.payment_status = paymentOrder.paymentStatus || "pending";
  row.payment_gateway = paymentOrder.paymentGateway || null;
  row.payment_order_id = paymentOrder.paymentOrderId || null;
  row.payment_id = paymentOrder.paymentId || null;
  row.payment_captured_at = paymentOrder.paymentCapturedAt ? paymentOrder.paymentCapturedAt.toISOString() : null;
  row.tracking_id = order.trackingId;
  row.customer_email = order.customerEmail;
  row.shipping_cost = order.shippingCost;
  row.gst_amount = order.gstAmount;
  row.discount_amount = order.discountAmount;
  row.coupon_code = order.couponCode;
  row.shipping_address = {
    name: order.shippingName,
    phone: order.shippingPhone,
    address: order.shippingAddr,
    landmark: order.shippingLandmark || "",
    city: order.shippingCity,
    state: order.shippingState,
    pincode: order.shippingPincode,
  };
  row.items = order.items.map((item) => ({
    product_id: item.productId,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    size: item.size || "",
    image_url: item.imageUrl,
  }));
  return row;
}
