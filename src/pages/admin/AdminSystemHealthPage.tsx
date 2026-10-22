import { useMemo } from 'react'
import { CheckCircle2, Database, GitBranch, ShieldCheck, Users, Bell, ClipboardList } from 'lucide-react'
import { Card } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { useDirectoryStore } from '@/store/directoryStore'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuditStore } from '@/store/auditStore'
import { useTranslation } from '@/localization/useTranslation'

export function AdminSystemHealthPage() {
  const { t, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const roles = useDirectoryStore((state) => state.roles)
  const requests = useRequestStore((state) => state.requests)
  const definitions = useWorkflowStore((state) => state.definitions)
  const notifications = useNotificationStore((state) => state.notifications)
  const audits = useAuditStore((state) => state.entries)
  const number = useMemo(
    () => (value: number) => new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(value),
    [locale],
  )
  const checks = useMemo(() => [
    [t('admin.localDirectory'), users.length > 0, `${number(users.length)} ${t('admin.userCountLoaded')}`, Users],
    [t('admin.localPermissions'), roles.length > 0, `${number(roles.length)} ${t('admin.roleCountConfigured')}`, ShieldCheck],
    [t('admin.localRequests'), true, `${number(requests.length)} ${t('admin.requestCountAvailable')}`, ClipboardList],
    [t('admin.localWorkflows'), definitions.length > 0, `${number(definitions.length)} ${t('admin.workflowCountDefinitions')}`, GitBranch],
    [t('admin.localNotifications'), true, `${number(notifications.length)} ${t('admin.notificationCountStored')}`, Bell],
    [t('admin.localAuditTrail'), true, `${number(audits.length)} ${t('admin.auditCountRetained')}`, Database],
  ] as const, [audits.length, definitions.length, notifications.length, number, requests.length, roles.length, t, users.length])
  const healthy = checks.filter(([, ok]) => ok).length
  return (
    <PageContainer>
      <PageHeader title={t('admin.systemHealth')} description={t('admin.healthDescription')} />
      <Card className="mb-6 border-slate-200 bg-slate-950 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{t('admin.workspaceStatus')}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-3xl font-bold">{number(healthy)}/{number(checks.length)}</p><p className="mt-1 text-sm text-slate-300">{t('admin.localChecksPassing')}</p></div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">{healthy === checks.length ? t('admin.healthy') : t('admin.reviewRequired')}</span>
        </div>
      </Card>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {checks.map(([label, ok, detail, Icon]) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={18} /></span><CheckCircle2 className={ok ? 'text-emerald-600' : 'text-rose-600'} size={20} /></div>
            <h2 className="mt-4 font-semibold text-slate-900">{label}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p>
          </Card>
        ))}
      </section>
    </PageContainer>
  )
}
