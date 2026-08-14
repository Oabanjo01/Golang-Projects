import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/client'
import { authKeys } from '../../lib/queryKeys'
import type { Credentials, User } from '../../types/api'

/**
 * The session is a server query, not client state. The JWT lives in an
 * HttpOnly cookie that JS cannot read, so the only way to know who you are is
 * to ask the server — which means a 401 here is a normal answer ("nobody"),
 * not an error to surface.
 */
export function useSession() {
  const q = useQuery<User | null>({
    queryKey: authKeys.session,
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null
        throw err
      }
    },
    staleTime: 5 * 60_000,
  })

  return {
    user: q.data ?? null,
    isLoading: q.isLoading,
    isAuthenticated: !!q.data,
  }
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (creds: Credentials) => authApi.login(creds),
    onSuccess: (user) => qc.setQueryData(authKeys.session, user),
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (creds: Credentials) => authApi.register(creds),
    onSuccess: (user) => qc.setQueryData(authKeys.session, user),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    // Drop every cached query, not just the session — the cache holds the
    // previous user's monitors, and the next person to log in must not see them.
    onSuccess: () => qc.clear(),
  })
}
