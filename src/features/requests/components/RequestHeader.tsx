import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { RequestStatusBadge } from './RequestStatusBadge'
import type { Request } from '@/types/request'
import { useTranslation } from '@/localization/useTranslation'

interface RequestHeaderProps {
  request: Request
}

export function RequestHeader({ request }: RequestHeaderProps) {
  const navigate = useNavigate()
  const { t, content } = useTranslation()
  const location = useLocation()
  const backPath = location.pathname.startsWith('/inbox') ? ROUTES.INBOX : location.pathname.startsWith('/outbox') ? ROUTES.OUTBOX : ROUTES.REQUESTS
  const backLabel = location.pathname.startsWith('/inbox') ? t('requests.backInbox') : location.pathname.startsWith('/outbox') ? t('requests.backOutbox') : t('requests.backMine')

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={backLabel}
          onClick={() => navigate(backPath)}
        >
          <ArrowLeft size={18} className="rtl:rotate-180" aria-hidden="true" />
        </Button>
        <div>
          <p className="text-sm font-medium text-slate-500">{request.referenceCode}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {content(request.title)}
          </h1>
        </div>
      </div>
      <RequestStatusBadge status={request.status} />
    </div>
    </header>
  )
}
