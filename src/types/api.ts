export interface EntityApi<T> {
  list(sort?: string, limit?: number): Promise<T[]>;
  filter(where?: Record<string, any>, sort?: string, limit?: number): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<any>;
}

export interface Base44Entities {
  Product: EntityApi<import('./entities').Product>;
  CartItem: EntityApi<import('./entities').CartItem>;
  WishlistItem: EntityApi<import('./entities').WishlistItem>;
  Order: EntityApi<import('./entities').Order>;
  Review: EntityApi<import('./entities').Review>;
  BlogPost: EntityApi<import('./entities').BlogPost>;
  ContactMessage: EntityApi<import('./entities').ContactMessage>;
}

export interface Base44Auth {
  me(): Promise<import('./auth').User>;
  redirectToLogin(returnUrl?: string): void;
  logout(redirectUrl?: string): void;
  isAuthenticated(): Promise<boolean>;
}

export interface Base44Integrations {
  Core: {
    UploadFile(params: { file: File }): Promise<{ url: string; [key: string]: any }>;
  };
}

export interface Base44Client {
  entities: Base44Entities;
  auth: Base44Auth;
  integrations: Base44Integrations;
  appId?: string;
}
