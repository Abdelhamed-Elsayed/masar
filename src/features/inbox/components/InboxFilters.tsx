import { Input } from '@/components/ui'
import { useTranslation } from '@/localization/useTranslation'

interface InboxFiltersProps {
  query: string
  onQueryChange: (query: string) => void
}

export function InboxFilters({ query, onQueryChange }: InboxFiltersProps) {
  const { t } = useTranslation()
  return (
    <label className="block max-w-md space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{t('inbox.search')}</span>
      <Input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        placeholder={t('requests.searchPlaceholder')}
      />
    </label>
  )
}
