import { toast } from 'sonner';

export const toastService = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  warning: (message) => toast.warning(message),
  info: (message) => toast.info(message),

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

    // 2. Extract error response message safely
    const errorMessage = String(error?.message || error?.error || "");
    const isNetworkError = !error?.status && (
      errorMessage.toLowerCase().includes("fetch") || 
      errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("failed to connect")
    );

    // 3. Map to specific user-friendly toast messages
    if (isNetworkError) {
      toast.error("Unable to connect to server. Please try again.");
      return;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          if (errorMessage.toLowerCase().includes("validation") || errorMessage.toLowerCase().includes("invalid")) {
            toast.error("Please check the highlighted fields.");
          } else {
            toast.error(errorMessage || fallbackMessage);
          }
          break;
        case 401:
          // Check if this is a login credential error vs session expiration
          if (errorMessage.toLowerCase().includes("invalid credentials") || errorMessage.toLowerCase().includes("incorrect")) {
            toast.error("Incorrect email or password.");
          } else {
            toast.error("Your session has expired. Please log in again.");
          }
          break;
        case 403:
          toast.error("You do not have permission to perform this action.");
          break;
        case 404:
          toast.error(errorMessage || "Requested resource not found.");
          break;
        case 409:
          toast.error(errorMessage || "Conflict occurred. Please try again.");
          break;
        case 422:
          toast.error("Please check the highlighted fields.");
          break;
        case 429:
          toast.error("Too many requests. Please try again later.");
          break;
        case 500:
          // Check for specific configuration errors
          if (errorMessage.toLowerCase().includes("razorpay") && errorMessage.toLowerCase().includes("not configured")) {
            toast.error("Payment service is not configured. Please contact support.");
          } else {
            toast.error("Something went wrong. Please try again.");
          }
          break;
        default:
          toast.error(errorMessage || fallbackMessage);
      }
    } else {
      // Context-specific fallback messages
      if (context === 'cart') {
        toast.error("Unable to update cart. Please try again.");
      } else if (context === 'payment') {
        toast.error("Payment could not be completed. Please try again.");
      } else if (context === 'order') {
        toast.error("Unable to place order. Please try again.");
      } else if (context === 'wishlist') {
        toast.error("Unable to update wishlist. Please try again.");
      } else if (context === 'product') {
        toast.error("Unable to load product. Please try again.");
      } else {
        toast.error(fallbackMessage);
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
