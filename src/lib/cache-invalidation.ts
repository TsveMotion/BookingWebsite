/**
 * Cache invalidation helpers for GlamBooking
 * Call these functions after creating/updating data to clear stale cache
 */

import { invalidateUserCache, invalidateCachePattern, invalidateCache, cacheKeys } from './cache';

/**
 * Invalidate all dashboard-related cache for a user
 * Call this after any action that affects dashboard stats (bookings, clients, revenue)
 */
export async function invalidateDashboardCache(userId: string) {
  console.log(`♻️ Invalidating dashboard cache for user: ${userId}`);
  
  await Promise.all([
    invalidateCache(cacheKeys.dashboard.summary(userId)),
    invalidateCache(cacheKeys.dashboard.revenue(userId)),
    invalidateCache(cacheKeys.dashboard.subscription(userId)),
  ]);
}

/**
 * Invalidate billing cache for a user
 * Call this after subscription changes, SMS credit purchases, etc.
 */
export async function invalidateBillingCache(userId: string) {
  console.log(`♻️ Invalidating billing cache for user: ${userId}`);
  
  await Promise.all([
    invalidateCache(cacheKeys.billing.data(userId)),
    invalidateCache(cacheKeys.billing.invoices(userId)),
  ]);
}

/**
 * Invalidate cache after booking creation/update
 * This affects dashboard stats and booking lists
 */
export async function invalidateBookingCache(userId: string) {
  console.log(`♻️ Invalidating booking cache for user: ${userId}`);
  
  await Promise.all([
    invalidateDashboardCache(userId),
    invalidateCache(cacheKeys.booking.upcoming(userId)),
    invalidateCache(cacheKeys.booking.history(userId)),
  ]);
}

/**
 * Invalidate cache after client creation/update
 * This affects dashboard stats
 */
export async function invalidateClientCache(userId: string) {
  console.log(`♻️ Invalidating client cache for user: ${userId}`);
  
  await invalidateDashboardCache(userId);
}

/**
 * Invalidate cache after profile/salon update
 */
export async function invalidateProfileCache(userId: string, salonId?: string) {
  console.log(`♻️ Invalidating profile cache for user: ${userId}`);
  
  await invalidateDashboardCache(userId);
  
  if (salonId) {
    await invalidateCache(cacheKeys.salon.details(salonId));
  }
}

/**
 * Invalidate all cache for a user (nuclear option)
 * Use this for major account changes like plan upgrades
 */
export async function invalidateAllUserCache(userId: string) {
  console.log(`♻️♻️♻️ FULL CACHE INVALIDATION for user: ${userId}`);
  
  await invalidateUserCache(userId);
}
