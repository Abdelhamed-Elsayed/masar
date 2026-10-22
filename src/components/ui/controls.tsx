import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Spinner } from './feedback'
import { cn, controlBase, focusRing } from './styles'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'border border-transparent bg-blue-800 text-white hover:bg-blue-900 disabled:bg-blue-400 dark:bg-[#d4af37] dark:text-[#1a1405] dark:hover:bg-[#e2c15a] dark:disabled:bg-[#d4af37]/45',
  secondary: 'border border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'border border-transparent bg-red-600 text-white hover:bg-red-700',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-xs',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-11 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        buttonVariants[variant],
        buttonSizes[size],
        focusRing,
        className,
      )}
    >
      {loading ? <Spinner size="sm" label="Loading" /> : null}
      {children}
    </button>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ className, invalid = false, ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={cn(controlBase, invalid && 'border-red-500 focus:border-red-600 focus:ring-red-100', className)}
    />
  )
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ className, invalid = false, ...props }: SelectProps) {
  return (
    <select
      {...props}
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={cn(controlBase, 'appearance-auto', invalid && 'border-red-500 focus:border-red-600 focus:ring-red-100', className)}
    />
  )
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export function Textarea({ className, invalid = false, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={cn(controlBase, 'min-h-24 resize-y', invalid && 'border-red-500 focus:border-red-600 focus:ring-red-100', className)}
    />
  )
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      {...props}
      type="checkbox"
      className={cn('size-4 rounded border-slate-300 accent-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2', className)}
    />
  )
}

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Radio({ className, ...props }: RadioProps) {
  return (
    <input
      {...props}
      type="radio"
      className={cn('size-4 border-slate-300 accent-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2', className)}
    />
  )
}

export type DateInputProps = Omit<InputProps, 'type'>

export function DateInput(props: DateInputProps) {
  return <Input {...props} type="date" />
}
