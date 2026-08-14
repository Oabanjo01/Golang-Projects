import { useCallback, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
const KEY = 'pulse-theme'

/**
 * Dark is the default rather than following the OS: this is an ops tool that
 * lives on a second monitor at night. The choice persists per browser.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(KEY) as Theme | null) ?? 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(KEY, theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle }
}
