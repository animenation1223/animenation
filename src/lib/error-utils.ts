/**
 * Error message extraction utility
 * Handles various API response formats and provides meaningful error messages
 */

/**
 * Extract meaningful error message from various error formats
 */
export function extractErrorMessage(error) {
  // Handle null/undefined
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || 'Something went wrong. Please try again.';
  }

  // Handle API response objects
  const apiError = error;

  // Check for message field
  if (apiError.message && typeof apiError.message === 'string') {
    return apiError.message;
  }

  // Check for error field
  if (apiError.error && typeof apiError.error === 'string') {
    return apiError.error;
  }

  // Check for errors array
  if (Array.isArray(apiError.errors) && apiError.errors.length > 0) {
    const firstError = apiError.errors[0];
    if (firstError?.message && typeof firstError.message === 'string') {
      return firstError.message;
    }
  }

  // Fallback for unknown error formats
  return 'Something went wrong. Please try again.';
}

/**
 * Check if error is a specific type
 */
export function isAuthError(error) {
  const apiError = error;
  return apiError.status === 401 || apiError.status === 403;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error) {
  const apiError = error;
  return apiError.status === 400 || apiError.status === 422;
}

/**
 * Check if error is a server error
 */
export function isServerError(error) {
  const apiError = error;
  return (apiError.status || 0) >= 500;
}
