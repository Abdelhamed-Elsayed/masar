import { Badge } from '@/components/ui'
import { RequestStatus } from '@/types/request'
import type { Request } from '@/types/request'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

type StatusVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

const statusTranslationKeys: Record<Request['status'], TranslationKey> = {
  [RequestStatus.DRAFT]: 'status.draft',
  [RequestStatus.SUBMITTED]: 'status.submitted',
  [RequestStatus.IN_PROGRESS]: 'status.inProgress',
  [RequestStatus.APPROVED]: 'status.approved',
  [RequestStatus.REJECTED]: 'status.rejected',
  [RequestStatus.CANCELLED]: 'status.cancelled',
}

const statusVariants: Record<Request['status'], StatusVariant> = {
  [RequestStatus.DRAFT]: 'default',
  [RequestStatus.SUBMITTED]: 'primary',
  [RequestStatus.IN_PROGRESS]: 'warning',
  [RequestStatus.APPROVED]: 'success',
  [RequestStatus.REJECTED]: 'danger',
  [RequestStatus.CANCELLED]: 'default',
}

export interface RequestStatusBadgeProps {
  status: Request['status']
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const { t } = useTranslation()
  return <Badge variant={statusVariants[status]}>{t(statusTranslationKeys[status])}</Badge>
}
