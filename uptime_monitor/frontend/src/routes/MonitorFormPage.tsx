import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Panel } from '../components/ui/Panel'
import { fmtInterval } from '../lib/format'
import { useCreateMonitor, useMonitor, useUpdateMonitor } from '../features/monitors/useMonitors'
import type { CreateMonitorInput } from '../types/api'

const INTERVALS = [30, 60, 120, 300]

const BLANK: CreateMonitorInput = {
  name: '',
  url: '',
  interval_seconds: 60,
  timeout_seconds: 10,
  expected_status_code: 200,
  failure_threshold: 3,
}

export function MonitorFormPage() {
  const { id } = useParams<{ id: string }>()
  const editing = !!id
  const navigate = useNavigate()

  const existing = useMonitor(id ?? '')
  const create = useCreateMonitor()
  const update = useUpdateMonitor()
  const mutation = editing ? update : create

  const [form, setForm] = useState<CreateMonitorInput>(BLANK)
  const [hydrated, setHydrated] = useState(false)

  // Populate once when editing. Guarded so the 10s poll can't overwrite fields
  // the user is part-way through typing.
  if (editing && existing.data && !hydrated) {
    const m = existing.data
    setForm({
      name: m.name,
      url: m.url,
      interval_seconds: m.interval_seconds,
      timeout_seconds: m.timeout_seconds,
      expected_status_code: m.expected_status_code,
      failure_threshold: m.failure_threshold,
    })
    setHydrated(true)
  }

  const set = <K extends keyof CreateMonitorInput>(key: K, value: CreateMonitorInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  // Mirrors the CHECK constraint in the migration. Validating here too means
  // the user gets the message before the round trip, not a 400 afterwards.
  const timeoutTooLong = form.timeout_seconds >= form.interval_seconds

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (timeoutTooLong) return

    if (editing && id) {
      update.mutate({ id, input: form }, { onSuccess: () => navigate(`/monitors/${id}`) })
    } else {
      create.mutate(form, { onSuccess: (m) => navigate(`/monitors/${m.id}`) })
    }
  }

  return (
    <main className="mx-auto max-w-[640px] px-5 pt-[26px] pb-16">
      <Link
        to="/"
        className="mb-3.5 inline-block font-mono text-[11px] tracking-[.1em] text-muted no-underline hover:text-text"
      >
        ← ALL MONITORS
      </Link>

      <h1 className="m-0 mb-1 font-cond text-[32px] font-semibold">
        {editing ? 'Edit monitor' : 'New monitor'}
      </h1>
      <p className="m-0 mb-[22px] text-[13.5px] text-muted">
        Checks start the moment you save. A new monitor stays{' '}
        <span style={{ color: 'var(--idle)' }}>PENDING</span> until its first check returns.
      </p>

      {mutation.error && (
        <div
          role="alert"
          className="mb-[18px] flex items-start gap-3 border border-[var(--down)] bg-[var(--down-tint)] px-3.5 py-3"
        >
          <div className="flex-1">
            <div className="font-cond text-[16px] font-semibold tracking-[.03em] text-[var(--down)]">
              COULDN’T SAVE
            </div>
            <div className="mt-0.5 text-[13px] text-muted">
              {mutation.error.message} Your changes are still here — try again.
            </div>
            <div className="mt-2.5 flex gap-2.5">
              <button
                type="button"
                onClick={() => mutation.reset()}
                className="h-[30px] cursor-pointer border-0 bg-transparent px-3 text-[13px] text-muted hover:text-text"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <Panel className="flex flex-col gap-4 p-5">
          <Field
            label="Name"
            placeholder="Checkout API"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
          <Field
            label="URL"
            type="url"
            placeholder="https://"
            required
            mono
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
          />

          <div>
            <label className="field-label">Check interval</label>
            <div className="flex w-fit max-w-full flex-wrap border border-divider">
              {INTERVALS.map((v) => {
                const active = form.interval_seconds === v
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set('interval_seconds', v)}
                    className="num cursor-pointer border-0 border-r border-divider px-3.5 py-[7px] text-[12.5px] last:border-r-0"
                    style={{
                      background: active ? 'var(--accent)' : 'transparent',
                      color: active ? 'var(--bg)' : 'var(--muted)',
                    }}
                  >
                    {fmtInterval(v)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            <Field
              label="Request timeout"
              type="number"
              min={1}
              max={30}
              required
              mono
              value={form.timeout_seconds}
              onChange={(e) => set('timeout_seconds', Number(e.target.value))}
              error={
                timeoutTooLong
                  ? `Must be under the ${fmtInterval(form.interval_seconds)} interval.`
                  : undefined
              }
            />
            <Field
              label="Expected status"
              type="number"
              min={100}
              max={599}
              required
              mono
              value={form.expected_status_code}
              onChange={(e) => set('expected_status_code', Number(e.target.value))}
            />
          </div>

          <div>
            <label className="field-label">Failure threshold</label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex border border-divider">
                <button
                  type="button"
                  aria-label="Decrease failure threshold"
                  onClick={() =>
                    set('failure_threshold', Math.max(1, form.failure_threshold - 1))
                  }
                  className="min-h-[38px] w-[34px] cursor-pointer border-0 border-r border-divider bg-transparent text-[16px] text-muted hover:text-text"
                >
                  −
                </button>
                <span className="num inline-flex min-w-[44px] items-center justify-center text-[14px]">
                  {form.failure_threshold}
                </span>
                <button
                  type="button"
                  aria-label="Increase failure threshold"
                  onClick={() =>
                    set('failure_threshold', Math.min(10, form.failure_threshold + 1))
                  }
                  className="min-h-[38px] w-[34px] cursor-pointer border-0 border-l border-divider bg-transparent text-[16px] text-muted hover:text-text"
                >
                  +
                </button>
              </div>
              <span className="flex-[1_1_220px] text-[12.5px] text-muted">
                Consecutive failures before an incident opens. Below it the monitor reads{' '}
                <span style={{ color: 'var(--warn)' }}>FAILING</span>, not down.
              </span>
            </div>
          </div>
        </Panel>

        <div className="mt-[18px] flex flex-wrap gap-2.5">
          <Button type="submit" disabled={mutation.isPending || timeoutTooLong}>
            {mutation.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create monitor'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  )
}
