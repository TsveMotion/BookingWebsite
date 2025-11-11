import { showToast } from "./toast";

/**
 * Centralized API client with consistent error handling
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export const apiClient = {
  async fetch<T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || response.statusText;

        if (showErrorToast) {
          showToast.error(errorMessage);
        }

        throw new ApiError(response.status, response.statusText, errorData);
      }

      const data = await response.json();

      if (showSuccessToast && successMessage) {
        showToast.success(successMessage);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or parsing error
      if (showErrorToast) {
        showToast.error("Network error. Please check your connection.");
      }

      throw error;
    }
  },

  async get<T = any>(url: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: "GET" });
  },

  async post<T = any>(
    url: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T = any>(
    url: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T = any>(
    url: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T = any>(url: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: "DELETE" });
  },
};
