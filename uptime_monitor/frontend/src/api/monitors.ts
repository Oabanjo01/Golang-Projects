import { del, get, patch, post } from './client'
import type {
  CheckLog,
  CreateMonitorInput,
  Incident,
  Monitor,
  UpdateMonitorInput,
} from '../types/api'

export const monitorsApi = {
  list: () => get<Monitor[]>('/api/monitors'),
  detail: (id: string) => get<Monitor>(`/api/monitors/${id}`),
  create: (body: CreateMonitorInput) => post<Monitor>('/api/monitors', body),
  update: (id: string, body: UpdateMonitorInput) => patch<Monitor>(`/api/monitors/${id}`, body),
  remove: (id: string) => del<void>(`/api/monitors/${id}`),

  // Phase 2 endpoints — not implemented by the Phase 1 API yet.
  checks: (id: string) => get<CheckLog[]>(`/api/monitors/${id}/checks`),
  incidents: (id: string) => get<Incident[]>(`/api/monitors/${id}/incidents`),
}
