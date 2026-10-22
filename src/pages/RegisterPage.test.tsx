import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useLocaleStore } from '@/store/localeStore'
import { RegisterPage } from './RegisterPage'

describe('RegisterPage validation', () => {
  const registerPendingUser = vi.fn()

  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' })
    registerPendingUser.mockReset()
    useAuthStore.setState({ registerPendingUser })
  })

  async function fillRegistrationForm(confirmPassword = 'StrongPass1') {
    const user = userEvent.setup()
    const isArabic = useLocaleStore.getState().locale === 'ar'
    await user.type(screen.getByLabelText(isArabic ? /الاسم بالكامل/ : /Full name/), 'Taylor Morgan')
    await user.type(screen.getByLabelText(isArabic ? /البريد الإلكتروني للعمل/ : /Work email/), 'taylor@example.com')
    await user.selectOptions(screen.getByLabelText(isArabic ? /القسم/ : /Department/), useDirectoryStore.getState().departments[0]!.id)
    await user.type(screen.getByLabelText(isArabic ? /المسمى الوظيفي/ : /Job title/), 'Analyst')
    await user.type(screen.getByLabelText(isArabic ? /^كلمة المرور/ : /^Password/), 'StrongPass1')
    await user.type(screen.getByLabelText(isArabic ? /تأكيد كلمة المرور/ : /Confirm password/), confirmPassword)
    return user
  }

  function renderPage() {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )
  }

  it('rejects mismatched passwords without creating an account', async () => {
    renderPage()
    const user = await fillRegistrationForm('DifferentPass2')

    await user.click(screen.getByRole('button', { name: 'Submit registration' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(registerPendingUser).not.toHaveBeenCalled()
  })

  it('requires a strong password with at least eight characters', async () => {
    renderPage()
    const user = userEvent.setup()
    const password = screen.getByLabelText(/^Password/)
    await user.type(password, 'weakpass')

    expect(password).toHaveAttribute('pattern', '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')
    expect((password as HTMLInputElement).validity.patternMismatch).toBe(true)
    expect(registerPendingUser).not.toHaveBeenCalled()
  })

  it('requires a name with first and last name and a valid work email', async () => {
    renderPage()
    const name = screen.getByLabelText(/Full name/) as HTMLInputElement
    const email = screen.getByLabelText(/Work email/) as HTMLInputElement

    fireEvent.change(name, { target: { value: 'Taylor' } })
    fireEvent.change(email, { target: { value: 'not-an-email' } })

    expect(name.validity.patternMismatch).toBe(true)
    expect(email.validity.typeMismatch).toBe(true)
  })

  it('shows Arabic validation errors without creating an account', async () => {
    useLocaleStore.setState({ locale: 'ar' })
    renderPage()
    const user = await fillRegistrationForm('DifferentPass2')

    await user.click(screen.getByRole('button', { name: 'إرسال طلب التسجيل' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('كلمتا المرور غير متطابقتين.')
    expect(registerPendingUser).not.toHaveBeenCalled()
  })
})
