import React from 'react';
import PincodeChecker from '../india/PincodeChecker';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

export default function DeliveryInfo() {
  // Hide pincode checker if feature flag is disabled
  if (!FEATURE_FLAGS.ENABLE_PINCODE_CHECK) {
    return null;
  }
  
  return <PincodeChecker />;
}