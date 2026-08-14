import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  mono?: boolean
  error?: string
}

/**
 * Label and input are bound with a generated id rather than nesting, so screen
 * readers announce the label and clicking it focuses the field.
 */
export function Field({ label, hint, mono, error, className = '', ...rest }: Props) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'field-input',
          mono ? 'font-mono text-[13.5px] tabular-nums' : '',
          error ? 'border-[var(--down)]' : '',
          className,
        ].join(' ')}
      />
      {error && (
        <div id={errorId} className="mt-1 text-[12.5px] text-[var(--down)]">
          {error}
        </div>
      )}
      {hint && !error && <div className="mt-1 text-[12.5px] text-muted">{hint}</div>}
    </div>
  )
}
