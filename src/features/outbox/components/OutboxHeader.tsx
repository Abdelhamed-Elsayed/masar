import { PageHeader } from '@/components/layout'
import { useTranslation } from '@/localization/useTranslation'

export function OutboxHeader() {
  const { t } = useTranslation()
  return (
    <PageHeader
      title={t('outbox.title')}
      description={t('outbox.description')}
    />
  )
}
