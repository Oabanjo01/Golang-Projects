import { mockApi } from '../mocks/api'

/**
 * Set VITE_API_MOCK=true in .env.local to run against the in-memory mock
 * instead of the Go API. Delete src/mocks/ once the backend is up.
 */
const USE_MOCK = import.meta.env.VITE_API_MOCK === 'true'

export class ApiError extends Error {
  // Declared explicitly rather than as a constructor parameter property —
  // the template enables `erasableSyntaxOnly`, which bans TS-only syntax that
  // emits runtime code.
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ErrorBody {
  error?: string
  message?: string
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (USE_MOCK) return mockApi<T>(path, init)

  let res: Response
  try {
    res = await fetch(path, {
      ...init,
      // Required for the auth cookie to be sent at all. In dev the Vite proxy
      // keeps us same-origin; in production see DESIGN.md §3.4.
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
  } catch {
    // fetch only rejects on network-level failure, never on a 4xx/5xx.
    throw new ApiError(0, 'Network error — could not reach the API.')
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  const body: unknown = text ? JSON.parse(text) : null

  if (!res.ok) {
    const msg = (body as ErrorBody | null)?.error ?? (body as ErrorBody | null)?.message
    throw new ApiError(res.status, msg ?? `Request failed (${res.status})`)
  }

  return body as T
}

export const get = <T>(path: string) => api<T>(path)

export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

export const patch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) })

export const del = <T>(path: string) => api<T>(path, { method: 'DELETE' })
