import { RequestStatus } from '@/types/request'
import type { Request } from '@/types/request'
import type { RequestTab } from './requestTabFilters'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

interface RequestTabItem {
  id: RequestTab
  label: TranslationKey
  matches: (request: Request) => boolean
}

const requestTabItems: RequestTabItem[] = [
  { id: 'all', label: 'requests.all', matches: () => true },
  {
    id: 'pending',
    label: 'dashboard.pending',
    matches: (request) =>
      request.status === RequestStatus.SUBMITTED ||
      request.status === RequestStatus.IN_PROGRESS,
  },
  { id: 'approved', label: 'status.approved', matches: (request) => request.status === RequestStatus.APPROVED },
  { id: 'rejected', label: 'status.rejected', matches: (request) => request.status === RequestStatus.REJECTED },
  { id: 'drafts', label: 'requests.drafts', matches: (request) => request.status === RequestStatus.DRAFT },
]

interface RequestTabsProps {
  value: RequestTab
  onChange: (tab: RequestTab) => void
}

export function RequestTabs({ value, onChange }: RequestTabsProps) {
  const { t } = useTranslation()
  return (
    <div role="tablist" aria-label={t('requests.filterStatus')} className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {requestTabItems.map((item) => (
        <button
          key={item.id}
          id={`requests-tab-${item.id}`}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          aria-controls="requests-panel"
          tabIndex={item.id === value ? 0 : -1}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => {
            const isRtl = document.documentElement.dir === 'rtl'
            const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight'
            const previousKey = isRtl ? 'ArrowRight' : 'ArrowLeft'
            if (event.key === 'Home' || event.key === 'End') {
              event.preventDefault()
              const target = event.key === 'Home'
                ? requestTabItems[0]
                : requestTabItems[requestTabItems.length - 1]
              if (target) {
                onChange(target.id)
                document.getElementById(`requests-tab-${target.id}`)?.focus()
              }
              return
            }
            if (event.key !== nextKey && event.key !== previousKey) return
            event.preventDefault()
            const currentIndex = requestTabItems.findIndex((tab) => tab.id === value)
            const shift = event.key === nextKey ? 1 : -1
            const next = requestTabItems[(currentIndex + shift + requestTabItems.length) % requestTabItems.length]
            if (next) {
              onChange(next.id)
              document.getElementById(`requests-tab-${next.id}`)?.focus()
            }
          }}
          className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            item.id === value
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {t(item.label)}
        </button>
      ))}
    </div>
  )
}
