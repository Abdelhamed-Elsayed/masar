import {
  DashboardHeader,
  NotificationsPreview,
  PendingActions,
  RecentRequests,
  StatisticsGrid,
} from '@/features/dashboard'

export function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <DashboardHeader />
      <StatisticsGrid />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <RecentRequests />
        <div className="space-y-6">
          <PendingActions />
          <NotificationsPreview />
        </div>
      </div>
    </div>
  )
}
