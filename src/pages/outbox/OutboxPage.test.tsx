import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { mockRequests } from '@/mock/requests'
import { mockUsers, userIds } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { OutboxPage } from './OutboxPage'

describe('OutboxPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.adam)!, isInitializing: false })
    useRequestStore.setState({ requests: mockRequests, hydratedUserId: userIds.adam })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    })
  })

  it('shows only requests created by the signed-in user', () => {
    render(
      <MemoryRouter>
        <OutboxPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'REQ-1042' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'REQ-1045' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'REQ-1043' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'REQ-1044' })).not.toBeInTheDocument()
  })
})
