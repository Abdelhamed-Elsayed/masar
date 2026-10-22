import { Input, Select } from '@/components/ui'
import { useTranslation } from '@/localization/useTranslation'

interface UserFiltersProps {
  query: string
  activeFilter: 'all' | 'active' | 'inactive'
  onQueryChange: (query: string) => void
  onActiveFilterChange: (filter: 'all' | 'active' | 'inactive') => void
}

export function UserFilters({
  query,
  activeFilter,
  onQueryChange,
  onActiveFilterChange,
}: UserFiltersProps) {
  const { t } = useTranslation()
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <Input
        aria-label={t('admin.searchUsers')}
        placeholder={t('admin.searchUserPlaceholder')}
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        className="min-w-0"
      />
      <Select
        aria-label={t('admin.filterUserStatus')}
        value={activeFilter}
        onChange={(event) => {
          const filter = event.currentTarget.value
          if (filter === 'all' || filter === 'active' || filter === 'inactive') {
            onActiveFilterChange(filter)
          }
        }}
        className="min-w-0"
      >
        <option value="all">{t('admin.allStatuses')}</option>
        <option value="active">{t('admin.active')}</option>
        <option value="inactive">{t('admin.inactive')}</option>
      </Select>
    </div>
  )
}
