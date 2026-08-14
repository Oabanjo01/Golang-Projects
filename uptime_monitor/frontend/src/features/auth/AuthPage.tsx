import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Panel } from '../../components/ui/Panel'
import { useLogin, useRegister, useSession } from './useSession'

type Mode = 'login' | 'register'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { isAuthenticated, isLoading } = useSession()
  const login = useLogin()
  const register = useRegister()
  const active = mode === 'login' ? login : register

  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    active.mutate({ email, password })
  }

  const copy =
    mode === 'login'
      ? { title: 'Sign in', sub: 'Watching your endpoints, so you don’t have to.', cta: 'Sign in', swap: 'No account?', swapCta: 'Register' }
      : { title: 'Create account', sub: 'Two fields, then add your first monitor.', cta: 'Create account', swap: 'Already have one?', swapCta: 'Sign in' }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-[340px]">
        <div className="mb-7 flex items-baseline gap-2.5">
          <div className="font-cond text-[28px] font-semibold tracking-[.06em]">PULSE</div>
          <div className="font-mono text-[11px] tracking-[.08em] text-faint">UPTIME MONITORING</div>
        </div>

        <Panel className="p-[22px]">
          <div className="font-cond text-[22px] font-semibold">{copy.title}</div>
          <div className="mb-[18px] text-[13px] text-muted">{copy.sub}</div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={mode === 'register' ? 'At least 8 characters.' : undefined}
            />

            {active.error && (
              <div
                role="alert"
                className="border border-[var(--down)] bg-[var(--down-tint)] px-3 py-2 text-[13px] text-[var(--down)]"
              >
                {active.error.message}
              </div>
            )}

            <Button type="submit" className="mt-1 w-full" disabled={active.isPending}>
              {active.isPending ? 'Working…' : copy.cta}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between border-t border-hair pt-3.5 text-[13px]">
            <span className="text-muted">{copy.swap}</span>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-accent underline underline-offset-[3px]"
            >
              {copy.swapCta}
            </button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
