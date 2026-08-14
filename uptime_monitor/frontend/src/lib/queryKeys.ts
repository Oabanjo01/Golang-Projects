/**
 * Key factory. Every cache key is built here, so invalidation is never a
 * guessing game — `monitorKeys.all` invalidates every monitor query at once
 * because each specific key is a prefix-extension of it.
 */
export const monitorKeys = {
  all: ['monitors'] as const,
  lists: () => [...monitorKeys.all, 'list'] as const,
  detail: (id: string) => [...monitorKeys.all, 'detail', id] as const,
  checks: (id: string) => [...monitorKeys.all, 'checks', id] as const,
  incidents: (id: string) => [...monitorKeys.all, 'incidents', id] as const,
}

export const authKeys = {
  session: ['auth', 'session'] as const,
}
