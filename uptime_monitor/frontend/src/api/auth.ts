import { get, post } from './client'
import type { Credentials, User } from '../types/api'

export const authApi = {
  register: (body: Credentials) => post<User>('/api/auth/register', body),
  login: (body: Credentials) => post<User>('/api/auth/login', body),
  logout: () => post<void>('/api/auth/logout'),
  /** Source of truth for "am I logged in" — the cookie is HttpOnly, so JS can't read it. */
  me: () => get<User>('/api/auth/me'),
}
