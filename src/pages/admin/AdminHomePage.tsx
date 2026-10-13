import { Activity, ArrowRight, Building2, ClipboardList, GitBranch, Users, ShieldCheck, UserCog } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { useDirectoryStore } from '@/store/directoryStore'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useAuditStore } from '@/store/auditStore'
import { RequestStatus } from '@/types/request'
import { ROUTES } from '@/constants/routes'
import type { ReactNode } from 'react'
import { useTranslation } from '@/localization/useTranslation'

interface AdminMetric {
  label: string
  value: number
  icon: ReactNode
  description: string
}

function AdminMetricCard({ label, value, icon, description }: AdminMetric) {
  return (
    <Card as="article" className="flex items-start gap-4 border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </Card>
  )
}

export function AdminHomePage() {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const requests = useRequestStore((state) => state.requests)
  const definitions = useWorkflowStore((state) => state.definitions)
  const auditEntries = useAuditStore((state) => state.entries)
  const recentActivity = auditEntries.slice(0, 5)
  const metrics: AdminMetric[] = [
    {
      label: t('admin.totalUsers'),
      value: users.length,
      icon: <Users size={20} aria-hidden="true" />,
      description: `${new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(users.filter((user) => user.isActive).length)} ${t('admin.activeUsers')}`,
    },
    {
      label: t('admin.departments'),
      value: departments.length,
      icon: <Building2 size={20} aria-hidden="true" />,
      description: t('admin.configuredDepartments'),
    },
    {
      label: t('admin.requestTypes'),
      value: requestTypes.length,
      icon: <ClipboardList size={20} aria-hidden="true" />,
      description: t('admin.requestCategories'),
    },
    {
      label: t('admin.activeWorkflows'),
      value: definitions.length,
      icon: <GitBranch size={20} aria-hidden="true" />,
      description: t('admin.workflowDefinitions'),
    },
    {
      label: t('admin.pendingRequests'),
      value: requests.filter(
        (request) =>
          request.status === RequestStatus.SUBMITTED ||
          request.status === RequestStatus.IN_PROGRESS,
      ).length,
      icon: <Activity size={20} aria-hidden="true" />,
      description: t('admin.waitingDecision'),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('admin.homeTitle')}
        description={t('admin.homeDescription')}
      />
      <section aria-label={t('admin.systemOverview')} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#8b6914]">{t('admin.administration')}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{t('admin.manageMasar')}</h2><p className="mt-1 text-sm text-slate-500">{t('admin.configurePeople')}</p></div></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {[[ROUTES.ADMIN_USERS, t('admin.users'), t('admin.peopleAccess')], [ROUTES.ADMIN_FORMS, t('navigation.forms'), t('admin.requestData')], [ROUTES.ADMIN_WORKFLOWS, t('navigation.workflows'), t('admin.approvalPaths')], [ROUTES.ADMIN_AUDIT_LOGS, t('admin.auditLogs'), t('admin.recentSystemActivity')]].map(([to, label, text]) => (
              <Link key={to} to={to} className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-[#d4af37] hover:bg-[#fbf6e6]"><span><span className="block text-sm font-semibold text-slate-900">{label}</span><span className="mt-1 block text-xs text-slate-500">{text}</span></span><ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#8b6914] rtl:rotate-180" /></Link>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin.executiveControls')}</p>
          <div className="mt-4 grid gap-2">
            {[
              { to: ROUTES.ADMIN_STRUCTURE, label: t('admin.companyStructure'), text: t('admin.movePeople'), icon: <Building2 size={16} aria-hidden="true" /> },
              { to: ROUTES.ADMIN_ROLES, label: t('admin.rolesPermissions'), text: t('admin.controlRoles'), icon: <UserCog size={16} aria-hidden="true" /> },
              { to: ROUTES.ADMIN_USERS, label: t('admin.peopleAccess'), text: t('admin.manageAccounts'), icon: <Users size={16} aria-hidden="true" /> },
              { to: ROUTES.ADMIN_AUDIT_LOGS, label: t('admin.auditLogs'), text: t('admin.reviewActivity'), icon: <ShieldCheck size={16} aria-hidden="true" /> },
              { to: ROUTES.ADMIN_HEALTH, label: t('admin.systemHealth'), text: t('admin.checkIntegrity'), icon: <Activity size={16} aria-hidden="true" /> },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-amber-300 hover:bg-amber-50"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-300">{item.icon}</span><span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">{item.label}</span><span className="mt-0.5 block text-xs text-slate-500">{item.text}</span></span></Link>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin.recentActivity')}</p>
          <div className="mt-4 space-y-3">
            {recentActivity.length === 0 ? <p className="text-sm text-slate-500">{t('admin.noActivity')}</p> : recentActivity.map((entry) => <div key={entry.id} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500" /><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{content(entry.action)}</p><p className="truncate text-xs text-slate-500">{content(entry.details || t('admin.systemActivity'))}</p></div></div>)}
          </div>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin.workspaceHealth')}</p>
          <div className="mt-4 space-y-4">
            <div><div className="flex justify-between text-sm"><span className="text-slate-600">{t('admin.activeUsers')}</span><span className="font-semibold text-slate-900">{users.filter((u) => u.isActive).length}/{users.length}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-600" style={{ width: `${users.length ? (users.filter((u) => u.isActive).length / users.length) * 100 : 0}%` }} /></div></div>
            <div><div className="flex justify-between text-sm"><span className="text-slate-600">{t('admin.configuredWorkflows')}</span><span className="font-semibold text-slate-900">{definitions.length}</span></div><p className="mt-1 text-xs text-slate-500">{t('admin.routesReady')}</p></div>
          </div>
        </Card>
      </section>
    </PageContainer>
  )
}
