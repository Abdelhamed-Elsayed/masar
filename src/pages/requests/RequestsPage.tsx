import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui'
import { PageContainer, PageHeader, Section } from '@/components/layout'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { RequestFilters } from '@/features/requests/components/RequestFilters'
import { RequestTabs } from '@/features/requests/components/RequestTabs'
import { getRequestTabFilter } from '@/features/requests/components/requestTabFilters'
import type { RequestTab } from '@/features/requests/components/requestTabFilters'
import { RequestTable } from '@/features/requests/components/RequestTable'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from '@/localization/useTranslation'

export function RequestsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)
  const requests = useRequestStore((state) => state.requests)
  const [activeTab, setActiveTab] = useState<RequestTab>('all')
  const [query, setQuery] = useState('')
  const [requestTypeId, setRequestTypeId] = useState('')

  const visibleRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return requests
      .filter((request) => request.requesterId === currentUser?.id)
      .filter(getRequestTabFilter(activeTab))
      .filter((request) => !requestTypeId || request.requestTypeId === requestTypeId)
      .filter(
        (request) =>
          !normalizedQuery ||
          request.referenceCode.toLowerCase().includes(normalizedQuery) ||
          request.title.toLowerCase().includes(normalizedQuery),
      )
      .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [activeTab, currentUser?.id, query, requestTypeId, requests])

  return (
    <PageContainer>
      <PageHeader
        title={t('requests.title')}
        description={t('requests.description')}
        actions={
          <Button type="button" onClick={() => navigate(ROUTES.REQUESTS_NEW)}>
            {t('requests.create')}
          </Button>
        }
      />
      <Section>
        <RequestFilters
          query={query}
          requestTypeId={requestTypeId}
          onQueryChange={setQuery}
          onRequestTypeChange={setRequestTypeId}
        />
        <RequestTabs value={activeTab} onChange={setActiveTab} />
        <div
          id="requests-panel"
          role="tabpanel"
          aria-labelledby={`requests-tab-${activeTab}`}
          className="mt-4"
        >
          <RequestTable requests={visibleRequests} />
        </div>
      </Section>
    </PageContainer>
  )
}
