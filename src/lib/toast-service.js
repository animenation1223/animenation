import { toast } from 'sonner';

/**
 * Extract meaningful error message from various error formats
 * Supports all common API response structures
 */
function extractErrorMessage(error) {
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

  // Handle API response objects - check all possible nested structures
  const apiError = error;

  // Check for message field at top level
  if (apiError.message && typeof apiError.message === 'string') {
    return apiError.message;
  }

  // Check for error field at top level
  if (apiError.error && typeof apiError.error === 'string') {
    return apiError.error;
  }

  // Check for nested error.message structure
  if (apiError.error?.message && typeof apiError.error.message === 'string') {
    return apiError.error.message;
  }

  // Check for data.message structure
  if (apiError.data?.message && typeof apiError.data.message === 'string') {
    return apiError.data.message;
  }

  // Check for data.error structure
  if (apiError.data?.error && typeof apiError.data.error === 'string') {
    return apiError.data.error;
  }

  // Check for data.error.message structure
  if (apiError.data?.error?.message && typeof apiError.data.error.message === 'string') {
    return apiError.data.error.message;
  }

  // Check for detail field (common in Django/DRF)
  if (apiError.detail && typeof apiError.detail === 'string') {
    return apiError.detail;
  }

  // Check for errors array
  if (Array.isArray(apiError.errors) && apiError.errors.length > 0) {
    const firstError = apiError.errors[0];
    if (firstError?.message && typeof firstError.message === 'string') {
      return firstError.message;
    }
    if (firstError && typeof firstError === 'string') {
      return firstError;
    }
  }

  // Try to stringify the error as last resort
  try {
    const stringified = JSON.stringify(error);
    if (stringified && stringified !== '{}') {
      return stringified;
    }
  } catch (e) {
    // Ignore JSON stringify errors
  }

  // Final fallback - convert to string
  try {
    return String(error);
  } catch (e) {
    return 'Something went wrong. Please try again.';
  }
}

export const toastService = {
  success: (message) => {
    const displayMessage = typeof message === 'string' ? message : String(message || '');
    toast.success(displayMessage);
  },
  error: (message) => {
    const displayMessage = typeof message === 'string' ? message : String(message || '');
    toast.error(displayMessage);
  },
  warning: (message) => {
    const displayMessage = typeof message === 'string' ? message : String(message || '');
    toast.warning(displayMessage);
  },
  info: (message) => {
    const displayMessage = typeof message === 'string' ? message : String(message || '');
    toast.info(displayMessage);
  },

  /**
   * Centralized handler for API response and network errors.
   * Maps status codes to user-friendly messages while keeping dev logs detailed.
   *
   * @param {any} error The caught error object
   * @param {string} fallbackMessage Fallback message for unexpected cases
   * @param {string} context Optional context for more specific error messages (e.g., 'cart', 'payment', 'order')
   */
  handleApiError: (error, fallbackMessage = "Something went wrong. Please try again.", context = '') => {
    // 1. Keep detailed errors in dev console logs
    console.error("API Error Logged:", error);

    // 2. Extract error response message safely using robust utility
    const errorMessage = extractErrorMessage(error);
    
    // 3. Ensure errorMessage is always a string
    const displayMessage = typeof errorMessage === 'string' ? errorMessage : String(errorMessage || fallbackMessage);
    
    const isNetworkError = !error?.status && (
      displayMessage.toLowerCase().includes("fetch") || 
      displayMessage.toLowerCase().includes("network") ||
      displayMessage.toLowerCase().includes("failed to connect")
    );

    // 3. Map to specific user-friendly toast messages
    if (isNetworkError) {
      toastService.error("Unable to connect to server. Please try again.");
      return;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          if (displayMessage.toLowerCase().includes("validation") || displayMessage.toLowerCase().includes("invalid")) {
            toastService.error("Please check the highlighted fields.");
          } else {
            toastService.error(displayMessage || fallbackMessage);
          }
          break;
        case 401:
          // Check if this is a login credential error vs session expiration
          if (displayMessage.toLowerCase().includes("invalid credentials") || displayMessage.toLowerCase().includes("incorrect")) {
            toastService.error("Incorrect email or password.");
          } else {
            toastService.error("Your session has expired. Please log in again.");
          }
          break;
        case 403:
          toastService.error("You do not have permission to perform this action.");
          break;
        case 404:
          toastService.error(displayMessage || "Requested resource not found.");
          break;
        case 409:
          toastService.error(displayMessage || "Conflict occurred. Please try again.");
          break;
        case 422:
          toastService.error("Please check the highlighted fields.");
          break;
        case 429:
          toastService.error("Too many requests. Please try again later.");
          break;
        case 500:
          // Check for specific configuration errors
          if (displayMessage.toLowerCase().includes("razorpay") && displayMessage.toLowerCase().includes("not configured")) {
            toastService.error("Payment service is not configured. Please contact support.");
          } else {
            toastService.error("Something went wrong. Please try again.");
          }
          break;
        default:
          toastService.error(displayMessage || fallbackMessage);
      }
    } else {
      // Context-specific fallback messages
      if (context === 'cart') {
        toastService.error("Unable to update cart. Please try again.");
      } else if (context === 'payment') {
        toastService.error("Payment could not be completed. Please try again.");
      } else if (context === 'order') {
        toastService.error("Unable to place order. Please try again.");
      } else if (context === 'wishlist') {
        toastService.error("Unable to update wishlist. Please try again.");
      } else if (context === 'product') {
        toastService.error("Unable to load product. Please try again.");
      } else {
        toastService.error(fallbackMessage);
      }
    }
  },

  /**
   * Specific error handlers for common operations
   */
  cartError: (error) => toastService.handleApiError(error, "Unable to update cart.", 'cart'),
  paymentError: (error) => toastService.handleApiError(error, "Payment could not be completed.", 'payment'),
  orderError: (error) => toastService.handleApiError(error, "Unable to place order.", 'order'),
  wishlistError: (error) => toastService.handleApiError(error, "Unable to update wishlist.", 'wishlist'),
  productError: (error) => toastService.handleApiError(error, "Unable to load product.", 'product'),
  authError: (error) => toastService.handleApiError(error, "Authentication failed. Please log in again.", 'auth'),
};
