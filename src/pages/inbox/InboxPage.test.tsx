import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { mockRequests } from '@/mock/requests'
import { mockUsers, userIds } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { mockWorkflowInstances } from '@/mock/workflows'
import { InboxPage } from './InboxPage'

describe('InboxPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.daniel)!, isInitializing: false })
    useRequestStore.setState({ requests: mockRequests, hydratedUserId: userIds.daniel })
    useWorkflowStore.setState({ instances: mockWorkflowInstances })
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

  it('shows only requests currently assigned for action, not completed requests', () => {
    render(
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'REQ-1042' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'REQ-1044' })).not.toBeInTheDocument()
  })
})
