import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, status } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (response.status === 401) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const isAuthenticated = !!user && !error;
  const isUnauthenticated = user === null && !error;
  const isError = !!error;

  return {
    user: user ?? undefined,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    isError,
    error,
    status,
  };
}
