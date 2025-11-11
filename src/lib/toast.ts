import toast from "react-hot-toast";

/**
 * Centralized toast notification utilities for consistent UX
 */

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "rgba(34, 197, 94, 0.1)",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        color: "#fff",
        backdropFilter: "blur(12px)",
      },
      iconTheme: {
        primary: "#22c55e",
        secondary: "#fff",
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      style: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "#fff",
        backdropFilter: "blur(12px)",
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#fff",
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: "top-right",
      style: {
        background: "rgba(59, 130, 246, 0.1)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        color: "#fff",
        backdropFilter: "blur(12px)",
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: "top-right",
        style: {
          background: "rgba(0, 0, 0, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
          backdropFilter: "blur(12px)",
        },
      }
    );
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};
