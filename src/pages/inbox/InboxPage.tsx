import { useMemo, useState } from 'react'
import { PageContainer } from '@/components/layout'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { RequestStatus } from '@/types/request'
import { WorkflowStepStatus } from '@/types/workflow'
import { InboxFilters, InboxHeader, InboxTable } from '@/features/inbox'

export function InboxPage() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const requests = useRequestStore((state) => state.requests)
  const instances = useWorkflowStore((state) => state.instances)
  const [query, setQuery] = useState('')

  const actionableRequests = useMemo(() => {
    if (!currentUser) return []
    const actionableRequestIds = new Set(
      instances
        .filter((instance) =>
          instance.steps.some(
            (step) =>
              step.assignedUserId === currentUser.id &&
              step.status === WorkflowStepStatus.CURRENT,
          ),
        )
        .map((instance) => instance.requestId),
    )
    const normalizedQuery = query.trim().toLowerCase()
    return requests
      .filter(
        (request) =>
          actionableRequestIds.has(request.id) &&
          (request.status === RequestStatus.SUBMITTED ||
            request.status === RequestStatus.IN_PROGRESS),
      )
      .filter(
        (request) =>
          !normalizedQuery ||
          request.referenceCode.toLowerCase().includes(normalizedQuery) ||
          request.title.toLowerCase().includes(normalizedQuery),
      )
      .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [currentUser, instances, query, requests])

  return (
    <PageContainer>
      <InboxHeader />
      <div className="space-y-4">
        <InboxFilters query={query} onQueryChange={setQuery} />
        <InboxTable requests={actionableRequests} />
      </div>
    </PageContainer>
  )
}
