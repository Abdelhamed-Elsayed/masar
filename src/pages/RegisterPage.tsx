import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Alert, Button, Input, Select } from '@/components/ui'
import { FormField, FormLabel } from '@/components/forms/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import type { User } from '@/types/user'
import { useTranslation } from '@/localization/useTranslation'

const strongPasswordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'

export function RegisterPage() {
  const { t } = useTranslation()
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)
  const registerPendingUser = useAuthStore((state) => state.registerPendingUser)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }
    if (!new RegExp(strongPasswordPattern).test(password)) {
      setError(t('auth.weakPassword'))
      return
    }

    const normalizedName = fullName.trim().replace(/\s+/g, ' ')
    const nameParts = normalizedName.split(' ')
    if (nameParts.length < 2 || nameParts.some((part) => part.length < 2) || !jobTitle.trim()) {
      setError(t('auth.invalidName'))
      return
    }
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ')
    const employeeRole = roles.find((role) => role.code === 'EMPLOYEE')
    if (!employeeRole) {
      setError(t('auth.employeeRoleMissing'))
      return
    }

    const user: User = {
      id: `user-${crypto.randomUUID()}`,
      employeeId: `PENDING-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      firstName,
      lastName,
      fullName: normalizedName,
      email: email.trim().toLowerCase(),
      jobTitle: jobTitle.trim(),
      departmentId,
      managerId: null,
      roleIds: [employeeRole.id],
      isActive: false,
      avatarUrl: null,
      approvalStatus: 'PENDING',
      registrationStage: 'HR_REVIEW',
      registrationSubmittedAt: new Date().toISOString(),
    }

    setIsSubmitting(true)
    try {
      if (!await registerPendingUser(user, password)) {
        setError(t('auth.emailAlreadyExists'))
        return
      }
      setSubmitted(true)
    } catch (submitError) {
      console.error('Registration request failed', submitError)
      setError(t('auth.registrationUnavailable'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="w-full max-w-lg" aria-live="polite">
        <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#e7efe8] text-teal-900">
          <CheckCircle2 size={24} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {t('auth.registrationReceived')}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {t('auth.registrationFlow')}
        </p>
        <Alert variant="info" className="mt-6">
          {t('auth.registrationEmailNote')} <span className="font-medium" dir="ltr">{email.trim()}</span>
        </Alert>
        <Link
          to={ROUTES.LOGIN}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-teal-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <ArrowRight size={16} className="rtl:rotate-180" aria-hidden="true" />
          {t('auth.backToSignIn')}
        </Link>
      </section>
    )
  }

  return (
    <section className="w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {t('auth.requestAccount')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {t('auth.registrationFlow')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="sm:col-span-2">
            <FormLabel htmlFor="register-name" required>{t('auth.fullName')}</FormLabel>
            <Input
              id="register-name"
              dir="auto"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.currentTarget.value)}
              required
              minLength={5}
              maxLength={100}
              pattern="\S{2,}(?:\s+\S{2,})+"
              title={t('auth.nameTitle')}
            />
          </FormField>
          <FormField className="sm:col-span-2">
            <FormLabel htmlFor="register-email" required>{t('auth.workEmail')}</FormLabel>
            <Input
              id="register-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              maxLength={254}
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="register-department" required>{t('auth.department')}</FormLabel>
            <Select
              id="register-department"
              value={departmentId}
              onChange={(event) => setDepartmentId(event.currentTarget.value)}
              required
            >
              <option value="">{t('auth.chooseDepartment')}</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="register-job-title" required>{t('auth.jobTitle')}</FormLabel>
            <Input
              id="register-job-title"
              autoComplete="organization-title"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.currentTarget.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="register-password" required>{t('auth.password')}</FormLabel>
            <Input
              id="register-password"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              minLength={8}
              maxLength={128}
              pattern={strongPasswordPattern}
              aria-describedby="register-password-help"
              title={t('auth.passwordTitle')}
            />
            <p id="register-password-help" className="text-xs leading-5 text-stone-500">
              {t('auth.passwordHelp')}
            </p>
          </FormField>
          <FormField>
            <FormLabel htmlFor="register-confirm-password" required>{t('auth.confirmPassword')}</FormLabel>
            <Input
              id="register-confirm-password"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.currentTarget.value)}
              required
              minLength={8}
            />
          </FormField>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {t('auth.submitRegistration')}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-600">
        {t('auth.haveAccount')}{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-teal-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          {t('welcome.signIn')}
        </Link>
      </p>
    </section>
  )
}
