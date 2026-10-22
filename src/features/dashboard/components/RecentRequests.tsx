import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import {
  DataTable,
  TableCell,
  TableEmptyState,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '@/components/tables'
import { Card } from '@/components/ui'
import { ROUTES, requestDetailsPath } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useRequestStore } from '@/store/requestStore'
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge'
import { useTranslation } from '@/localization/useTranslation'

function formatDate(value: string, locale: 'en' | 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function RecentRequests() {
  const { t, locale, content } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const requests = useRequestStore((state) => state.requests)
  const recentRequests = currentUser
    ? requests
        .filter((request) => request.requesterId === currentUser.id)
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
        )
        .slice(0, 5)
    : []

  return (
    <Card as="section" aria-labelledby="recent-requests-heading" className="min-w-0">
      <div className="flex flex-col items-start gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h2
            id="recent-requests-heading"
            className="text-base font-semibold text-slate-950"
          >
            {t('dashboard.recentRequests')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('dashboard.latestUpdates')}
          </p>
        </div>
        <Link
          to={ROUTES.REQUESTS}
          className="inline-flex min-w-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 sm:shrink-0"
        >
          <span className="break-words">{t('dashboard.viewAllRequests')}</span>
          <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
        </Link>
      </div>
      <DataTable caption={t('dashboard.recentRequests')}>
        <TableHeader>
          <TableRow>
            <TableHeadCell>{t('dashboard.request')}</TableHeadCell>
            <TableHeadCell className="hidden sm:table-cell">{t('dashboard.type')}</TableHeadCell>
            <TableHeadCell>{t('dashboard.status')}</TableHeadCell>
            <TableHeadCell className="hidden md:table-cell">{t('dashboard.updated')}</TableHeadCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {recentRequests.length === 0 ? (
            <TableEmptyState
              colSpan={4}
              title={t('dashboard.noRequests')}
              description={t('dashboard.createRequestHint')}
            />
          ) : (
            recentRequests.map((request) => {
              const requestType = requestTypes.find(
                (item) => item.id === request.requestTypeId,
              )
              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <Link
                      to={requestDetailsPath(request.id)}
                      className="font-medium text-slate-900 hover:text-blue-700"
                    >
                      <span className="block">{content(request.title)}</span>
                      <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        <bdi dir="ltr">{request.referenceCode}</bdi>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {content(requestType?.name ?? t('dashboard.request'))}
                  </TableCell>
                  <TableCell><RequestStatusBadge status={request.status} /></TableCell>
                  <TableCell className="hidden whitespace-nowrap text-slate-500 md:table-cell">
                    <time dateTime={request.updatedAt}>
                      {formatDate(request.updatedAt, locale)}
                    </time>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </tbody>
      </DataTable>
    </Card>
  )
}
