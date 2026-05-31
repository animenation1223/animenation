/**
 * Feature Flags Configuration
 * 
 * Add feature flags here to control feature availability across the application.
 * Set to false to disable features without deleting code.
 */

export const FEATURE_FLAGS = {
  // Pincode availability checker
  // Set to false to hide pincode checker from customer-facing UI
  // Backend APIs and database remain intact
  ENABLE_PINCODE_CHECK: false,
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
