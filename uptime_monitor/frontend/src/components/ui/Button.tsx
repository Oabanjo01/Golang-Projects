import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-bg border border-[var(--accent)] hover:bg-[var(--text)] hover:border-[var(--text)]',
  outline:
    'bg-transparent text-text border border-divider hover:border-[var(--text)]',
  ghost: 'bg-transparent border-0 text-muted hover:text-text',
  danger:
    'bg-transparent border border-[var(--down)] text-[var(--down)] hover:bg-[var(--down-tint)]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-none',
        'font-cond font-semibold tracking-[.04em] cursor-pointer',
        'min-h-[40px] px-4 text-[15px]',
        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        className,
      ].join(' ')}
    />
  )
}
