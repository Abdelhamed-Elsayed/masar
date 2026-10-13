import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'
import { Input } from '@/components/ui'
import { cn } from '@/components/ui/styles'
import { useTranslation } from '@/localization/useTranslation'

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function FormField({ className, children, ...props }: FormFieldProps) {
  return <div {...props} className={cn('space-y-1.5', className)}>{children}</div>
}

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function FormLabel({ required = false, className, children, ...props }: FormLabelProps) {
  const { t } = useTranslation()
  return (
    <label {...props} className={cn('block text-sm font-medium text-slate-700', className)}>
      {children}
      {required ? <span aria-hidden="true" className="ms-1 text-red-600">*</span> : null}
      {required ? <span className="sr-only"> ({t('forms.required')})</span> : null}
    </label>
  )
}

export interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

export function FormError({ className, children, ...props }: FormErrorProps) {
  return <p {...props} role="alert" className={cn('text-sm text-red-600', className)}>{children}</p>
}

export interface FormSectionProps extends HTMLAttributes<HTMLFieldSetElement> {
  legend: string
  description?: string
  children: ReactNode
}

export function FormSection({ legend, description, className, children, ...props }: FormSectionProps) {
  return (
    <fieldset {...props} className={cn('space-y-4 border-0 p-0', className)}>
      <legend className="text-base font-semibold text-slate-900">{legend}</legend>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      {children}
    </fieldset>
  )
}

export interface FileUploadProps {
  id: string
  label: string
  accept?: string
  multiple?: boolean
  required?: boolean
  disabled?: boolean
  onFilesChange?: (files: FileList | null) => void
  describedBy?: string
}

export function FileUpload({
  id,
  label,
  accept,
  multiple = false,
  required,
  disabled,
  onFilesChange,
  describedBy,
}: FileUploadProps) {
  return (
    <div className="space-y-1.5">
      <FormLabel htmlFor={id} required={required}>{label}</FormLabel>
      <Input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={disabled}
        aria-describedby={describedBy}
        className="file:me-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
        onChange={(event) => onFilesChange?.(event.currentTarget.files)}
      />
    </div>
  )
}

export interface DateRangeInputProps {
  startId: string
  endId: string
  startLabel?: string
  endLabel?: string
  startValue?: string
  endValue?: string
  onStartChange?: (value: string) => void
  onEndChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
}

export function DateRangeInput({
  startId,
  endId,
  startLabel = 'Start date',
  endLabel = 'End date',
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  required,
  disabled,
}: DateRangeInputProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField>
        <FormLabel htmlFor={startId} required={required}>{startLabel}</FormLabel>
        <Input
          id={startId}
          type="date"
          value={startValue}
          max={endValue || undefined}
          required={required}
          disabled={disabled}
          onChange={(event) => onStartChange?.(event.currentTarget.value)}
        />
      </FormField>
      <FormField>
        <FormLabel htmlFor={endId} required={required}>{endLabel}</FormLabel>
        <Input
          id={endId}
          type="date"
          value={endValue}
          min={startValue || undefined}
          required={required}
          disabled={disabled}
          onChange={(event) => onEndChange?.(event.currentTarget.value)}
        />
      </FormField>
    </div>
  )
}
