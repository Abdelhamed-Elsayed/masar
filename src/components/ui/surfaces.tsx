import { useEffect, useId, useRef, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn, focusRing } from './styles'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div' | 'section'
  children: ReactNode
}

export function Card({ as: Component = 'div', className, children, ...props }: CardProps) {
  return (
    <Component
      {...props}
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
    >
      {children}
    </Component>
  )
}

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', badgeVariants[variant], className)}
    />
  )
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  alt?: string
}

const avatarSizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-12 text-base' }

export function Avatar({ name, src, size = 'md', alt, className, ...props }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <span
      {...props}
      aria-label={alt ?? name}
      role="img"
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-medium text-slate-700', avatarSizes[size], className)}
    >
      {showImage ? <img src={src} alt="" className="size-full object-cover" onError={() => setFailedSrc(src ?? null)} /> : initials || '?'}
    </span>
  )
}

export interface TooltipProps {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full start-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  )
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const dialogId = useId()
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement
    dialogRef.current?.focus()

    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={description ? `${dialogId}-description` : undefined}
        className={cn('max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl', focusRing, className)}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose()
            return
          }
          if (event.key !== 'Tab' || !dialogRef.current) return

          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          )
          if (focusable.length === 0) {
            event.preventDefault()
            dialogRef.current.focus()
            return
          }
          const first = focusable.item(0)
          const last = focusable.item(focusable.length - 1)

          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
            event.preventDefault()
            last?.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }}
      >
        <h2 id={`${dialogId}-title`} className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p id={`${dialogId}-description`} className="mt-2 text-sm text-slate-600">{description}</p> : null}
        <div className="mt-5">{children}</div>
      </section>
    </div>
  )
}

export interface DropdownProps {
  label: string
  children: ReactNode
  className?: string
}

export function Dropdown({ label, children, className }: DropdownProps) {
  return (
    <details className={cn('group relative inline-block', className)}>
      <summary className={cn('flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 [&::-webkit-details-marker]:hidden', focusRing)}>
        {label}
      </summary>
      <div className="absolute end-0 z-30 mt-2 min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
        {children}
      </div>
    </details>
  )
}

export interface TabsItem {
  id: string
  label: string
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabsItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  ariaLabel: string
  className?: string
}

export function Tabs({ items, value, defaultValue, onValueChange, ariaLabel, className }: TabsProps) {
  const [activeTab, setActiveTab] = useControllableTab(value, defaultValue, items, onValueChange)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const selected = items.find((item) => item.id === activeTab && !item.disabled)
  if (!selected) return null

  function selectAndFocus(id: string) {
    setActiveTab(id)
    tabRefs.current.get(id)?.focus()
  }

  function moveFocus(currentIndex: number, direction: 1 | -1) {
    const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled)
    const position = enabled.findIndex(({ index }) => index === currentIndex)
    const next = enabled[(position + direction + enabled.length) % enabled.length]
    if (next) selectAndFocus(next.item.id)
  }

  const activeIndex = items.findIndex((item) => item.id === selected.id)

  return (
    <div className={className}>
      <div role="tablist" aria-label={ariaLabel} className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(element) => {
              if (element) tabRefs.current.set(item.id, element)
              else tabRefs.current.delete(item.id)
            }}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={item.id === selected.id}
            aria-controls={`tabpanel-${item.id}`}
            tabIndex={item.id === selected.id ? 0 : -1}
            disabled={item.disabled}
            onClick={() => setActiveTab(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault()
                moveFocus(index, 1)
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault()
                moveFocus(index, -1)
              } else if (event.key === 'Home') {
                event.preventDefault()
                const first = items.find((candidate) => !candidate.disabled)
                if (first) selectAndFocus(first.id)
              } else if (event.key === 'End') {
                event.preventDefault()
                const last = [...items].reverse().find((candidate) => !candidate.disabled)
                if (last) selectAndFocus(last.id)
              }
            }}
            className={cn('shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600', item.id === selected.id ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900', item.disabled && 'cursor-not-allowed opacity-50')}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id={`tabpanel-${selected.id}`} role="tabpanel" aria-labelledby={`tab-${selected.id}`} tabIndex={0} className="pt-4">
        {items[activeIndex]?.content}
      </div>
    </div>
  )
}

function useControllableTab(
  value: string | undefined,
  defaultValue: string | undefined,
  items: TabsItem[],
  onValueChange: ((value: string) => void) | undefined,
): [string, (nextValue: string) => void] {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items.find((item) => !item.disabled)?.id ?? '',
  )
  const activeValue = value ?? internalValue

  function setValue(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  return [activeValue, setValue]
}
