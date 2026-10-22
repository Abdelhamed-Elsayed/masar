import { Avatar, Button, Modal } from '@/components/ui'
import { Award, Briefcase, GraduationCap, Sparkles } from 'lucide-react'
import { useTranslation } from '@/localization/useTranslation'
import { getLocalizedProfile } from '@/utils/localizedProfile'
import type { User } from '@/types/user'

export interface LandingEmployee {
  id: string
  fullName: string
  jobTitle: string
  avatarUrl: string | null
  departmentName: string | undefined
  jobTitleCode: string | null
  profile: User['profile']
}

interface EmployeeProfileModalProps {
  employee: LandingEmployee
  onClose: () => void
}

export function EmployeeProfileModal({ employee, onClose }: EmployeeProfileModalProps) {
  const { t, content, locale } = useTranslation()
  const profile = getLocalizedProfile(employee.profile, locale)

  return (
      <Modal
        open
        onClose={() => onClose()}
        title={content(employee.fullName)}
        className="max-w-2xl"
      >
        <div className="space-y-6 py-1">
          {/* Employee Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar
              name={content(employee.fullName)}
              src={employee.avatarUrl ?? undefined}
              size="lg"
              className="size-16 rounded-2xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {content(employee.fullName)}
                </h3>
              </div>
              <p className="mt-0.5 text-sm font-medium text-slate-600">
                {locale === 'en' && employee.jobTitleCode
                  ? employee.jobTitleCode
                  : content(employee.jobTitle)}
              </p>
              {employee.departmentName ? (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                  <span className="size-1.5 rounded-full bg-teal-500" aria-hidden="true" />
                  {content(employee.departmentName)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Field 1: Bio (General Info - Visible to All) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
              <Sparkles size={14} className="text-teal-600" aria-hidden="true" />
              {t('profile.bio')}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {profile.bio
                ? content(profile.bio)
                : t('profile.noBio')}
            </p>
          </div>

          {/* Field 2: Skills & Specializations (General Info - Visible to All) */}
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('profile.skills')}
            </h4>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">{t('profile.noSkills')}</p>
            )}
          </div>

          {/* Fields 3, 4, 5: experience, qualifications and certifications are public */}
          <div className="space-y-5 border-t border-slate-200 pt-5">
              {/* Field 3: Work Experience */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Briefcase size={14} className="text-blue-600" aria-hidden="true" />
                  {t('profile.experience')}
                </h4>
                {profile.experiences.length > 0 ? (
                  <div className="space-y-3">
                    {profile.experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h5 className="text-sm font-bold text-slate-900">
                            {content(exp.role)}
                          </h5>
                          <span className="text-xs font-medium text-slate-500">
                            {exp.period}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-teal-700">
                          {content(exp.company)}
                        </p>
                        {exp.description ? (
                          <p className="mt-2 text-xs leading-relaxed text-slate-600">
                            {content(exp.description)}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">{t('profile.noExperience')}</p>
                )}
              </div>

              {/* Field 4: Education & Qualifications */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <GraduationCap size={14} className="text-indigo-600" aria-hidden="true" />
                  {t('profile.education')}
                </h4>
                {profile.education.length > 0 ? (
                  <div className="space-y-2">
                    {profile.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {content(edu.degree)}
                          </p>
                          <p className="text-xs text-slate-600">
                            {content(edu.institution)}
                          </p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {edu.year}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">{t('profile.noEducation')}</p>
                )}
              </div>

              {/* Field 5: Certifications & Achievements */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Award size={14} className="text-amber-600" aria-hidden="true" />
                  {t('profile.certifications')}
                </h4>
                {profile.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {profile.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {content(cert.title)}
                          </p>
                          <p className="text-xs text-slate-600">
                            {content(cert.issuer)}
                          </p>
                        </div>
                        {cert.year ? (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            {cert.year}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">{t('profile.noCertifications')}</p>
                )}
              </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => onClose()}>
              {t('gateway.close')}
            </Button>
          </div>
        </div>
      </Modal>
  )
}
