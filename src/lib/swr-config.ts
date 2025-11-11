import { SWRConfiguration } from 'swr';

/**
 * Global SWR configuration for consistent data fetching
 */

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  onError: (error, key) => {
    console.error(`SWR Error for ${key}:`, error);
  },
};

export const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
});
