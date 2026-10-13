import { PageHeader } from '@/components/layout'
import { useTranslation } from '@/localization/useTranslation'

export function InboxHeader() {
  const { t } = useTranslation()
  return (
    <PageHeader
      title={t('inbox.title')}
      description={t('inbox.description')}
    />
  )
}
