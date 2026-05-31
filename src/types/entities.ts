export interface BaseEntity {
  id: string;
  created_date: string;
  updated_date?: string;
}

export type ProductCategory =
  | 't-shirts'
  | 'oversized-tshirts'
  | 'hoodies'
  | 'posters'
  | 'stickers'
  | 'keychains'
  | 'manga'
  | 'action-figures'
  | 'phone-covers'
  | 'mouse-pads'
  | 'accessories';

export type AnimeSeries =
  | 'naruto'
  | 'one-piece'
  | 'attack-on-titan'
  | 'demon-slayer'
  | 'dragon-ball'
  | 'jujutsu-kaisen'
  | 'chainsaw-man'
  | 'bleach'
  | 'tokyo-revengers'
  | 'spy-x-family'
  | 'other';

export interface Product extends BaseEntity {
  title: string;
  description: string;
  price: number;
  compare_price?: number;
  category: ProductCategory;
  anime_series?: AnimeSeries;
  image_url: string;
  images?: string[];
  sizes?: string[];
  tags?: string[];
  stock: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  gsm?: string;
  print_type?: string;
}

export interface CartItem extends BaseEntity {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  image_url?: string;
}

export interface WishlistItem extends BaseEntity {
  product_id: string;
  title: string;
  price: number;
  image_url?: string;
  category?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking';

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  image_url?: string;
}

export interface Order extends BaseEntity {
  order_number?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  shipping_address?: ShippingAddress;
  tracking_id?: string;
  customer_email?: string;
}

export interface Review extends BaseEntity {
  product_id: string;
  reviewer_name?: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
}

export type BlogCategory =
  | 'anime-news'
  | 'merchandise-drops'
  | 'style-guides'
  | 'collection-announcements';

export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  category: BlogCategory;
  tags?: string[];
  author?: string;
  is_published: boolean;
  published_date?: string;
  read_time?: number;
  meta_title?: string;
  meta_description?: string;
  featured: boolean;
}

export interface ContactMessage extends BaseEntity {
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
}

export type ImageType = 'front' | 'back' | 'model_front' | 'model_back' | 'lifestyle';

export interface ProductImage extends BaseEntity {
  product_id: string;
  type: ImageType;
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  sort_order: number;
}
