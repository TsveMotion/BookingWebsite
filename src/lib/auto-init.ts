/**
 * Automatic initialization system for GlamBooking
 * Runs on app startup to ensure all Stripe products and database are ready
 */

import { initializeStripeProducts } from './stripe-products';

let isInitialized = false;

export async function autoInitialize() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('🚀 GlamBooking Auto-Initialization Starting...');

    // Initialize Stripe products automatically
    await initializeStripeProducts();

    isInitialized = true;
    console.log('✅ GlamBooking Auto-Initialization Complete');
  } catch (error) {
    console.error('❌ Auto-initialization failed:', error);
    // Don't throw - allow app to continue even if initialization fails
  }
}
