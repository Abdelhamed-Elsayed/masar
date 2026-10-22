import { Link } from 'react-router'
import { Card } from '@/components/ui'
import { requestDetailsPath } from '@/constants/routes'
import type { Request } from '@/types/request'
import { RequestStatusBadge } from './RequestStatusBadge'
import { useTranslation } from '@/localization/useTranslation'

export interface RequestCardProps {
  request: Request
  requesterName: string
}

export function RequestCard({ request, requesterName }: RequestCardProps) {
  const { t, content } = useTranslation()
  return (
    <Card as="article" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{request.referenceCode}</p>
          <h3 className="mt-1 truncate font-semibold text-slate-900">{content(request.title)}</h3>
          <p className="mt-1 text-sm text-slate-500">{requesterName}</p>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>
      <Link
        to={requestDetailsPath(request.id)}
        className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        {t('requests.view')}
      </Link>
    </Card>
  )
}
