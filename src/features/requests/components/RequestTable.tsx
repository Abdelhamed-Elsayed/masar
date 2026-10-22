import { Link } from 'react-router'
import { useSyncExternalStore } from 'react'
import { TableVirtuoso, Virtuoso } from 'react-virtuoso'
import type { TableProps } from 'react-virtuoso'
import { TableCell, TableEmptyState, TableHeadCell, TableHeader, TableRow } from '@/components/tables'
import { DataTable } from '@/components/tables'
import { requestDetailsPath } from '@/constants/routes'
import { useDirectoryStore } from '@/store/directoryStore'
import type { Request } from '@/types/request'
import { RequestStatusBadge } from './RequestStatusBadge'
import type { ID } from '@/types/common'
import { useTranslation } from '@/localization/useTranslation'

interface RequestTableProps {
  requests: Request[]
  caption?: string
  emptyMessage?: string
  getDetailsPath?: (requestId: ID) => string
}

function VirtualRequestTable({ children, style }: TableProps) {
  return (
    <table style={{ ...style, minWidth: '56rem', width: '100%' }} className="border-collapse text-start text-sm">
      {children}
    </table>
  )
}

const virtualRequestTableComponents = { Table: VirtualRequestTable }

function subscribeToMobileLayout(onChange: () => void) {
  const media = window.matchMedia('(max-width: 639px)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function getIsMobileLayout() {
  return window.matchMedia('(max-width: 639px)').matches
}

function RequestSummaryCard({
  request,
  requesterName,
  departmentName,
  detailsPath,
}: {
  request: Request
  requesterName: string
  departmentName: string
  detailsPath: string
}) {
  const { t, content, locale } = useTranslation()
  return (
    <article className="m-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" role="listitem">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={detailsPath}
            className="block truncate font-semibold text-blue-800 hover:text-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {content(request.title)}
          </Link>
          <p className="mt-1 text-xs text-slate-500"><bdi dir="ltr">{request.referenceCode}</bdi></p>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-slate-500">{t('requests.requester')}</dt>
          <dd className="mt-0.5 truncate font-medium text-slate-800">{requesterName}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{t('requests.department')}</dt>
          <dd className="mt-0.5 truncate font-medium text-slate-800">{departmentName}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-slate-500">{t('dashboard.updated')}</dt>
          <dd className="mt-0.5 text-slate-700">{formatDate(request.updatedAt, locale)}</dd>
        </div>
      </dl>
    </article>
  )
}

function formatDate(value: string, locale: 'en' | 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function RequestTable({
  requests,
  caption = 'Requests',
  emptyMessage = 'No requests match these filters.',
  getDetailsPath = requestDetailsPath,
}: RequestTableProps) {
  const { t, locale, content } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const isMobile = useSyncExternalStore(
    subscribeToMobileLayout,
    getIsMobileLayout,
    () => false,
  )

  if (isMobile) {
    const renderRequest = (request: Request) => (
      <RequestSummaryCard
        key={request.id}
        request={request}
        requesterName={content(users.find((user) => user.id === request.requesterId)?.fullName ?? t('requests.unknownUser'))}
        departmentName={content(departments.find((item) => item.id === request.departmentId)?.name ?? t('requests.unknownDepartment'))}
        detailsPath={getDetailsPath(request.id)}
      />
    )
    return requests.length >= 100 ? (
      <Virtuoso
        data={requests}
        style={{ height: 'min(70vh, 42rem)' }}
        computeItemKey={(_, request) => request.id}
        itemContent={(_, request) => renderRequest(request)}
        role="list"
        aria-label={caption}
      />
    ) : (
      <div role="list" aria-label={caption} className="grid gap-2 sm:hidden">
        {requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            {emptyMessage}
          </div>
        ) : requests.map(renderRequest)}
      </div>
    )
  }

  if (requests.length >= 100) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-200">
        <TableVirtuoso
          data={requests}
          style={{ height: 'min(70vh, 42rem)' }}
          computeItemKey={(_, request) => request.id}
          fixedHeaderContent={() => (
            <>
              <tr><th colSpan={6} className="sr-only">{caption}</th></tr>
              <tr className="bg-slate-50 text-slate-600">
                <th scope="col" className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide">{t('requests.reference')}</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide">{t('dashboard.request')}</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide">{t('requests.requester')}</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide">{t('requests.department')}</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide">{t('dashboard.updated')}</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide">{t('dashboard.status')}</th>
              </tr>
            </>
          )}
          itemContent={(_, request) => {
            const requester = users.find((user) => user.id === request.requesterId)
            const department = departments.find((item) => item.id === request.departmentId)
            return (
              <>
                <td className="border-b border-slate-200 px-4 py-3 align-middle">
                  <Link to={getDetailsPath(request.id)} className="font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    <bdi dir="ltr">{request.referenceCode}</bdi>
                  </Link>
                </td>
                <td className="border-b border-slate-200 px-4 py-3 align-middle font-medium text-slate-900">{content(request.title)}</td>
                <td className="border-b border-slate-200 px-4 py-3 align-middle text-slate-700">{content(requester?.fullName ?? t('requests.unknownUser'))}</td>
                <td className="border-b border-slate-200 px-4 py-3 align-middle text-slate-700">{content(department?.name ?? t('requests.unknownDepartment'))}</td>
                <td className="whitespace-nowrap border-b border-slate-200 px-4 py-3 align-middle text-slate-700">{formatDate(request.updatedAt, locale)}</td>
                <td className="border-b border-slate-200 px-4 py-3 align-middle"><RequestStatusBadge status={request.status} /></td>
              </>
            )
          }}
          components={virtualRequestTableComponents}
          aria-label={caption}
        />
      </div>
    )
  }

  return (
    <DataTable caption={caption}>
      <TableHeader>
        <TableRow>
          <TableHeadCell>{t('requests.reference')}</TableHeadCell>
          <TableHeadCell>{t('dashboard.request')}</TableHeadCell>
          <TableHeadCell>{t('requests.requester')}</TableHeadCell>
          <TableHeadCell>{t('requests.department')}</TableHeadCell>
          <TableHeadCell>{t('dashboard.updated')}</TableHeadCell>
          <TableHeadCell>{t('dashboard.status')}</TableHeadCell>
        </TableRow>
      </TableHeader>
      <tbody>
        {requests.length === 0 ? (
          <TableEmptyState colSpan={6} title={emptyMessage} />
        ) : (
          requests.map((request) => {
            const requester = users.find((user) => user.id === request.requesterId)
            const department = departments.find((item) => item.id === request.departmentId)
            return (
              <TableRow key={request.id} className="hover:bg-slate-50">
                <TableCell>
                  <Link
                    to={getDetailsPath(request.id)}
                    className="font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <bdi dir="ltr">{request.referenceCode}</bdi>
                  </Link>
                </TableCell>
                <TableCell className="font-medium text-slate-900">{content(request.title)}</TableCell>
                <TableCell>{content(requester?.fullName ?? t('requests.unknownUser'))}</TableCell>
                <TableCell>{content(department?.name ?? t('requests.unknownDepartment'))}</TableCell>
                <TableCell>{formatDate(request.updatedAt, locale)}</TableCell>
                <TableCell><RequestStatusBadge status={request.status} /></TableCell>
              </TableRow>
            )
          })
        )}
      </tbody>
    </DataTable>
  )
}
