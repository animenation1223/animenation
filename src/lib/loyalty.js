/**
 * AnimeNation Loyalty — backed by PostgreSQL API
 */
import { apiFetch, getAccessToken } from '@/api/httpClient';

export const POINTS_CONFIG = {
  purchase: 10,
  review: 50,
  referral: 200,
  referred: 100,
  wishlist_add: 5,
  newsletter: 100,
  first_order: 250,
};

export const TIERS = [
  { name: 'Genin', min: 0, max: 499, color: 'text-muted-foreground', bg: 'bg-muted', emoji: '🥷' },
  { name: 'Chunin', min: 500, max: 1499, color: 'text-blue-400', bg: 'bg-blue-500/10', emoji: '⚔️' },
  { name: 'Jonin', min: 1500, max: 3999, color: 'text-accent', bg: 'bg-accent/10', emoji: '🌀' },
  { name: 'Kage', min: 4000, max: 9999, color: 'text-yellow-400', bg: 'bg-yellow-400/10', emoji: '👑' },
  { name: 'Hokage', min: 10000, max: Infinity, color: 'text-primary', bg: 'bg-primary/10', emoji: '🔥' },
];

let cachedAccount = null;

export async function fetchLoyaltyAccount() {
  if (!getAccessToken()) return null;
  try {
    cachedAccount = await apiFetch('/api/loyalty/me');
    return cachedAccount;
  } catch {
    return null;
  }
}

export function getPoints() {
  return cachedAccount?.points ?? 0;
}

export async function addPoints(amount, type = 'newsletter') {
  if (!getAccessToken()) return 0;
  const res = await apiFetch('/api/loyalty/earn', { method: 'POST', body: { type, delta: amount } });
  if (cachedAccount) cachedAccount.points = res.points;
  return res.points;
}

export function getTier(points) {
  return TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
}

export function getNextTier(points) {
  const idx = TIERS.findIndex(t => points >= t.min && points <= t.max);
  return TIERS[idx + 1] || null;
}

export function getProgressToNext(points) {
  const current = getTier(points);
  const next = getNextTier(points);
  if (!next) return 100;
  return Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100));
}

export function getReferralCode() {
  return cachedAccount?.referral_code || 'AN-GUEST';
}

export function getReferralsMade() {
  return cachedAccount?.referrals_made ?? 0;
}

export function pointsFromOrder(total) {
  return Math.floor(total / 100) * POINTS_CONFIG.purchase;
}
