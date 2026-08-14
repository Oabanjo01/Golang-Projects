import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/useTheme'
import { useLogout, useSession } from '../features/auth/useSession'

export function AppHeader() {
  const { theme, toggle } = useTheme()
  const { user } = useSession()
  const logout = useLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const onDash = pathname === '/'

  return (
    <header className="sticky top-0 z-20 border-b border-divider bg-bg">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
        <Link to="/" className="mr-auto flex items-center gap-2.5 no-underline">
          <span className="inline-block h-[9px] w-[9px] bg-accent" />
          <span className="font-cond text-[19px] font-semibold tracking-[.06em] text-text">
            PULSE
          </span>
        </Link>

        <nav className="flex items-center gap-3.5 text-[13px]">
          <Link
            to="/"
            className="no-underline"
            style={{ color: onDash ? 'var(--accent)' : 'var(--muted)' }}
          >
            Monitors
          </Link>
        </nav>

        <button
          type="button"
          onClick={toggle}
          title="Toggle theme"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 border border-divider bg-transparent px-2.5 font-mono text-[11px] tracking-[.06em] text-muted hover:border-[var(--text)] hover:text-text"
        >
          {theme === 'dark' ? 'DARK' : 'LIGHT'}
        </button>

        <button
          type="button"
          onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login') })}
          title={user?.email}
          className="inline-flex h-8 cursor-pointer items-center border-0 bg-transparent px-1 text-[13px] text-muted hover:text-text"
        >
          Sign out
        </button>

        <Link
          to="/monitors/new"
          className="inline-flex h-8 items-center gap-2 border border-[var(--accent)] bg-accent px-3.5 font-cond text-[14px] font-semibold tracking-[.04em] text-bg no-underline hover:border-[var(--text)] hover:bg-[var(--text)]"
        >
          + Add monitor
        </Link>
      </div>
    </header>
  )
}
