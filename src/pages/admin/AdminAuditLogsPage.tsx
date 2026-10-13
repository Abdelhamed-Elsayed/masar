import { useMemo, useState } from 'react'
import { Card, Input, Select } from '@/components/ui'
import { DataTable, TableCell, TableEmptyState, TableHeadCell, TableHeader, TableRow } from '@/components/tables'
import { PageContainer, PageHeader } from '@/components/layout'
import { useDirectoryStore } from '@/store/directoryStore'
import { useAuditStore } from '@/store/auditStore'
import { useTranslation } from '@/localization/useTranslation'

function formatDate(value: string, locale: 'en' | 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AdminAuditLogsPage() {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const entries = useAuditStore((state) => state.entries)
  const [query, setQuery] = useState('')
  const [action, setAction] = useState('')
  const actions = useMemo(() => [...new Set(entries.map((entry) => entry.action))].sort(), [entries])
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return entries.filter((entry) => {
      const actor = entry.actorId ? users.find((user) => user.id === entry.actorId)?.fullName ?? '' : t('common.system')
      const haystack = `${entry.action} ${actor} ${entry.targetId} ${entry.details}`.toLowerCase()
      return (!normalized || haystack.includes(normalized)) && (!action || entry.action === action)
    })
  }, [action, entries, query, t, users])

  return (
    <PageContainer>
      <PageHeader title={t('admin.auditLogs')} description={t('admin.auditDescription')} />
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <Input aria-label={t('admin.searchAudit')} value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={t('admin.searchAuditPlaceholder')} />
        <Select aria-label={t('admin.filterAuditAction')} value={action} onChange={(event) => setAction(event.currentTarget.value)}>
          <option value="">{t('admin.allActions')}</option>
          {actions.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
      </div>
      <Card className="p-4 sm:p-5">
        <DataTable caption={t('admin.recentSystemActivity')}>
          <TableHeader>
            <TableRow>
              <TableHeadCell>{t('admin.action')}</TableHeadCell>
              <TableHeadCell>{t('admin.actor')}</TableHeadCell>
              <TableHeadCell>{t('admin.target')}</TableHeadCell>
              <TableHeadCell>{t('admin.dateTime')}</TableHeadCell>
              <TableHeadCell>{t('admin.details')}</TableHeadCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {filteredEntries.length === 0 ? <TableEmptyState colSpan={5} title={t('admin.noAuditActivity')} /> : filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium text-slate-900">{content(entry.action)}</TableCell>
                <TableCell>{entry.actorId ? (users.find((user) => user.id === entry.actorId)?.fullName ?? t('common.unknown')) : t('common.system')}</TableCell>
                <TableCell>{entry.targetId}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(entry.timestamp, locale)}</TableCell>
                <TableCell>{content(entry.details || '—')}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </DataTable>
      </Card>
    </PageContainer>
  )
}
