import { Badge, Button } from '@/components/ui'
import type { Department } from '@/types/department'
import type { Role } from '@/types/auth'
import type { User } from '@/types/user'
import { getLocalizedProfile } from '@/utils/localizedProfile'
import { useTranslation } from '@/localization/useTranslation'

interface UserDetailsProps {
  user: User
  users: User[]
  departments: Department[]
  roles: Role[]
  onClose: () => void
}

export function UserDetails({
  user,
  users,
  departments,
  roles,
  onClose,
}: UserDetailsProps) {
  const { t, content, locale } = useTranslation()
  const profile = getLocalizedProfile(user.profile, locale)
  const roleNames = user.roleIds.map((id) => roles.find((role) => role.id === id)?.name ?? id)
  const registrationStage = user.registrationStage === 'HR_REVIEW'
    ? t('registration.hrReview')
    : user.registrationStage === 'DEPARTMENT_HEAD_REVIEW'
      ? t('registration.departmentHeadReview')
      : user.registrationStage === 'CEO_REVIEW'
        ? t('registration.ceoAssignment')
        : user.registrationStage === 'APPROVED'
          ? t('registration.approved')
          : user.registrationStage === 'REJECTED'
            ? t('registration.rejected')
            : t('admin.notApplicable')
  const details: Array<[string, string]> = [
    [t('admin.name'), content(user.fullName)],
    [t('admin.email'), user.email],
    [t('admin.employeeId'), user.employeeId],
    [t('admin.jobTitle'), content(user.jobTitle)],
    [t('admin.department'), content(departments.find((department) => department.id === user.departmentId)?.name ?? t('admin.unassigned'))],
    [t('admin.manager'), users.find((item) => item.id === user.managerId) ? content(users.find((item) => item.id === user.managerId)!.fullName) : t('common.none')],
    [t('admin.registrationStage'), registrationStage],
  ]

  return (
    <div className="space-y-4">
      <dl className="grid gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-slate-500">{t('admin.roles')}</p>
        <div className="flex flex-wrap gap-2">
          {user.roleIds.map((id) => (
            <Badge key={id}>{content(roles.find((role) => role.id === id)?.name ?? id)}</Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-slate-500">{t('admin.accessProfile')}</p>
        <div className="flex flex-wrap gap-2">
          {roleNames.map((name) => <Badge key={name} variant="success">{content(name)}</Badge>)}
        </div>
        <p className="mt-2 text-xs text-slate-500">{t('admin.inheritedPermissions')}</p>
      </div>

      {user.profile ? (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">{t('profile.viewProfile')}</h3>
          
          {profile.bio ? (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">{t('profile.bio')}</p>
              <p className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700">
                {profile.bio}
              </p>
            </div>
          ) : null}

          {profile.skills.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-1.5">{t('profile.skills')}</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {profile.experiences.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-2">{t('profile.experience')}</p>
              <div className="space-y-2">
                {profile.experiences.map((exp) => (
                  <div key={exp.id} className="rounded-lg border border-slate-200 dark:border-slate-700/60 p-3 bg-white dark:bg-slate-800/40 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{exp.role}</span>
                      <span className="text-xs text-slate-500"><bdi dir="ltr">{exp.period}</bdi></span>
                    </div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">{exp.company}</p>
                    {exp.description ? <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{exp.description}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {profile.education.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-2">{t('profile.education')}</p>
              <div className="space-y-2">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="rounded-lg border border-slate-200 dark:border-slate-700/60 p-2.5 bg-white dark:bg-slate-800/40 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{edu.degree}</span>
                      <span className="text-slate-500"><bdi dir="ltr">{edu.year}</bdi></span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {profile.certifications.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-2">{t('profile.certifications')}</p>
              <div className="space-y-2">
                {profile.certifications.map((cert) => (
                  <div key={cert.id} className="rounded-lg border border-slate-200 dark:border-slate-700/60 p-2.5 bg-white dark:bg-slate-800/40 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{cert.title}</span>
                      <span className="text-slate-500"><bdi dir="ltr">{cert.year}</bdi></span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>{t('admin.close')}</Button>
      </div>
    </div>
  )
}
