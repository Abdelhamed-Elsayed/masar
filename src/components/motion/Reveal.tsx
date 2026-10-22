import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Delay in ms, used to stagger siblings. */
  delay?: number
  as?: ElementType
  className?: string
  /** Animation flavour. */
  variant?: 'up' | 'left' | 'right' | 'zoom'
}

/** Reveals content with a CSS transition when it scrolls into view. Falls back to visible when motion is unavailable or reduced. */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', variant = 'up' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return true
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  })

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Tag
      ref={ref}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={`reveal reveal-${variant} ${visible ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}
