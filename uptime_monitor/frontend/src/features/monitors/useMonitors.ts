import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { monitorsApi } from '../../api/monitors'
import { monitorKeys } from '../../lib/queryKeys'
import type { CreateMonitorInput, Monitor, UpdateMonitorInput } from '../../types/api'

/**
 * How often the dashboard re-asks the server for status. The footer renders
 * this same constant, so the UI can never claim a refresh rate it isn't using.
 */
export const POLL_MS = 10_000

export function useMonitors() {
  return useQuery({
    queryKey: monitorKeys.lists(),
    queryFn: monitorsApi.list,
    refetchInterval: POLL_MS,
    // Keep polling when the tab is hidden — a monitoring dashboard left open on
    // a second screen should be current the moment you look back at it.
    refetchIntervalInBackground: true,
  })
}

export function useMonitor(id: string) {
  return useQuery({
    queryKey: monitorKeys.detail(id),
    queryFn: () => monitorsApi.detail(id),
    refetchInterval: POLL_MS,
  })
}

export function useChecks(id: string) {
  return useQuery({
    queryKey: monitorKeys.checks(id),
    queryFn: () => monitorsApi.checks(id),
    refetchInterval: POLL_MS,
    retry: false,
  })
}

export function useIncidents(id: string) {
  return useQuery({
    queryKey: monitorKeys.incidents(id),
    queryFn: () => monitorsApi.incidents(id),
    retry: false,
  })
}

export function useCreateMonitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMonitorInput) => monitorsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: monitorKeys.all }),
  })
}

export function useUpdateMonitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMonitorInput }) =>
      monitorsApi.update(id, input),
    onSuccess: (updated: Monitor) => {
      qc.setQueryData(monitorKeys.detail(updated.id), updated)
      qc.invalidateQueries({ queryKey: monitorKeys.lists() })
    },
  })
}

export function useDeleteMonitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => monitorsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: monitorKeys.all }),
  })
}
