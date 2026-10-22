import { Link } from 'react-router'
import { EmptyState } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from '@/localization/useTranslation'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <EmptyState
        title={t('requests.pageNotFound')}
        description={t('requests.pageNotFoundDescription')}
        action={
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {t('requests.backDashboard')}
          </Link>
        }
      />
    </PageContainer>
  )
}
