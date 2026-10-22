import { useMemo, useState } from 'react'
import { PageContainer } from '@/components/layout'
import { RequestFilters } from '@/features/requests/components/RequestFilters'
import { RequestTable } from '@/features/requests/components/RequestTable'
import { OutboxHeader } from '@/features/outbox'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { useTranslation } from '@/localization/useTranslation'

export function OutboxPage() {
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const requests = useRequestStore((state) => state.requests)
  const [query, setQuery] = useState('')
  const [requestTypeId, setRequestTypeId] = useState('')

  const outboxRequests = useMemo(() => {
    if (!currentUser) return []
    const normalizedQuery = query.trim().toLowerCase()
    return requests
      .filter((request) => request.requesterId === currentUser.id)
      .filter((request) => !requestTypeId || request.requestTypeId === requestTypeId)
      .filter(
        (request) =>
          !normalizedQuery ||
          request.referenceCode.toLowerCase().includes(normalizedQuery) ||
          request.title.toLowerCase().includes(normalizedQuery),
      )
      .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [currentUser, query, requestTypeId, requests])

  return (
    <PageContainer>
      <OutboxHeader />
      <div className="space-y-4">
        <RequestFilters
          query={query}
          requestTypeId={requestTypeId}
          onQueryChange={setQuery}
          onRequestTypeChange={setRequestTypeId}
        />
        <RequestTable
          requests={outboxRequests}
          caption={t('outbox.caption')}
          emptyMessage={t('outbox.empty')}
        />
      </div>
    </PageContainer>
  )
}
