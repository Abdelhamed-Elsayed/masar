import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { mockRequests } from '@/mock/requests'
import { mockUsers, userIds } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { RequestsPage } from './RequestsPage'

describe('RequestsPage approved requests section', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.mohamedAbdelfattah)!, isInitializing: false })
    useRequestStore.setState({ requests: mockRequests, hydratedUserId: userIds.mohamedAbdelfattah })
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

  it('keeps approved requests accessible in their dedicated status tab', () => {
    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Approved' }))

    expect(screen.getByRole('link', { name: 'REQ-1044' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'REQ-1042' })).not.toBeInTheDocument()
  })
})
