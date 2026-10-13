import { CheckCircle2, Clock3, FileText, XCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { RequestStatus } from '@/types/request'
import type { Request } from '@/types/request'
import { StatCard } from './StatCard'
import { useTranslation } from '@/localization/useTranslation'

const pendingStatuses = new Set<Request['status']>([
  RequestStatus.SUBMITTED,
  RequestStatus.IN_PROGRESS,
])

export function StatisticsGrid() {
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const requests = useRequestStore((state) => state.requests)
  const ownRequests = currentUser
    ? requests.filter((request) => request.requesterId === currentUser.id)
    : []

  const statistics = [
    {
      label: t('dashboard.totalRequests'),
      value: ownRequests.length,
      description: t('dashboard.requestsSubmitted'),
      tone: 'blue' as const,
      icon: <FileText className="size-5" />,
    },
    {
      label: t('dashboard.pending'),
      value: ownRequests.filter((request) => pendingStatuses.has(request.status))
        .length,
      description: t('dashboard.awaitingDecision'),
      tone: 'amber' as const,
      icon: <Clock3 className="size-5" />,
    },
    {
      label: t('dashboard.approved'),
      value: ownRequests.filter(
        (request) => request.status === RequestStatus.APPROVED,
      ).length,
      description: t('dashboard.successfullyCompleted'),
      tone: 'green' as const,
      icon: <CheckCircle2 className="size-5" />,
    },
    {
      label: t('dashboard.rejected'),
      value: ownRequests.filter(
        (request) => request.status === RequestStatus.REJECTED,
      ).length,
      description: t('dashboard.requestsNotApproved'),
      tone: 'red' as const,
      icon: <XCircle className="size-5" />,
    },
  ]

  return (
    <section aria-label={t('dashboard.requestStatistics')}>
      <h2 className="sr-only">{t('dashboard.requestStatistics')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => (
          <StatCard key={statistic.label} {...statistic} />
        ))}
      </div>
    </section>
  )
}
