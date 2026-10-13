import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react'
import { Alert, Button, Input } from '@/components/ui'
import { FormField, FormLabel } from '@/components/forms/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const findUserByEmail = useDirectoryStore((state) => {
    const normalizedEmail = email.trim().toLowerCase()
    return state.users.find((user) => user.email.toLowerCase() === normalizedEmail)
  })
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const result = await login(email, password)
      if (result === 'REGISTRATION_REJECTED') {
        const rejectedUser = findUserByEmail
        const reason = rejectedUser?.registrationDecisionNote?.trim()
        setError(reason ? `${t('auth.registrationRejectedReason')} ${reason}` : t('auth.registrationRejected'))
        return
      }
      if (result === 'PENDING_APPROVAL') {
        const pendingUser = findUserByEmail
        const stage = pendingUser?.registrationStage
        const stageMessage = stage === 'HR_REVIEW'
          ? t('auth.pendingHr')
          : stage === 'DEPARTMENT_HEAD_REVIEW'
            ? t('auth.pendingDepartmentHead')
            : stage === 'CEO_REVIEW'
              ? t('auth.pendingCeo')
              : t('auth.pendingGeneric')
        setError(stageMessage)
        return
      }
      if (result === 'INACTIVE_ACCOUNT') {
        setError(t('auth.inactiveAccount'))
        return
      }
      if (result === 'INVALID_CREDENTIALS') {
        setError(t('auth.invalidCredentials'))
        return
      }
      if (result) {
        setError(t('auth.signInFailed'))
        return
      }
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (submitError) {
      console.error('Sign-in request failed', submitError)
      setError(t('auth.signInUnavailable'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full">
      <div className="mb-8">
        <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800 ring-1 ring-blue-100">
          <KeyRound size={21} aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-semibold text-blue-800">{t('auth.signInToMasar')}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {t('auth.welcomeBack')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t('auth.signInDescription')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField>
          <FormLabel htmlFor="login-email" required>{t('auth.email')}</FormLabel>
          <Input
            id="login-email"
            type="email"
            dir="ltr"
            autoComplete="username"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
          />
        </FormField>
        <FormField>
          <FormLabel htmlFor="login-password" required>{t('auth.password')}</FormLabel>
          <div className="relative">
            <Input
              id="login-password"
              type={isPasswordVisible ? 'text' : 'password'}
              dir="ltr"
              autoComplete="current-password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              minLength={8}
              className="pe-12 rtl:pe-3 rtl:ps-12"
            />
            <button
              type="button"
              aria-label={isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')}
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              className="absolute end-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              {isPasswordVisible
                ? <EyeOff size={18} aria-hidden="true" />
                : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </FormField>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {t('auth.signInAction')}
          <ArrowRight size={17} className="rtl:rotate-180" aria-hidden="true" />
        </Button>
      </form>


      <p className="mt-7 text-center text-sm text-slate-500">
        {t('auth.noAccount')}{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        >
          {t('welcome.requestAccess')}
        </Link>
      </p>
    </section>
  )
}
