import { apiFetch, createEntityApi, getAccessToken, setAccessToken } from '@/api/httpClient';
import { appParams } from '@/lib/app-params';
import { Base44Client, Base44Entities, Product, CartItem, WishlistItem, Order, Review, BlogPost, ContactMessage } from '@/types';

const entities: Base44Entities = {
  Product: createEntityApi<Product>('products'),
  CartItem: createEntityApi<CartItem>('cart-items'),
  WishlistItem: createEntityApi<WishlistItem>('wishlist-items'),
  Order: createEntityApi<Order>('orders'),
  Review: createEntityApi<Review>('reviews'),
  BlogPost: createEntityApi<BlogPost>('blog-posts'),
  ContactMessage: createEntityApi<ContactMessage>('contact-messages'),
};

export const base44: Base44Client = {
  entities,
  auth: {
    async me() {
      return apiFetch('/api/auth/me');
    },
    redirectToLogin(returnUrl) {
      const target = returnUrl || window.location.pathname;
      const url = new URL('/login', window.location.origin);
      url.searchParams.set('return_to', target);
      window.location.href = url.toString();
    },
    logout(redirectUrl) {
      setAccessToken(null);
      apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      if (redirectUrl) {
        const url = new URL(redirectUrl);
        url.searchParams.delete('access_token');
        window.location.href = url.toString();
      }
    },
    async isAuthenticated() {
      if (getAccessToken()) return true;
      try {
        await apiFetch('/api/auth/me');
        return true;
      } catch {
        return false;
      }
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const fd = new FormData();
        fd.append('file', file);
        return apiFetch('/api/uploads', { method: 'POST', body: fd, isFormData: true });
      },
    },
  },
  appId: appParams.appId,
};

// Persist token from OAuth redirect
if (appParams.token) {
  setAccessToken(appParams.token);
}
export default base44;
