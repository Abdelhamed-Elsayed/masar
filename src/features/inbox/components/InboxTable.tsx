import { RequestTable } from '@/features/requests/components/RequestTable'
import { inboxDetailsPath } from '@/constants/routes'
import type { Request } from '@/types/request'
import { useTranslation } from '@/localization/useTranslation'

interface InboxTableProps {
  requests: Request[]
}

export function InboxTable({ requests }: InboxTableProps) {
  const { t } = useTranslation()
  return (
    <RequestTable
      requests={requests}
      caption={t('inbox.caption')}
      emptyMessage={t('inbox.empty')}
      getDetailsPath={inboxDetailsPath}
    />
  )
}
