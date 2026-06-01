import { EntityApi } from '@/types';

const TOKEN_KEY = 'base44_access_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

interface ApiFetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function apiFetch<T = any>(
  path: string,
  { method = 'GET', body, headers = {}, isFormData = false }: ApiFetchOptions = {}
): Promise<T> {
  const token = getAccessToken();
  const reqHeaders: Record<string, string> = { ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;
  if (body && !isFormData) reqHeaders['Content-Type'] = 'application/json';

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      /* ignore */
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null as any;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function buildQuery(where: Record<string, any> = {}, sort?: string, limit?: number): string {
  const params = new URLSearchParams();
  Object.entries(where).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  if (sort) params.set('sort', sort);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function createEntityApi<T>(resourcePath: string): EntityApi<T> {
  return {
    async list(sort = '-created_date', limit) {
      return apiFetch<T[]>(`/api/${resourcePath}${buildQuery({}, sort, limit)}`);
    },
    async filter(where = {}, sort = '-created_date', limit) {
      return apiFetch<T[]>(`/api/${resourcePath}${buildQuery(where, sort, limit)}`);
    },
    async create(data) {
      return apiFetch<T>(`/api/${resourcePath}`, { method: 'POST', body: data });
    },
    async update(id, data) {
      return apiFetch<T>(`/api/${resourcePath}/${id}`, { method: 'PATCH', body: data });
    },
    async delete(id) {
      return apiFetch<any>(`/api/${resourcePath}/${id}`, { method: 'DELETE' });
    },
  };
}
