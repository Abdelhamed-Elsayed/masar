import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useLocaleStore } from '@/store/localeStore'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' })
    useAuthStore.setState({ currentUser: null, roles: [], isInitializing: false })
    useDirectoryStore.setState((state) => ({ ...state }))
  })

  it('renders before the user enters an email', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('shows translated labels in Arabic without changing the login form behavior', async () => {
    useLocaleStore.setState({ locale: 'ar' })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'مرحبًا بعودتك' })).toBeInTheDocument()
    expect(screen.getByLabelText(/البريد الإلكتروني/)).toBeRequired()
    expect(screen.getByLabelText(/^كلمة المرور/)).toBeRequired()
    expect(screen.getByRole('button', { name: 'تسجيل الدخول' })).toBeInTheDocument()
  })
})
