import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { GatewayPage } from './GatewayPage'

function renderGateway() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<GatewayPage />} />
        <Route path="/company" element={<p>company page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GatewayPage', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    useLocaleStore.setState({ locale: 'en' })
    useAuthStore.setState({ currentUser: null, isInitializing: false })
  })
  afterEach(() => vi.restoreAllMocks())

  it('shows only Employee and Guest choices, without sign-in controls', () => {
    renderGateway()
    expect(screen.getByRole('button', { name: /Employee/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guest/ })).toBeInTheDocument()
    expect(document.querySelector('a[href="/login"], a[href="/register"]')).toBeNull()
  })

  it('sends guests to the company page', () => {
    renderGateway()
    fireEvent.click(screen.getByRole('button', { name: /Guest/ }))
    expect(screen.getByText('company page')).toBeInTheDocument()
  })

  it('offers employees sign in and register', () => {
    renderGateway()
    fireEvent.click(screen.getByRole('button', { name: /Employee/ }))
    expect(screen.getByRole('link', { name: /Sign in/ })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /Register/ })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: 'Browse the company page' })).toHaveAttribute('href', '/company')
  })
})
