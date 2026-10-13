import type { ReactNode } from 'react'
import { Card } from '@/components/ui'

export interface StatCardProps {
  label: string
  value: number
  description: string
  icon: ReactNode
  tone: 'blue' | 'amber' | 'green' | 'red'
}

const toneClasses: Record<StatCardProps['tone'], string> = {
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
}

export function StatCard({
  label,
  value,
  description,
  icon,
  tone,
}: StatCardProps) {
  return (
    <Card as="article" className="flex items-start gap-4 p-5">
      <span
        aria-hidden="true"
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </Card>
  )
}
