import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { TopbarNotifications } from '@/app/layouts/TopbarNotifications'
import { MobileNav } from '@/app/layouts/MobileNav'
import { NotificationDropdown } from './components/NotificationDropdown'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationType } from '@/types/notification'
import type { User } from '@/types/user'

const testUser: User = {
  id: 'user-test-1',
  employeeId: 'EMP-999',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  email: 'test@masar.local',
  jobTitle: 'Developer',
  departmentId: 'dept-eng',
  managerId: null,
  roleIds: [],
  isActive: true,
  avatarUrl: '/avatars/default.svg',
  publicProfileVisible: true,
}

describe('Notification responsive behavior', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: testUser })
    useNotificationStore.setState({
      hydratedUserId: testUser.id,
      notifications: [
        {
          id: 'notif-test-1',
          userId: testUser.id,
          type: NotificationType.NEW_ACTION_REQUIRED,
          title: 'Action required on request',
          body: 'Leave request is waiting for your review.',
          requestId: 'req-1',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
    })
  })

  it('renders NotificationDropdown with mobile-responsive viewport positioning', () => {
    render(
      <MemoryRouter>
        <NotificationDropdown
          notifications={useNotificationStore.getState().notifications}
          onRead={() => {}}
          onMarkAllRead={() => {}}
          onClose={() => {}}
        />
      </MemoryRouter>,
    )

    const dropdownSection = screen.getByRole('region', { name: /recent notifications/i })
    expect(dropdownSection.className).toContain('fixed')
    expect(dropdownSection.className).toContain('inset-x-3')
    expect(dropdownSection.className).toContain('sm:absolute')
    expect(dropdownSection.className).toContain('sm:end-0')
  })

  it('opens TopbarNotifications and dismisses when mobile backdrop is clicked', () => {
    render(
      <MemoryRouter>
        <TopbarNotifications />
      </MemoryRouter>,
    )

    const bellButton = screen.getByRole('button', { name: /notifications/i })
    expect(screen.queryByRole('region', { name: /recent notifications/i })).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(bellButton)
    expect(screen.getByRole('region', { name: /recent notifications/i })).toBeInTheDocument()

    // Backdrop should exist for mobile dismissal
    const backdrop = document.querySelector('.fixed.inset-0.z-40')
    expect(backdrop).toBeInTheDocument()

    // Click backdrop
    if (backdrop) fireEvent.click(backdrop)
    expect(screen.queryByRole('region', { name: /recent notifications/i })).not.toBeInTheDocument()
  })

  it('displays the unread badge in MobileNav on the alerts tab', () => {
    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )

    // The unread badge count should appear in MobileNav
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
