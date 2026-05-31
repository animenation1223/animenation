export interface User {
  id: string;
  email: string;
  role?: 'admin' | 'user' | string;
  name?: string;
  [key: string]: any;
}

export interface AuthError {
  type: 'user_not_registered' | 'unknown' | string;
  message: string;
}

export interface PublicSettings {
  appId?: string;
  appName?: string;
  [key: string]: any;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: AuthError | null;
  appPublicSettings: PublicSettings | null;
  authChecked: boolean;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkUserAuth: () => Promise<void>;
  checkAppState: () => Promise<void>;
}
