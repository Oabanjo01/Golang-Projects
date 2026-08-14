import type { ReactNode } from 'react'

/**
 * Bordered surface with the design's four corner crosshairs. The marks sit
 * outside the border box, so the parent must not clip overflow.
 */
export function Panel({
  children,
  className = '',
  marks = true,
}: {
  children: ReactNode
  className?: string
  marks?: boolean
}) {
  return (
    <div className={`panel ${className}`}>
      {marks && (
        <>
          <i className="corner-mark -top-[6px] -left-[6px]" />
          <i className="corner-mark -top-[6px] -right-[6px]" />
          <i className="corner-mark -bottom-[6px] -left-[6px]" />
          <i className="corner-mark -bottom-[6px] -right-[6px]" />
        </>
      )}
      {children}
    </div>
  )
}
