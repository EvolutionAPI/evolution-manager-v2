import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

let displayedNetworkFailureError = false;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry(failureCount, error) {
        // Don't retry permanent client errors (4xx) — retrying them just spams the console
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) return false;
        }

        if (failureCount >= 3) {
          if (displayedNetworkFailureError === false) {
            displayedNetworkFailureError = true;

            toast.error("The application is taking longer than expected to load, please try again in a few minutes.", {
              onClose: () => {
                displayedNetworkFailureError = false;
              },
            });
          }

          return false;
        }

        return true;
      },
    },
  },
});
