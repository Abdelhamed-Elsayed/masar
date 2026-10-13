import { Input, Select } from '@/components/ui'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'

export interface RequestFiltersProps {
  query: string
  requestTypeId: string
  onQueryChange: (value: string) => void
  onRequestTypeChange: (value: string) => void
}

export function RequestFilters({
  query,
  requestTypeId,
  onQueryChange,
  onRequestTypeChange,
}: RequestFiltersProps) {
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const { t, content } = useTranslation()

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)]">
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-slate-700">{t('requests.search')}</span>
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={t('requests.searchPlaceholder')}
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-slate-700">{t('requests.type')}</span>
        <Select
          value={requestTypeId}
          onChange={(event) => onRequestTypeChange(event.currentTarget.value)}
        >
          <option value="">{t('requests.allTypes')}</option>
          {requestTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {content(type.name)}
            </option>
          ))}
        </Select>
      </label>
    </div>
  )
}
